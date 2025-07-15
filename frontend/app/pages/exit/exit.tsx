// PARK-IQ-CENTRAL-FE/app/routes/exit.tsx
import React from 'react';
import { Typography, Button, Card, Spin, Space } from 'antd';
import { CameraOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

export function meta() {
  return [{ title: "ParkIQ Central - Vehicle Exit Point" }];
}

export default function ExitPage() {
  const navigate = useNavigate();
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [exitDetected, setExitDetected] = React.useState(false);

  const simulateExitDetection = () => {
    setIsDetecting(true);
    setExitDetected(false);
    // TODO: Trigger backend API for exit detection
    setTimeout(() => {
      setExitDetected(true);
      setIsDetecting(false);
      // Simulate successful exit detection and navigate to payment
      setTimeout(() => {
        navigate('/payment', { state: { vehicle: { plate: 'B 1234 ABC' }, duration: '2 hours 30 mins', amount: 15000 } });
      }, 1500);
    }, 3000); // Simulate 3 seconds for detection
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card
        title={<Title level={3}><CameraOutlined /> Vehicle Exit Point</Title>}
        style={{ width: 600, textAlign: 'center' }}
        extra={!exitDetected && <Button type="primary" onClick={simulateExitDetection} loading={isDetecting}>
          {isDetecting ? 'Waiting for Vehicle...' : 'Initiate Exit Scan'}
        </Button>}
      >
        <div style={{ background: '#000', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.5em' }}>
          {/* Placeholder for camera feed */}
          {isDetecting ? <Spin size="large" tip="Detecting Vehicle..." /> : (exitDetected ? <CheckCircleOutlined style={{ fontSize: '3em', color: '#52c41a' }} /> : <Text style={{ color: '#fff' }}>Camera Feed Here</Text>)}
        </div>
        <Paragraph style={{ marginTop: 20 }}>
          <Text strong>Instructions:</Text> Please drive your vehicle to the exit camera.
        </Paragraph>
        {exitDetected && (
          <Space direction="vertical" style={{ width: '100%', marginTop: 20 }}>
            <Title level={4} style={{ color: '#52c41a' }}>Vehicle Detected!</Title>
            <Text>Processing exit and calculating tariff...</Text>
          </Space>
        )}
      </Card>
    </div>
  );
}