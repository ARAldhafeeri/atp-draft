import React, { useState } from 'react';
import { 
  Timeline, 
  Card, 
  Badge, 
  Descriptions, 
  Alert, 
  Tag, 
  Collapse,
  Button,
  Space,
  Typography,
  Divider,
  message
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CodeOutlined,
  CopyOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Text, Title, Paragraph } = Typography;

const ActionAuditViewer = ({auditTrail, actionData}) => {
  const [expandedEvent, setExpandedEvent] = useState(null);
  
  // Load the action data from the uploaded JSON

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getEventConfig = (event) => {
    const configs = {
      action_declared: {
        label: 'Action Declared',
        color: 'blue',
        icon: <FileTextOutlined />,
      },
      risk_assessed: {
        label: 'Risk Assessed',
        color: 'orange',
        icon: <SafetyOutlined />,
      },
      approval_received: {
        label: 'Approval Received',
        color: 'green',
        icon: <CheckCircleOutlined />,
      },
      status_updated: {
        label: 'Status Updated',
        color: 'blue',
        icon: <ClockCircleOutlined />,
      },
      execution_completed: {
        label: 'Execution Completed',
        color: 'purple',
        icon: <PlayCircleOutlined />,
      },
      verification_completed: {
        label: 'Verification Completed',
        color: 'cyan',
        icon: <SafetyOutlined />,
      },
    };
    return configs[event] || { label: event, color: 'default', icon: <FileTextOutlined /> };
  };

  const copyToClipboard = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    message.success('JSON copied to clipboard!');
  };

  const renderEventDetails = (entry) => {
    const { event, data } = entry;

    switch (event) {
      case 'action_declared':
        return (
          <Card size="small" style={{ marginTop: 8 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Action Type">{data.action_type}</Descriptions.Item>
              <Descriptions.Item label="Service">{data.payload?.application_name}</Descriptions.Item>
              <Descriptions.Item label="Operation">
                <Tag color="blue">{data.target?.operation}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Version">
                {data.payload?.current_version} → {data.payload?.rollback_to_version}
              </Descriptions.Item>
            </Descriptions>
            {data.context?.impact_assessment && (
              <Alert
                message="Impact Assessment"
                description={
                  <div>
                    <div>Affected Users: {data.context.impact_assessment.affected_users}</div>
                    <div>Revenue Impact: <Tag color="red">{data.context.impact_assessment.revenue_impact}</Tag></div>
                  </div>
                }
                type="warning"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </Card>
        );

      case 'risk_assessed':
        return (
          <Card size="small" style={{ marginTop: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Risk Score: </Text>
                <Tag color={data.risk_score > 0.7 ? 'red' : data.risk_score > 0.4 ? 'orange' : 'green'}>
                  {(data.risk_score * 100).toFixed(0)}%
                </Tag>
                <Tag color={data.risk_level === 'high' ? 'red' : 'orange'}>{data.risk_level}</Tag>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              {data.risk_factors?.map((factor, idx) => (
                <div key={idx}>
                  <Tag color={factor.severity === 'high' ? 'red' : factor.severity === 'medium' ? 'orange' : 'green'}>
                    {factor.severity}
                  </Tag>
                  <Text>{factor.details}</Text>
                </div>
              ))}
            </Space>
          </Card>
        );

      case 'approval_received':
        return (
          <Card size="small" style={{ marginTop: 8 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Decision">
                <Badge status={data.decision === 'approved' ? 'success' : 'error'} text={data.decision} />
              </Descriptions.Item>
              <Descriptions.Item label="Approver">{data.approver}</Descriptions.Item>
              <Descriptions.Item label="Reason" span={2}>{data.reason}</Descriptions.Item>
            </Descriptions>
          </Card>
        );

      case 'status_updated':
        return (
          <Card size="small" style={{ marginTop: 8 }}>
            <Text>
              Status changed from <Tag>{data.previous_status}</Tag> to <Tag color="blue">{data.new_status}</Tag>
            </Text>
          </Card>
        );

      case 'execution_completed':
        return (
          <Card size="small" style={{ marginTop: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Status: </Text>
                <Badge status={data.status === 'success' ? 'success' : 'error'} text={data.status} />
              </div>
              {data.result?.error && (
                <Alert message="Error" description={data.result.error} type="error" showIcon />
              )}
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Duration">
                  {((new Date(data.completed_at) - new Date(data.started_at)) / 1000).toFixed(2)}s
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>
        );

      case 'verification_completed':
        return (
          <Card size="small" style={{ marginTop: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Status: </Text>
                <Badge 
                  status={data.overall_status === 'verification_passed' ? 'success' : 'error'} 
                  text={data.overall_status} 
                />
              </div>
              <Divider style={{ margin: '8px 0' }} />
              {data.checks?.map((check, idx) => (
                <div key={idx}>
                  {check.status === 'pass' ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                  )}
                  <Text strong>{check.type}: </Text>
                  <Text type="secondary">{check.details}</Text>
                </div>
              ))}
            </Space>
          </Card>
        );

      default:
        return null;
    }
  };
  console.log("audit trail", auditTrail);
  console.log("action data", actionData);
  const timelineItems = auditTrail?.map?.((entry, index) => {
    const eventConfig = getEventConfig(entry.event);
    
    return {
      color: eventConfig.color,
      dot: eventConfig.icon,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <Title level={5} style={{ margin: 0 }}>{eventConfig.label}</Title>
              <Text type="secondary">{formatTimestamp(entry.timestamp)}</Text>
            </div>
            <Button
              size="small"
              icon={<CodeOutlined />}
              onClick={() => setExpandedEvent(expandedEvent === index ? null : index)}
            >
              {expandedEvent === index ? 'Hide JSON' : 'View JSON'}
            </Button>
          </div>

          {renderEventDetails(entry)}

          {expandedEvent === index && (
            <Card 
              size="small" 
              style={{ marginTop: 12, backgroundColor: '#f5f5f5' }}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>Event Data (JSON)</Text>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(entry)}
                  >
                    Copy
                  </Button>
                </div>
              }
            >
              <pre style={{ 
                maxHeight: 400, 
                overflow: 'auto', 
                fontSize: 12,
                margin: 0,
                padding: 12,
                backgroundColor: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: 4
              }}>
                {JSON.stringify(entry, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      ),
    };
  });

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>Action Audit Trail</Title>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Action ID">{actionData.action_id}</Descriptions.Item>
              <Descriptions.Item label="Workflow ID">{actionData.workflow_id}</Descriptions.Item>
              <Descriptions.Item label="Service">{actionData.payload.application_name}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge 
                  status={actionData.status === 'executed' ? 'processing' : 'default'} 
                  text={actionData.status} 
                />
              </Descriptions.Item>
              <Descriptions.Item label="Environment">
                <Tag color="red">{actionData.context.environment}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Severity">
                <Tag color="red">{actionData.context.severity}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>

          <Divider />

          <Timeline items={timelineItems} mode="left" />
        </Space>
      </Card>
    </div>
  );
};

export default ActionAuditViewer;