// PARK-IQ-CENTRAL-FE/app/routes/intro.tsx

import React from 'react';
import { Typography, Button, Space, Card } from 'antd';
import { useNavigate } from 'react-router-dom'; // To navigate to other pages

const { Title, Paragraph } = Typography;

// Define metadata for this route (for the browser tab title)
export function meta() {
  return [
    { title: "ParkIQ Central - Welcome" },
    { name: "description", content: "Discover the future of smart parking." },
  ];
}

// This is your new Welcome Page component
export default function Welcome() {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/login'); // Redirect to the login page
  };

  const handleLearnMoreClick = () => {
    // You could navigate to an /about page or simply scroll down
    console.log('Learn more clicked!');
    // For now, let's navigate to home
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', // A nice gradient background
      padding: '20px'
    }}>
      <Card
        style={{
          maxWidth: 600,
          textAlign: 'center',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '30px',
          backgroundColor: 'white'
        }}
      >
        <Title level={1} style={{ color: '#001529' }}>Welcome to ParkIQ Central!</Title>
        <Paragraph style={{ fontSize: '1.1em', color: '#595959', marginBottom: '30px' }}>
          Experience seamless parking with AI-powered object detection and OCR for automatic entry and exit.
          Real-time slot availability, accurate tariff calculation, and digital payments—all at your fingertips.
        </Paragraph>
        <Space size="large">
          <Button type="primary" size="large" onClick={handleExploreClick}>
            Get Started
          </Button>
          <Button size="large" onClick={handleLearnMoreClick}>
            Learn More
          </Button>
        </Space>
      </Card>
    </div>
  );
}