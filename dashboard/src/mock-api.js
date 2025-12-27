const mockActions = [
  {
    action_id: 'act_001',
    workflow_id: 'wf_customer_refund_v1',
    initiator: {
      type: 'scheduled',
      source: 'n8n_scheduler',
      session_id: 'session_001',
    },
    timestamp: '2024-12-25T10:30:00Z',
    action_type: 'payment.process',
    target: {
      system: 'stripe',
      resource: 'charges',
      operation: 'refund',
    },
    payload: {
      charge_id: 'ch_123456',
      amount: 2500,
      currency: 'USD',
      reason: 'customer_request',
    },
    context: {
      business_reason: 'Customer requested refund within 30-day window',
      related_entities: ['customer:c_789', 'order:ord_001'],
      prior_actions: ['email_received', 'verified_order_date'],
      service: 'stripe',
      namespace: 'payments',
      status: 'pending',
    },
    risk_assessment: {
      action_id: 'act_001',
      timestamp: '2024-12-25T10:30:01Z',
      risk_score: 0.42,
      risk_level: 'medium',
      risk_factors: [
        {
          factor: 'amount_exceeds_threshold',
          severity: 'medium',
          weight: 0.5,
          details: 'Refund amount $2,500 exceeds auto-approval threshold of $1,000',
        },
        {
          factor: 'customer_account_age',
          severity: 'low',
          weight: 0.2,
          details: 'Customer account created 2 years ago - good standing',
        },
      ],
      similar_actions: {
        past_30_days: 147,
        success_rate: 0.994,
        average_completion_time: '2.3s',
      },
      recommendation: 'human_review',
      confidence: 0.85,
    },
    approval_request: {
      action_id: 'act_001',
      risk_score: 0.42,
      approval_type: 'human_required',
      approvers: ['role:finance_manager'],
      deadline: '2024-12-25T12:30:00Z',
      priority: 'normal',
    },
    status: 'pending_approval',
  },
  {
    action_id: 'act_002',
    workflow_id: 'wf_lead_import_v2',
    initiator: {
      type: 'human',
      source: 'user_456',
      session_id: 'session_002',
    },
    timestamp: '2024-12-24T14:20:00Z',
    action_type: 'database.update',
    target: {
      system: 'salesforce',
      resource: 'leads',
      operation: 'create',
    },
    payload: {
      leads_count: 25,
      source: 'conference_attendees',
      records: [],
    },
    context: {
      business_reason: 'Import conference attendees as new leads',
      related_entities: ['event:conf_2024'],
      prior_actions: ['csv_uploaded', 'validation_passed'],
      service: 'salesforce',
      namespace: 'crm',
      status: 'approved',
    },
    risk_assessment: {
      action_id: 'act_002',
      timestamp: '2024-12-24T14:20:05Z',
      risk_score: 0.12,
      risk_level: 'low',
      risk_factors: [
        {
          factor: 'standard_operation',
          severity: 'low',
          weight: 0.1,
          details: 'Routine lead import from verified source',
        },
        {
          factor: 'data_validation_passed',
          severity: 'low',
          weight: 0.05,
          details: 'All records validated against schema',
        },
      ],
      similar_actions: {
        past_30_days: 89,
        success_rate: 0.988,
        average_completion_time: '1.8s',
      },
      recommendation: 'auto_approve',
      confidence: 0.92,
    },
    approval_request: {
      action_id: 'act_002',
      risk_score: 0.12,
      approval_type: 'human_required',
      approvers: ['role:sales_lead'],
      deadline: '2024-12-24T15:20:00Z',
      priority: 'normal',
    },
    approval_decision: {
      action_id: 'act_002',
      decision: 'approved',
      approver: 'user_789',
      timestamp: '2024-12-24T14:22:00Z',
      reason: 'Standard lead import, source verified',
    },
    execution_result: {
      action_id: 'act_002',
      started_at: '2024-12-24T14:25:00Z',
      completed_at: '2024-12-24T14:25:03Z',
      status: 'success',
      result: {
        records_created: 25,
        records_failed: 0,
        execution_time: '3.2s',
      },
      side_effects: [
        {
          type: 'email_sent',
          details: 'Notification sent to sales team',
        },
      ],
    },
    status: 'executed',
  },
  {
    action_id: 'act_003',
    workflow_id: 'wf_data_cleanup_v1',
    initiator: {
      type: 'ai_agent',
      source: 'agent_gpt4',
      session_id: 'session_abc123',
    },
    timestamp: '2024-12-23T09:15:00Z',
    action_type: 'api.call',
    target: {
      system: 'hubspot',
      resource: 'contacts',
      operation: 'update',
    },
    payload: {
      contacts_count: 150,
      action: 'update_tags',
      tag: 'event_attendee_2024',
    },
    context: {
      business_reason: 'Update contact tags based on event attendance',
      related_entities: ['event:webinar_2024'],
      prior_actions: ['attendee_list_generated'],
      service: 'hubspot',
      namespace: 'marketing',
      status: 'verified',
    },
    risk_assessment: {
      action_id: 'act_003',
      timestamp: '2024-12-23T09:15:02Z',
      risk_score: 0.08,
      risk_level: 'low',
      risk_factors: [
        {
          factor: 'ai_initiated_action',
          severity: 'low',
          weight: 0.15,
          details: 'Action initiated by AI agent with approval workflow',
        },
        {
          factor: 'bulk_update_operation',
          severity: 'low',
          weight: 0.08,
          details: 'Updating 150 contacts - within normal batch size',
        },
      ],
      similar_actions: {
        past_30_days: 234,
        success_rate: 0.996,
        average_completion_time: '2.1s',
      },
      recommendation: 'auto_approve',
      confidence: 0.95,
    },
    approval_request: {
      action_id: 'act_003',
      risk_score: 0.08,
      approval_type: 'human_required',
      approvers: ['role:marketing_ops'],
      deadline: '2024-12-23T10:15:00Z',
      priority: 'low',
    },
    approval_decision: {
      action_id: 'act_003',
      decision: 'approved',
      approver: 'user_101',
      timestamp: '2024-12-23T09:20:00Z',
      reason: 'Standard tag update operation',
    },
    execution_result: {
      action_id: 'act_003',
      started_at: '2024-12-23T09:21:00Z',
      completed_at: '2024-12-23T09:21:02Z',
      status: 'success',
      result: {
        contacts_updated: 148,
        contacts_failed: 2,
        execution_time: '2.3s',
      },
      side_effects: [
        {
          type: 'database_updated',
          details: 'Contact tags updated in CRM',
        },
        {
          type: 'audit_log_created',
          details: 'Action logged in audit trail',
        },
      ],
    },
    verification_result: {
      action_id: 'act_003',
      timestamp: '2024-12-23T09:21:05Z',
      overall_status: 'verified',
      checks: [
        {
          type: 'state_consistency',
          status: 'pass',
          details: 'Contact tags match expected state',
        },
        {
          type: 'downstream_effects',
          status: 'pass',
          details: 'All downstream systems updated',
        },
      ],
      confidence: 0.97,
    },
    status: 'verified',
  },
  {
    action_id: 'act_004',
    workflow_id: 'wf_finance_adj_v1',
    initiator: {
      type: 'webhook',
      source: 'invoice_system',
      session_id: 'session_004',
    },
    timestamp: '2024-12-22T16:45:00Z',
    action_type: 'database.update',
    target: {
      system: 'quickbooks',
      resource: 'invoices',
      operation: 'adjustment',
    },
    payload: {
      invoice_id: 'inv_789101',
      adjustment_amount: -500,
      reason: 'payment_dispute',
    },
    context: {
      business_reason: 'Automatic adjustment for disputed invoice',
      related_entities: ['invoice:inv_789101', 'customer:c_555'],
      prior_actions: ['dispute_received', 'review_scheduled'],
      service: 'quickbooks',
      namespace: 'finance',
      status: 'rejected',
    },
    risk_assessment: {
      action_id: 'act_004',
      timestamp: '2024-12-22T16:45:03Z',
      risk_score: 0.67,
      risk_level: 'high',
      risk_factors: [
        {
          factor: 'high_financial_impact',
          severity: 'high',
          weight: 0.7,
          details: 'Adjustment amount exceeds standard authority limit',
        },
        {
          factor: 'disputed_invoice',
          severity: 'medium',
          weight: 0.4,
          details: 'Invoice currently under dispute investigation',
        },
        {
          factor: 'requires_multi_approval',
          severity: 'high',
          weight: 0.6,
          details: 'Action requires both finance manager and controller approval',
        },
      ],
      similar_actions: {
        past_30_days: 12,
        success_rate: 0.833,
        average_completion_time: '45m',
      },
      recommendation: 'human_review',
      confidence: 0.88,
    },
    approval_request: {
      action_id: 'act_004',
      risk_score: 0.67,
      approval_type: 'human_required',
      approvers: ['role:finance_manager', 'role:controller'],
      deadline: '2024-12-22T18:45:00Z',
      priority: 'high',
    },
    approval_decision: {
      action_id: 'act_004',
      decision: 'rejected',
      approver: 'user_202',
      timestamp: '2024-12-22T16:50:00Z',
      reason: 'Adjustment exceeds authority limit, requires VP approval',
    },
    status: 'rejected',
  },
  {
    action_id: 'act_005',
    workflow_id: 'wf_system_maintenance',
    initiator: {
      type: 'scheduled',
      source: 'cron_job',
      session_id: 'session_005',
    },
    timestamp: '2024-12-25T10:00:00Z',
    action_type: 'system.command',
    target: {
      system: 'aws',
      resource: 'ec2',
      operation: 'restart_service',
    },
    payload: {
      service: 'api_gateway',
      instance_id: 'i-abc123def456',
    },
    context: {
      business_reason: 'Scheduled maintenance window',
      related_entities: ['service:api_gateway'],
      prior_actions: ['health_check_failed', 'alert_sent'],
      service: 'aws',
      namespace: 'infrastructure',
      status: 'executing',
    },
    risk_assessment: {
      action_id: 'act_005',
      timestamp: '2024-12-25T10:00:02Z',
      risk_score: 0.31,
      risk_level: 'medium',
      risk_factors: [
        {
          factor: 'service_downtime',
          severity: 'medium',
          weight: 0.4,
          details: 'Expected 2-3 minutes downtime during restart',
        },
        {
          factor: 'maintenance_window',
          severity: 'low',
          weight: 0.15,
          details: 'Action scheduled during approved maintenance window',
        },
        {
          factor: 'backup_verified',
          severity: 'low',
          weight: 0.1,
          details: 'System backup completed and verified',
        },
      ],
      similar_actions: {
        past_30_days: 8,
        success_rate: 0.975,
        average_completion_time: '3.5m',
      },
      recommendation: 'human_review',
      confidence: 0.80,
    },
    approval_request: {
      action_id: 'act_005',
      risk_score: 0.31,
      approval_type: 'human_required',
      approvers: ['role:devops'],
      deadline: '2024-12-25T10:30:00Z',
      priority: 'high',
    },
    approval_decision: {
      action_id: 'act_005',
      decision: 'approved',
      approver: 'user_303',
      timestamp: '2024-12-25T09:55:00Z',
      reason: 'Within maintenance window, backup verified',
    },
    execution_result: {
      action_id: 'act_005',
      started_at: '2024-12-25T10:01:00Z',
      completed_at: null,
      status: 'partial',
      result: {
        status: 'in_progress',
        progress: '65%',
      },
      side_effects: [
        {
          type: 'notification_sent',
          details: 'Maintenance notification sent to team',
        },
      ],
    },
    status: 'executing',
  },
];

export const mockApiService = {
  async getHealth() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'healthy',
          version: '1.0.0',
          uptime: '7d 14h 32m',
          timestamp: new Date().toISOString(),
        });
      }, 300);
    });
  },

  async declareAction(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const action_id = `act_${Date.now()}`;
        const riskScore = Math.random() * 0.5 + 0.1;
        const riskLevel = riskScore > 0.5 ? 'high' : riskScore > 0.3 ? 'medium' : 'low';
        
        const newAction = {
          action_id,
          workflow_id: data.workflow_id || 'wf_custom_v1',
          initiator: data.initiator || { 
            type: 'human', 
            source: 'current_user',
            session_id: `session_${Date.now()}`,
          },
          timestamp: new Date().toISOString(),
          action_type: data.action_type || 'api.call',
          target: {
            system: data.target?.system || 'unknown',
            resource: data.target?.resource || 'unknown',
            operation: data.target?.operation || 'unknown',
          },
          payload: data.payload || {},
          context: data.context || {
            business_reason: 'Custom action',
            related_entities: [],
            prior_actions: [],
            service: data.target?.system || 'unknown',
            namespace: 'custom',
            status: 'pending',
          },
          risk_assessment: {
            action_id,
            timestamp: new Date().toISOString(),
            risk_score: riskScore,
            risk_level: riskLevel,
            risk_factors: [
              {
                factor: 'custom_action',
                severity: riskLevel,
                weight: riskScore,
                details: 'Custom action requires review',
              },
            ],
            similar_actions: {
              past_30_days: Math.floor(Math.random() * 50),
              success_rate: 0.85 + Math.random() * 0.1,
              average_completion_time: `${(Math.random() * 5 + 1).toFixed(1)}s`,
            },
            recommendation: riskScore > 0.3 ? 'human_review' : 'auto_approve',
            confidence: 0.85 + Math.random() * 0.1,
          },
          approval_request: {
            action_id,
            risk_score: riskScore,
            approval_type: riskScore > 0.3 ? 'human_required' : 'auto_approve',
            approvers: ['role:default_approver'],
            deadline: new Date(Date.now() + 3600000).toISOString(),
            priority: 'normal',
          },
          status: 'pending_approval',
        };
        
        mockActions.unshift(newAction);
        resolve(newAction);
      }, 500);
    });
  },

  async approveAction(actionId, approver, reason) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const action = mockActions.find(a => a.action_id === actionId);
        if (action) {
          action.approval_decision = {
            action_id: actionId,
            decision: 'approved',
            approver,
            timestamp: new Date().toISOString(),
            reason: reason || 'Manual approval',
          };
          action.status = 'approved';
          action.context.status = 'approved';
          resolve({ success: true, action });
        } else {
          reject(new Error('Action not found'));
        }
      }, 400);
    });
  },

  async rejectAction(actionId, approver, reason) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const action = mockActions.find(a => a.action_id === actionId);
        if (action) {
          action.approval_decision = {
            action_id: actionId,
            decision: 'rejected',
            approver,
            timestamp: new Date().toISOString(),
            reason: reason || 'Manual rejection',
          };
          action.status = 'rejected';
          action.context.status = 'rejected';
          resolve({ success: true, action });
        } else {
          reject(new Error('Action not found'));
        }
      }, 400);
    });
  },

  async executeAction(actionId, webhookUrl) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const action = mockActions.find(a => a.action_id === actionId);
        if (action) {
          const executionTime = (Math.random() * 3 + 0.5).toFixed(1);
          const started = new Date().toISOString();
          const completed = new Date(Date.now() + parseFloat(executionTime) * 1000).toISOString();
          
          action.execution_result = {
            action_id: actionId,
            started_at: started,
            completed_at: completed,
            status: 'success',
            result: {
              execution_time: `${executionTime}s`,
              webhook_url: webhookUrl,
              ...(action.action_type === 'payment.process' && {
                refund_id: `re_${Date.now()}`,
                amount_refunded: action.payload.amount,
                currency: action.payload.currency,
              }),
              ...(action.action_type === 'database.update' && {
                records_affected: Math.floor(Math.random() * 100) + 1,
              }),
            },
            side_effects: [
              {
                type: 'audit_log_created',
                details: 'Action execution logged',
              },
            ],
          };
          action.status = 'executed';
          action.context.status = 'executed';
          resolve({ success: true, execution: action.execution_result });
        } else {
          reject(new Error('Action not found'));
        }
      }, 800);
    });
  },

  async verifyAction(actionId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const action = mockActions.find(a => a.action_id === actionId);
        if (action) {
          action.verification_result = {
            action_id: actionId,
            timestamp: new Date().toISOString(),
            overall_status: 'verified',
            checks: [
              {
                type: 'state_consistency',
                status: 'pass',
                details: 'System state verified',
              },
              {
                type: 'downstream_effects',
                status: 'pass',
                details: 'All downstream effects completed',
              },
            ],
            confidence: 0.95,
          };
          action.status = 'verified';
          action.context.status = 'verified';
          resolve({ success: true, verification: action.verification_result });
        } else {
          reject(new Error('Action not found'));
        }
      }, 500);
    });
  },

  async rollbackAction(actionId, reason) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const action = mockActions.find(a => a.action_id === actionId);
        if (action) {
          action.rollback = {
            action_id: actionId,
            timestamp: new Date().toISOString(),
            reason: reason || 'Manual rollback',
            status: 'completed',
            compensating_actions: ['state_restored', 'audit_updated'],
          };
          action.status = 'rolled_back';
          action.context.status = 'rolled_back';
          resolve({ success: true, rollback: action.rollback });
        } else {
          reject(new Error('Action not found'));
        }
      }, 700);
    });
  },

  async getAuditTrail(actionId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const action = mockActions.find(a => a.action_id === actionId);
        const events = [
          {
            timestamp: action?.timestamp || new Date(Date.now() - 300000).toISOString(),
            event: 'action_declared',
            actor: action?.initiator?.source || 'system',
            details: { workflow_id: action?.workflow_id || 'unknown' },
          },
          {
            timestamp: action?.risk_assessment?.timestamp || new Date(Date.now() - 299000).toISOString(),
            event: 'risk_assessed',
            actor: 'risk_engine',
            details: { 
              risk_score: action?.risk_assessment?.risk_score || 0,
              recommendation: action?.risk_assessment?.recommendation || 'unknown',
            },
          },
        ];

        if (action?.approval_decision) {
          events.push({
            timestamp: action.approval_decision.timestamp,
            event: `approval_${action.approval_decision.decision}`,
            actor: action.approval_decision.approver,
            details: { reason: action.approval_decision.reason },
          });
        }

        if (action?.execution_result) {
          events.push({
            timestamp: action.execution_result.started_at,
            event: 'execution_started',
            actor: 'execution_engine',
            details: { status: action.execution_result.status },
          });
        }

        if (action?.verification_result) {
          events.push({
            timestamp: action.verification_result.timestamp,
            event: 'verification_completed',
            actor: 'verification_engine',
            details: { status: action.verification_result.overall_status },
          });
        }

        resolve({
          action_id: actionId,
          audit_trail: events,
        });
      }, 300);
    });
  },

  async getExplanation(actionId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const action = mockActions.find(a => a.action_id === actionId);
        if (action) {
          resolve({
            action_id: actionId,
            explanation: `This action was initiated via ${action.initiator.type} from ${action.initiator.source} as part of the ${action.workflow_id} workflow. The system assessed a ${action.risk_assessment.risk_level} risk level (${(action.risk_assessment.risk_score * 100).toFixed(0)}%) based on ${action.risk_assessment.risk_factors.length} risk factors. ${action.approval_request.approval_type === 'human_required' ? 'Human approval is required due to risk assessment.' : 'The action can proceed with automatic approval.'}`,
            factors: action.risk_assessment.risk_factors.map(f => f.factor),
            risk_breakdown: action.risk_assessment,
          });
        } else {
          resolve({
            action_id: actionId,
            explanation: 'Action not found in system',
            factors: [],
          });
        }
      }, 400);
    });
  },

  async getActions() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockActions);
      }, 300);
    });
  },
};