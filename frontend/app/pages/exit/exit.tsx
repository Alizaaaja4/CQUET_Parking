import React from 'react';
import { Typography, Button } from 'antd';
import { CarOutlined, CameraOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export function meta() {
  return [{ title: "CarCheese - Exit" }];
}

export default function ExitPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(false);
  const [detecting, setDetecting] = React.useState(false);
  const [detected, setDetected] = React.useState(false);

  // Responsive
  React.useEffect(() => {
    setIsMobile(typeof window !== "undefined" && window.innerWidth < 700);
  }, []);

  // After detected, auto-redirect to payment
  React.useEffect(() => {
    if (detected) {
      const timeout = setTimeout(() => {
        navigate('/payment', {
          state: {
            vehicle: { plate: 'B 1234 ABC' },
            duration: '2 hours 30 mins',
            amount: 15000
          }
        });
      }, 6000); // 6s on detected page
      return () => clearTimeout(timeout);
    }
  }, [detected, navigate]);

  // Handler for "Deteksi Driver" button
  const handleDetect = () => {
    setDetecting(true);
    setTimeout(() => {
      setDetecting(false);
      setDetected(true);
    }, 2500); // Splash 2.5 detik
  };

  // Bubbles background
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

  // === UI ===

  // Splash after button pressed
  if (detecting) {
    return (
      <div style={{
        minHeight: "100vh", width: "100vw", background: "#fff",
        display: "flex", justifyContent: "center", alignItems: "center",
        position: "fixed", left: 0, top: 0, zIndex: 9999, overflow: "hidden"
      }}>
        {BubbleBg}
        <div style={{ zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <CameraOutlined style={{ fontSize: 60, color: "#FFD600", marginBottom: 20 }} />
          <div style={{
            fontWeight: 800,
            fontSize: '1.16rem',
            letterSpacing: .8,
            color: '#222',
            marginBottom: 6,
            textAlign: 'center'
          }}>Detecting vehicle exiting...</div>
          <div style={{
            fontWeight: 700,
            color: '#FFD600',
            fontSize: 14,
            letterSpacing: .6,
            marginTop: 4
          }}>Please wait</div>
        </div>
      </div>
    );
  }

  // Output setelah deteksi
  if (detected) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "0 0vw" : "0 3vw",
        overflow: "hidden",
        position: "relative"
      }}>
        {BubbleBg}
        <div style={{
          width: "100%",
          maxWidth: 560,
          zIndex: 3,
          background: "rgba(255,255,255,0.97)",
          borderRadius: 32,
          boxShadow: "0 6px 36px #FFD60018, 0 2px 16px #bbb1",
          padding: isMobile ? "22px 10px 30px 10px" : "44px 56px 36px 52px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <CheckCircleOutlined style={{ fontSize: 54, color: "#FFD600", marginBottom: 14 }} />
          <Title style={{
            color: "#222",
            fontSize: isMobile ? "2.1rem" : "2.4rem",
            fontWeight: 900,
            marginBottom: 10,
            lineHeight: 1.13,
            textAlign: "center",
          }}>
            Vehicle Detected!
          </Title>
          <Paragraph style={{
            color: "#444",
            fontSize: isMobile ? 16 : 18,
            marginBottom: 22,
            textAlign: "center"
          }}>
            Please wait while we process your exit.<br />
            You will be redirected to the payment page shortly.
          </Paragraph>
          <div style={{
            fontWeight: 700,
            fontSize: isMobile ? 17 : 20,
            marginBottom: 11,
            color: "#b9a500",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <CarOutlined style={{ color: "#FFD600", fontSize: 22 }} />
            <span style={{
              background: "#FFD600",
              color: "#222",
              fontWeight: 900,
              borderRadius: 10,
              padding: "2px 20px",
              fontSize: isMobile ? 18 : 22,
              marginLeft: 10
            }}>
              B 1234 ABC
            </span>
          </div>
        </div>
        {/* Bottom credit */}
        <div style={{
          color: "#bbb",
          fontSize: 13,
          width: '100%',
          textAlign: "center",
          position: "absolute",
          bottom: 12,
          left: 0
        }}>
          Powered by CarCheese Smart Parking System
        </div>
      </div>
    );
  }

  // Halaman awal: card dan tombol deteksi
  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "0 0vw" : "0 3vw",
      overflow: "hidden",
      position: "relative"
    }}>
      {BubbleBg}
      <div style={{
        width: "100%",
        maxWidth: 540,
        zIndex: 3,
        background: "rgba(255,255,255,0.97)",
        borderRadius: 32,
        boxShadow: "0 6px 36px #FFD60018, 0 2px 16px #bbb1",
        padding: isMobile ? "22px 10px 30px 10px" : "44px 56px 36px 52px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <CameraOutlined style={{ fontSize: 54, color: "#FFD600", marginBottom: 14 }} />
        <Title style={{
          color: "#222",
          fontSize: isMobile ? "2.1rem" : "2.4rem",
          fontWeight: 900,
          marginBottom: 10,
          lineHeight: 1.13,
          textAlign: "center",
        }}>
          Vehicle Exit Point
        </Title>
        <Paragraph style={{
          color: "#444",
          fontSize: isMobile ? 16 : 18,
          marginBottom: 24,
          textAlign: "center"
        }}>
          Please drive your vehicle to the exit camera and press the button below to begin detection.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          style={{
            background: "linear-gradient(90deg, #FFD600 78%, #FFA726 100%)",
            color: "#222", fontWeight: 700, border: "none",
            borderRadius: 22, padding: "0 38px", fontSize: 18,
            boxShadow: "0 2px 16px #FFD60044", outline: "none"
          }}
          onClick={handleDetect}
        >
          Detect Driver
        </Button>
      </div>
      {/* Bottom credit */}
      <div style={{
        color: "#bbb",
        fontSize: 13,
        width: '100%',
        textAlign: "center",
        position: "absolute",
        bottom: 12,
        left: 0
      }}>
        Powered by CarCheese Smart Parking System
      </div>
    </div>
  );
}
