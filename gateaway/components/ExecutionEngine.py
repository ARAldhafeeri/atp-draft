import httpx
from datetime import datetime
from models import CompleteAction, ApprovalDecision, ExecutionResultModel

class ExecutionEngine:
    """
    Deterministic execution through automation engine like n8n.
    We chose n8n for its flexibility, simplicity and open-source nature.
    The goal of the exeuction engine is to reliably carry out the approved action
    as specified in the action declaration.
    If execution fails, it should capture detailed error information for auditing and troubleshooting.
    """
    
    def __init__(self, high_risk_webhook_url: str, low_risk_webhook_url: str):
        self.high_risk_webhook_url = high_risk_webhook_url
        self.low_risk_webhook_url = low_risk_webhook_url
    
    async def execute(self, action: CompleteAction, approval: ApprovalDecision) -> ExecutionResultModel:
        """Execute action through n8n workflow"""
        
        started_at = datetime.utcnow().isoformat()
        
        try:
            # Determine what workflow to hit based on risk level
            risk_level = action.risk_assessment.risk_level

            web_hook_url = ""

            if risk_level == "high":
                web_hook_url = self.high_risk_webhook_url
            else:
                web_hook_url = self.low_risk_webhook_url

        
            # Call n8n webhook with ATP metadata
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    web_hook_url,
                    json={
                        "atp_action_id": action.action_id,
                        "target": action.target.dict(),
                        "payload": action.payload,
                        "context": action.context,
                        "approval": {
                            "approver": approval.approver,
                            "timestamp": approval.timestamp
                        }
                    },
                    timeout=30.0
                )
                
                result = response.json()
                
                return ExecutionResultModel(
                    action_id=action.action_id,
                    started_at=started_at,
                    completed_at=datetime.utcnow().isoformat(),
                    status="success" if response.status_code == 200 else "failure",
                    result=result,
                    side_effects=[
                        {
                            "type": "n8n_workflow_executed",
                            "workflow_id": action.workflow_id,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                    ]
                )
        
        except Exception as e:
            return ExecutionResultModel(
                action_id=action.action_id,
                started_at=started_at,
                completed_at=datetime.utcnow().isoformat(),
                status="failure",
                result={"error": str(e)},
                side_effects=[]
            )
