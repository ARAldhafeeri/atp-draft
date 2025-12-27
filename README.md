# Intro

The real value of LLMs lies in **interpretation**—yet most automation efforts misuse them for **execution**. The leap forward isn't more intelligence; it's a trust infrastructure that existing tools lack. Deterministic automation requires:

1. **Predictability:** Known outcomes for given inputs.
2. **Observability:** Full visibility into each step.
3. **Controllability:** The ability to pause or modify execution.
4. **Accountability:** Clear attribution for failures.
5. **Recoverability:** Mechanisms to undo errors.

Current solutions offer observability and controllability, but fall short on predictability, accountability, and recoverability. The Automation Trust Protocol bridges this gap by separating intelligence from execution:

1. **Separation of Concerns:** AI interprets intent; traditional automation engines handle execution.
2. **Risk-Adaptive Boundaries:** Trust boundaries that expand with proven reliability.
3. **Temporal Safety:** Built-in review periods, verification, and automatic rollback.
4. **Complete Observability:** Audit trails, explanations, and compliance-ready reporting.
5. **Gradual Autonomy:** Trust is earned through demonstrated reliability, not assumed.

This protocol addresses the "last 10%" of failures that block full enterprise adoption, creating a foundation for automation that is both intelligent and trustworthy.


**Automation Trust Protocol ( ATP ):** 
is a standard for automation systems to communicate risk, ensure accountability, and enable safe execution of automated actions across any platform. Think of it as how OAuth as protocol brought trust to authorization. Same for ATP, Automation Trust Protocol aims to restore the trust in automation.


The only way people will see the value of the Automation Trust Protocol (ATP) is through a concrete, practical example. This repository a follow-up to blog post and demo video aims to demonstrate the protocol draft by walking through its technical layers with a real-world scenario.

The protocol consists of nine layers that directly address the five principles outlined earlier: **Separation of Concerns, Risk-Adaptive Boundaries, Temporal Safety, Complete Observability, and Gradual Autonomy.**


The goal of this repository, blog post, demo is to explain ATP to others as I invision it and possibily collabrate with the community to create a production version.

## Protocol Layers

### Layer 0 - Identity and Authorization
When introducing agency into automation—whether a human, an AI agent, or a scheduled task—every action must be identifiable and authorized. This foundational layer answers: *Who did what, and were they allowed to?* It creates an immutable anchor for all downstream accountability.
```json
{
  "action_id": "uuid-v4",
  "workflow_id": "wf_customer_refund_v3",
  "initiator": {
    "type": "human|ai_agent|scheduled|event_triggered",
    "user_id": "user_123",
    "agent_id": "agent_gpt4",
    "session_id": "session_456"
  },
  "timestamp": "2025-12-25T10:30:00Z",
  "parent_action_id": "uuid-parent"
}
```

### Layer 1 - Action Declaration 
Before execution, the system must declare its intent. This enables predictability (the workflow's path is known in advance), observability (both declared and executed states are logged), and forms the basis for controllability, accountability, and recoverability.
```json
{
  "action": {
    "type": "database.update|api.call|email.send|payment.process|...",
    "target": {
      "system": "stripe",
      "resource": "charges",
      "operation": "refund"
    },
    "payload": {
      "charge_id": "ch_123",
      "amount": 5000,
      "currency": "USD",
      "reason": "customer_request"
    },
    "idempotency_key": "refund_order_789_attempt_1"
  },
  "context": {
    "business_reason": "Customer requested refund within 30-day window",
    "related_entities": ["customer:c_789", "order:ord_789"],
    "prior_actions": ["email_received", "verified_order_date"]
  }
}
```

### Layer 2 - Risk Assessment Request
Here, the system requests a risk evaluation. This is where LLMs excel at **interpretation**. Risk assessment is inherently probabilistic; within defined trust boundaries, this evaluation determines the subsequent workflow path.
```json
{
  "risk_assessment_request": {
    "action_id": "uuid-v4",
    "evaluate": [
      "financial_risk",
      "compliance_risk",
      "operational_risk",
      "reputational_risk"
    ],
    "require_approvals": "auto_determine"
  }
}
```
**Risk Assessment Response (From AI Agent):**
```json
{
  "risk_assessment": {
    "action_id": "uuid-v4",
    "timestamp": "2025-12-25T10:30:01Z",
    "risk_score": {
      "overall": 0.23,
      "financial": 0.15,
      "compliance": 0.05,
      "operational": 0.42,
      "reputational": 0.12
    },
    "risk_factors": [
      {
        "factor": "amount_exceeds_threshold",
        "severity": "medium",
        "threshold": 1000,
        "actual": 5000,
        "multiplier": 5.0
      },
      {
        "factor": "customer_account_age",
        "severity": "low",
        "details": "Account created 2 years ago"
      }
    ],
    "similar_actions": {
      "past_30_days": 147,
      "success_rate": 0.994,
      "average_completion_time": "2.3s",
      "anomalies_detected": 0
    },
    "recommendation": "auto_approve|human_review|reject",
    "confidence": 0.87
  }
}
```

### Layer 3 - Approval Flow
Based on the risk result, the system routes the action for approval. This is not binary. By defining confidence boundaries (e.g., risk < 0.25 auto-approve, 0.25-0.75 human review, >0.75 reject), businesses can create as many trust tiers as needed.
```json
{
  "approval_request": {
    "action_id": "uuid-v4",
    "risk_score": 0.23,
    "approval_type": "human_required|ai_sufficient|pre_approved",
    "approvers": {
      "required": ["role:finance_manager", "role:customer_service_lead"],
      "optional": ["role:ceo"],
      "escalation_after": "1h",
      "auto_approve_if_no_response": false
    },
    "deadline": "2025-12-25T12:30:00Z",
    "priority": "normal|high|critical"
  }
}
```
**Approval Response:**
```json
{
  "approval": {
    "action_id": "uuid-v4",
    "decision": "approved|rejected|modified",
    "approver": "user_456",
    "timestamp": "2025-12-25T10:35:00Z",
    "reason": "Within normal parameters, customer has good history",
    "modifications": {
      "amount": 4500,
      "reason": "Waiving shipping fee only, not full refund"
    },
    "conditions": [
      {
        "type": "notification_required",
        "notify": ["user_789"],
        "message": "Large refund processed"
      }
    ]
  }
}
```

### Layer 4 - Pre-Execution Verification
Before the action is sent to the target system, a final set of deterministic checks is performed. This can be a sub-workflow of test cases or an AI-aided verification step.
```json
{
  "pre_execution_check": {
    "action_id": "uuid-v4",
    "checks": [
      {
        "type": "data_validation",
        "status": "pass",
        "details": "All required fields present and valid"
      },
      {
        "type": "preconditions",
        "status": "pass",
        "verified": [
          "charge_exists",
          "charge_not_previously_refunded",
          "within_refund_window"
        ]
      },
      {
        "type": "rate_limit",
        "status": "pass",
        "current": "12 refunds in past hour",
        "limit": "50 per hour"
      },
      {
        "type": "dependency_health",
        "status": "pass",
        "dependencies": [
          {"service": "stripe_api", "status": "healthy", "latency": "120ms"}
        ]
      }
    ],
    "ready_for_execution": true
  }
}
```

### Layer 5 - Execution with Proof
The action executes against the target system, producing immutable, detailed logs and cryptographic proof.
```json
{
  "execution": {
    "action_id": "uuid-v4",
    "started_at": "2025-12-25T10:35:05Z",
    "completed_at": "2025-12-25T10:35:07Z",
    "status": "success|failure|partial",
    "result": {
      "refund_id": "re_456",
      "status": "succeeded",
      "amount_refunded": 5000,
      "currency": "USD"
    },
    "proof": {
      "execution_hash": "sha256_hash_of_inputs_and_outputs",
      "signature": "digital_signature",
      "witnesses": ["stripe_api", "internal_ledger"],
      "receipts": [
        {
          "system": "stripe",
          "transaction_id": "re_456",
          "timestamp": "2025-12-25T10:35:06Z"
        }
      ]
    },
    "side_effects": [
      {
        "type": "email_sent",
        "to": "customer@example.com",
        "template": "refund_confirmation",
        "message_id": "msg_789"
      },
      {
        "type": "database_updated",
        "table": "orders",
        "record_id": "ord_789",
        "field": "status",
        "old_value": "completed",
        "new_value": "refunded"
      }
    ]
  }
}
```

### Layer 6 - Post-Execution Verification
The system independently verifies that the action achieved its intended outcome and no unintended side effects occurred.
```json
{
  "verification": {
    "action_id": "uuid-v4",
    "timestamp": "2025-12-25T10:35:10Z",
    "checks": [
      {
        "type": "state_consistency",
        "status": "pass",
        "verified": "Order status matches refund status in Stripe"
      },
      {
        "type": "downstream_effects",
        "status": "pass",
        "verified": [
          "customer_notified",
          "accounting_updated",
          "analytics_recorded"
        ]
      },
      {
        "type": "no_unintended_consequences",
        "status": "pass",
        "checked": [
          "no_duplicate_refunds",
          "customer_balance_correct",
          "inventory_not_affected"
        ]
      }
    ],
    "overall_status": "verified|anomaly_detected|verification_failed",
    "confidence": 0.95
  }
}
```

### Layer 7 - Rollback Capability
If verification fails, the protocol enables a rollback to a previous stable state. This is achieved via compensating transactions or state restoration mechanisms.
```json
{
  "rollback_request": {
    "action_id": "uuid-v4",
    "reason": "downstream_verification_failed",
    "details": "Customer balance shows incorrect amount",
    "strategy": "compensating_transaction|state_restoration",
    "compensating_actions": [
      {
        "type": "api.call",
        "target": "stripe.charges.capture",
        "payload": {...}
      },
      {
        "type": "database.update",
        "target": "orders.status",
        "restore_to": "completed"
      }
    ]
  }
}
```
**Rollback Response:**
```json
{
  "rollback": {
    "action_id": "uuid-v4",
    "original_action_id": "uuid-original",
    "status": "completed|partial|failed",
    "compensating_actions_executed": 2,
    "state_restored": true,
    "residual_effects": [
      {
        "type": "audit_trail",
        "description": "Refund attempt recorded in logs",
        "cleanup_required": false
      }
    ]
  }
}
```

### Layer 8 - Learning & Feedback
The system records outcomes to improve future risk assessments, creating a feedback loop for continuous learning and human correction.
```json
{
  "feedback": {
    "action_id": "uuid-v4",
    "outcome": "success|failure|partial|rolled_back",
    "actual_risk_materialized": false,
    "predicted_risk": 0.23,
    "actual_risk": 0.05,
    "learning_signals": [
      {
        "signal": "risk_overestimated",
        "factor": "customer_account_age",
        "adjustment": "lower_weight_for_established_customers"
      },
      {
        "signal": "execution_time",
        "expected": "2.3s",
        "actual": "2.1s",
        "within_normal": true
      }
    ],
    "human_feedback": {
      "provided_by": "user_456",
      "rating": "appropriate_approval_required",
      "comments": "Good catch on the amount threshold"
    }
  }
}
```

## Protocol Endpoints

ATP-compliant systems must implement these core endpoints to facilitate the layered interaction.

### Required Endpoints:
1.  **`POST /atp/v1/actions/declare`**
    *   Declare intent before execution.
    *   Returns: `action_id` and initial risk assessment.
2.  **`GET /atp/v1/actions/{action_id}/risk`**
    *   Request comprehensive risk assessment.
    *   Returns: risk scores, factors, recommendation.
3.  **`POST /atp/v1/actions/{action_id}/approve`**
    *   Submit approval decision.
    *   Returns: execution authorization or rejection.
4.  **`POST /atp/v1/actions/{action_id}/execute`**
    *   Execute the approved action.
    *   Returns: execution result with proof.
5.  **`GET /atp/v1/actions/{action_id}/verify`**
    *   Verify the action's outcome.
    *   Returns: verification status.
6.  **`POST /atp/v1/actions/{action_id}/rollback`**
    *   Initiate a compensating transaction or rollback.
    *   Returns: rollback status.
7.  **`POST /atp/v1/actions/{action_id}/feedback`**
    *   Submit learning feedback for the action.
    *   Returns: acknowledgment.

### Optional Endpoints:
1.  **`GET /atp/v1/actions/{action_id}/explain`**
    *   Get a natural language explanation of the action and its context.
2.  **`GET /atp/v1/actions/{action_id}/audit-trail`**
    *   Retrieve the full, compliance-ready audit trail.
3.  **`GET /atp/v1/patterns/similar`**
    *   Find similar historical actions for pattern analysis.


## From Theory to Practice: Show Me the Code

So far, everything looks good on paper. But does this protocol actually solve the automation problems we've identified? To prove it hits all five critical requirements:

1. **Predictability:** Known outcomes for given inputs
2. **Observability:** Full visibility into each step  
3. **Controllability:** The ability to pause or modify execution
4. **Accountability:** Clear attribution for failures
5. **Recoverability:** Mechanisms to undo errors

We need a concrete implementation. Let's walk through a real-world scenario.

### The Infrastructure Problem

Consider a typical modern stack:
- **Uptime Kuma** for monitoring and outage notifications
- **n8n** as the automation workflow engine  ( for simplicity if you are Terraform person congrats for learning this challenging tool )
- **GitHub Actions, ArgoCD, Kubernetes** for full CI/CD

The DevOps setup is solid—until something breaks. Here's what happens today:

1. **Uptime Kuma** detects a service failure and triggers an n8n workflow
2. The workflow sends notifications to the team (that's it)
3. **ArgoCD** may automatically rollback to a previous version (seconds to minutes recovery)
4. Engineers scramble to debug, potentially taking hours or days depending on failure severity

This setup nails **observability** and **controllability**, but completely misses:
- **Predictability** (will this automated response actually fix things?)
- **Accountability** (who approved this rollback? Why was it chosen?)
- **Recoverability** (what if the rollback makes things worse?)

### Bridging the Gap with ATP

Instead of direct automation, we insert an **ATP Gateway** between monitoring and execution:

![ATP Solution Architecture](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/h5w23pgsqpwydyn1chhh.png)

The image illustrates the complete flow, but let me walk you through the implementation:

1. Uptime kuma sends notification to our ATP layer instead of the automation engine. 
2. ATP gateaway declare an action which is roll back deployment and the target would be argocd, namespace production.
3. ATP gateaway uses LLMs for risk assesement checking all the risk factors given the description of the situation. Which proper action given the risk result for example high risk means human review is a must.
4. Approval flow low-risk auto-approve ( rollback ) , high risk ( human review required ) .
5. Determinsitic workflows execution via atuoamtion engine - receives execution request with ATP metadata. 
6. automation engine execute determinsitic workflows:
  a. Call ArgoCD API to rollback.
  b. Wait for deployment to complete.
  c. Check service health.
  d. Report back to ATP gateaway.
7. Verfication inside ATP gateaway : ATP verifies the outcome via specific defined checks: execution completed, service health, no side effects via dependencies list, error rate. ANd the result is probalistic socre.
8. The ATP gateaway records outcome for future risk assesement. 

So what is the result ? In my humble opoinion here it's : 

| Feature | Plain n8n | Pure AI Agent | ATP Solution |
| :--- | :--- | :--- | :--- |
| **Risk Assessment** | ❌ None | ⚠️ Basic, probabilistic | ✅ AI-powered, quantitative scoring |
| **Approval Flow** | ❌ Manual only | ⚠️ Ad-hoc, inconsistent | ✅ Risk-adaptive, multi-tier rules |
| **Audit Trail** | ⚠️ Basic logs only | ❌ Limited or none | ✅ Immutable, cryptographic proof |
| **Rollback** | ❌ Manual recovery | ⚠️ Unreliable or missing | ✅ Automated, verified rollback |
| **Learning** | ❌ None | ✅ Yes, but unstable | ✅ Continuous, stable improvement |
| **Predictability** | ⚠️ Brittle workflows | ❌ Unpredictable outputs | ✅ Declared intent, deterministic execution |
| **Accountability** | ⚠️ Limited attribution | ❌ Unclear responsibility | ✅ Clear identity & action tracing |
| **Control** | ✅ Manual overrides | ❌ Limited intervention | ✅ Granular, risk-based controls |
| **Execution Type** | ✅ Deterministic | ❌ Probabilistic | ✅ Deterministic with AI interpretation |
| **Explainability** | ✅ Clear workflow steps | ❌ Black-box decisions | ✅ Transparent decision rationale |
| **Compliance** | ⚠️ Manual reporting | ❌ Difficult to audit | ✅ Built-in compliance verification |
| **Trust Boundaries** | ❌ All-or-nothing | ❌ Unbounded autonomy | ✅ Configurable, earned trust |
| **Reliability at Scale** | ✅ High for simple tasks | ⚠️ ~90% success rate | ✅ 99.9%+ with safeguards |
| **Human Oversight** | ✅ Required for all | ❌ Optional or absent | ✅ Risk-adaptive, always available |
| **Recovery Speed** | ⚠️ Manual, slow | ❌ Unpredictable | ✅ Automated, verified compensation |
| **Best For** | Simple, repetitive tasks | Creative, exploratory tasks | Mission-critical, regulated automation |