// PARK-IQ-CENTRAL-FE/app/routes/dashboard/payments.tsx
import React from 'react';
import { Typography, Table, Card, Statistic, Row, Col, Tag, Space } from 'antd';
import { DollarOutlined, HistoryOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export function meta() {
  return [{ title: "Dashboard - Payment History" }];
}

interface PaymentRecord {
  id: string;
  vehiclePlate: string;
  entryTime: string;
  exitTime: string;
  duration: string;
  amount: number;
  status: 'Completed' | 'Refunded' | 'Pending';
}

const dummyPaymentHistory: PaymentRecord[] = [
  { id: 'P001', vehiclePlate: 'B 1234 ABC', entryTime: '2025-07-10 10:00', exitTime: '2025-07-10 12:30', duration: '2h 30m', amount: 15000, status: 'Completed' },
  { id: 'P002', vehiclePlate: 'D 5678 EF', entryTime: '2025-07-10 11:15', exitTime: '2025-07-10 14:00', duration: '2h 45m', amount: 17500, status: 'Completed' },
  { id: 'P003', vehiclePlate: 'F 9012 GH', entryTime: '2025-07-10 13:00', exitTime: '2025-07-10 13:30', duration: '0h 30m', amount: 5000, status: 'Completed' },
  { id: 'P004', vehiclePlate: 'G 3456 IJ', entryTime: '2025-07-10 15:00', exitTime: '2025-07-10 16:00', duration: '1h 0m', amount: 7500, status: 'Pending' },
];

export default function PaymentHistoryPage() {
  const totalRevenue = dummyPaymentHistory.reduce((sum, record) => sum + record.amount, 0);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Vehicle Plate', dataIndex: 'vehiclePlate', key: 'vehiclePlate' },
    { title: 'Entry Time', dataIndex: 'entryTime', key: 'entryTime' },
    { title: 'Exit Time', dataIndex: 'exitTime', key: 'exitTime' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: number) => `Rp${text.toLocaleString('id-ID')},00`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'Pending') {
          color = 'orange';
        } else if (status === 'Refunded') {
          color = 'red';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Title level={3}>Payment History & Revenue</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Card>
            <Statistic title="Total Revenue" value={totalRevenue} prefix="Rp" suffix=",00" precision={0} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="Total Transactions" value={dummyPaymentHistory.length} />
          </Card>
        </Col>
      </Row>

      <Title level={4}>Transaction History <HistoryOutlined /></Title>
      <Table dataSource={dummyPaymentHistory} columns={columns} rowKey="id" />
    </Space>
  );
}