import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Typography, message, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { userService } from "../../api/userService";

const { Title, Text } = Typography;

export function meta() {
  return [{ title: "CarCheese - Admin Login" }];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [loginError, setLoginError] = useState<string | null>(null);

  // SPLASH state
  const [showSplash, setShowSplash] = useState(true);
  const [splashOut, setSplashOut] = useState(false);

  useEffect(() => {
    // SPLASH: tampil 2s, lalu smooth keluar dalam 0.8s
    const outTimer = setTimeout(() => setSplashOut(true), 1800);
    const hideTimer = setTimeout(() => setShowSplash(false), 2600);
    return () => {
      clearTimeout(outTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    setLoginError(null);
    try {
      const apiResponse = await userService.login(values);
      const { access_token, user } = apiResponse;
      if (!access_token || !user || !user.role || !user.username) {
        message.error("Login successful but failed to get user data. Please contact support.");
        setLoading(false);
        return;
      }
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("username", user.username);
      message.success("Login successful! Redirecting to dashboard...");
      window.location.href = "/dashboard";
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- SPLASH ---
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
            0% { opacity: 0; transform: scale(.85);}
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
            fontSize:'2.3rem',
            letterSpacing:1.3,
            color:'#FFD600',
            marginBottom:6,
            textShadow:"0 2px 6px #ffd60023"
          }}>CarCheese</div>
          <div style={{
            fontWeight:800,
            fontSize:'1.2rem',
            color:'#222',
            letterSpacing:.5
          }}>Admin Panel</div>
        </div>
      </div>
    );
  }

  // --- LOGIN FORM ---
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Bubbles & accent */}
      <div style={{position:"absolute", inset:0, zIndex:1, pointerEvents:'none'}}>
        <div style={{
          position:"absolute", left: -60, top: -60,
          width: 150, height: 150, borderRadius: 80,
          background: "radial-gradient(circle at 40% 40%, #FFD600dd 60%, #fff0 100%)",
          filter:"blur(1.5px)", opacity:.15
        }}/>
        <div style={{
          position:"absolute", right: -40, bottom: -40,
          width: 120, height: 120, borderRadius: 60,
          background: "radial-gradient(circle at 50% 50%, #FFD600bb 70%, #fff0 100%)",
          filter:"blur(1.4px)", opacity:.13
        }}/>
        <div style={{
          position:"absolute", left: "60%", top: "66%",
          width: 46, height: 46, borderRadius: 30,
          background: "#FFD60055",
          filter:"blur(1.2px)", opacity:.10
        }}/>
      </div>

      <Card
        style={{
          width: 370,
          borderRadius: "20px",
          boxShadow: "0 8px 36px #FFD60025, 0 2px 18px #bbb3",
          padding: "20px 0 30px 0",
          background: "#fff",
          zIndex: 3,
        }}
        bodyStyle={{ padding: "18px 32px 0 32px" }}
      >
        {/* Logo/illustration */}
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginBottom: 14,
        }}>
          <svg width={82} height={54} viewBox="0 0 82 54" fill="none">
            <rect x="17" y="20" width="36" height="14" rx="5" fill="#FFD600" stroke="#222" strokeWidth="2"/>
            <rect x="28" y="23" width="16" height="7" rx="2.8" fill="#fff" />
            <ellipse cx="23.5" cy="36.5" rx="4.5" ry="4.5" fill="#222" />
            <ellipse cx="47.5" cy="36.5" rx="4.5" ry="4.5" fill="#222" />
            <rect x="61" y="12" width="14" height="14" rx="7" fill="#FFD600" stroke="#fff" strokeWidth="2"/>
            <text x="68" y="22" fontWeight="bold" textAnchor="middle" fill="#fff" fontSize="12" fontFamily="sans-serif">P</text>
          </svg>
        </div>
        <Title
          level={3}
          style={{
            textAlign: "center",
            marginBottom: 12,
            color: "#222",
            letterSpacing: 1.1,
            fontWeight: 900
          }}
        >
          Admin Login
        </Title>
        <div style={{
          textAlign: "center",
          fontWeight: 500,
          color: "#b9a500",
          fontSize: 17,
          marginBottom: 18,
          letterSpacing: ".5px"
        }}>
          Welcome back to <span style={{color:"#FFD600", fontWeight:700}}>CarCheese</span>
        </div>
        <Form
          name="admin_login"
          form={form}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          style={{marginTop: 0}}
        >
          {loginError && (
            <Alert
              message="Login Error"
              description={loginError}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 14 }}
            />
          )}
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your Username!" }]}
            style={{marginBottom: 14}}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#FFD600" }} />}
              placeholder="Username"
              size="large"
              autoFocus
              style={{
                borderRadius: 18,
                background: "#fffbe7",
                borderColor: "#ffe066",
                fontWeight: 500
              }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your Password!" }]}
            style={{marginBottom: 10}}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#FFD600" }} />}
              placeholder="Password"
              size="large"
              style={{
                borderRadius: 18,
                background: "#fffbe7",
                borderColor: "#ffe066",
                fontWeight: 500
              }}
            />
          </Form.Item>
          <Form.Item style={{marginBottom: 10}}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              disabled={loading}
              style={{
                width: "100%",
                background: "linear-gradient(90deg,#FFD600 70%,#FFA726 100%)",
                border: "none",
                fontWeight: 700,
                color: "#222",
                borderRadius: 22,
                boxShadow: "0 3px 16px #FFD60033",
                transition: "all .19s cubic-bezier(.61,.16,.22,1.15)",
                outline: "none",
                cursor: "pointer"
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "linear-gradient(90deg,#ffe066 60%,#ffd600 100%)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.035)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "linear-gradient(90deg,#FFD600 70%,#FFA726 100%)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
      {/* Simple absolute credit */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        width: '100%',
        textAlign: 'center',
        color: '#CCC',
        fontSize: 13,
        zIndex: 4
      }}>
        Powered by CarCheese Admin
      </div>
    </div>
  );
}
