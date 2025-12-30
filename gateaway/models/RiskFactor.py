from typing import Dict, List, Literal, Any, Optional
from pydantic import BaseModel, Field

class RiskFactor(BaseModel):
    factor: str
    severity: Literal["low", "medium", "high"]
    weight: float
    details: Optional[str] = None