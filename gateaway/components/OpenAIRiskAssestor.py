
from ast import Dict
from models import RiskAssessment

import os
import httpx
import json
from datetime import datetime
from models import (
    ActionDeclaration, 
    RiskFactor
)
from components.ATPStore import store

class OpenAIRiskAssessor:
    """
    The goal is to leverage OpenAI's GPT-4 model to perform nuanced risk assessments 
    to decide whether an automation action should be auto-approved, sent for human review, or rejected outright.   
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://api.openai.com/v1/chat/completions"
    
    async def assess_risk(self, action: ActionDeclaration) -> RiskAssessment:
        """Use OpenAI to calculate risk score with nuanced understanding"""
        
        # Get historical context
        similar = store.get_similar_actions(action)
        
        # Prepare prompt for GPT-4
        prompt = f"""You are a DevOps risk assessment expert. Analyze this automation action and provide a detailed risk assessment.

ACTION DETAILS:
- Service: {action.context.get('service')}
- Namespace/Environment: {action.context.get('namespace')}
- Current Status: {action.context.get('status')}
- Operation: {action.target.operation} on {action.target.system}
- Error Rate: {action.context.get('error_rate', 'unknown')}
- Recent Deployment: {action.context.get('recent_deployment', False)}
- Time: {action.timestamp} (UTC)
- Day of Week: {datetime.fromisoformat(action.timestamp.replace('Z', '+00:00')).strftime('%A')}
- Hour: {datetime.fromisoformat(action.timestamp.replace('Z', '+00:00')).hour} UTC

HISTORICAL CONTEXT:
- Similar actions in past 30 days: {similar['count']}
- Historical success rate: {similar['success_rate']:.1%}
- Average completion time: {similar['avg_completion_time']}

TASK:
Analyze the risk of automatically executing this remediation action. Consider:
1. Environment criticality (production vs staging)
2. Service importance (customer-facing vs internal)
3. Time of day and business impact
4. Recent changes (deployments)
5. Historical reliability
6. Blast radius if action fails

Respond with ONLY a valid JSON object (no markdown, no explanation outside JSON):
{{
  "risk_score": <float between 0 and 1>,
  "risk_level": "<low|medium|high>",
  "risk_factors": [
    {{
      "factor": "<factor name>",
      "severity": "<low|medium|high>",
      "weight": <float representing contribution to risk_score>,
      "details": "<brief explanation>"
    }}
  ],
  "recommendation": "<auto_approve|human_review|reject>",
  "confidence": <float between 0 and 1>,
  "reasoning": "<brief explanation of the assessment>"
}}

IMPORTANT: 
- risk_score should be 0-1 (0 = no risk, 1 = maximum risk)
- All risk_factors weights should sum to approximately the risk_score
- Be conservative: when in doubt, recommend human_review
- Production environments should generally be higher risk
- Consider that failed automation can cause more damage than the original issue"""

        try:
            # Call OpenAI API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-4o",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a DevOps risk assessment expert. You provide detailed, accurate risk assessments for automation actions. You always respond with valid JSON only, no markdown formatting."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.3,  # Lower temperature for more consistent results
                        "max_tokens": 1000
                    },
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    print(f"OpenAI API error: {response.status_code} - {response.text}")
                    # Fallback to rule-based assessment
                    return await self._fallback_assessment(action, similar)
                
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                # Parse JSON response
                # Remove markdown code blocks if present
                content = content.strip()
                if content.startswith('```'):
                    content = content.split('```')[1]
                    if content.startswith('json'):
                        content = content[4:]
                    content = content.strip()
                
                risk_data = json.loads(content)
                
                # Validate and construct RiskAssessment
                return RiskAssessment(
                    action_id=action.action_id,
                    timestamp=datetime.utcnow().isoformat(),
                    risk_score=float(risk_data['risk_score']),
                    risk_level=risk_data['risk_level'],
                    risk_factors=[
                        RiskFactor(**factor) for factor in risk_data['risk_factors']
                    ],
                    similar_actions=similar,
                    recommendation=risk_data['recommendation'],
                    confidence=float(risk_data['confidence'])
                )
                
        except Exception as e:
            print(f"Error in OpenAI risk assessment: {e}")
            # Fallback to rule-based assessment
            return await self._fallback_assessment(action, similar)
    
    async def _fallback_assessment(self, action: ActionDeclaration, similar: Dict) -> RiskAssessment:
        """Fallback rule-based assessment if OpenAI fails"""
        
        factors = []
        total_risk = 0.0
        
        # Factor 1: Environment
        env = action.context.get("namespace", "unknown")
        if env == "production":
            factors.append(RiskFactor(
                factor="production_environment",
                severity="high",
                weight=0.4,
                details="Action affects production environment"
            ))
            total_risk += 0.4
        elif env == "staging":
            factors.append(RiskFactor(
                factor="staging_environment",
                severity="low",
                weight=0.1,
                details="Action affects staging environment"
            ))
            total_risk += 0.1
        
        # Factor 2: Service Criticality
        service = action.context.get("service", "unknown")
        if "api" in service or "gateway" in service:
            factors.append(RiskFactor(
                factor="customer_facing_service",
                severity="high",
                weight=0.3,
                details="Service directly impacts customers"
            ))
            total_risk += 0.3
        else:
            factors.append(RiskFactor(
                factor="internal_service",
                severity="low",
                weight=0.1,
                details="Internal service with limited user impact"
            ))
            total_risk += 0.1
        
        # Factor 3: Time of day
        hour = datetime.utcnow().hour
        if 9 <= hour <= 17:  # Business hours
            factors.append(RiskFactor(
                factor="business_hours",
                severity="medium",
                weight=0.15,
                details="Action during peak business hours"
            ))
            total_risk += 0.15
        else:
            factors.append(RiskFactor(
                factor="off_hours",
                severity="low",
                weight=0.05,
                details="Action during low-traffic period"
            ))
            total_risk += 0.05
        
        # Determine risk level
        if total_risk >= 0.7:
            risk_level = "high"
        elif total_risk >= 0.3:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        # Determine recommendation
        if risk_level == "high" or total_risk > 0.6:
            recommendation = "human_review"
        elif risk_level == "low" and total_risk < 0.3:
            recommendation = "auto_approve"
        else:
            recommendation = "human_review"
        
        # If we have high success rate history, lower the requirement
        if similar["success_rate"] > 0.95 and similar["count"] > 10:
            if recommendation == "human_review" and risk_level == "medium":
                recommendation = "auto_approve"
        
        return RiskAssessment(
            action_id=action.action_id,
            timestamp=datetime.utcnow().isoformat(),
            risk_score=total_risk,
            risk_level=risk_level,
            risk_factors=factors,
            similar_actions=similar,
            recommendation=recommendation,
            confidence=0.75  # Lower confidence for fallback
        )
    
    async def explain_risk(self, assessment: RiskAssessment) -> str:
        """Generate natural language explanation using OpenAI"""
        
        prompt = f"""Explain this risk assessment in clear, concise language for a DevOps engineer:

Risk Score: {assessment.risk_score:.2f} ({assessment.risk_level.upper()})
Recommendation: {assessment.recommendation.upper()}
Confidence: {assessment.confidence:.0%}

Risk Factors:
{json.dumps([f.dict() for f in assessment.risk_factors], indent=2)}

Historical Context:
- Similar actions: {assessment.similar_actions.get('count', 0)}
- Success rate: {assessment.similar_actions.get('success_rate', 0):.1%}

Provide a 2-3 paragraph explanation that:
1. Summarizes the overall risk and recommendation
2. Highlights the most important risk factors
3. Explains why this recommendation was made
4. Notes any relevant historical context

Keep it professional and actionable."""

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-4o",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a DevOps expert explaining risk assessments to engineers. Be clear, concise, and actionable."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 500
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result['choices'][0]['message']['content']
                
        except Exception as e:
            print(f"Error generating explanation: {e}")
        
        # Fallback explanation
        return self._fallback_explanation(assessment)
    
    def _fallback_explanation(self, assessment: RiskAssessment) -> str:
        """Fallback template-based explanation"""
        
        explanation = f"Risk Assessment Summary:\n\n"
        explanation += f"Overall Risk Score: {assessment.risk_score:.2f} ({assessment.risk_level.upper()})\n\n"
        explanation += f"Key Risk Factors:\n"
        
        for factor in assessment.risk_factors:
            explanation += f"- {factor.factor}: {factor.severity.upper()} (weight: {factor.weight:.2f})\n"
            if factor.details:
                explanation += f"  {factor.details}\n"
        
        explanation += f"\nHistorical Context:\n"
        explanation += f"- Similar actions in past 30 days: {assessment.similar_actions.get('count', 0)}\n"
        explanation += f"- Success rate: {assessment.similar_actions.get('success_rate', 0):.1%}\n"
        
        explanation += f"\nRecommendation: {assessment.recommendation.replace('_', ' ').upper()}\n"
        
        if assessment.recommendation == "auto_approve":
            explanation += "This action can be safely automated based on low risk score and proven historical reliability."
        elif assessment.recommendation == "human_review":
            explanation += "This action requires human review due to elevated risk factors or insufficient historical data."
        
        return explanation

# Initialize risk assessor with OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
if not OPENAI_API_KEY:
    print("WARNING: OPENAI_API_KEY not set. Using fallback risk assessment.")

risk_assessor = OpenAIRiskAssessor(OPENAI_API_KEY)
