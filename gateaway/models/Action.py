from typing import Dict, List, Optional, Literal, Any, Union
from .VerificationResult import ApprovalDecision, ApprovalRequest, VerificationResult
from .RiskAssessment import RiskAssessment
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from .enums import ActionStatus

class RollbackAction(BaseModel):
    action_id: str
    timestamp: str
    reason: str
    status: Literal["pending", "in_progress", "completed", "failed"]
    compensating_actions: List[str] = Field(default_factory=list)
    


class ActionTarget(BaseModel):
    system: str  # e.g., "stripe", "salesforce", "hubspot", "aws"
    resource: str  # e.g., "charges", "leads", "contacts", "ec2"
    operation: str  # e.g., "refund", "create", "update", "restart_service"

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
    payload: Dict
    context: Dict
    # intial status of the action
    status: str = ActionStatus.DECLARED
    # Optional fields to be filled later
    approval_request: Optional[ApprovalRequest] = None


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
    execution_result: Optional[ActionStatus] = None
    verification_result: Optional[VerificationResult] = None
    rollback: Optional[RollbackAction] = None
    status: ActionStatus
    
    class Config:
        use_enum_values = True