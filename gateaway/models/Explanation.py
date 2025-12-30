from typing import  List, Optional
from .RiskAssessment import RiskAssessment
from pydantic import BaseModel

class Explanation(BaseModel):
    action_id: str
    explanation: str
    factors: List[str]
    risk_breakdown: Optional[RiskAssessment] = None