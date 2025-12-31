from typing import Dict, List, Optional, Literal, Any
from pydantic import BaseModel, Field

class ApprovalRequest(BaseModel):
    action_id: str
    risk_score: float
    approval_type: Literal["auto_approve", "human_required"]
    approvers: List[str]
    deadline: str
    priority: Literal["low", "normal", "high"]


class ApprovalDecision(BaseModel):
    action_id: str
    decision: Literal["approved", "rejected", "modified"]
    approver: str
    timestamp: str
    reason: str
    modifications: Optional[Dict[str, Any]] = None


# === Execution Models ===
class SideEffect(BaseModel):
    type: str
    details: str
    timestamp: Optional[str] = None


class ExecutionResultModel(BaseModel):
    action_id: str
    started_at: str
    completed_at: Optional[str] = None
    status: Literal["success", "failure", "partial", "in_progress"]
    result: Dict[str, Any]
    side_effects: List[Dict[str, Any]] = Field(default_factory=list)