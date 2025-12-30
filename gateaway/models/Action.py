from typing import Dict, List, Optional, Literal, Any, Union
from gateaway.models import ApprovalDecision, ApprovalRequest
from gateaway.models.ActionInitiator import ActionContext, ActionInitiator
from gateaway.models.RiskAssessment import RiskAssessment
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class CompleteAction(BaseModel):
    action_id: str
    workflow_id: str
    initiator: ActionInitiator
    timestamp: str
    action_type: str
    target: ActionTarget
    payload: Dict[str, Any]
    context: ActionContext
    risk_assessment: Optional[RiskAssessment] = None
    approval_request: Optional[ApprovalRequest] = None
    approval_decision: Optional[ApprovalDecision] = None
    execution_result: Optional[ApprovalDecision.ExecutionResult] = None
    verification_result: Optional[VerificationResult] = None
    rollback: Optional[RollbackAction] = None
    status: ActionStatus
    
    class Config:
        use_enum_values = True