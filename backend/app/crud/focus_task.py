from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.crud.base import CRUDBase
from app.models.focus_task import FocusTask
from app.schemas.focus_task import FocusTaskCreate, FocusTaskUpdate


class CRUDFocusTask(CRUDBase[FocusTask, FocusTaskCreate, FocusTaskUpdate]):
    async def get_by_card(
        self, db: AsyncSession, *, card_id: UUID
    ) -> List[FocusTask]:
        result = await db.execute(
            select(FocusTask)
            .where(FocusTask.card_id == card_id)
            .order_by(FocusTask.position)
        )
        return result.scalars().all()


focus_task_crud = CRUDFocusTask(FocusTask)