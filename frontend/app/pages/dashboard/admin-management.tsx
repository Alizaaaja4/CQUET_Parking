// PARK-IQ-CENTRAL-FE/app/routes/dashboard/admin-management.tsx
import React, { useEffect, useState } from 'react';
import { Typography, Table, Button, Space, Modal, Form, Input, Popconfirm, message, Spin, Alert, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
// Ensure both userService and the specific types are imported correctly
import { userService, type AdminAccount, type GetAdminAccountsResponse } from '../../api/userService'; // <<<--- Ensure GetAdminAccountsResponse is imported

const { Title } = Typography;
const { Option } = Select;

export function meta() {
  return [{ title: "Dashboard - Admin Management" }];
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [form] = Form.useForm();
  const [modalLoading, setModalLoading] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      // Data received will be of type GetAdminAccountsResponse: { users: AdminAccount[] }
      const data: GetAdminAccountsResponse = await userService.getAdminAccounts(); // <<<--- Explicitly type 'data' for clarity
      setAdmins(data.users); // <<<--- FIX: Use 'data.users' here
    } catch (err: any) {
      console.error('Error fetching admin accounts:', err);
      setError(err.message || 'Failed to fetch admin accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdd = () => {
    setEditingAdmin(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: AdminAccount) => {
    setEditingAdmin(record);
    form.setFieldsValue({
      id: record.id,
      username: record.username,
      email: record.email,
      role: record.role,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.deleteAdminAccount(id);
      message.success(`Admin account ${id} deleted successfully!`);
      fetchAdmins();
    } catch (err: any) {
      message.error(err.response?.data?.message || `Failed to delete admin account ${id}.`);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      if (editingAdmin) {
        // For editing, exclude password if it's not being updated
        const updatePayload = {
          username: values.username,
          email: values.email,
          role: values.role,
          // Do NOT send password if it's not explicitly changed
        };
        await userService.updateAdminAccount(editingAdmin.id, updatePayload);
        message.success(`Admin account ${values.username} updated successfully!`);
      } else {
        // For creating, send username, email, password, role
        // No need for confirmPassword in payload to backend
        await userService.createAdminAccount({
          username: values.username,
          password: values.password, // Ensure this is sent
          email: values.email,
          role: values.role,
        });
        message.success(`Admin account ${values.username} added successfully!`);
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchAdmins();
    } catch (err: any) {
      console.error('Modal operation failed:', err);
      const errorMessage = err.response?.data?.message || 'Operation failed. Please try again.';
      message.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: AdminAccount) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this account?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading Admin Accounts..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Title level={3}>Admin Accounts Management</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
        Add New Admin
      </Button>
      <Table dataSource={admins} columns={columns} rowKey="id" />

      <Modal
        title={editingAdmin ? "Edit Admin Account" : "Add New Admin Account"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={modalLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please input username!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please input valid email!' }]}>
            <Input />
          </Form.Item>
          {!editingAdmin && ( // Password fields only for new admin creation
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input password!' }]}>
              <Input.Password />
            </Form.Item>
            // <<<--- REMOVED confirmPassword Form.Item HERE ---<<<
          )}
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role!' }]}>
            <Select placeholder="Select a role">
              <Option value="admin">Admin</Option>
              <Option value="operator">Operator</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}