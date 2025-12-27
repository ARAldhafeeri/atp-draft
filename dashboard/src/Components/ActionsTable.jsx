import { Table, Tag, Button, Space, Typography, Tooltip, Progress } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  PlayCircleOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined,
  SyncOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';

const { Text } = Typography;

const getStatusConfig = (status) => {
  switch (status) {
    case 'pending_approval':
      return { icon: <ClockCircleOutlined />, color: '#faad14', text: 'Pending Approval' };
    case 'approved':
      return { icon: <CheckCircleOutlined />, color: '#52c41a', text: 'Approved' };
    case 'executed':
      return { icon: <PlayCircleOutlined />, color: '#1890ff', text: 'Executed' };
    case 'verified':
      return { icon: <CheckCircleFilled />, color: '#722ed1', text: 'Verified' };
    case 'rejected':
      return { icon: <CloseCircleOutlined />, color: '#ff4d4f', text: 'Rejected' };
    case 'executing':
      return { icon: <SyncOutlined spin />, color: '#1890ff', text: 'Executing' };
    default:
      return { icon: <ExclamationCircleOutlined />, color: '#d9d9d9', text: status };
  }
};

const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case 'low': return 'green';
    case 'medium': return 'orange';
    case 'high': return 'red';
    default: return 'default';
  }
};

const getInitiatorIcon = (type) => {
  switch (type) {
    case 'human': return '👤';
    case 'scheduled': return '⏰';
    case 'ai_agent': return '🤖';
    case 'webhook': return '🔗';
    default: return '⚡';
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  return format(new Date(timestamp), 'MMM d, HH:mm');
};

const ActionsTable = ({ actions, onViewDetails, onApprove, onReject, onExecute }) => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'action_id',
      key: 'action_id',
      width: 100,
      render: (text) => <Text code>{text}</Text>,
      fixed: 'left',
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.target?.operation || 'N/A'} {record.target?.resource || ''}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <Tooltip title={`Initiated by ${record.initiator?.type}`}>
              <span style={{ marginRight: 4 }}>{getInitiatorIcon(record.initiator?.type)}</span>
            </Tooltip>
            {record.action_type}
          </div>
        </div>
      ),
    },
    {
      title: 'System',
      key: 'system',
      width: 120,
      render: (_, record) => (
        <Tag color="blue">
          {record.target?.system || record.context?.service || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Risk',
      key: 'risk',
      width: 120,
      render: (_, record) => {
        const risk = record.risk_assessment;
        if (!risk) return <Tag>N/A</Tag>;
        
        return (
          <Tooltip title={`Score: ${(risk.risk_score * 100).toFixed(1)}%`}>
            <div>
              <Tag color={getRiskColor(risk.risk_level)}>
                {risk.risk_level.toUpperCase()}
              </Tag>
              <Progress 
                percent={risk.risk_score * 100} 
                size="small" 
                showInfo={false}
                strokeColor={getRiskColor(risk.risk_level)}
                style={{ marginTop: 4 }}
              />
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 140,
      render: (_, record) => {
        const config = getStatusConfig(record.status);
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Time',
      key: 'timestamp',
      width: 120,
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {formatTime(record.timestamp)}
        </Text>
      ),
    },
    {
      title: 'Approval',
      key: 'approval',
      width: 160,
      render: (_, record) => {
        if (record.approval_decision) {
          return (
            <div>
              <div style={{ fontSize: '12px' }}>
                <Text type={record.approval_decision.decision === 'approved' ? 'success' : 'danger'}>
                  {record.approval_decision.decision.toUpperCase()}
                </Text>
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                by {record.approval_decision.approver}
              </div>
            </div>
          );
        }
        
        if (record.approval_request) {
          const approvers = record.approval_request.approvers?.map(a => a.split(':')[1]).join(', ') || '';
          return (
            <div>
              <div style={{ fontSize: '12px', color: '#faad14' }}>
                ⏳ {record.approval_request.priority} priority
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                Needs: {approvers}
              </div>
            </div>
          );
        }
        
        return <Text type="secondary">N/A</Text>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const canApprove = record.status === 'pending_approval' && record.approval_request;
        const canExecute = record.status === 'approved' || 
                         (record.status === 'executing' && record.execution_result?.status === 'partial');
        const canReject = record.status === 'pending_approval';
        
        return (
          <Space>
            <Button 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => onViewDetails(record)}
            >
              Details
            </Button>
            
            {canApprove && (
              <Button 
                size="small" 
                type="primary"
                onClick={() => onApprove(record)}
              >
                Approve
              </Button>
            )}
            
            {canExecute && (
              <Button 
                size="small"
                type="dashed"
                icon={record.status === 'executing' ? <SyncOutlined spin /> : <PlayCircleOutlined />}
                onClick={() => onExecute(record)}
              >
                {record.status === 'executing' ? 'Monitoring' : 'Execute'}
              </Button>
            )}
            
            {canReject && (
              <Button 
                size="small" 
                danger
                onClick={() => onReject(record)}
              >
                Reject
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={actions}
      rowKey="action_id"
      pagination={{ pageSize: 10, showSizeChanger: true }}
      scroll={{ x: 1200 }}
      size="middle"
      rowClassName={(record) => {
        if (record.status === 'rejected') return 'row-rejected';
        if (record.status === 'executing') return 'row-executing';
        return '';
      }}
    />
  );
};

const styles = `
  .row-rejected {
    background-color: #fff2f0 !important;
  }
  .row-executing {
    background-color: #f0f5ff !important;
  }
  .ant-table-row.row-rejected:hover td {
    background-color: #ffe6e6 !important;
  }
  .ant-table-row.row-executing:hover td {
    background-color: #e6f7ff !important;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default ActionsTable;