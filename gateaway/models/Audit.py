from typing import Dict, List, Any
from pydantic import BaseModel

class AuditEvent(BaseModel):
    timestamp: str
    event: str
    actor: str
    details: Dict[str, Any]


class AuditTrail(BaseModel):
    action_id: str
    audit_trail: List[AuditEvent]