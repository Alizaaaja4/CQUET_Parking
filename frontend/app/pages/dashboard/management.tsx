// PARK-IQ-CENTRAL-FE/app/routes/dashboard/management.tsx
import React from 'react';
import { Typography, Table, Button, Space, Modal, Form, Input, Select, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

export function meta() {
  return [{ title: "Dashboard - Slot Management" }];
}

interface ParkingSlot {
  id: string;
  level: number;
  type: 'Car' | 'Motorcycle' | 'Both';
  status: 'available' | 'occupied' | 'maintenance';
}

const initialSlots: ParkingSlot[] = [
  { id: 'A1', level: 1, type: 'Car', status: 'available' },
  { id: 'A2', level: 1, type: 'Motorcycle', status: 'occupied' },
  { id: 'B1', level: 2, type: 'Car', status: 'available' },
];

export default function SlotManagementPage() {
  const [slots, setSlots] = React.useState<ParkingSlot[]>(initialSlots);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [editingSlot, setEditingSlot] = React.useState<ParkingSlot | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingSlot(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: ParkingSlot) => {
    setEditingSlot(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    // TODO: Call backend API to delete slot
    setSlots(slots.filter(slot => slot.id !== id));
    message.success(`Slot ${id} deleted successfully!`);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      // TODO: Call backend API for add/update
      if (editingSlot) {
        setSlots(slots.map(slot => (slot.id === editingSlot.id ? { ...slot, ...values } : slot)));
        message.success(`Slot ${values.id} updated successfully!`);
      } else {
        setSlots([...slots, { ...values, status: 'available' }]); // New slots are available by default
        message.success(`Slot ${values.id} added successfully!`);
      }
      setIsModalVisible(false);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const columns = [
    { title: 'Slot ID', dataIndex: 'id', key: 'id' },
    { title: 'Level', dataIndex: 'level', key: 'level' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ParkingSlot) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this slot?"
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

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Title level={3}>Parking Slot Management</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
        Add New Slot
      </Button>
      <Table dataSource={slots} columns={columns} rowKey="id" />

      <Modal
        title={editingSlot ? "Edit Parking Slot" : "Add New Parking Slot"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" label="Slot ID" rules={[{ required: true, message: 'Please input slot ID!' }]}>
            <Input disabled={!!editingSlot} /> {/* Disable ID editing */}
          </Form.Item>
          <Form.Item name="level" label="Level" rules={[{ required: true, message: 'Please select level!' }]}>
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="type" label="Vehicle Type" rules={[{ required: true, message: 'Please select vehicle type!' }]}>
            <Select>
              <Option value="Car">Car</Option>
              <Option value="Motorcycle">Motorcycle</Option>
              <Option value="Both">Both</Option>
            </Select>
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