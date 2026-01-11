"""
Migration script to add scanner_id column to checkpointlog table
Run this once to update the database schema
"""
import asyncio
from sqlalchemy import text
from app.database import engine

async def migrate():
    async with engine.begin() as conn:
        # Check if column exists, if not add it
        result = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='checkpointlog' AND column_name='scanner_id'
        """))
        
        if result.fetchone() is None:
            print("Adding scanner_id column to checkpointlog table...")
            await conn.execute(text("""
                ALTER TABLE checkpointlog 
                ADD COLUMN scanner_id VARCHAR
            """))
            print("Column added successfully!")
        else:
            print("Column scanner_id already exists")

if __name__ == "__main__":
    asyncio.run(migrate())
