from typing import Optional
from sqlmodel import SQLModel, Field, Column
from datetime import datetime
from uuid import uuid4
from enum import Enum

class CheckpointStage(str, Enum):
    CHECKIN = "CHECKIN"
    SECURITY_CHECK = "SECURITY_CHECK"
    TRANSFER = "TRANSFER"
    LOADING = "LOADING"
    LOADED_ONTO_AIRCRAFT = "LOADED_ONTO_AIRCRAFT"
    IN_TRANSIT = "IN_TRANSIT"
    UNLOADING = "UNLOADING"
    ARRIVAL = "ARRIVAL"
    CLAIMED = "CLAIMED"
    LOST = "LOST"
    RETURNED_TO_AGENT = "RETURNED_TO_AGENT"

class Bag(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    tag_number: str
    passenger_name: Optional[str] = None
    flight_number: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    registered_at: datetime = Field(default_factory=datetime.utcnow)


class Scanner(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    name: str  # e.g., "Security Scanner 1", "Loading Bay Scanner A"
    location: str  # e.g., "Terminal 3, Gate A12"
    checkpoint: CheckpointStage  # Default checkpoint for this scanner
    device_type: str = "barcode"  # "barcode", "qr", "rfid", "manual"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CheckpointLog(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    # store as string; SQLModel will store the Enum value text
    checkpoint: CheckpointStage = Field(sa_column=Column("checkpoint", nullable=False))
    bag_id: str = Field(foreign_key="bag.id")
    location: Optional[str] = None
    scanner_id: Optional[str] = Field(default=None, foreign_key="scanner.id")
    scanned_at: datetime = Field(default_factory=datetime.utcnow)
    status_note: Optional[str] = None

def get_next_stage(current_stage: CheckpointStage):
    stages = list(CheckpointStage)
    idx = stages.index(current_stage)
    if idx + 1 < len(stages):
        return stages[idx + 1]
    return None  # no next stage (CLAIMED, LOST, RETURNED_TO_AGENT)
