import { Card, Tag, Timeline, Descriptions, Space, Typography  } from 'antd';
import { getRiskColor } from "../utils";

const { Text } = Typography;


const RiskAssessmentCard = ({ riskAssessment }) => {
  if (!riskAssessment) return null;

  return (
    <Card title="Risk Assessment" style={{ marginBottom: 16 }}>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Risk Score">
          <Space>
            <Text strong>{(riskAssessment.risk_score * 100).toFixed(0)}%</Text>
            <Tag color={getRiskColor(riskAssessment.risk_level)}>
              {riskAssessment.risk_level?.toUpperCase()}
            </Tag>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Confidence">
          {(riskAssessment.confidence * 100).toFixed(0)}%
        </Descriptions.Item>
        <Descriptions.Item label="Recommendation" span={2}>
          <Tag color={riskAssessment.recommendation === 'auto_approve' ? 'success' : 'warning'}>
            {riskAssessment.recommendation.replace('_', ' ')?.toUpperCase()}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 16 }}>
        <Text strong>Risk Factors:</Text>
        <Timeline style={{ marginTop: 12 }}>
          {riskAssessment.risk_factors?.map((factor, idx) => (
            <Timeline.Item
              key={idx}
              color={getRiskColor(factor.severity)}
            >
              <Space direction="vertical" size={0}>
                <Text strong>{factor.factor.replace(/_/g, ' ')}</Text>
                <Text type="secondary">{factor.details}</Text>
                <Text type="secondary">Weight: {(factor.weight * 100).toFixed(0)}%</Text>
              </Space>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    </Card>
  );
};
export default RiskAssessmentCard;