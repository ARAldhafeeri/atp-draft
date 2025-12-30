from uuid import uuid4
from typing import Dict, List
from gateaway.models.ActionDeclaration import ActionDeclaration
from gateaway.models.RiskAssessment import RiskAssessment
from gateaway.models.ApprovalDecision import ApprovalDecision
from gateaway.models.ExecutionResult import ExecutionResult
from gateaway.models.VerificationResult import VerificationResult
from datetime import datetime

class ATPStore:
    """
    Simple in-memory store for ATP components. In a real-world scenario, this would interface with a database.
    The goal is to keep track of actions, risk assessments, approvals, executions, verifications, and audit logs.
    """

    def __init__(self):
        self.actions: Dict[str, Dict] = {}
        self.risk_assessments: Dict[str, RiskAssessment] = {}
        self.approvals: Dict[str, ApprovalDecision] = {}
        self.executions: Dict[str, ExecutionResult] = {}
        self.verifications: Dict[str, VerificationResult] = {}
        self.audit_logs: Dict[str, List[Dict]] = {}
        
        # Historical data for risk calculation
        self.action_history: List[Dict] = []
    
    def store_action(self, action: ActionDeclaration):
        """
            Adds a new action declaration to the store. Create an audit log entry.
        """
        if (not action.action_id) or (action.action_id == ""):
            action.action_id = f"act_{uuid4().hex[:8]}"
        self.actions[action.action_id] = action.dict()
        self.audit_log(action.action_id, "action_declared", action.dict())
    
    def store_risk_assessment(self, assessment: RiskAssessment):
        """
            Store a risk assessment for an action. Create an audit log entry.
        """
        self.risk_assessments[assessment.action_id] = assessment
        self.audit_log(assessment.action_id, "risk_assessed", assessment.dict())
    
    def store_approval(self, approval: ApprovalDecision):
        """
            Store an approval decision for an action. Create an audit log entry.
        """
        self.approvals[approval.action_id] = approval
        self.audit_log(approval.action_id, "approval_received", approval.dict())
    
    def store_execution(self, execution: ExecutionResult):
        """
            Store an execution result for an action. Create an audit log entry.
        """
        self.executions[execution.action_id] = execution
        self.audit_log(execution.action_id, "execution_completed", execution.dict())
    
    def store_verification(self, verification: VerificationResult):
        """
            Store a verification result for an action. Create an audit log entry.
        """
        self.verifications[verification.action_id] = verification
        self.audit_log(verification.action_id, "verification_completed", verification.dict())
        
        # Add to history for future risk assessment
        action = self.actions.get(verification.action_id)
        if action:
            self.action_history.append({
                "action": action,
                "risk_assessment": self.risk_assessments[verification.action_id].dict(),
                "execution": self.executions.get(verification.action_id, {}).dict() if verification.action_id in self.executions else {},
                "verification": verification.dict(),
                "timestamp": datetime.utcnow().isoformat()
            })
    
    def audit_log(self, action_id: str, event: str, data: Dict):
        """  
            Create an audit log entry for a given action.
            Each log entry includes a timestamp, event type, and associated data.
        """
        if action_id not in self.audit_logs:
            self.audit_logs[action_id] = []
        
        self.audit_logs[action_id].append({
            "timestamp": datetime.utcnow().isoformat(),
            "event": event,
            "data": data
        })
    
    def get_similar_actions(self, action: ActionDeclaration) -> Dict:
        """Find similar historical actions for risk assessment"""
        similar = [
            h for h in self.action_history
            if h["action"]["target"]["system"] == action.target.system
            and h["action"]["target"]["operation"] == action.target.operation
            and h["action"]["context"].get("namespace") == action.context.get("namespace")
        ]
        
        if not similar:
            return {
                "count": 0,
                "success_rate": 0.0,
                "avg_completion_time": "N/A"
            }
        
        successful = sum(1 for h in similar if h["verification"]["overall_status"] == "verified")
        
        return {
            "count": len(similar),
            "success_rate": successful / len(similar) if similar else 0.0,
            "avg_completion_time": "2.3s"  # Simplified
        }

store = ATPStore()