// PARK-IQ-CENTRAL-FE/app/routes/login.tsx
import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { userService, type AuthResponse } from "../../api/userService";

const { Title, Text } = Typography;

export function meta() {
  return [{ title: "CarCheese - Admin Login" }];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [loginError, setLoginError] = useState<string | null>(null);

  const onFinish = async (values: any) => {
  setLoading(true);
  setLoginError(null);
  try {
    const apiResponse = await userService.login(values);
    const { access_token, user } = apiResponse;

    if (!access_token || !user || !user.role || !user.username) {
      console.error("Critical Error: Token or user data is undefined after login API call.");
      message.error("Login successful but failed to get user data. Please contact support.");
      setLoading(false);
      return;
    }

    // 🔥 Add console logs here to confirm what's being set
    console.log("Login Success: Setting authToken:", access_token);
    console.log("Login Success: Setting userRole:", user.role);
    console.log("Login Success: Setting username:", user.username);

    localStorage.setItem("authToken", access_token);
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("username", user.username);

    // Immediately check if it's stored
    const checkToken = localStorage.getItem("authToken");
    console.log("Login Success: Token immediately after setting:", checkToken ? 'Present' : 'Missing');


    message.success("Login successful! Redirecting to dashboard...");
    // Use window.location.href for a full refresh - highly recommended for initial login
    window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Login failed (API error):", error);
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Title
          level={3}
          style={{ textAlign: "center", marginBottom: 24, color: "#001529" }}
        >
          CarCheese Admin Login
        </Title>
        <Form
          name="admin_login"
          form={form}
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          {/* === UNCOMMENT AND USE THIS INLINE ALERT === */}
          {loginError && (
            <Alert
              message="Login Error"
              description={loginError}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 20 }}
            />
          )}

          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              size="large"
              loading={loading}
              disabled={loading}
            >
              Log in
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <Text type="secondary">
              Forgot password? <a href="#">Click here</a>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}
