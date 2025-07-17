// PARK-IQ-CENTRAL-FE/app/routes/entry.tsx
import React from 'react';
import { Typography, Button, Card, Spin, Space } from 'antd';
import { CameraOutlined, CarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // Assuming useNavigate is available from react-router-dom/react-router

const { Title, Text, Paragraph } = Typography;

export function meta() {
  return [{ title: "ParkIQ Central - Vehicle Entry" }];
}

export default function EntryPage() {
  const navigate = useNavigate();
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [detectedVehicle, setDetectedVehicle] = React.useState<{ type: string; plate: string } | null>(null);

  const simulateDetection = () => {
    setIsDetecting(true);
    setDetectedVehicle(null);
    // TODO: In a real scenario, this would trigger an API call to your backend
    // which communicates with the AI detection system.
    setTimeout(() => {
      setDetectedVehicle({ type: 'Sedan', plate: 'B 1234 ABC' });
      setIsDetecting(false);
      // Simulate successful entry and navigation to slot page
      setTimeout(() => {
        navigate('/slot', { state: { entryTime: new Date().toISOString(), vehicle: { type: 'Sedan', plate: 'B 1234 ABC' } } });
      }, 1500);
    }, 3000); // Simulate 3 seconds for detection
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card
        title={<Title level={3}><CameraOutlined /> Vehicle Entry Point</Title>}
        style={{ width: 600, textAlign: 'center' }}
        extra={<Button type="primary" onClick={simulateDetection} loading={isDetecting}>
          {isDetecting ? 'Detecting...' : 'Start Detection'}
        </Button>}
      >
        <div style={{ background: '#000', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.5em' }}>
          {/* Placeholder for camera feed */}
          {isDetecting ? <Spin size="large" tip="Detecting Vehicle..." /> : <Text style={{ color: '#fff' }}>Camera Feed Here</Text>}
        </div>
        <Paragraph style={{ marginTop: 20 }}>
          <Text strong>Instructions:</Text> Please position your vehicle in front of the camera.
        </Paragraph>
        {detectedVehicle && (
          <Space direction="vertical" style={{ width: '100%', marginTop: 20 }}>
            <Text strong>Detected Vehicle:</Text>
            <Text><CarOutlined /> Type: {detectedVehicle.type}</Text>
            <Text>License Plate: <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{detectedVehicle.plate}</span></Text>
          </Space>
        )}
      </Card>
    </div>
  );
}