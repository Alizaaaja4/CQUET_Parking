// PARK-IQ-CENTRAL-FE/app/routes/dashboard/payments.tsx
import React, { useEffect, useState } from 'react';
import { Typography, Table, Card, Statistic, Row, Col, Tag, Space, Spin, Alert } from 'antd';
import { DollarOutlined, HistoryOutlined } from '@ant-design/icons';
import { paymentService, type PaymentRecord, type GetPaymentHistoryResponse } from '../../api/paymentService'; // Import the new service

const { Title, Paragraph } = Typography;

export function meta() {
  return [{ title: "Dashboard - Payment History" }];
}

export default function PaymentHistoryPage() {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch payment history from the backend
  const fetchPaymentHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure the token is present before making the API call
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        setError("Authentication token missing. Please log in.");
        setLoading(false);
        return;
      }

      const response: GetPaymentHistoryResponse = await paymentService.getPaymentHistory();
      setPaymentRecords(response.payments.map(record => ({ ...record, key: record.id.toString() }))); // Add key for Antd Table

      // Calculate statistics if not provided directly by backend response
      const calculatedRevenue = response.payments.reduce((sum, record) => sum + record.amount, 0);
      setTotalRevenue(response.totalRevenue || calculatedRevenue); // Use backend total if available, else calculate
      setTotalTransactions(response.totalTransactions || response.payments.length); // Use backend total if available, else count

    } catch (err: any) {
      console.error('Error fetching payment history:', err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch payment history.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment history on component mount
  useEffect(() => {
    // A small delay to ensure localStorage is fully loaded after login redirect
    // This is a common pattern when dealing with initial protected API calls after navigation.
    setTimeout(() => {
      fetchPaymentHistory();
    }, 50); // Small delay
  }, []); // Empty dependency array means this runs once on mount

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Vehicle Plate', dataIndex: 'vehiclePlate', key: 'vehiclePlate' },
    { title: 'Entry Time', dataIndex: 'entryTime', key: 'entryTime',
      render: (text: string) => new Date(text).toLocaleString() // Format date/time for display
    },
    { title: 'Exit Time', dataIndex: 'exitTime', key: 'exitTime',
      render: (text: string) => new Date(text).toLocaleString() // Format date/time for display
    },
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
      render: (status: 'Completed' | 'Refunded' | 'Pending') => {
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading payment history..." />
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
      <Title level={3}>Payment History & Revenue</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Card>
            <Statistic title="Total Revenue" value={totalRevenue} prefix="Rp" suffix=",00" precision={0} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="Total Transactions" value={totalTransactions} />
          </Card>
        </Col>
      </Row>

      <Title level={4}>Transaction History <HistoryOutlined /></Title>
      <Table dataSource={paymentRecords} columns={columns} rowKey="id" />
    </Space>
  );
}
