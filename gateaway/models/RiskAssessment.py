from typing import Dict, List, Literal, Any
from pydantic import BaseModel, Field
from .RiskFactor import RiskFactor


class SimilarActions(BaseModel):
    past_30_days: int
    success_rate: float
    average_completion_time: str


class RiskAssessment(BaseModel):
    action_id: str
    timestamp: str
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_level: Literal["low", "medium", "high"]
    risk_factors: List[RiskFactor]
    similar_actions: Dict[str, Any]  # Can be SimilarActions or custom dict
    recommendation: Literal["auto_approve", "human_review", "reject"]
    confidence: float = Field(ge=0.0, le=1.0)