// PARK-IQ-CENTRAL-FE/app/routes/dashboard/management.tsx
import React, { useEffect, useState } from 'react';
import { Typography, Table, Button, Space, Modal, Form, Input, Select, Popconfirm, message, Spin, Alert, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { parkingService, type ParkingSlot, type GetAllParkingSlotsAdminResponse } from '../../api/parkingService';

const { Title } = Typography;
const { Option } = Select;

export function meta() {
  return [{ title: "Dashboard - Slot Management" }];
}

// Ensure this interface matches the ParkingSlot interface in parkingService.ts
// based on your Flask backend's Slot.to_dict()
interface ParkingSlotDisplay extends Omit<ParkingSlot, 'created_at' | 'updated_at' | 'vehiclePlate' | 'entryTime'> {
  // We're extending the base ParkingSlot to explicitly include fields for display
  // and ensure types align with what the Ant Design Table expects.
  // 'id' is the numeric DB ID
  // 'slot_id' is the human-readable string ID
  // 'level' is string (e.g., "L1")
  // 'zone' is string (e.g., "A")
  // 'status' is string literal ('available' | 'occupied' | 'maintenance')
}

// Define the form values interface for clarity
interface SlotFormValues {
  slot_id: string; // For adding/editing the human-readable ID
  level: string;   // e.g., "L1"
  zone: string;    // e.g., "A"
  status?: 'available' | 'occupied' | 'maintenance'; // Only for editing existing slots
}

export default function SlotManagementPage() {
  const [slots, setSlots] = useState<ParkingSlotDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ParkingSlotDisplay | null>(null);
  const [form] = Form.useForm<SlotFormValues>(); // Use the specific form values interface

  // Function to fetch all slots from the backend
  const fetchSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: GetAllParkingSlotsAdminResponse = await parkingService.getAllParkingSlotsAdmin();
      // Map backend ParkingSlot to ParkingSlotDisplay if necessary,
      // but if the interfaces are aligned, a direct cast might be fine.
      // Ensure the 'key' for the Table (rowKey="id") is unique and present.
      setSlots(response.slots.map(slot => ({ ...slot, key: slot.id.toString() }))); // Add key for Antd Table
    } catch (err: any) {
      console.error('Error fetching parking slots:', err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch parking slots.";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch slots on component mount
  useEffect(() => {
    // A small delay to ensure localStorage is fully loaded after login redirect
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setError("Authentication token missing. Please log in.");
      setLoading(false);
      return;
    }

    // Delay the initial fetch slightly to avoid race conditions with localStorage
    setTimeout(() => {
      fetchSlots();
    }, 50); // Small delay
  }, []);

  const handleAdd = () => {
    setEditingSlot(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: ParkingSlotDisplay) => {
    setEditingSlot(record);
    // Set form fields based on the record, mapping 'id' to 'slot_id' for the form
    form.setFieldsValue({
      slot_id: record.slot_id,
      level: record.level,
      zone: record.zone,
      status: record.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (slotIdToDelete: number, slotIdentifier: string) => {
    setLoading(true); // Show loading during delete operation
    try {
      // Call backend API to delete slot using the numeric 'id'
      await parkingService.deleteParkingSlotAdmin(slotIdToDelete);
      message.success(`Slot ${slotIdentifier} deleted successfully!`);
      fetchSlots(); // Re-fetch data to update the table
    } catch (err: any) {
      console.error(`Error deleting slot ${slotIdentifier}:`, err);
      const errorMessage = err.response?.data?.error || err.message || `Failed to delete slot ${slotIdentifier}.`;
      message.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true); // Show loading during add/update operation

      if (editingSlot) {
        // Update existing slot
        // Backend update expects the numeric 'id' in the URL and a partial payload
        const payload: Partial<ParkingSlot> = {
          slot_id: values.slot_id,
          level: values.level,
          zone: values.zone,
          status: values.status, // Status is only available when editing
        };
        await parkingService.updateParkingSlotAdmin(editingSlot.id, payload);
        message.success(`Slot ${values.slot_id} updated successfully!`);
      } else {
        // Add new slot
        // Backend create expects slot_id, level, zone. Status defaults to available.
        const payload: Omit<ParkingSlot, 'id' | 'status' | 'vehiclePlate' | 'entryTime' | 'created_at' | 'updated_at'> = {
          slot_id: values.slot_id,
          level: values.level,
          zone: values.zone,
        };
        await parkingService.createParkingSlotAdmin(payload);
        message.success(`Slot ${values.slot_id} added successfully!`);
      }
      setIsModalVisible(false);
      fetchSlots(); // Re-fetch data to update the table
    } catch (info) {
      console.log('Validate Failed or API Error:', info);
      const errorMessage = (info as any).response?.data?.error || (info as any).message || "Operation failed.";
      message.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Slot ID', dataIndex: 'slot_id', key: 'slot_id' }, // Use slot_id for display
    { title: 'Level', dataIndex: 'level', key: 'level' },
    { title: 'Zone', dataIndex: 'zone', key: 'zone' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'available' | 'occupied' | 'maintenance') => (
        <Tag color={status === 'available' ? 'success' : status === 'occupied' ? 'error' : 'warning'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ParkingSlotDisplay) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title={`Are you sure to delete slot ${record.slot_id}?`}
            onConfirm={() => handleDelete(record.id, record.slot_id)} // Pass both DB ID and human-readable ID
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
        <Spin size="large" tip="Loading slot data..." />
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
      <Title level={3}>Parking Slot Management</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
        Add New Slot
      </Button>
      <Table dataSource={slots} columns={columns} rowKey="id" /> {/* Use backend 'id' as rowKey */}

      <Modal
        title={editingSlot ? "Edit Parking Slot" : "Add New Parking Slot"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading} // Show loading on modal buttons during API calls
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="slot_id"
            label="Slot ID (e.g., L1A01)"
            rules={[{ required: true, message: 'Please input slot ID!' }]}
          >
            {/* Disable slot_id editing for existing slots */}
            <Input disabled={!!editingSlot} />
          </Form.Item>
          <Form.Item
            name="level"
            label="Level (e.g., L1, L2)"
            rules={[{ required: true, message: 'Please input level!' }]}
          >
            <Input /> {/* Changed type to text as levels are strings like "L1" */}
          </Form.Item>
          <Form.Item
            name="zone"
            label="Zone (e.g., A, B)"
            rules={[{ required: true, message: 'Please input zone!' }]}
          >
            <Input />
          </Form.Item>
          {editingSlot && ( // Allow status change only for existing slots
            <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status!' }]}>
              <Select>
                <Option value="available">Available</Option>
                <Option value="occupied">Occupied</Option>
                <Option value="maintenance">Maintenance</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Space>
  );
}
