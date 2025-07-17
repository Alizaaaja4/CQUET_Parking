// PARK-IQ-CENTRAL-FE/app/routes/monitoring.tsx
import React, { useEffect, useState } from 'react';
import { Typography, Card, Col, Row, Tag, Statistic, Space, Spin, Alert } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { parkingService, type ParkingSlot, type GetAllParkingSlotsAdminResponse } from '../../api/parkingService';

const { Title, Paragraph } = Typography;

export function meta() {
  return [{ title: "Dashboard - Monitoring" }];
}

export default function MonitoringPage() {
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [statistics, setStatistics] = useState({ total: 0, available: 0, occupied: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initiateFetch = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      console.log('MonitoringPage useEffect: Initial token check:', token ? 'Present' : 'Missing');

      if (!token) {
        console.warn("MonitoringPage: AuthToken not immediately available. Delaying fetch...");
        setError("Authenticating... please wait."); // User feedback

        // Introduce a very short delay to allow localStorage to fully sync
        // This is often enough after a full page reload (window.location.href)
        setTimeout(() => {
          const tokenAfterDelay = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
          console.log('MonitoringPage useEffect: Token after delay:', tokenAfterDelay ? 'Present' : 'Missing');
          if (tokenAfterDelay) {
            fetchData(); // Token is now available, proceed
          } else {
            console.error("MonitoringPage: Token still missing after delay. Cannot fetch data.");
            setError("Authentication failed. Please log in again.");
            setLoading(false);
            // Optional: If you want to force redirect if token never appears
            // window.location.href = '/login';
          }
        }, 50); // Small 50ms delay
      } else {
        fetchData(); // Token is immediately available, proceed
      }
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null); // Clear errors before new fetch
      try {
        const response: GetAllParkingSlotsAdminResponse = await parkingService.getAllParkingSlotsAdmin();
        setParkingSlots(response.slots);
        setStatistics(response.statistics);
      } catch (err: any) {
        console.error('Error fetching parking slots:', err);
        const errorMessage = err.response?.data?.error || err.message || "Failed to fetch parking slots.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initiateFetch(); // Start the process

    // Cleanup not strictly necessary here since it's a one-time fetch after initial load
    return () => {}; // Empty cleanup function
  }, []); // Empty dependency array, runs once on mount

  // ... rest of your render logic (loading, error, content)
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip={error || "Loading Parking Data..."} />
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

  // ... rest of your monitoring page rendering
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Title level={3}>Parking Slot Monitoring</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Slots" value={statistics.total} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Available Slots" value={statistics.available} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Occupied Slots" value={statistics.occupied} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>

      <Title level={4}>Live Slot View</Title>
    {[...new Set(parkingSlots.map(s => s.level))].sort((a, b) => {
        const numA = parseInt(a.replace('L', ''));
        const numB = parseInt(b.replace('L', ''));
        return numA - numB;
      }).map(level => (
      <React.Fragment key={level}>
        <Paragraph strong>Level {level}</Paragraph>
        <Row gutter={[16, 16]}>
          {parkingSlots.filter(s => s.level === level)
            .sort((a, b) => a.slot_id.localeCompare(b.slot_id))
            .map(slot => (
              <Col key={slot.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  size="small"
                  title={`Slot ${slot.slot_id}`}
                  style={{
                    // 🔥 CHANGE THIS: Compare with string literal "available"
                    background: slot.status === 'available' ? '#f6ffed' : '#fff0f6',
                    borderColor: slot.status === 'available' ? '#52c41a' : '#eb2f96',
                  }}
                >
                  <Paragraph>
                    Status:
                    {/* 🔥 CHANGE THIS: Compare with string literal "available" */}
                    <Tag color={slot.status === 'available' ? 'success' : 'error'}>
                      {slot.status.toUpperCase()} {/* Already shows UPPERCASE of "available" or "occupied" */}
                    </Tag>
                  </Paragraph>
                  {/* 🔥 CHANGE THIS: Compare with string literal "occupied" */}
                  {slot.status === 'occupied' && (
                    <Paragraph>
                      <CarOutlined /> {slot.vehiclePlate ? `Plate: ${slot.vehiclePlate}` : 'N/A'}
                      {slot.entryTime && ` - Entry: ${new Date(slot.entryTime).toLocaleTimeString()}`}
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