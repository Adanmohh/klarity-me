from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator

from app.core.config import settings

# Only create engine if not in dev mode
if not settings.DEV_MODE:
    engine = create_async_engine(str(settings.DATABASE_URI), pool_pre_ping=True)
    SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
else:
    engine = None
    SessionLocal = None


class MockSession:
    """Mock database session for dev mode"""
    async def execute(self, *args, **kwargs):
        return MockResult()
    
    async def commit(self):
        pass
    
    async def rollback(self):
        pass
    
    async def close(self):
        pass
    
    async def refresh(self, *args, **kwargs):
        pass
    
    def add(self, *args, **kwargs):
        pass
    
    async def flush(self):
        pass


class MockResult:
    """Mock result for database queries"""
    def scalars(self):
        return self
    
    def all(self):
        return []
    
    def first(self):
        return None
    
    def one_or_none(self):
        return None


async def get_db() -> AsyncGenerator:
    if settings.DEV_MODE:
        # Return mock session in dev mode
        yield MockSession()
    else:
        async with SessionLocal() as session:
            yield session