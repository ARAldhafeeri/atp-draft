import React, { useState } from 'react';
import { Layout, Button, Modal, Form, Input, Select, Space, message, Typography } from 'antd';

import { apiService } from "../api";


const CreateActionModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const data = await apiService.declareAction({
        service: values.service,
        namespace: values.namespace,
        status: values.status,
        error_rate: values.error_rate,
        recent_deployment: values.recent_deployment === 'true',
      });
      message.success('Action declared successfully!');
      form.resetFields();
      onSuccess(data);
    } catch {
      message.error('Failed to declare action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Declare New Action"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="service"
          label="Service Name"
          rules={[{ required: true, message: 'Please enter service name' }]}
        >
          <Input placeholder="e.g., payment-api" />
        </Form.Item>

        <Form.Item
          name="namespace"
          label="Namespace"
          rules={[{ required: true, message: 'Please select namespace' }]}
        >
          <Select placeholder="Select namespace">
            <Select.Option value="production">Production</Select.Option>
            <Select.Option value="staging">Staging</Select.Option>
            <Select.Option value="development">Development</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Current Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select placeholder="Select status">
            <Select.Option value="down">Down</Select.Option>
            <Select.Option value="degraded">Degraded</Select.Option>
            <Select.Option value="critical">Critical</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="error_rate" label="Error Rate">
          <Input placeholder="e.g., 15%" />
        </Form.Item>

        <Form.Item name="recent_deployment" label="Recent Deployment">
          <Select placeholder="Select">
            <Select.Option value="true">Yes</Select.Option>
            <Select.Option value="false">No</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Declare Action
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateActionModal;