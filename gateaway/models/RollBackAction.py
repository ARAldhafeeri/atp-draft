from typing import  List, Literal
from pydantic import BaseModel, Field

class RollbackAction(BaseModel):
    action_id: str
    timestamp: str
    reason: str
    status: Literal["pending", "in_progress", "completed", "failed"]
    compensating_actions: List[str] = Field(default_factory=list)