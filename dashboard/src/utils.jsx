import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ReloadOutlined, ApiOutlined, SafetyOutlined, ThunderboltOutlined } from '@ant-design/icons';


export const getRiskColor = (level) => {
  const colors = {
    low: 'success',
    medium: 'warning',
    high: 'error',
  };
  return colors[level] || 'default';
};

export const getStatusIcon = (status) => {
  const icons = {
    success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    verified: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    failure: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    pending: <ClockCircleOutlined style={{ color: '#faad14' }} />,
    anomaly_detected: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
  };
  return icons[status] || <ClockCircleOutlined />;
};