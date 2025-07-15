import React, { useEffect, useState } from 'react';
import { Typography, Card, Col, Row, Tag, Statistic, Space, Spin, Alert } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { parkingService, type ParkingSlot } from '../../api/parkingService';

const { Title, Paragraph } = Typography;

export function meta() {
  return [{ title: "Dashboard - Monitoring" }];
}

export default function MonitoringPage() {
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false); // 👈 added

  useEffect(() => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (!token) {
    console.warn("No authToken in localStorage. Will not fetch data.");
    setError("Not authenticated. Please log in again.");
    setLoading(false);
    return;
  }

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await parkingService.getAllParkingSlotsAdmin();
      setParkingSlots(data);
    } catch (err: any) {
      console.error('Error fetching parking slots:', err);
      setError(err.message || "Failed to fetch parking slots.");
    } finally {
      setLoading(false);
    }
  };

  fetchSlots();
}, []);

  const totalSlots = parkingSlots.length;
  const availableSlots = parkingSlots.filter(s => s.status === 'available').length;
  const occupiedSlots = totalSlots - availableSlots;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading Parking Data..." />
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
      <Title level={3}>Parking Slot Monitoring</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Slots" value={totalSlots} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Available Slots" value={availableSlots} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Occupied Slots" value={occupiedSlots} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>

      <Title level={4}>Live Slot View</Title>
      {[...new Set(parkingSlots.map(s => s.level))].sort().map(level => (
        <React.Fragment key={level}>
          <Paragraph strong>Level {level}</Paragraph>
          <Row gutter={[16, 16]}>
            {parkingSlots.filter(s => s.level === level).map(slot => (
              <Col key={slot.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  size="small"
                  title={`Slot ${slot.id}`}
                  style={{
                    background: slot.status === 'available' ? '#f6ffed' : '#fff0f6',
                    borderColor: slot.status === 'available' ? '#52c41a' : '#eb2f96',
                  }}
                >
                  <Paragraph>
                    Status: <Tag color={slot.status === 'available' ? 'success' : 'error'}>{slot.status.toUpperCase()}</Tag>
                  </Paragraph>
                  {slot.status === 'occupied' && (
                    <Paragraph>
                      <CarOutlined /> {slot.type} - {slot.vehiclePlate || 'N/A'}
                    </Paragraph>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </React.Fragment>
      ))}
    </Space>
  );
}
