from typing import List, Optional
from sqlmodel import select
from .models import Bag, CheckpointLog, Scanner
from .database import AsyncSessionLocal
from .schemas import BagCreate, CheckpointCreate, ScannerCreate
from sqlmodel.ext.asyncio.session import AsyncSession

async def create_bag(payload: BagCreate) -> Bag:
    async with AsyncSessionLocal() as session:
        try:
            bag = Bag.from_orm(payload)
            session.add(bag)
            await session.commit()
            await session.refresh(bag)
            return bag
        except Exception:
            await session.rollback()
            raise

async def get_bag(bag_id: str) -> Optional[Bag]:
    async with AsyncSessionLocal() as session:
        try:
            q = select(Bag).where(Bag.id == bag_id)
            result = await session.execute(q)
            return result.scalar_one_or_none()
        except Exception:
            await session.rollback()
            raise

async def add_checkpoint(payload: CheckpointCreate) -> CheckpointLog:
    async with AsyncSessionLocal() as session:
        try:
            chk = CheckpointLog.from_orm(payload)
            session.add(chk)
            await session.commit()
            await session.refresh(chk)
            return chk
        except Exception:
            await session.rollback()
            raise

async def get_history(bag_id: str) -> List[CheckpointLog]:
    async with AsyncSessionLocal() as session:
        try:
            q = select(CheckpointLog).where(CheckpointLog.bag_id == bag_id).order_by(CheckpointLog.scanned_at)
            result = await session.execute(q)
            return result.scalars().all()
        except Exception:
            await session.rollback()
            raise

async def get_latest_checkpoint(bag_id: str) -> Optional[CheckpointLog]:
    async with AsyncSessionLocal() as session:
        q = select(CheckpointLog).where(CheckpointLog.bag_id == bag_id).order_by(CheckpointLog.scanned_at.desc()).limit(1)
        result = await session.execute(q)
        return result.scalar_one_or_none()

# Scanner CRUD operations
async def create_scanner(payload: ScannerCreate) -> Scanner:
    async with AsyncSessionLocal() as session:
        scanner = Scanner.from_orm(payload)
        session.add(scanner)
        await session.commit()
        await session.refresh(scanner)
        return scanner

async def get_scanner(scanner_id: str) -> Optional[Scanner]:
    async with AsyncSessionLocal() as session:
        q = select(Scanner).where(Scanner.id == scanner_id)
        result = await session.execute(q)
        return result.scalar_one_or_none()

async def get_scanners(active_only: bool = True) -> List[Scanner]:
    async with AsyncSessionLocal() as session:
        q = select(Scanner)
        if active_only:
            q = q.where(Scanner.is_active == True)
        result = await session.execute(q)
        return result.scalars().all()
