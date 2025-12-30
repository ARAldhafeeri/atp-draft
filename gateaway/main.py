from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import  Optional
from datetime import datetime
import uuid

from models import (
    ApprovalDecision, 
    ActionDeclaration, 
    ActionInitiator, 
    ActionTarget
)

from components import (
    store, 
    risk_assessor,
    ExecutionEngine,
    verification_engine
) 

app = FastAPI(title="ATP Gateway")

# Enable CORS for dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/atp/v1/actions/declare")
async def declare_action(
    service: str,
    namespace: str,
    status: str,
    error_rate: Optional[str] = None,
    recent_deployment: bool = False
):
    """
    Webhook endpoint for Uptime Kuma
    This is the entry point when a service goes down
    Allow Uptime Kuma to declare a remediation action
    which is configured in uptime kuma notification webhook
    with the proper data.
    """
    
    action_id = f"act_{uuid.uuid4().hex[:8]}"
    
    # Declare the remediation action
    action = ActionDeclaration(
        action_id=action_id,
        workflow_id="wf_service_remediation_v1",
        initiator=ActionInitiator(
            type="webhook",
            source="uptime_kuma",
            session_id=f"session_{uuid.uuid4().hex[:8]}"
        ),
        timestamp=datetime.utcnow().isoformat(),
        action_type="service.remediation",
        target=ActionTarget(
            system="argocd",
            resource="application",
            operation="rollback"
        ),
        payload={
            "application_name": service,
            "namespace": namespace,
            "target_revision": "previous"
        },
        context={
            "service": service,
            "namespace": namespace,
            "status": status,
            "error_rate": error_rate,
            "recent_deployment": recent_deployment,
            "triggered_by": "uptime_kuma_alert"
        }
    )
    
    # Store action
    store.store_action(action)
    
    # Assess risk using OpenAI
    risk = await risk_assessor.assess_risk(action)
    store.store_risk_assessment(risk)
    
    # Get explanation
    explanation = await risk_assessor.explain_risk(risk)
    
    return {
        "action_id": action_id,
        "risk_assessment": risk.dict(),
        "explanation": explanation,
        "next_step": "approval_required" if risk.recommendation == "human_review" else "auto_executing"
    }

@app.post("/atp/v1/actions/{action_id}/approve")
async def approve_action(action_id: str, approver: str, reason: str):
    """
    Manual approval endpoint
    Called by on-call engineer or automated approval system
    """
    
    action = store.actions.get(action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    approval = ApprovalDecision(
        action_id=action_id,
        decision="approved",
        approver=approver,
        timestamp=datetime.utcnow().isoformat(),
        reason=reason
    )
    
    store.store_approval(approval)
    
    return {
        "action_id": action_id,
        "status": "approved",
        "message": "Action approved and queued for execution"
    }

@app.post("/atp/v1/actions/{action_id}/execute")
async def execute_action(action_id: str, n8n_webhook_url: str):
    """
    Execute the approved action through n8n
    """
    
    action_dict = store.actions.get(action_id)
    approval_dict = store.approvals.get(action_id)
    
    if not action_dict:
        raise HTTPException(status_code=404, detail="Action not found")
    
    if not approval_dict:
        raise HTTPException(status_code=403, detail="Action not approved")
    
    action = ActionDeclaration(**action_dict)
    approval = approval_dict
    
    # Execute through n8n
    executor = ExecutionEngine(n8n_webhook_url)
    execution = await executor.execute(action, approval)
    store.store_execution(execution)
    
    # Verify execution
    verification = await verification_engine.verify(action, execution)
    store.store_verification(verification)
    
    return {
        "action_id": action_id,
        "execution": execution.dict(),
        "verification": verification.dict()
    }

@app.get("/atp/v1/actions/{action_id}/audit-trail")
async def get_audit_trail(action_id: str):
    """
    Get complete audit trail for an action
    """
    
    logs = store.audit_logs.get(action_id, [])
    
    if not logs:
        raise HTTPException(status_code=404, detail="Action not found")
    
    return {
        "action_id": action_id,
        "audit_trail": logs,
        "action": store.actions.get(action_id),
        "risk_assessment": store.risk_assessments.get(action_id).dict() if action_id in store.risk_assessments else None,
        "approval": store.approvals.get(action_id).dict() if action_id in store.approvals else None,
        "execution": store.executions.get(action_id).dict() if action_id in store.executions else None,
        "verification": store.verifications.get(action_id).dict() if action_id in store.verifications else None
    }

@app.get("/atp/v1/actions/{action_id}/explain")
async def explain_action(action_id: str):
    """
    Get natural language explanation of action and its risk
    """
    
    risk = store.risk_assessments.get(action_id)
    
    if not risk:
        raise HTTPException(status_code=404, detail="Risk assessment not found")
    
    explanation = await risk_assessor.explain_risk(risk)
    
    return {
        "action_id": action_id,
        "explanation": explanation
    }

@app.get("/atp/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ATP Gateway",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)