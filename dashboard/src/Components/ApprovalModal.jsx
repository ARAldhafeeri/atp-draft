
import  { useState } from 'react';
import {  Button, Modal, Form, Input, Space,  message, Typography } from 'antd';

const { TextArea } = Input;
import {apiService } from "../api";


const ApprovalModal = ({ visible, action, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleApprove = async (values) => {
    setLoading(true);
    try {
      await apiService.approveAction(action.action_id, values.approver, values.reason);
      message.success('Action approved successfully!');
      form.resetFields();
      onSuccess();
    } catch  {
      message.error('Failed to approve action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Approve Action"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleApprove}>
        <Form.Item
          name="approver"
          label="Approver Name"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <Input placeholder="e.g., john.doe@company.com" />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Approval Reason"
          rules={[{ required: true, message: 'Please enter reason' }]}
        >
          <TextArea rows={4} placeholder="Why are you approving this action?" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Approve
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ApprovalModal;