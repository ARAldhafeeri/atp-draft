import { useState } from 'react';
import {  Button, Modal, Form, Input, Space, message} from 'antd';

import {apiService } from "../api";


const ExecuteModal = ({ visible, action, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleExecute = async (values) => {
    setLoading(true);
    try {
      const result = await apiService.executeAction(action.action_id, values.webhook_url);
      message.success('Action executed successfully!');
      form.resetFields();
      onSuccess(result);
    } catch  {
      message.error('Failed to execute action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Execute Action"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleExecute} initialValues={{ webhook_url: 'http://localhost:5678/webhook/atp-execute' }}>
        <Form.Item
          name="webhook_url"
          label="n8n Webhook URL"
          rules={[{ required: true, message: 'Please enter webhook URL' }]}
        >
          <Input placeholder="http://localhost:5678/webhook/atp-execute" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Execute
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExecuteModal