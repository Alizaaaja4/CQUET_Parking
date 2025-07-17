import React from 'react';
import { Typography, Button, Statistic, QRCode } from 'antd';
import { DollarCircleOutlined, CarOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export function meta() {
  return [{ title: "CarCheese - Payment" }];
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicle, duration, amount } = location.state || {};
  const [paymentStatus, setPaymentStatus] = React.useState<'pending' | 'success' | 'failed'>('pending');
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsMobile(typeof window !== "undefined" && window.innerWidth < 700);
  }, []);

  React.useEffect(() => {
    if (paymentStatus === 'pending' && amount) {
      const paymentTimer = setTimeout(() => {
        setPaymentStatus('success');
        setTimeout(() => {
          navigate('/');
        }, 3400);
      }, 4200);
      return () => clearTimeout(paymentTimer);
    }
  }, [paymentStatus, amount, navigate]);

  // Bubbles accent
  const BubbleBg = (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
      <div style={{
        position: "absolute", left: 24, top: 38, width: 90, height: 90,
        borderRadius: 60, background: "#FFD600", opacity: .12, filter: "blur(2.2px)"
      }} />
      <div style={{
        position: "absolute", right: 24, bottom: 30, width: 70, height: 70,
        borderRadius: 38, background: "#FFD600", opacity: .13, filter: "blur(2.3px)"
      }} />
      <div style={{
        position: "absolute", left: -50, top: -40, width: 110, height: 100, borderRadius: 80,
        background: "radial-gradient(circle at 38% 38%, #FFD600cc 68%, #fff0 100%)", filter: "blur(2.3px)", opacity: .14
      }} />
      <div style={{
        position: "absolute", right: -30, bottom: -30, width: 85, height: 85, borderRadius: 60,
        background: "radial-gradient(circle at 53% 52%, #FFD600bb 73%, #fff0 100%)", filter: "blur(1.8px)", opacity: .13
      }} />
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative"
    }}>
      {BubbleBg}
      <div style={{
        width: "100%",
        maxWidth: isMobile ? 375 : 520,
        background: "rgba(255,255,255,0.98)",
        borderRadius: 32,
        boxShadow: "0 6px 36px #FFD60018, 0 2px 16px #bbb1",
        padding: isMobile ? "22px 10px 32px 10px" : "54px 56px 52px 52px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3
      }}>
        <DollarCircleOutlined style={{ fontSize: 54, color: "#FFD600", marginBottom: 12 }} />
        <Title style={{
          color: "#222",
          fontSize: isMobile ? "2rem" : "2.2rem",
          fontWeight: 900,
          marginBottom: 7,
          lineHeight: 1.13,
          textAlign: "center"
        }}>
          Payment for Parking
        </Title>

        {/* Pending: QR payment */}
        {paymentStatus === 'pending' && (
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 10,
            marginBottom: 10
          }}>
            <div style={{
              color: "#444",
              fontSize: isMobile ? 16 : 18,
              marginBottom: 10,
              textAlign: "center",
              fontWeight: 600,
            }}>
              <CarOutlined style={{ color: "#FFD600", fontSize: 22, marginRight: 7 }} />
              Vehicle: <span style={{ color: "#FFD600", fontWeight: 900, marginLeft: 7 }}>{vehicle?.plate || "N/A"}</span>
            </div>
            <div style={{
              color: "#444", fontWeight: 600, fontSize: isMobile ? 16 : 17,
              marginBottom: 5,
              display: "flex", alignItems: "center", gap: 5
            }}>
              <ClockCircleOutlined style={{ color: "#FFD600", marginRight: 7, fontSize: 19 }} />
              Duration:&nbsp;
              <span style={{ color: "#222", fontWeight: 800 }}>{duration || "-"}</span>
            </div>
            <Statistic
              title={<span style={{ color: "#b9a500", fontWeight: 800 }}>Total Due</span>}
              value={amount || 0}
              prefix={<span style={{ color: "#FFD600", fontWeight: 800 }}>Rp</span>}
              suffix={<span style={{ color: "#FFD600", fontWeight: 800 }}>,00</span>}
              precision={0}
              valueStyle={{
                fontSize: isMobile ? 26 : 31,
                color: "#222",
                fontWeight: 900,
                marginTop: 6,
                marginBottom: 12
              }}
              style={{ marginBottom: 12 }}
            />

            <Paragraph style={{ marginTop: 6, fontSize: isMobile ? 15 : 17, color: "#888", fontWeight: 500, textAlign: "center" }}>
              Please scan the QRIS code below to pay.
            </Paragraph>
            {/* QR Static */}
            <div style={{
              margin: "18px 0 10px 0",
              boxShadow: "0 4px 24px #FFD60022",
              borderRadius: 24,
              padding: 6,
              background: "#fffde7"
            }}>
              <QRCode value={`https://example.com/pay?amount=${amount}&ref=${vehicle?.plate}`} size={isMobile ? 144 : 200} />
            </div>
            <Paragraph type="secondary" style={{
              color: "#FFD600", fontWeight: 700, letterSpacing: 0.2, fontSize: 15, textAlign: "center", marginTop: 3
            }}>
              Waiting for payment confirmation...
            </Paragraph>
          </div>
        )}

        {/* Success */}
        {paymentStatus === 'success' && (
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 14,
            marginBottom: 10
          }}>
            <CheckCircleOutlined style={{ fontSize: 58, color: "#FFD600", marginBottom: 10 }} />
            <Title level={3} style={{
              color: "#222",
              fontWeight: 900,
              margin: 0,
              marginBottom: 8,
              textAlign: "center"
            }}>
              Payment Successful!
            </Title>
            <div style={{
              fontWeight: 700, fontSize: isMobile ? 16 : 18, color: "#b9a500",
              textAlign: "center", marginBottom: 6
            }}>
              Amount paid:&nbsp;
              <span style={{ color: "#FFD600", fontWeight: 900 }}>Rp{amount || 0},00</span>
            </div>
            <div style={{ color: "#444", fontWeight: 600, fontSize: 16, textAlign: "center", marginBottom: 14 }}>
              Thank you for using CarCheese Smart Parking!
              <br />
              You will be redirected to Home.
            </div>
          </div>
        )}
      </div>
      {/* Bottom credit */}
      <div style={{
        textAlign: 'center',
        color: '#bbb',
        fontSize: 13,
        width: '100%',
        position: 'absolute',
        bottom: 12,
        left: 0
      }}>
        Powered by CarCheese Smart Parking System
      </div>
    </div>
  );
}
