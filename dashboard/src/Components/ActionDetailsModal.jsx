import React, { useState, useEffect } from 'react';
import { Card, Tag, Typography, Button, Modal, Timeline, Descriptions, Space, message, Tabs } from 'antd';
import { apiService } from "../api";
import { getStatusIcon } from "../utils";
import RiskAssessmentCard from './RiskAssessmentCard';

const { Text, Paragraph } = Typography;

const ActionDetailsModal = ({ visible, action, onClose }) => {
  const [auditTrail, setAuditTrail] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && action) {
      loadDetails();
    }
  }, [visible, action]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const [audit, expl] = await Promise.all([
        apiService.getAuditTrail(action.action_id),
        apiService.getExplanation(action.action_id),
      ]);
      setAuditTrail(audit);
      setExplanation(expl);
    } catch {
      message.error('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  if (!action) return null;

  const items = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Action ID" span={2}>
              <Text code>{action.action_id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Workflow ID" span={2}>
              {action.workflow_id}
            </Descriptions.Item>
            <Descriptions.Item label="Action Type">
              {action.action_type}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Space>
                {getStatusIcon(action.status)}
                <Tag color={
                  action.status === 'verified' ? 'success' :
                  action.status === 'executed' ? 'processing' :
                  action.status === 'approved' ? 'blue' :
                  action.status === 'rejected' ? 'error' :
                  'default'
                }>
                  {action.status?.toUpperCase()}
                </Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Initiator Type">
              {action.initiator?.type}
            </Descriptions.Item>
            <Descriptions.Item label="Source">
              {action.initiator?.source}
            </Descriptions.Item>
            <Descriptions.Item label="Target System">
              {action.target?.system}
            </Descriptions.Item>
            <Descriptions.Item label="Resource">
              {action.target?.resource}
            </Descriptions.Item>
            <Descriptions.Item label="Operation">
              {action.target?.operation}
            </Descriptions.Item>
            <Descriptions.Item label="Timestamp">
              {new Date(action.timestamp).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>

          <Card title="Context" size="small">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Business Reason">
                {action.context?.business_reason}
              </Descriptions.Item>
              <Descriptions.Item label="Service">
                {action.context?.service || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Namespace">
                {action.context?.namespace || 'N/A'}
              </Descriptions.Item>
              {action.context?.related_entities?.length > 0 && (
                <Descriptions.Item label="Related Entities">
                  {action.context.related_entities.join(', ')}
                </Descriptions.Item>
              )}
              {action.context?.prior_actions?.length > 0 && (
                <Descriptions.Item label="Prior Actions">
                  {action.context.prior_actions.join(', ')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <RiskAssessmentCard riskAssessment={action.risk_assessment} />

          {action.approval_request && (
            <Card title="Approval Request" size="small">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Approval Type">
                  <Tag color={action.approval_request.approval_type === 'auto_approve' ? 'success' : 'warning'}>
                    {action.approval_request.approval_type?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Priority">
                  <Tag color={
                    action.approval_request.priority === 'high' ? 'red' :
                    action.approval_request.priority === 'normal' ? 'blue' :
                    'default'
                  }>
                    {action.approval_request.priority?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Required Approvers" span={2}>
                  {action.approval_request.approvers?.join(', ')}
                </Descriptions.Item>
                <Descriptions.Item label="Deadline" span={2}>
                  {new Date(action.approval_request.deadline).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {action.approval_decision && (
            <Card title="Approval Decision" size="small">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Decision">
                  <Tag color={
                    action.approval_decision.decision === 'approved' ? 'success' :
                    action.approval_decision.decision === 'rejected' ? 'error' :
                    'warning'
                  }>
                    {action.approval_decision.decision?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Approver">
                  {action.approval_decision.approver}
                </Descriptions.Item>
                <Descriptions.Item label="Timestamp">
                  {new Date(action.approval_decision.timestamp).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Reason">
                  {action.approval_decision.reason}
                </Descriptions.Item>
                {action.approval_decision.modifications && (
                  <Descriptions.Item label="Modifications">
                    <pre>{JSON.stringify(action.approval_decision.modifications, null, 2)}</pre>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

          {action.execution_result && (
            <Card title="Execution Result" size="small">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Status">
                  <Space>
                    {getStatusIcon(action.execution_result.status)}
                    <Tag color={
                      action.execution_result.status === 'success' ? 'success' :
                      action.execution_result.status === 'failure' ? 'error' :
                      'processing'
                    }>
                      {action.execution_result.status?.toUpperCase()}
                    </Tag>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Execution Time">
                  {action.execution_result.result?.execution_time || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Started At" span={2}>
                  {new Date(action.execution_result.started_at).toLocaleString()}
                </Descriptions.Item>
                {action.execution_result.completed_at && (
                  <Descriptions.Item label="Completed At" span={2}>
                    {new Date(action.execution_result.completed_at).toLocaleString()}
                  </Descriptions.Item>
                )}
                {action.execution_result.side_effects?.length > 0 && (
                  <Descriptions.Item label="Side Effects" span={2}>
                    <Timeline size="small">
                      {action.execution_result.side_effects.map((effect, idx) => (
                        <Timeline.Item key={idx}>
                          <Text strong>{effect.type}</Text>
                          <br />
                          <Text type="secondary">{effect.details}</Text>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

          {action.verification_result && (
            <Card title="Verification Result" size="small">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Overall Status">
                  <Tag color={
                    action.verification_result.overall_status === 'verified' ? 'success' :
                    action.verification_result.overall_status === 'verification_failed' ? 'error' :
                    'warning'
                  }>
                    {action.verification_result.overall_status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Confidence">
                  {(action.verification_result.confidence * 100).toFixed(0)}%
                </Descriptions.Item>
                <Descriptions.Item label="Timestamp" span={2}>
                  {new Date(action.verification_result.timestamp).toLocaleString()}
                </Descriptions.Item>
                {action.verification_result.checks?.length > 0 && (
                  <Descriptions.Item label="Checks" span={2}>
                    <Timeline size="small">
                      {action.verification_result.checks.map((check, idx) => (
                        <Timeline.Item 
                          key={idx}
                          color={check.status === 'pass' ? 'green' : 'red'}
                        >
                          <Text strong>{check.type}</Text> - {check.status}
                          <br />
                          <Text type="secondary">{check.details}</Text>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Space>
      ),
    },
    {
      key: 'explanation',
      label: 'AI Explanation',
      children: (
        <Card loading={loading}>
          {explanation ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {explanation.explanation}
              </Paragraph>
              {explanation.factors?.length > 0 && (
                <>
                  <Text strong>Key Factors:</Text>
                  <ul>
                    {explanation.factors.map((factor, idx) => (
                      <li key={idx}>{factor.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </>
              )}
            </Space>
          ) : (
            <Text type="secondary">No explanation available</Text>
          )}
        </Card>
      ),
    },
    {
      key: 'audit',
      label: 'Audit Trail',
      children: (
        <Card loading={loading}>
          {auditTrail?.audit_trail ? (
            <Timeline>
              {auditTrail.audit_trail.map((log, idx) => (
                <Timeline.Item key={idx} color="blue">
                  <Space direction="vertical" size={0}>
                    <Text strong>{log.event.replace(/_/g, ' ').toUpperCase()}</Text>
                    <Text type="secondary">Actor: {log.actor}</Text>
                    <Text type="secondary">
                      {new Date(log.timestamp).toLocaleString()}
                    </Text>
                    {log.details && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {JSON.stringify(log.details, null, 2)}
                      </Text>
                    )}
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Text type="secondary">No audit trail available</Text>
          )}
        </Card>
      ),
    },
  ];

  return (
    <Modal
      title={`Action Details - ${action.action_id}`}
      open={visible}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Close</Button>}
      width={900}
    >
      <Tabs items={items} />
    </Modal>
  );
};

export default ActionDetailsModal;