import { Card, Statistic, Row, Col } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, ApiOutlined, ThunderboltOutlined } from '@ant-design/icons';



const StatisticsCards = ({ actions }) => {
  const totalActions = actions.length;
  const approvedActions = actions.filter(a => a.approval).length;
  const executedActions = actions.filter(a => a.execution).length;
  const highRiskActions = actions.filter(a => a.risk_assessment?.risk_level === 'high').length;

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Total Actions"
            value={totalActions}
            prefix={<ApiOutlined />}
            styles={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Approved"
            value={approvedActions}
            prefix={<CheckCircleOutlined />}
            styles={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Executed"
            value={executedActions}
            prefix={<ThunderboltOutlined />}
            styles={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="High Risk"
            value={highRiskActions}
            prefix={<ExclamationCircleOutlined />}
            styles={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StatisticsCards;