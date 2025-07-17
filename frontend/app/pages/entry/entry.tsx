import React from 'react';
import { Typography, Button, Card, Spin, Modal } from 'antd';
import { CameraOutlined, CarOutlined, ScanOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

export function meta() {
  return [{ title: "CarCheese - Vehicle Entry" }];
}

export default function EntryPage() {
  const navigate = useNavigate();
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [detectedVehicle, setDetectedVehicle] = React.useState<{ type: string; plate: string } | null>(null);
  const [plateReveal, setPlateReveal] = React.useState(false);

  // SPLASH STATE
  const [showSplash, setShowSplash] = React.useState(true);
  const [splashOut, setSplashOut] = React.useState(false);

  React.useEffect(() => {
    const outTimer = setTimeout(() => setSplashOut(true), 1800);
    const hideTimer = setTimeout(() => setShowSplash(false), 2600);
    return () => {
      clearTimeout(outTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Plate modal control
  React.useEffect(() => {
    let revealTimeout: any, navTimeout: any;
    if (detectedVehicle) {
      setPlateReveal(false);
      // Delay untuk animasi modal
      revealTimeout = setTimeout(() => setPlateReveal(true), 340);
      navTimeout = setTimeout(() => {
        setPlateReveal(false);
        setDetectedVehicle(null);
        navigate('/slot', {
          state: {
            entryTime: new Date().toISOString(),
            vehicle: detectedVehicle,
          }
        });
      }, 10000); // 10 detik
    }
    return () => {
      clearTimeout(revealTimeout);
      clearTimeout(navTimeout);
    };
  }, [detectedVehicle, navigate]);

  const simulateDetection = () => {
    setIsDetecting(true);
    setDetectedVehicle(null);
    setPlateReveal(false);
    setTimeout(() => {
      setDetectedVehicle({ type: 'Sedan', plate: 'B 1234 ABC' });
      setIsDetecting(false);
    }, 2800);
  };

  // --- SPLASH SCREEN ---
  if (showSplash) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          background: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 9999,
          overflow: "hidden",
          opacity: splashOut ? 0 : 1,
          pointerEvents: splashOut ? "none" : "auto",
          transition: "opacity .8s cubic-bezier(.7,.18,.22,1.09)",
        }}
      >
        <style>{`
          @keyframes splash-pop {
            0% { opacity: 0; transform: scale(.87);}
            70% { opacity: 1;}
            100% { opacity: 1; transform: scale(1);}
          }
        `}</style>
        {/* Bubbles */}
        <div style={{position:"absolute", inset:0, zIndex:1, pointerEvents:'none'}}>
          <div style={{
            position:"absolute", left: "6%", top: "9%",
            width: 110, height: 110, borderRadius: 60,
            background: "#FFD600", opacity:.11,
            filter:"blur(2.2px)",
            animation: "splash-pop 1.2s .3s both"
          }}/>
          <div style={{
            position:"absolute", right: "9%", bottom: "8%",
            width: 76, height: 76, borderRadius: 38,
            background: "#FFD600", opacity:.13,
            filter:"blur(2px)",
            animation: "splash-pop 1.7s .5s both"
          }}/>
        </div>
        {/* Center logo */}
        <div style={{
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <svg width={98} height={62} viewBox="0 0 82 54" fill="none"
            style={{marginBottom: 16, animation:"splash-pop 1.2s .1s both"}}>
            {/* Simple car icon */}
            <rect x="17" y="20" width="36" height="14" rx="5" fill="#FFD600" stroke="#222" strokeWidth="2"/>
            <rect x="28" y="23" width="16" height="7" rx="2.8" fill="#fff" />
            <ellipse cx="23.5" cy="36.5" rx="4.5" ry="4.5" fill="#222" />
            <ellipse cx="47.5" cy="36.5" rx="4.5" ry="4.5" fill="#222" />
            {/* Parking sign */}
            <rect x="61" y="12" width="14" height="14" rx="7" fill="#FFD600" stroke="#fff" strokeWidth="2"/>
            <text x="68" y="22" fontWeight="bold" textAnchor="middle" fill="#fff" fontSize="12" fontFamily="sans-serif">P</text>
          </svg>
          <div style={{
            fontWeight:900,
            fontSize:'2.1rem',
            letterSpacing:1.3,
            color:'#FFD600',
            marginBottom:6,
            textShadow:"0 2px 6px #ffd60023"
          }}>CarCheese</div>
          <div style={{
            fontWeight:800,
            fontSize:'1.08rem',
            color:'#222',
            letterSpacing:.4
          }}>Vehicle Entry</div>
        </div>
      </div>
    );
  }

  // --- ENTRY CARD ---
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Bubble accents */}
      <div style={{position:"absolute", inset:0, zIndex:1, pointerEvents:'none'}}>
        <div style={{
          position:"absolute", left: -60, top: -60,
          width: 160, height: 130, borderRadius: 80,
          background: "radial-gradient(circle at 40% 40%, #FFD600cc 55%, #fff0 100%)",
          filter:"blur(1.4px)", opacity:.13
        }}/>
        <div style={{
          position:"absolute", right: -40, bottom: -35,
          width: 120, height: 120, borderRadius: 60,
          background: "radial-gradient(circle at 50% 50%, #FFD600bb 70%, #fff0 100%)",
          filter:"blur(1.4px)", opacity:.13
        }}/>
      </div>
      <div style={{
        width: '100%',
        maxWidth: 560,
        padding: '0 2vw',
        margin: '38px 0' // margin supaya card tidak mentok ke atas/bawah
      }}>
        <Card
          style={{
            width: '100%',
            minHeight: 520,
            borderRadius: "26px",
            boxShadow: "0 8px 36px #FFD60025, 0 2px 18px #bbb3",
            background: "#fff",
            zIndex: 3,
            padding: '16px 0 32px 0',
            display: 'flex',
            flexDirection: 'column'
          }}
          bodyStyle={{ padding: "20px 24px 0 24px" }}
        >
          {/* Title + Subtitle */}
          <div style={{textAlign:'center', marginBottom:16}}>
            <CameraOutlined style={{color:'#FFD600', fontSize:30, marginTop:-4}} />
            <Title level={3} style={{
              display:'inline-block',
              margin:0, marginLeft:10, fontWeight:900, color:'#222',
              fontSize:'2rem', letterSpacing:1.1, verticalAlign:'middle'
            }}>
              Vehicle Entry Point
            </Title>
            <div style={{
              color:'#b9a500',
              fontSize:17,
              fontWeight:600,
              marginTop:2,
              marginBottom:6,
              letterSpacing:0.2
            }}>
              Scan and Enter Parking
            </div>
          </div>
          {/* Camera Feed/Illustration */}
          <div style={{
            background: 'linear-gradient(90deg,#FFFDE7 85%,#FFD60010 100%)',
            height: 260,
            maxWidth: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 21,
            marginBottom: 18,
            border: "1.8px solid #ffe06666",
            position: 'relative'
          }}>
            {isDetecting ? (
              <Spin size="large" tip="Detecting Vehicle..." style={{ color: "#FFD600" }} />
            ) : (
              <div style={{textAlign:'center', width:'100%'}}>
                {/* Ilustrasi mobil + kamera */}
                <svg width={150} height={100} viewBox="0 0 120 80" fill="none">
                  <rect x="22" y="34" width="53" height="20" rx="8" fill="#FFD600" stroke="#222" strokeWidth="2"/>
                  <rect x="38" y="39" width="24" height="8" rx="3.5" fill="#fff" />
                  <ellipse cx="32" cy="54" rx="5" ry="5" fill="#222" />
                  <ellipse cx="68" cy="54" rx="5" ry="5" fill="#222" />
                  <circle cx="95" cy="28" r="11" fill="#fffbe7" stroke="#FFD600" strokeWidth="3"/>
                  <circle cx="95" cy="28" r="6" fill="#FFD600" />
                  <rect x="93.5" y="17" width="3" height="9" rx="1.3" fill="#FFD600" />
                  <rect x="79" y="32" width="30" height="4" rx="2" fill="#FFD600" style={{
                    opacity: isDetecting ? 0.8 : 0.23,
                    animation: isDetecting ? 'scanline 1.5s infinite alternate' : 'none'
                  }}/>
                  <style>
                    {`
                      @keyframes scanline {
                        0% { opacity: 0.33; }
                        100% { opacity: 1; }
                      }
                    `}
                  </style>
                </svg>
                <div style={{color:'#b9a500', marginTop:7, fontWeight:600, letterSpacing:0.2, fontSize:15}}>Camera Feed Preview</div>
              </div>
            )}
          </div>
          {/* Detection Button */}
          <div style={{
            display:'flex', justifyContent:'center', marginBottom: 10
          }}>
            <Button 
              type="primary" 
              onClick={simulateDetection} 
              loading={isDetecting}
              size="large"
              style={{
                background: isDetecting 
                  ? 'linear-gradient(90deg,#FFD600 75%,#FFD600 100%)'
                  : 'linear-gradient(90deg,#FFD600 80%,#FFA726 100%)',
                color: "#222",
                fontWeight: 700,
                border: "none",
                borderRadius: 25,
                minWidth: 170,
                minHeight: 44,
                fontSize: 18,
                boxShadow: "0 2px 16px #FFD60044",
                transition: "all .17s cubic-bezier(.52,.12,.29,1.12)",
                outline: "none"
              }}
            >
              {isDetecting ? <><ScanOutlined /> Detecting...</> : <><ScanOutlined /> Start Detection</>}
            </Button>
          </div>
          {/* Instructions */}
          <Paragraph style={{ marginTop: 12, fontSize:16, textAlign:'center' }}>
            <Text strong style={{color:'#FFD600'}}>Instructions:</Text> Please position your vehicle in front of the camera and ensure the license plate is visible.
          </Paragraph>
        </Card>
      </div>
      {/* MODAL DETECTION */}
      <Modal
        open={!!detectedVehicle && plateReveal}
        footer={null}
        closable={false}
        centered
        width={400}
        style={{
          zIndex: 11111,
          padding:0,
          top: 30,
        }}
        maskStyle={{
          background: "rgba(255,214,0,0.12)"
        }}
        bodyStyle={{
          padding: '32px 0 22px 0',
          borderRadius: 20,
          background: '#fff',
          minHeight: 280,
        }}
        destroyOnClose
      >
        {/* Animasi */}
        <style>
          {`
            @keyframes plate-pop {
              0% { opacity: 0; transform: translateY(38px) scale(0.97);}
              80% { opacity: 1;}
              100% { opacity: 1; transform: translateY(0) scale(1);}
            }
            @keyframes ring-grow {
              0% { transform: scale(0.65); opacity: 0;}
              60% { opacity: .8;}
              100% { transform: scale(1.13); opacity: 0;}
            }
          `}
        </style>
        <div style={{
          background:'#FFFDE7',
          borderRadius: 18,
          border: "2.5px solid #FFD600",
          padding: '22px 12px 16px 12px',
          boxShadow: "0 6px 36px #FFD60011",
          fontWeight: 700,
          color:'#222',
          textAlign:'center',
          minWidth: 220,
          minHeight: 180,
          position:'relative',
          margin: '0 auto',
          opacity: plateReveal ? 1 : 0,
          transform: plateReveal ? 'translateY(0) scale(1)' : 'translateY(38px) scale(.97)',
          animation: plateReveal ? 'plate-pop .72s cubic-bezier(.73,.11,.18,.98) both' : undefined,
          transition: 'all .22s cubic-bezier(.73,.13,.18,.96)'
        }}>
          {/* Success Ring */}
          {plateReveal && (
            <div style={{
              position:'absolute',
              left: '50%', top: -36,
              transform:'translateX(-50%)',
              pointerEvents:'none',
            }}>
              <CheckCircleFilled style={{
                color:'#FFD600',
                fontSize:38,
                background:'#fff',
                borderRadius:40,
                boxShadow:'0 2px 16px #FFD60044'
              }}/>
              <div style={{
                position:'absolute', left:'50%', top:'49%',
                width:66, height:66, borderRadius:33,
                border:'4.3px solid #FFD60088',
                transform:'translate(-50%,-50%)',
                opacity:0,
                animation:'ring-grow .8s cubic-bezier(.7,.09,.14,.92) .16s both'
              }} />
            </div>
          )}
          <div style={{
            color:'#b9a500',
            fontWeight:600,
            fontSize:17,
            marginBottom:4,
            marginTop:12,
            letterSpacing:0.1,
            display:'flex', alignItems:'center', justifyContent:'center', gap:7
          }}>
            <CarOutlined style={{color:'#FFD600', fontSize:19}}/> Vehicle detected!
          </div>
          <div style={{
            marginBottom:6,
            fontWeight:700,
            fontSize:16,
          }}>
            Type: <span style={{fontWeight:800, color:'#FFD600'}}>{detectedVehicle?.type}</span>
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: 3.4,
            color: "#222",
            background:'#ffd600',
            borderRadius:10,
            padding:'4px 18px',
            display:'inline-block',
            boxShadow:'0 2px 12px #FFD60022',
            margin:'8px 0'
          }}>
            {detectedVehicle?.plate}
          </div>
          <div style={{
            color:'#888',
            fontSize:13,
            marginTop:10,
            fontWeight:500
          }}>
            Automatically continue in 10 seconds...
          </div>
        </div>
      </Modal>
      {/* Bottom credit */}
      <div style={{
        position: 'absolute',
        bottom: 14,
        width: '100%',
        textAlign: 'center',
        color: '#BBB',
        fontSize: 13,
        zIndex: 4
      }}>
        Powered by CarCheese AI Detection
      </div>
    </div>
  );
}
