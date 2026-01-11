import asyncio
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from . import crud, models, schemas
from .database import init_db
from .models import CheckpointStage
from .models import get_next_stage
from .qrcode_gen import get_qr_code_response
from .state_derivation import derive_operational_state

app = FastAPI(title="Baggage Tracker")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    # initialize DB (create tables)
    await init_db()

@app.post("/registerBag", response_model=schemas.BagRead)
async def register_bag(payload: schemas.BagCreate):
    bag = await crud.create_bag(payload)
    return bag

@app.post("/scanCheckpoint", response_model=schemas.CheckpointRead)
async def scan_checkpoint(payload: schemas.CheckpointCreate):
    # ensure bag exists
    bag = await crud.get_bag(payload.bag_id)
    if not bag:
        raise HTTPException(status_code=404, detail="Bag not found")
    chk = await crud.add_checkpoint(payload)
    return chk

@app.get("/getStatus/{bag_id}", response_model=schemas.BagStatus)
async def get_status(bag_id: str):
    """
    Get complete bag status including:
    - Bag information
    - Latest checkpoint event
    - Full checkpoint history
    - Next expected stage
    - Derived operational state (NEW)
    """
    bag = await crud.get_bag(bag_id)
    if not bag:
        raise HTTPException(status_code=404, detail="Bag not found")

    history = await crud.get_history(bag_id)
    latest = history[-1] if history else None

    # Compute next expected stage (simple sequential logic)
    next_stage = get_next_stage(latest.checkpoint) if latest else None

    # NEW: Derive operational state from history
    # This interprets events to determine current operational phase
    operational_state_dict = derive_operational_state(history, next_stage)
    operational_state = schemas.OperationalState(**operational_state_dict)

    return {
        "bag": bag,
        "latest_checkpoint": latest,
        "history": history,
        "next_stage": next_stage,
        "operational_state": operational_state  # NEW: Derived state interpretation
    }

@app.get("/checkpoints", response_model=list[CheckpointStage])
async def list_checkpoints():
    """
    Returns the allowed checkpoint stages so frontends can fetch them.
    """
    return list(CheckpointStage)

# ========== AUTOMATION ENDPOINTS ==========

@app.get("/bag/{bag_id}/qr", response_class=Response)
async def get_bag_qr_code(bag_id: str):
    """
    Generate QR code for a bag ID.
    Used for printing labels or displaying on screens.
    """
    bag = await crud.get_bag(bag_id)
    if not bag:
        raise HTTPException(status_code=404, detail="Bag not found")
    return get_qr_code_response(bag_id)

@app.post("/scan/auto", response_model=schemas.CheckpointRead)
async def auto_scan_checkpoint(
    bag_id: str = Query(..., description="Bag ID (from barcode/QR scanner)"),
    scanner_id: Optional[str] = Query(None, description="Scanner device ID"),
    location: Optional[str] = Query(None, description="Override location")
):
    """
    Automated checkpoint scanning endpoint.
    Designed for barcode scanners that send data as query parameters.
    Scanner automatically determines checkpoint based on scanner_id.
    """
    bag = await crud.get_bag(bag_id)
    if not bag:
        raise HTTPException(status_code=404, detail="Bag not found")
    
    # Get scanner info if provided
    checkpoint = None
    scanner_location = location
    
    if scanner_id:
        scanner = await crud.get_scanner(scanner_id)
        if scanner and scanner.is_active:
            checkpoint = scanner.checkpoint
            if not scanner_location:
                scanner_location = scanner.location
    
    # If no scanner or checkpoint not determined, use next expected stage
    if not checkpoint:
        history = await crud.get_history(bag_id)
        latest = history[-1] if history else None
        if latest:
            checkpoint = get_next_stage(latest.checkpoint) or latest.checkpoint
        else:
            checkpoint = CheckpointStage.CHECKIN  # Default to first stage
    
    payload = schemas.CheckpointCreate(
        bag_id=bag_id,
        checkpoint=checkpoint,
        location=scanner_location,
        scanner_id=scanner_id
    )
    
    chk = await crud.add_checkpoint(payload)
    return chk

@app.post("/scan/batch", response_model=List[schemas.CheckpointRead])
async def batch_scan_checkpoints(
    bag_ids: List[str] = Query(..., description="List of bag IDs"),
    scanner_id: Optional[str] = Query(None, description="Scanner device ID"),
    checkpoint: Optional[CheckpointStage] = Query(None, description="Override checkpoint"),
    location: Optional[str] = Query(None, description="Override location")
):
    """
    Batch scan multiple bags at once.
    Useful for loading/unloading operations where multiple bags are scanned quickly.
    """
    results = []
    errors = []
    
    # Get scanner info if provided
    scanner_checkpoint = checkpoint
    scanner_location = location
    
    if scanner_id and not scanner_checkpoint:
        scanner = await crud.get_scanner(scanner_id)
        if scanner and scanner.is_active:
            scanner_checkpoint = scanner.checkpoint
            if not scanner_location:
                scanner_location = scanner.location
    
    for bag_id in bag_ids:
        try:
            bag = await crud.get_bag(bag_id)
            if not bag:
                errors.append(f"Bag {bag_id} not found")
                continue
            
            # Determine checkpoint
            final_checkpoint = scanner_checkpoint
            if not final_checkpoint:
                history = await crud.get_history(bag_id)
                latest = history[-1] if history else None
                if latest:
                    final_checkpoint = get_next_stage(latest.checkpoint) or latest.checkpoint
                else:
                    final_checkpoint = CheckpointStage.CHECKIN
            
            payload = schemas.CheckpointCreate(
                bag_id=bag_id,
                checkpoint=final_checkpoint,
                location=scanner_location,
                scanner_id=scanner_id
            )
            
            chk = await crud.add_checkpoint(payload)
            results.append(chk)
        except Exception as e:
            errors.append(f"Error processing {bag_id}: {str(e)}")
    
    if errors and not results:
        raise HTTPException(status_code=400, detail="; ".join(errors))
    
    return results

@app.post("/scanners", response_model=schemas.ScannerRead)
async def create_scanner(payload: schemas.ScannerCreate):
    """Register a new scanner device"""
    scanner = await crud.create_scanner(payload)
    return scanner

@app.get("/scanners", response_model=List[schemas.ScannerRead])
async def list_scanners(active_only: bool = Query(True)):
    """List all scanner devices"""
    scanners = await crud.get_scanners(active_only=active_only)
    return scanners

@app.get("/scanners/{scanner_id}", response_model=schemas.ScannerRead)
async def get_scanner(scanner_id: str):
    """Get scanner device details"""
    scanner = await crud.get_scanner(scanner_id)
    if not scanner:
        raise HTTPException(status_code=404, detail="Scanner not found")
    return scanner