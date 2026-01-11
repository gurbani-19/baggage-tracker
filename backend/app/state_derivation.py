"""
State Derivation Service

This module derives operational state from checkpoint history.
It interprets events (checkpoint scans) to determine current operational phase,
completion status, and risk indicators - similar to real airline baggage systems.

Key Concepts:
- Event: An immutable checkpoint scan record
- State: Derived operational phase based on events + time
- Risk: Assessment of whether bag is on track or delayed
"""

from typing import List, Optional, Dict
from datetime import datetime, timedelta
from enum import Enum
from .models import CheckpointLog, CheckpointStage

class OperationalStatus(str, Enum):
    """High-level operational status labels"""
    ON_TRACK = "ON_TRACK"
    IN_TRANSIT = "IN_TRANSIT"
    AWAITING_NEXT_STAGE = "AWAITING_NEXT_STAGE"
    DELAYED = "DELAYED"
    AT_RISK = "AT_RISK"
    COMPLETED = "COMPLETED"
    TERMINAL = "TERMINAL"  # CLAIMED, LOST, RETURNED_TO_AGENT

class RiskLevel(str, Enum):
    """Risk assessment levels"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

# Expected time thresholds between checkpoints (in minutes)
# Based on typical airport operations
EXPECTED_TIMES = {
    (CheckpointStage.CHECKIN, CheckpointStage.SECURITY_CHECK): 5,  # Usually immediate
    (CheckpointStage.SECURITY_CHECK, CheckpointStage.TRANSFER): 10,
    (CheckpointStage.TRANSFER, CheckpointStage.LOADING): 15,
    (CheckpointStage.LOADING, CheckpointStage.LOADED_ONTO_AIRCRAFT): 5,
    (CheckpointStage.LOADED_ONTO_AIRCRAFT, CheckpointStage.IN_TRANSIT): 30,  # Boarding time
    (CheckpointStage.IN_TRANSIT, CheckpointStage.UNLOADING): None,  # Flight duration - variable
    (CheckpointStage.UNLOADING, CheckpointStage.ARRIVAL): 10,
    (CheckpointStage.ARRIVAL, CheckpointStage.CLAIMED): 30,  # Typical claim time
}

# Terminal stages - no further progression expected
TERMINAL_STAGES = {
    CheckpointStage.CLAIMED,
    CheckpointStage.LOST,
    CheckpointStage.RETURNED_TO_AGENT
}

def get_expected_time(current: CheckpointStage, next: CheckpointStage) -> Optional[int]:
    """
    Get expected time (in minutes) between two checkpoints.
    Returns None if time is highly variable (e.g., flight duration).
    """
    return EXPECTED_TIMES.get((current, next))

def is_terminal_stage(stage: CheckpointStage) -> bool:
    """Check if a stage is terminal (no further progression)"""
    return stage in TERMINAL_STAGES

def get_stage_index(stage: CheckpointStage) -> int:
    """Get the sequential index of a checkpoint stage"""
    stages = list(CheckpointStage)
    return stages.index(stage)

def calculate_time_since_last_scan(history: List[CheckpointLog]) -> Optional[float]:
    """
    Calculate minutes since last scan.
    Returns None if no history exists.
    """
    if not history:
        return None
    last_scan = history[-1].scanned_at
    now = datetime.utcnow()
    delta = now - last_scan
    return delta.total_seconds() / 60.0

def assess_delay(history: List[CheckpointLog], expected_next: Optional[CheckpointStage]) -> RiskLevel:
    """
    Assess if bag is delayed based on time since last scan and expected progression.
    
    Logic:
    - If no expected next stage, risk is LOW (terminal or just started)
    - If time exceeds expected threshold, risk increases
    - Missing expected scans increases risk
    """
    if not history:
        return RiskLevel.LOW
    
    if not expected_next:
        return RiskLevel.LOW
    
    last_scan = history[-1]
    time_since = calculate_time_since_last_scan(history)
    
    if time_since is None:
        return RiskLevel.LOW
    
    expected_time = get_expected_time(last_scan.checkpoint, expected_next)
    
    if expected_time is None:
        # Variable time (e.g., flight duration) - use longer threshold
        if time_since > 180:  # 3 hours
            return RiskLevel.MEDIUM
        return RiskLevel.LOW
    
    # Compare actual time vs expected
    if time_since > expected_time * 3:  # 3x expected time = high risk
        return RiskLevel.HIGH
    elif time_since > expected_time * 2:  # 2x expected time = medium risk
        return RiskLevel.MEDIUM
    else:
        return RiskLevel.LOW

def get_completed_stages(history: List[CheckpointLog]) -> List[CheckpointStage]:
    """
    Extract all unique checkpoint stages that have been completed.
    Returns stages in order of first occurrence.
    """
    if not history:
        return []
    
    # Get unique stages in order of first scan
    seen = set()
    completed = []
    for log in history:
        if log.checkpoint not in seen:
            seen.add(log.checkpoint)
            completed.append(log.checkpoint)
    
    return completed

def determine_current_stage(history: List[CheckpointLog]) -> Optional[CheckpointStage]:
    """
    Determine the current operational stage.
    
    Logic:
    - If terminal stage reached, that's the current stage
    - Otherwise, current stage is the latest checkpoint
    - If no history, bag is at initial state (before CHECKIN)
    """
    if not history:
        return None
    
    latest = history[-1].checkpoint
    
    # Terminal stages are always current (no progression)
    if is_terminal_stage(latest):
        return latest
    
    return latest

def determine_operational_status(
    current_stage: Optional[CheckpointStage],
    history: List[CheckpointLog],
    expected_next: Optional[CheckpointStage]
) -> OperationalStatus:
    """
    Determine high-level operational status label.
    
    This provides a human-readable status similar to airline systems.
    """
    if not current_stage:
        return OperationalStatus.AWAITING_NEXT_STAGE
    
    # Terminal states
    if is_terminal_stage(current_stage):
        if current_stage == CheckpointStage.CLAIMED:
            return OperationalStatus.COMPLETED
        return OperationalStatus.TERMINAL
    
    # In transit is a special state
    if current_stage == CheckpointStage.IN_TRANSIT:
        return OperationalStatus.IN_TRANSIT
    
    # Check if delayed
    risk = assess_delay(history, expected_next)
    if risk == RiskLevel.HIGH:
        return OperationalStatus.AT_RISK
    elif risk == RiskLevel.MEDIUM:
        return OperationalStatus.DELAYED
    
    # Normal progression
    if expected_next:
        return OperationalStatus.AWAITING_NEXT_STAGE
    
    return OperationalStatus.ON_TRACK

def get_status_label(status: OperationalStatus, current_stage: Optional[CheckpointStage]) -> str:
    """
    Convert operational status to human-readable label.
    Similar to what passengers see in airline apps.
    """
    if not current_stage:
        return "Not Yet Checked In"
    
    status_labels = {
        OperationalStatus.ON_TRACK: f"On Track - {current_stage.value.replace('_', ' ')}",
        OperationalStatus.IN_TRANSIT: "In Transit",
        OperationalStatus.AWAITING_NEXT_STAGE: f"Awaiting {current_stage.value.replace('_', ' ')}",
        OperationalStatus.DELAYED: f"Delayed at {current_stage.value.replace('_', ' ')}",
        OperationalStatus.AT_RISK: f"At Risk - {current_stage.value.replace('_', ' ')}",
        OperationalStatus.COMPLETED: "Journey Completed",
        OperationalStatus.TERMINAL: current_stage.value.replace('_', ' '),
    }
    
    return status_labels.get(status, "Unknown Status")

def derive_operational_state(
    history: List[CheckpointLog],
    expected_next: Optional[CheckpointStage]
) -> Dict:
    """
    Main function: Derive complete operational state from checkpoint history.
    
    This is the core state interpretation logic that transforms events into state.
    
    Returns a dictionary with:
    - completed_stages: List of stages that have been completed
    - current_stage: The stage the bag is currently in
    - expected_next_stage: The next expected stage
    - operational_status: High-level status enum
    - status_label: Human-readable status
    - risk_level: Risk assessment
    - time_since_last_scan: Minutes since last scan
    - is_delayed: Boolean flag
    """
    completed_stages = get_completed_stages(history)
    current_stage = determine_current_stage(history)
    operational_status = determine_operational_status(current_stage, history, expected_next)
    status_label = get_status_label(operational_status, current_stage)
    risk_level = assess_delay(history, expected_next)
    time_since = calculate_time_since_last_scan(history)
    
    # Determine if delayed (medium or high risk)
    is_delayed = risk_level in [RiskLevel.MEDIUM, RiskLevel.HIGH]
    
    return {
        "completed_stages": completed_stages,
        "current_stage": current_stage,
        "expected_next_stage": expected_next,
        "operational_status": operational_status,
        "status_label": status_label,
        "risk_level": risk_level,
        "time_since_last_scan_minutes": time_since,
        "is_delayed": is_delayed,
        "is_terminal": current_stage in TERMINAL_STAGES if current_stage else False,
    }
