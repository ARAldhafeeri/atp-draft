from typing import Dict, List, Optional, Literal, Any
from pydantic import BaseModel

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