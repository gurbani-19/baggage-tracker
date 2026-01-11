from sqlmodel import SQLModel
from typing import Optional, List
from datetime import datetime
from .models import Bag, CheckpointLog, CheckpointStage, Scanner

class BagCreate(SQLModel):
    tag_number: str
    passenger_name: Optional[str] = None
    flight_number: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None

class BagRead(Bag):
    pass

class CheckpointCreate(SQLModel):
    bag_id: str
    checkpoint: CheckpointStage
    location: Optional[str] = None
    status_note: Optional[str] = None
    scanner_id: Optional[str] = None

class CheckpointRead(CheckpointLog):
    pass

class OperationalState(SQLModel):
    """Derived operational state from checkpoint history"""
    completed_stages: List[CheckpointStage] = []
    current_stage: Optional[CheckpointStage] = None
    expected_next_stage: Optional[CheckpointStage] = None
    operational_status: str  # OperationalStatus enum value
    status_label: str  # Human-readable status
    risk_level: str  # RiskLevel enum value
    time_since_last_scan_minutes: Optional[float] = None
    is_delayed: bool = False
    is_terminal: bool = False

class BagStatus(SQLModel):
    bag: BagRead
    latest_checkpoint: Optional[CheckpointRead] = None
    history: List[CheckpointRead] = []
    next_stage: Optional[CheckpointStage] = None
    operational_state: Optional[OperationalState] = None  # NEW: Derived state

class ScannerCreate(SQLModel):
    name: str
    location: str
    checkpoint: CheckpointStage
    device_type: str = "barcode"

class ScannerRead(Scanner):
    pass
