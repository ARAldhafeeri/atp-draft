from typing import Dict,  Optional, Literal
from pydantic import BaseModel

class HealthStatus(BaseModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    version: str
    uptime: str
    timestamp: str
    services: Optional[Dict[str, str]] = None