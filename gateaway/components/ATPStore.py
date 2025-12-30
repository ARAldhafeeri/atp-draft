from uuid import uuid4
from typing import Dict, List, Optional
from models import (
    ActionDeclaration,
    RiskAssessment,
    ExecutionResult,
    VerificationResult,
    ApprovalDecision,
    ExecutionResult
)
from datetime import datetime
import sqlite3
import json


class ATPStore:
    """
    Store for ATP components with optional SQLite persistence.
    Supports both in-memory and persistent database storage.
    """

    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize the ATP store.
        
        Args:
            db_path: Path to SQLite database file. If None, uses in-memory storage only.
                    Use ":memory:" for SQLite in-memory database.
        """
        self.db_path = db_path
        self.use_db = db_path is not None
        
        # In-memory caches (always used for fast access)
        self.actions: Dict[str, Dict] = {}
        self.risk_assessments: Dict[str, RiskAssessment] = {}
        self.approvals: Dict[str, ApprovalDecision] = {}
        self.executions: Dict[str, ExecutionResult] = {}
        self.verifications: Dict[str, VerificationResult] = {}
        self.audit_logs: Dict[str, List[Dict]] = {}
        self.action_history: List[Dict] = []
        
        if self.use_db:
            self._init_database()
            self._load_from_database()
    
    def _init_database(self):
        """Initialize SQLite database schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Actions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS actions (
                action_id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        
        # Risk assessments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS risk_assessments (
                action_id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (action_id) REFERENCES actions(action_id)
            )
        """)
        
        # Approvals table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS approvals (
                action_id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (action_id) REFERENCES actions(action_id)
            )
        """)
        
        # Executions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS executions (
                action_id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (action_id) REFERENCES actions(action_id)
            )
        """)
        
        # Verifications table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS verifications (
                action_id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (action_id) REFERENCES actions(action_id)
            )
        """)
        
        # Audit logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                event TEXT NOT NULL,
                data TEXT NOT NULL,
                FOREIGN KEY (action_id) REFERENCES actions(action_id)
            )
        """)
        
        # Action history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS action_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action_id TEXT NOT NULL,
                data TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        
        conn.commit()
        conn.close()
    
    def _load_from_database(self):
        """Load all data from database into memory caches"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Load actions
        cursor.execute("SELECT action_id, data FROM actions")
        for action_id, data in cursor.fetchall():
            self.actions[action_id] = json.loads(data)
        
        # Load risk assessments
        cursor.execute("SELECT action_id, data FROM risk_assessments")
        for action_id, data in cursor.fetchall():
            self.risk_assessments[action_id] = RiskAssessment(**json.loads(data))
        
        # Load approvals
        cursor.execute("SELECT action_id, data FROM approvals")
        for action_id, data in cursor.fetchall():
            self.approvals[action_id] = ApprovalDecision(**json.loads(data))
        
        # Load executions
        cursor.execute("SELECT action_id, data FROM executions")
        for action_id, data in cursor.fetchall():
            self.executions[action_id] = ExecutionResult(**json.loads(data))
        
        # Load verifications
        cursor.execute("SELECT action_id, data FROM verifications")
        for action_id, data in cursor.fetchall():
            self.verifications[action_id] = VerificationResult(**json.loads(data))
        
        # Load audit logs
        cursor.execute("SELECT action_id, timestamp, event, data FROM audit_logs ORDER BY timestamp")
        for action_id, timestamp, event, data in cursor.fetchall():
            if action_id not in self.audit_logs:
                self.audit_logs[action_id] = []
            self.audit_logs[action_id].append({
                "timestamp": timestamp,
                "event": event,
                "data": json.loads(data)
            })
        
        # Load action history
        cursor.execute("SELECT data FROM action_history ORDER BY timestamp")
        for (data,) in cursor.fetchall():
            self.action_history.append(json.loads(data))
        
        conn.close()
    
    def store_action(self, action: ActionDeclaration):
        """
        Adds a new action declaration to the store. Create an audit log entry.
        """
        if (not action.action_id) or (action.action_id == ""):
            action.action_id = f"act_{uuid4().hex[:8]}"
        
        action_dict = action.dict()
        self.actions[action.action_id] = action_dict
        
        if self.use_db:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO actions (action_id, data, created_at) VALUES (?, ?, ?)",
                (action.action_id, json.dumps(action_dict), datetime.utcnow().isoformat())
            )
            conn.commit()
            conn.close()
        
        self.audit_log(action.action_id, "action_declared", action_dict)
    
    def store_risk_assessment(self, assessment: RiskAssessment):
        """
        Store a risk assessment for an action. Create an audit log entry.
        """
        self.risk_assessments[assessment.action_id] = assessment
        
        if self.use_db:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO risk_assessments (action_id, data, created_at) VALUES (?, ?, ?)",
                (assessment.action_id, json.dumps(assessment.dict()), datetime.utcnow().isoformat())
            )
            conn.commit()
            conn.close()
        
        self.audit_log(assessment.action_id, "risk_assessed", assessment.dict())
    
    def store_approval(self, approval: ApprovalDecision):
        """
        Store an approval decision for an action. Create an audit log entry.
        """
        self.approvals[approval.action_id] = approval
        
        if self.use_db:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO approvals (action_id, data, created_at) VALUES (?, ?, ?)",
                (approval.action_id, json.dumps(approval.dict()), datetime.utcnow().isoformat())
            )
            conn.commit()
            conn.close()
        
        self.audit_log(approval.action_id, "approval_received", approval.dict())
    
    def store_execution(self, execution: ExecutionResult):
        """
        Store an execution result for an action. Create an audit log entry.
        """
        self.executions[execution.action_id] = execution
        
        if self.use_db:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO executions (action_id, data, created_at) VALUES (?, ?, ?)",
                (execution.action_id, json.dumps(execution.dict()), datetime.utcnow().isoformat())
            )
            conn.commit()
            conn.close()
        
        self.audit_log(execution.action_id, "execution_completed", execution.dict())
    
    def store_verification(self, verification: VerificationResult):
        """
        Store a verification result for an action. Create an audit log entry.
        """
        self.verifications[verification.action_id] = verification
        
        if self.use_db:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO verifications (action_id, data, created_at) VALUES (?, ?, ?)",
                (verification.action_id, json.dumps(verification.dict()), datetime.utcnow().isoformat())
            )
            conn.commit()
            conn.close()
        
        self.audit_log(verification.action_id, "verification_completed", verification.dict())
        
        # Add to history for future risk assessment
        action = self.actions.get(verification.action_id)
        if action:
            history_entry = {
                "action": action,
                "risk_assessment": self.risk_assessments[verification.action_id].dict(),
                "execution": self.executions.get(verification.action_id, {}).dict() if verification.action_id in self.executions else {},
                "verification": verification.dict(),
                "timestamp": datetime.utcnow().isoformat()
            }
            self.action_history.append(history_entry)
            
            if self.use_db:
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO action_history (action_id, data, timestamp) VALUES (?, ?, ?)",
                    (verification.action_id, json.dumps(history_entry), history_entry["timestamp"])
                )
                conn.commit()
                conn.close()
    
    def audit_log(self, action_id: str, event: str, data: Dict):
        """  
        Create an audit log entry for a given action.
        Each log entry includes a timestamp, event type, and associated data.
        """
        if action_id not in self.audit_logs:
            self.audit_logs[action_id] = []
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": event,
            "data": data
        }
        self.audit_logs[action_id].append(log_entry)
        
        if self.use_db:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO audit_logs (action_id, timestamp, event, data) VALUES (?, ?, ?, ?)",
                (action_id, log_entry["timestamp"], event, json.dumps(data))
            )
            conn.commit()
            conn.close()
    
    def get_similar_actions(self, action: ActionDeclaration) -> Dict:
        """Find similar historical actions for risk assessment"""
        similar = [
            h for h in self.action_history
            if h["action"]["target"]["system"] == action.target.system
            and h["action"]["target"]["operation"] == action.target.operation
            and h["action"]["context"].get("namespace") == action.context.get("namespace")
        ]
        
        if not similar:
            return {
                "count": 0,
                "success_rate": 0.0,
                "avg_completion_time": "N/A"
            }
        
        successful = sum(1 for h in similar if h["verification"]["overall_status"] == "verified")
        
        return {
            "count": len(similar),
            "success_rate": successful / len(similar) if similar else 0.0,
            "avg_completion_time": "2.3s"  # Simplified
        }
    
    def clear_all(self):
        """Clear all data from memory and database"""
        self.actions.clear()
        self.risk_assessments.clear()
        self.approvals.clear()
        self.executions.clear()
        self.verifications.clear()
        self.audit_logs.clear()
        self.action_history.clear()
        
        if self.use_db:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM audit_logs")
            cursor.execute("DELETE FROM action_history")
            cursor.execute("DELETE FROM verifications")
            cursor.execute("DELETE FROM executions")
            cursor.execute("DELETE FROM approvals")
            cursor.execute("DELETE FROM risk_assessments")
            cursor.execute("DELETE FROM actions")
            conn.commit()
            conn.close()


# in memory 
# store = ATPStore()
# sqlite in memory 
# store = ATPStore(db_path=":memory:")
# sqlite persistent
store = ATPStore(db_path="atp_store.db")