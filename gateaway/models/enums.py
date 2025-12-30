from enum import Enum


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Recommendation(str, Enum):
    AUTO_APPROVE = "auto_approve"
    HUMAN_REVIEW = "human_review"
    REJECT = "reject"


class ApprovalType(str, Enum):
    AUTO_APPROVE = "auto_approve"
    HUMAN_REQUIRED = "human_required"


class Decision(str, Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    MODIFIED = "modified"


class ExecutionStatus(str, Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    PARTIAL = "partial"
    IN_PROGRESS = "in_progress"


class VerificationStatus(str, Enum):
    VERIFIED = "verified"
    ANOMALY_DETECTED = "anomaly_detected"
    VERIFICATION_FAILED = "verification_failed"


class ActionStatus(str, Enum):
    PENDING = "pending"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTING = "executing"
    EXECUTED = "executed"
    VERIFIED = "verified"
    DECLARED = "declared"
    ROLLED_BACK = "rolled_back"
