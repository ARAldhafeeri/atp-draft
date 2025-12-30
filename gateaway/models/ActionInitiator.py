from typing import Dict, List, Optional, Literal, Any, Union
from gateaway.models.enums import ActionStatus
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from gateaway.models.ActionTarget import ActionTarget

class ActionInitiator(BaseModel):
    type: Literal["webhook", "scheduled", "human", "ai_agent"]
    source: str
    session_id: Optional[str] = None


class ActionContext(BaseModel):
    business_reason: str
    related_entities: List[str] = Field(default_factory=list)
    prior_actions: List[str] = Field(default_factory=list)
    service: str
    namespace: str
    status: str = "pending"


class ActionPayload(BaseModel):
    """Dynamic payload structure that varies by action type"""
    data: Dict[str, Any] = Field(default_factory=dict)


class ActionDeclaration(BaseModel):
    action_id: str
    workflow_id: str
    initiator: ActionInitiator
    timestamp: str
    action_type: str
    target: ActionTarget
    payload: Dict[str, Any]
    context: ActionContext
    
    # Optional fields that may be added later
    risk_assessment: Optional["RiskAssessment"] = None
    approval_request: Optional["ApprovalRequest"] = None
    approval_decision: Optional["ApprovalDecision"] = None
    execution_result: Optional["ExecutionResult"] = None
    verification_result: Optional["VerificationResult"] = None
    status: ActionStatus = ActionStatus.PENDING
    
    class Config:
        use_enum_values = True
