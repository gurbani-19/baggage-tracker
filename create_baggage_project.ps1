# create_baggage_project.ps1
# Run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; .\create_baggage_project.ps1

$root = "baggage-tracker"
Write-Host "Creating project at .\$root ..."

# create directories
New-Item -Path $root -ItemType Directory -Force | Out-Null
New-Item -Path "$root/backend" -ItemType Directory -Force | Out-Null
New-Item -Path "$root/backend/app" -ItemType Directory -Force | Out-Null
New-Item -Path "$root/backend/app/tests" -ItemType Directory -Force | Out-Null

# __init__.py (empty)
Set-Content -Path "$root/backend/app/__init__.py" -Value "" -Encoding UTF8

# database.py
$database_py = @'
import os
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, AsyncSession, async_sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@db:5432/baggage_db"
)

# create async engine
engine: AsyncEngine = create_async_engine(DATABASE_URL, echo=False, future=True)

# session factory
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def init_db():
    """
    Create DB tables (safe to call at startup).
    Uses run_sync to call SQLModel.metadata.create_all on sync engine.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
'@
Set-Content -Path "$root/backend/app/database.py" -Value $database_py -Encoding UTF8

# models.py
$models_py = @'
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import uuid4

class Bag(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    tag_number: str
    passenger_name: Optional[str] = None
    flight_number: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    registered_at: datetime = Field(default_factory=datetime.utcnow)


class CheckpointLog(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    bag_id: str = Field(foreign_key="bag.id")
    checkpoint: str
    location: Optional[str] = None
    scanned_at: datetime = Field(default_factory=datetime.utcnow)
    status_note: Optional[str] = None
'@
Set-Content -Path "$root/backend/app/models.py" -Value $models_py -Encoding UTF8

# schemas.py
$schemas_py = @'
from sqlmodel import SQLModel
from typing import Optional, List
from datetime import datetime
from .models import Bag, CheckpointLog  # reuse table models for response models

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
    checkpoint: str
    location: Optional[str] = None
    status_note: Optional[str] = None

class CheckpointRead(CheckpointLog):
    pass

class BagStatus(SQLModel):
    bag: BagRead
    latest_checkpoint: Optional[CheckpointRead] = None
    history: List[CheckpointRead] = []
'@
Set-Content -Path "$root/backend/app/schemas.py" -Value $schemas_py -Encoding UTF8

# crud.py
$crud_py = @'
from typing import List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from .models import Bag, CheckpointLog
from .schemas import BagCreate, CheckpointCreate
from .database import AsyncSessionLocal

async def create_bag(payload: BagCreate) -> Bag:
    async with AsyncSessionLocal() as session:  # type: AsyncSession
        bag = Bag.from_orm(payload)
        session.add(bag)
        await session.commit()
        await session.refresh(bag)
        return bag

async def get_bag(bag_id: str) -> Optional[Bag]:
    async with AsyncSessionLocal() as session:
        q = select(Bag).where(Bag.id == bag_id)
        result = await session.execute(q)
        return result.scalar_one_or_none()

async def add_checkpoint(payload: CheckpointCreate) -> CheckpointLog:
    async with AsyncSessionLocal() as session:
        chk = CheckpointLog.from_orm(payload)
        session.add(chk)
        await session.commit()
        await session.refresh(chk)
        return chk

async def get_history(bag_id: str) -> List[CheckpointLog]:
    async with AsyncSessionLocal() as session:
        q = select(CheckpointLog).where(CheckpointLog.bag_id == bag_id).order_by(CheckpointLog.scanned_at)
        result = await session.execute(q)
        return result.scalars().all()

async def get_latest_checkpoint(bag_id: str) -> Optional[CheckpointLog]:
    async with AsyncSessionLocal() as session:
        q = select(CheckpointLog).where(CheckpointLog.bag_id == bag_id).order_by(CheckpointLog.scanned_at.desc()).limit(1)
        result = await session.execute(q)
        return result.scalar_one_or_none()
'@
Set-Content -Path "$root/backend/app/crud.py" -Value $crud_py -Encoding UTF8

# main.py
$main_py = @'
import asyncio
from fastapi import FastAPI, HTTPException
from . import crud, models, schemas
from .database import init_db

app = FastAPI(title="Baggage Tracker")

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
    bag = await crud.get_bag(bag_id)
    if not bag:
        raise HTTPException(status_code=404, detail="Bag not found")
    history = await crud.get_history(bag_id)
    latest = history[-1] if history else None
    return schemas.BagStatus(bag=bag, latest_checkpoint=latest, history=history)
'@
Set-Content -Path "$root/backend/app/main.py" -Value $main_py -Encoding UTF8

# tests/test_basic.py
$test_py = @'
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_docs_alive():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        res = await ac.get("/docs")
        assert res.status_code in (200, 307)
'@
Set-Content -Path "$root/backend/app/tests/test_basic.py" -Value $test_py -Encoding UTF8

# backend/requirements.txt
$reqs = @'
fastapi==0.100.0
uvicorn[standard]==0.22.0
sqlmodel==0.0.8
asyncpg==0.27.0
sqlalchemy==2.0.20
python-dotenv==1.0.0
pytest==7.4.0
httpx==0.24.0
'@
Set-Content -Path "$root/backend/requirements.txt" -Value $reqs -Encoding UTF8

# backend/Dockerfile
$dockerfile = @'
FROM python:3.11-slim

WORKDIR /app

# system deps for asyncpg (optional on slim; adding minimal)
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY backend/app /app/app

ENV PYTHONPATH=/app
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
'@
Set-Content -Path "$root/backend/Dockerfile" -Value $dockerfile -Encoding UTF8

# docker-compose.yml
$docker_compose = @'
version: "3.8"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: baggage_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build:
      context: .
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:postgres@db:5432/baggage_db
    ports:
      - "8000:8000"
    depends_on:
      - db

volumes:
  pgdata:
'@
Set-Content -Path "$root/docker-compose.yml" -Value $docker_compose -Encoding UTF8

# README.md
$readme = @'
# Baggage Tracker - Backend (FastAPI)

## Run locally with Docker Compose

1. Build & start:
