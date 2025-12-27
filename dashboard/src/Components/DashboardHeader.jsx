import { Layout, Button, Badge, Space, Typography } from 'antd';
import {  ReloadOutlined, SafetyOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title, Text } = Typography;



const DashboardHeader = ({ healthStatus, onRefresh }) => (
  <Header style={{ background: '#001529', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <SafetyOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
      <Title level={3} style={{ color: 'white', margin: 0 }}>
        ATP Gateway Dashboard
      </Title>
    </div>
    <Space>
      {healthStatus && (
        <Badge status={healthStatus.status === 'healthy' ? 'success' : 'error'} text={
          <Text style={{ color: 'white' }}>
            {healthStatus.status === 'healthy' ? 'System Healthy' : 'System Down'}
          </Text>
        } />
      )}
      <Button icon={<ReloadOutlined />} onClick={onRefresh}>
        Refresh
      </Button>
    </Space>
  </Header>
);
export default DashboardHeader;