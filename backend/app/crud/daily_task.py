from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.crud.base import CRUDBase
from app.models.daily_task import DailyTask
from app.schemas.daily_task import DailyTaskCreate, DailyTaskUpdate


class CRUDDailyTask(CRUDBase[DailyTask, DailyTaskCreate, DailyTaskUpdate]):
    async def get_by_card(
        self, db: AsyncSession, *, card_id: UUID
    ) -> List[DailyTask]:
        result = await db.execute(
            select(DailyTask)
            .where(DailyTask.card_id == card_id)
            .order_by(DailyTask.position)
        )
        return result.scalars().all()


daily_task_crud = CRUDDailyTask(DailyTask)