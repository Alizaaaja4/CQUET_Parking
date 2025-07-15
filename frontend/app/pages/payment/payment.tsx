// PARK-IQ-CENTRAL-FE/app/routes/payment.tsx
import React from 'react';
import { Typography, Card, Statistic, Button, QRCode, Space, Result } from 'antd';
import { CheckCircleOutlined, DollarCircleOutlined, CarOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

export function meta() {
  return [{ title: "ParkIQ Central - Payment" }];
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicle, duration, amount } = location.state || {}; // Get state from ExitPage
  const [paymentStatus, setPaymentStatus] = React.useState<'pending' | 'success' | 'failed'>('pending');

  const simulatePaymentSuccess = () => {
    // TODO: In a real scenario, you'd monitor a webhook from your payment gateway
    // for payment confirmation.
    setTimeout(() => {
      setPaymentStatus('success');
      // Navigate after successful payment
      setTimeout(() => {
        navigate('/exit'); // Go back to home or a thank you page
      }, 3000);
    }, 5000); // Simulate 5 seconds for payment processing
  };

  React.useEffect(() => {
    if (paymentStatus === 'pending' && amount) {
      simulatePaymentSuccess();
    }
  }, [paymentStatus, amount]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card
        title={<Title level={3}><DollarCircleOutlined /> Payment for Parking</Title>}
        style={{ width: 450, textAlign: 'center' }}
      >
        {paymentStatus === 'pending' ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>Parking Details</Title>
            <Paragraph><CarOutlined /> Vehicle: {vehicle?.plate || 'N/A'}</Paragraph>
            <Paragraph>Duration: {duration || 'N/A'}</Paragraph>
            <Statistic title="Total Amount Due" value={amount || 0} prefix="Rp" suffix=",00" precision={0} />

            <Paragraph style={{ marginTop: 20 }}>Scan QRIS to complete payment:</Paragraph>
            <QRCode value={`https://example.com/pay?amount=${amount}&ref=${vehicle?.plate}`} size={200} />
            <Paragraph type="secondary">Waiting for payment confirmation...</Paragraph>
          </Space>
        ) : paymentStatus === 'success' ? (
          <Result
            status="success"
            title="Payment Successful!"
            subTitle={`Thank you for parking with ParkIQ Central. Amount paid: Rp${amount || 0},00`}
            extra={[
              <Button type="primary" key="dashboard" onClick={() => navigate('/exit')}>
                Back to Home
              </Button>,
            ]}
          />
        ) : (
          <Result
            status="error"
            title="Payment Failed"
            subTitle="There was an issue processing your payment. Please try again or contact support."
            extra={[
              <Button type="primary" key="retry" onClick={() => setPaymentStatus('pending')}>
                Retry Payment
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
}