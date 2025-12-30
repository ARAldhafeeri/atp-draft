from pydantic import BaseModel

class ActionTarget(BaseModel):
    system: str  # e.g., "stripe", "salesforce", "hubspot", "aws"
    resource: str  # e.g., "charges", "leads", "contacts", "ec2"
    operation: str  # e.g., "refund", "create", "update", "restart_service"