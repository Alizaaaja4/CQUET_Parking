import React, { useEffect, useState } from 'react';
import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export function meta() {
  return [
    { title: "CarCheese - Smart Parking System" },
    { name: "description", content: "Smart Parking System - CarCheese" },
  ];
}

export default function Welcome() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [splashOut, setSplashOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(typeof window !== "undefined" && window.innerWidth < 700);
    // Splash: start fade out after 8.3s, total 9s
    const outTimer = setTimeout(() => setSplashOut(true), 8300);
    const hideTimer = setTimeout(() => setShowSplash(false), 9000);
    return () => {
      clearTimeout(outTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/entry');

  // --- SPLASH SCREEN ---
  if (showSplash) {
    const carWidth = isMobile ? 180 : 350;
    const carHeight = isMobile ? 60 : 110;

    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#fff',
        position: 'fixed',
        left: 0, top: 0,
        overflow: 'hidden',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 1.2s cubic-bezier(.77,.16,.22,1.09)',
        opacity: splashOut ? 0 : 1,
        pointerEvents: splashOut ? 'none' : 'auto',
      }}>
        <style>{`
          @keyframes car-move {
            0% { transform: translateX(-120px); }
            80% { transform: translateX(${isMobile ? 76 : 146}px); }
            100% { transform: translateX(${isMobile ? 65 : 128}px);}
          }
          @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1;}
          }
          @keyframes bubble-soft {
            0% { opacity:0; transform: scale(0.85);}
            15% { opacity:0.09;}
            75% { opacity:.20;}
            100% { opacity:.12; transform: scale(1);}
          }
          @keyframes p-pop {
            0% { opacity:0; transform: scale(0.3);}
            65% { opacity:0;}
            75% { opacity:.3; transform:scale(1.16);}
            88% { opacity:1; transform:scale(1);}
            100% { opacity:1; }
          }
        `}</style>
        {/* BG Bubble */}
        <div style={{position:'absolute',inset:0,zIndex:1}}>
          <div style={{
            position: 'absolute', left: '9%', top: '16%',
            width: isMobile ? 92 : 210, height: isMobile ? 92 : 180,
            background: '#FFD600', opacity: .13,
            borderRadius: 90, filter:'blur(2.4px)',
            animation: 'bubble-soft 2.8s .2s both'
          }}/>
          <div style={{
            position: 'absolute', right: '8%', bottom: '12%',
            width: isMobile ? 60 : 140, height: isMobile ? 56 : 120,
            background: '#FFD600', opacity: .14,
            borderRadius: 90, filter:'blur(2.6px)',
            animation: 'bubble-soft 3.5s .8s both'
          }}/>
          <div style={{
            position: 'absolute', left: '44%', top: '50%',
            width: isMobile ? 54 : 100, height: isMobile ? 50 : 88,
            background: '#FFD600', opacity: .11,
            borderRadius: 90, filter:'blur(2.4px)',
            animation: 'bubble-soft 2.4s 1.1s both'
          }}/>
        </div>

        {/* Animasi Utama */}
        <div style={{
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100vw',
        }}>
          {/* Teks Welcome */}
          <div style={{
            fontSize: isMobile ? '2.1rem' : '3.2rem',
            fontWeight: 900,
            letterSpacing: 1.6,
            color: '#222',
            marginBottom: isMobile ? 30 : 40,
            textAlign:'center',
            userSelect:'none',
            animation: 'fade-in 1.6s .4s both'
          }}>
            Welcome to <span style={{ color: '#FFD600' }}>CarCheese</span>
          </div>

          {/* Jalan & Mobil */}
          <div style={{
            position:'relative',
            width: carWidth + (isMobile ? 80 : 120),
            height: carHeight + 32,
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>
            {/* Jalan */}
            <div style={{
              position:'absolute', left:0, top:carHeight/2 + 12,
              width: '100%', height: isMobile ? 16 : 28,
              background: 'linear-gradient(90deg,#ffecb3 0%, #ffd600 50%, #fffde7 100%)',
              borderRadius: isMobile ? 18 : 24,
              boxShadow: '0 0 22px #ffd60033, 0 3px 22px #bbb5',
            }}/>
            {/* Marka */}
            {[0,1,2,3].map(n=>(
              <div key={n} style={{
                position:'absolute',
                left:`${25 + (carWidth/2 + 20)*n}px`, top:carHeight/2 + (isMobile?18:22),
                width: isMobile?20:36, height: isMobile?4:7, borderRadius: 6,
                background:'#fff', opacity:.85, boxShadow:'0 0 6px #fff6'
              }}/>
            ))}
            {/* Area Parkir */}
            <div style={{
              position:'absolute',
              right:isMobile?18:38,
              top:carHeight/2 + (isMobile?11:15),
              width: isMobile?34:70, height: isMobile?10:18, borderRadius:9,
              background:'#FFD600', boxShadow:'0 0 14px #ffd60070'
            }}/>
            {/* Mobil */}
            <div style={{
              position:'absolute',
              left:0, top:0,
              width: carWidth, height: carHeight,
              animation: `car-move 6.7s cubic-bezier(.65,.13,.16,1.09) .9s both`
            }}>
              <svg width={carWidth} height={carHeight} viewBox="0 0 180 60" fill="none">
                <rect x="25" y="18" width="88" height="27" rx="10" fill="#FFD600" stroke="#222" strokeWidth="2.7"/>
                <rect x="45" y="23" width="34" height="13" rx="4.5" fill="#fffde7" stroke="#eee" strokeWidth="1.4"/>
                <rect x="114" y="24" width="21" height="14" rx="7" fill="#FFD600" stroke="#222" strokeWidth="1.4"/>
                <ellipse cx="130" cy="32" rx="4" ry="3" fill="#ffe600" stroke="#ffb800" strokeWidth="1"/>
                <rect x="16" y="25" width="10" height="10" rx="4" fill="#FFD600" stroke="#222" strokeWidth="1.3"/>
                <ellipse cx="18" cy="33" rx="2.1" ry="1.5" fill="#ff7675" stroke="#ffb800" strokeWidth="0.6"/>
                <ellipse className="wheel" cx="42" cy="44" rx="7" ry="7" fill="#232323" stroke="#222" strokeWidth="2"/>
                <ellipse className="wheel" cx="90" cy="44" rx="7" ry="7" fill="#232323" stroke="#222" strokeWidth="2"/>
              </svg>
            </div>
            {/* P pop (muncul belakangan) */}
            <div style={{
              position:'absolute',
              right:isMobile?8:32, top:carHeight/2 - (isMobile?19:28),
              width:isMobile?29:56, height:isMobile?29:56,
              background:'#FFD600',
              borderRadius:'50%',
              display:'flex',alignItems:'center',justifyContent:'center',
              color:'#fff', fontWeight:900, fontSize:isMobile?21:32,
              border:'2.2px solid #fff',
              boxShadow:'0 0 10px #ffd60060',
              animation: 'p-pop 2.2s 5.7s both'
            }}>P</div>
          </div>
          {/* Tagline pendek */}
          <div style={{
            fontSize: isMobile ? '1.06rem' : '1.38rem',
            color:'#b29500',
            fontWeight: 600,
            marginTop: isMobile ? 32 : 48,
            letterSpacing: 0.1,
            animation: 'fade-in 1.3s 2.6s both'
          }}>
            AI Smart Parking for Everyone
          </div>
        </div>
      </div>
    );
  }

  // --- WELCOME SCREEN --- (unchanged)
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '0 2vw',
      overflow: 'hidden',
      transition: 'opacity 1s cubic-bezier(.73,.19,.18,1.07), transform 1.05s cubic-bezier(.73,.19,.18,1.09)'
    }}>
      {/* BG SHAPES */}
      <div style={{position:'absolute',inset:0,zIndex:1,pointerEvents:'none'}}>
        <div style={{
          position: 'absolute', left: -80, top: -60, width: 260, height: 140,
          background: 'radial-gradient(circle at 45% 45%, #FFEB3Bcc 65%, #fff0 100%)',
          filter: 'blur(2px)', opacity: 0.18, borderRadius: 120
        }}/>
        <div style={{
          position:'absolute',right:-50,bottom:-35,width:170,height:90,
          background:'radial-gradient(circle at 52% 70%, #FFD600 70%, #fff0 100%)',
          filter:'blur(1.5px)',opacity:0.12,borderRadius:120,
        }}/>
        {[...Array(7)].map((_,i) => (
          <span key={i}
            style={{
              position:'absolute',
              left:`${7 + Math.random()*83}%`,
              top:`${8 + Math.random()*84}%`,
              width:`${22+Math.random()*38}px`,
              height:`${22+Math.random()*38}px`,
              background:`rgba(255,214,0,${0.06 + Math.random()*0.07})`,
              borderRadius:180,
              filter:'blur(1.5px)'
            }}/>
        ))}
      </div>
      {/* LOGIN BUTTON */}
      {/* <Button
        type="text"
        size="small"
        onClick={handleLogin}
        style={{
          position: 'absolute',
          top: 36,
          right: 52,
          fontWeight: 500,
          color: '#888',
          border: 'none',
          background: 'transparent',
          zIndex: 10
        }}
      >
        Login
      </Button> */}
      {/* Main Content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 1100,
        gap: 32,
        position:'relative',
        zIndex:3,
        opacity: showSplash ? 0 : 1,
        transform: showSplash ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 1.15s cubic-bezier(.73,.19,.18,1.07), transform 1.2s cubic-bezier(.73,.19,.18,1.09)'
      }}>
        {/* LEFT: Text & Button */}
        <div style={{
          flex: 1,
          minWidth: 310,
          padding: '28px 0',
        }}>
          <Title style={{
            color: '#222',
            fontSize: '2.8rem',
            fontWeight: 900,
            lineHeight: 1.13,
            marginBottom: 10,
          }}>
            Welcome to <span style={{ color: '#FFD600' }}>CarCheese</span>
          </Title>
          <Paragraph style={{
            color: '#444',
            fontSize: 19,
            maxWidth: 390,
            marginBottom: 36,
            lineHeight: 1.7,
          }}>
            <span style={{ color: '#222', fontWeight: 600 }}>
              The Smart Parking Experience
            </span>
            <br />
            AI-powered car plate scanning, digital payments, real-time parking status & seamless entry — parking made smarter for everyone!
          </Paragraph>
          <Button
            type="primary"
            size="large"
            onClick={handleRegister}
            style={{
              padding: '0 36px',
              height: 48,
              fontSize: 19,
              background: 'linear-gradient(90deg,#FFD600 70%,#FFA726 100%)',
              border: 'none',
              fontWeight: 700,
              color: '#222',
              boxShadow: '0 2px 16px #FFD60044',
              borderRadius: 30,
              transition: 'all 0.22s cubic-bezier(.52,.12,.29,1.25)',
              outline: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.background = 'linear-gradient(90deg,#ffe066 60%,#ffd600 100%)';
              target.style.transform = 'scale(1.045)';
              target.style.boxShadow = '0 6px 24px #FFD60077';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.background = 'linear-gradient(90deg,#FFD600 70%,#FFA726 100%)';
              target.style.transform = 'scale(1)';
              target.style.boxShadow = '0 2px 16px #FFD60044';
            }}
          >
            Register to Enter Parking
          </Button>
        </div>
        {/* RIGHT: Illustration */}
        <div style={{
          flex: 1,
          minWidth: 310,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <svg width="330" height="220" viewBox="0 0 330 220" fill="none">
            <rect x="50" y="120" width="230" height="50" rx="18" fill="#FFF9E3"/>
            <rect x="75" y="70" width="180" height="60" rx="20" fill="#FFD600" stroke="#222" strokeWidth="2"/>
            <ellipse cx="105" cy="172" rx="22" ry="22" fill="#333"/>
            <ellipse cx="225" cy="172" rx="22" ry="22" fill="#333"/>
            <rect x="120" y="88" width="60" height="26" rx="9" fill="#fff"/>
            <rect x="258" y="95" width="40" height="13" rx="6" fill="#FFD600" stroke="#222" strokeWidth="1"/>
            <rect x="32" y="100" width="38" height="18" rx="8" fill="#FFD600" stroke="#222" strokeWidth="1"/>
            <ellipse cx="268" cy="120" rx="7" ry="4" fill="#FFD600"/>
          </svg>
        </div>
      </div>
      {/* Bottom credit */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        width: '100%',
        textAlign: 'center',
        color: '#CCC',
        fontSize: 13,
        zIndex: 4
      }}>
        Powered by CarCheese Smart Parking System
      </div>
    </div>
  );
}
