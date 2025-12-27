import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Input, Space, message, Typography } from 'antd';
import { ReloadOutlined, ApiOutlined } from '@ant-design/icons';

import DashboardHeader from '../Components/DashboardHeader';
import ActionsTable from '../Components/ActionsTable';
import StatisticsCards from '../Components/StatisticsCards';
import CreateActionModal from '../Components/CreateActionModal';
import ApprovalModal from '../Components/ApprovalModal';
import ExecuteModal from '../Components/ExecuteModal';
import ActionDetailsModal  from '../Components/ActionDetailsModal';

const {  Content } = Layout;
import {apiService } from "../api";


const ATPDashboard = () => {
  const [actions, setActions] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [isExecuteModalVisible, setIsExecuteModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);


  const fetchHealth = async () => {
    try {
      const data = await apiService.getHealth();
      setHealthStatus(data);
    } catch  {
      message.error('Failed to fetch health status');
    }
  };

 // interval check health status every 60 seconds
 useEffect(() => {
  let mounted = true;

  const fetchHealth = async () => {
    try {
      const data = await apiService.getHealth();
      if (mounted) {
        setHealthStatus(data);
      }
    } catch {
      message.error('Failed to fetch health status');
    }
  };

  fetchHealth(); // initial fetch

  const interval = setInterval(fetchHealth, 60000);

  return () => {
    mounted = false;
    clearInterval(interval);
  };
}, []);


// fetch actions on mount
useEffect(() => {
  let mounted = true;
  const fetchActions = async () => {
    try {
      const data = await apiService.getActions();
      if (mounted) {
        setActions(data);
      }
      } catch {
      message.error('Failed to fetch actions');
    }
  };
  fetchActions(); // initial fetch
  return () => {
    mounted = false;
  };
}, []);

  const handleCreateSuccess = (data) => {
    setActions([data, ...actions]);
    setIsCreateModalVisible(false);
  };

  const handleApprovalSuccess = () => {
    setIsApprovalModalVisible(false);
    message.info('Please refresh to see updated status');
  };

  const handleExecuteSuccess = (result) => {
    setIsExecuteModalVisible(false);
    message.success('Execution completed!', result);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <DashboardHeader healthStatus={healthStatus} onRefresh={fetchHealth} />
      
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Space>
                <Button
                  type="primary"
                  icon={<ApiOutlined />}
                  onClick={() => setIsCreateModalVisible(true)}
                >
                  Declare New Action
                </Button>
                <Button icon={<ReloadOutlined />} onClick={fetchHealth}>
                  Refresh Data
                </Button>
              </Space>
            </Card>

            <StatisticsCards actions={actions} />

            <Card title="Actions">
              <ActionsTable
                actions={actions}
                onViewDetails={(action) => {
                  setSelectedAction(action);
                  setIsDetailsModalVisible(true);
                }}
                onApprove={(action) => {
                  setSelectedAction(action);
                  setIsApprovalModalVisible(true);
                }}
                onExecute={(action) => {
                  setSelectedAction(action);
                  setIsExecuteModalVisible(true);
                }}
              />
            </Card>
          </Space>
        </div>
      </Content>

      <CreateActionModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <ApprovalModal
        visible={isApprovalModalVisible}
        action={selectedAction}
        onCancel={() => setIsApprovalModalVisible(false)}
        onSuccess={handleApprovalSuccess}
      />

      <ExecuteModal
        visible={isExecuteModalVisible}
        action={selectedAction}
        onCancel={() => setIsExecuteModalVisible(false)}
        onSuccess={handleExecuteSuccess}
      />

      <ActionDetailsModal
        visible={isDetailsModalVisible}
        action={selectedAction}
        onClose={() => setIsDetailsModalVisible(false)}
      />
    </Layout>
  );
};

export default ATPDashboard;