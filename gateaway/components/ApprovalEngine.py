from models import ApprovalRequest
from datetime import datetime

class ApprovalEngine:
    """
    The approval engine determine the approval request for an action 
    based on the risk level and other factors.
    It generates an ApprovalRequest object that specifies who needs to approve
    the action and under what conditions.
    """

    def get_approval_request(
            self, 
            risk_level: str, 
            action_id: str, 
            risk_score: float
        ) -> ApprovalRequest:
        """
        Generate an approval request based on risk level Simple implementation:
        """
        print("Generating approval request for risk level:", risk_level, action_id, risk_score)
        if risk_level == "low":
            return ApprovalRequest(
                action_id=action_id,
                decision="auto_approve",
                timestamp=datetime.utcnow().isoformat(),
                reason="Low risk action auto-approved",
                approval_type="auto_approve",
                priority ="low",
                risk_score=risk_score,
                deadline="24 hours",
                approvers=[ "system" ]
            )
        elif risk_level == "medium":
            return ApprovalRequest(
                action_id=action_id,
                decision="human_required",
                approvals=["on_call_engineer"],
                timestamp=datetime.utcnow().isoformat(),
                reason="Medium risk action requires human approval",
                approval_type="human_required",
                priority ="low",
                deadline="24 hours",
                risk_score=risk_score,
            )
        elif risk_level == "high":
            return ApprovalRequest(
                action_id=action_id,
                decision="human_required",
                approvers=["cto_team"],
                timestamp=datetime.utcnow().isoformat(),
                deadline="24 hours",
                reason="High risk action requires CEO approval",
                approval_type="human_required",
    priority ="high",
                                    risk_score=risk_score,
            )
        else: 
            return ApprovalRequest(
                action_id=action_id,
                decision="human_required",
                approvers=["security_team"],
                timestamp=datetime.utcnow().isoformat(),
                reason="Unknown risk level requires security team approval",
                approval_type="human_required",
                priority ="high",
                deadline="24 hours",
                risk_score=risk_score,
            )
        
approval_engine = ApprovalEngine()