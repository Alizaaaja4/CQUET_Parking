import React from 'react';
import { Typography, Button } from 'antd';
import { CarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export function meta() {
  return [{ title: "CarCheese - Slot Assignment" }];
}

function findSlot() {
  return {
    slot: 'B2',
    level: 2,
    zone: 'B',
  };
}

export default function SlotPage() {
  const location = useLocation();
  const { entryTime, vehicle } = location.state || {};

  const [showSplash, setShowSplash] = React.useState(true);
  const [splashOut, setSplashOut] = React.useState(false);
  const slotInfo = findSlot();

  // Responsive
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    setIsMobile(typeof window !== "undefined" && window.innerWidth < 700);
    const outTimer = setTimeout(() => setSplashOut(true), 3400);
    const hideTimer = setTimeout(() => setShowSplash(false), 4100);
    return () => {
      clearTimeout(outTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // SPLASH
  if (showSplash) {
    return (
      <div style={{
        minHeight: "100vh", width: "100vw", background: "#fff",
        display: "flex", justifyContent: "center", alignItems: "center",
        position: "fixed", left: 0, top: 0, zIndex: 9999, overflow: "hidden",
        opacity: splashOut ? 0 : 1,
        pointerEvents: splashOut ? "none" : "auto",
        transition: "opacity 1s cubic-bezier(.7,.18,.22,1.09)",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{
            position: "absolute", left: 24, top: 38, width: 90, height: 90,
            borderRadius: 60, background: "#FFD600", opacity: .12, filter: "blur(2.2px)"
          }} />
          <div style={{
            position: "absolute", right: 24, bottom: 30, width: 70, height: 70,
            borderRadius: 38, background: "#FFD600", opacity: .13, filter: "blur(2.3px)"
          }} />
        </div>
        <div style={{ zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <style>{`
            @keyframes text-blink {
              0%,100%{ opacity:1;}
              50%{ opacity:0.25;}
            }
          `}</style>
          <div style={{
            fontWeight: 800,
            fontSize: '1.28rem',
            letterSpacing: .7,
            color: '#222',
            marginBottom: 10,
            textAlign: 'center'
          }}>Searching for a parking slot...</div>
          <div style={{
            fontWeight: 700,
            color: '#FFD600',
            fontSize: 15,
            letterSpacing: .5,
            animation: 'text-blink 1.2s infinite',
            marginTop: 4
          }}>Please wait</div>
        </div>
      </div>
    );
  }

  // MAIN PAGE
  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "0 2vw" : "0 4vw",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Bubbles bg */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        <div style={{
          position: "absolute", left: -50, top: -40, width: 110, height: 100, borderRadius: 80,
          background: "radial-gradient(circle at 38% 38%, #FFD600cc 68%, #fff0 100%)", filter: "blur(2.3px)", opacity: .14
        }} />
        <div style={{
          position: "absolute", right: -30, bottom: -30, width: 85, height: 85, borderRadius: 60,
          background: "radial-gradient(circle at 53% 52%, #FFD600bb 73%, #fff0 100%)", filter: "blur(1.8px)", opacity: .13
        }} />
      </div>

      {/* Mobil bergerak */}
      <style>
        {`
          @keyframes car-run {
            0% { left: -130px; }
            100% { left: 100vw; }
          }
        `}
      </style>
      <div style={{
        position: "fixed",
        left: 0,
        bottom: isMobile ? 34 : 46,
        width: "100vw",
        height: 70,
        pointerEvents: "none",
        zIndex: 12,
        overflow: "visible"
      }}>
        <div style={{
          position: "absolute",
          top: isMobile ? 10 : 16,
          left: 0,
          width: 110,
          height: 40,
          animation: "car-run 4.7s linear infinite",
        }}>
          {/* Mobil SVG */}
          <svg width={110} height={40} viewBox="0 0 110 40" fill="none">
            {/* Body */}
            <rect x="18" y="14" width="54" height="15" rx="8" fill="#FFD600" stroke="#222" strokeWidth="2" />
            <rect x="32" y="18" width="22" height="7" rx="3" fill="#fff" />
            {/* Front */}
            <rect x="72" y="18" width="20" height="9" rx="4" fill="#FFD600" stroke="#222" strokeWidth="2" />
            <ellipse cx="90" cy="22.5" rx="4" ry="2.6" fill="#ffe600" stroke="#ffb800" strokeWidth="1.1" />
            {/* Back */}
            <rect x="9" y="18" width="11" height="9" rx="4" fill="#FFD600" stroke="#222" strokeWidth="2" />
            <ellipse cx="11.5" cy="22.5" rx="2.7" ry="1.5" fill="#ff7675" stroke="#ffb800" strokeWidth="1.1" />
            {/* Wheels */}
            <ellipse cx="32" cy="32" rx="6" ry="6" fill="#232323" stroke="#222" strokeWidth="2" />
            <ellipse cx="66" cy="32" rx="6" ry="6" fill="#232323" stroke="#222" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Content utama */}
      <div style={{
        width: "100%",
        maxWidth: 860,
        zIndex: 3,
        background: "rgba(255,255,255,0.95)",
        borderRadius: 28,
        boxShadow: "0 6px 36px #FFD60018, 0 2px 16px #bbb1",
        padding: isMobile ? "24px 8px 30px 8px" : "46px 54px 44px 52px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: isMobile ? 34 : 72,
      }}>
        {/* LEFT: Info kendaraan */}
        <div style={{
          flex: 1,
          minWidth: 260,
          display: "flex",
          flexDirection: "column",
          alignItems: isMobile ? "center" : "flex-start",
          justifyContent: "center"
        }}>
          <Title style={{
            color: "#222",
            fontSize: isMobile ? "2.1rem" : "2.65rem",
            fontWeight: 900,
            marginBottom: 11,
            lineHeight: 1.13
          }}>
            Welcome!
          </Title>
          <Paragraph style={{
            color: "#444",
            fontSize: isMobile ? 15 : 17,
            maxWidth: 410,
            marginBottom: 20,
            lineHeight: 1.65
          }}>
            <span style={{ color: "#222", fontWeight: 600 }}>
              Here are your vehicle details:
            </span>
          </Paragraph>
          <div style={{
            fontWeight: 700,
            fontSize: isMobile ? 17 : 20,
            marginBottom: 10,
            color: "#b9a500",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <CarOutlined style={{ color: "#FFD600", fontSize: 22 }} />
            {vehicle?.type || "Vehicle"}
            <span style={{
              background: "#FFD600",
              color: "#222",
              fontWeight: 900,
              borderRadius: 9,
              padding: "2px 18px",
              fontSize: isMobile ? 18 : 22,
              marginLeft: 13
            }}>
              {vehicle?.plate || "Plate"}
            </span>
          </div>
          <div style={{
            color: "#444",
            fontWeight: 500,
            fontSize: isMobile ? 15 : 17,
            marginBottom: 24,
            display: "flex", alignItems: "center"
          }}>
            <ClockCircleOutlined style={{ color: "#FFD600", marginRight: 7, fontSize: 18 }} />
            Entry:&nbsp;
            <span style={{ fontWeight: 700, color: "#222" }}>
              {entryTime ? new Date(entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
            </span>
          </div>
        </div>
        {/* RIGHT: Slot info + tombol */}
        <div style={{
          flex: 1,
          minWidth: isMobile ? 210 : 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start"
        }}>
          <div style={{
            background: "#FFFDE7",
            borderRadius: 18,
            border: "1.7px solid #FFD600",
            color: "#b9a500",
            fontWeight: 800,
            fontSize: isMobile ? 16 : 20,
            padding: isMobile ? "16px 0 10px 0" : "22px 0 13px 0",
            width: isMobile ? "99%" : 340,
            marginBottom: 28,
            textAlign: "center",
            letterSpacing: 1,
            boxShadow: "0 2px 14px #FFD60013"
          }}>
            <EnvironmentOutlined style={{ color: "#FFD600", fontSize: 22, marginRight: 8 }} />
            <span style={{ color: "#FFD600", fontWeight: 900, fontSize: isMobile ? 19 : 21 }}>Level {slotInfo.level}</span>
            &nbsp;|&nbsp;
            <span style={{ color: "#FFD600", fontWeight: 800, fontSize: isMobile ? 18 : 20 }}>Zone {slotInfo.zone}</span>
            <br />
            <span style={{
              color: "#222",
              fontWeight: 900,
              fontSize: isMobile ? 24 : 27,
              display: "inline-block",
              background: "#FFD600",
              borderRadius: 13,
              marginTop: 10,
              padding: "7px 34px"
            }}>
              Slot {slotInfo.slot}
            </span>
          </div>
          <Button
            type="primary"
            size="large"
            style={{
              background: "linear-gradient(90deg, #FFD600 78%, #FFA726 100%)",
              color: "#222", fontWeight: 700, border: "none",
              borderRadius: 22, padding: "0 38px", fontSize: 18,
              boxShadow: "0 2px 16px #FFD60044", outline: "none"
            }}
            onClick={() => window.location.href = '/'}
          >
            Back to Home
          </Button>
        </div>
      </div>
      {/* Bottom credit */}
      <div style={{
        textAlign: 'center',
        marginTop: isMobile ? 18 : 38,
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
