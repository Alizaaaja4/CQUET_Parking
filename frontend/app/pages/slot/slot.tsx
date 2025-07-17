// PARK-IQ-CENTRAL-FE/app/routes/slot.tsx
import React from 'react';
import { Typography, Card, Col, Row, Tag, Statistic, Button } from 'antd';
import { CarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom'; // To get state from previous navigation

const { Title, Paragraph, Text } = Typography;

export function meta() {
  return [{ title: "ParkIQ Central - Available Slots" }];
}

// Dummy data for parking slots
const parkingSlots = [
  { id: 'A1', status: 'available', level: 1 },
  { id: 'A2', status: 'occupied', level: 1 },
  { id: 'A3', status: 'available', level: 1 },
  { id: 'B1', status: 'available', level: 2 },
  { id: 'B2', status: 'available', level: 2 },
  { id: 'B3', status: 'occupied', level: 2 },
];

export default function SlotPage() {
  const location = useLocation();
  const { entryTime, vehicle } = location.state || {}; // Get state passed from EntryPage

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#e0e2e5' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>Available Parking Slots</Title>

      {vehicle && entryTime && (
        <Card style={{ marginBottom: 30 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="Your Vehicle" value={`${vehicle.type} - ${vehicle.plate}`} prefix={<CarOutlined />} />
            </Col>
            <Col span={12}>
              <Statistic title="Entry Time" value={new Date(entryTime).toLocaleString()} prefix={<ClockCircleOutlined />} />
            </Col>
          </Row>
          <Paragraph type="secondary" style={{ marginTop: 10 }}>
            Please find your allocated or chosen parking slot.
          </Paragraph>
        </Card>
      )}

      {/* Parking Slot Visualization (Simple Grid) */}
      <Title level={4}>Level 1</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {parkingSlots.filter(slot => slot.level === 1).map(slot => (
          <Col key={slot.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              size="small"
              title={`Slot ${slot.id}`}
              style={{ background: slot.status === 'available' ? '#f6ffed' : '#fff0f6', borderColor: slot.status === 'available' ? '#52c41a' : '#eb2f96' }}
            >
              <Text strong>Status:</Text>{' '}
              <Tag color={slot.status === 'available' ? 'success' : 'error'}>
                {slot.status.toUpperCase()}
              </Tag>
              {slot.status === 'available' && <Button type="link" size="small" style={{ float: 'right' }}>Park Here</Button>}
            </Card>
          </Col>
        ))}
      </Row>

      <Title level={4}>Level 2</Title>
      <Row gutter={[16, 16]}>
        {parkingSlots.filter(slot => slot.level === 2).map(slot => (
          <Col key={slot.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              size="small"
              title={`Slot ${slot.id}`}
              style={{ background: slot.status === 'available' ? '#f6ffed' : '#fff0f6', borderColor: slot.status === 'available' ? '#52c41a' : '#eb2f96' }}
            >
              <Text strong>Status:</Text>{' '}
              <Tag color={slot.status === 'available' ? 'success' : 'error'}>
                {slot.status.toUpperCase()}
              </Tag>
              {slot.status === 'available' && <Button type="link" size="small" style={{ float: 'right' }}>Park Here</Button>}
            </Card>
          </Col>
        ))}
      </Row>

      <Paragraph type="secondary" style={{ marginTop: 30, textAlign: 'center' }}>
        *Real-time updates for slot availability would come from your backend.
      </Paragraph>
    </div>
  );
}