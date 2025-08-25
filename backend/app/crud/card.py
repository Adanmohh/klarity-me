from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.crud.base import CRUDBase
from app.models.card import Card
from app.schemas.card import CardCreate, CardUpdate


class CRUDCard(CRUDBase[Card, CardCreate, CardUpdate]):
    async def get_by_user(
        self, db: AsyncSession, *, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Card]:
        result = await db.execute(
            select(Card)
            .where(Card.user_id == user_id)
            .order_by(Card.position)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_with_tasks(self, db: AsyncSession, *, id: UUID) -> Optional[Card]:
        result = await db.execute(
            select(Card)
            .options(selectinload(Card.focus_tasks), selectinload(Card.daily_tasks))
            .where(Card.id == id)
        )
        return result.scalar_one_or_none()

    async def create_with_user(self, db: AsyncSession, *, obj_in: CardCreate, user_id: UUID) -> Card:
        db_obj = Card(**obj_in.dict(), user_id=user_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


card_crud = CRUDCard(Card)