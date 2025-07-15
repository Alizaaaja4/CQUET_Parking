// PARK-IQ-CENTRAL-FE/app/routes/login.tsx
import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { userService, type AuthResponse } from "../../api/userService";

const { Title, Text } = Typography;

export function meta() {
  return [{ title: "ParkIQ Central - Admin Login" }];
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
      const apiResponse = await userService.login(values); // `apiResponse` is already the AuthResponse object

      // --- FIX THIS LINE ---
      const { access_token, user } = apiResponse; // <<<--- REMOVED .data
      // ---------------------

      // --- DEBUGGING LOGS HERE (Adjust as needed after this fix) ---
      // console.log('API Raw Response (apiResponse):', apiResponse); // This now IS the data
      // console.log('API Response Data (apiResponse.data):', apiResponse.data); // This will now cause error
      // console.log('Destructured access_token:', access_token);
      // console.log('Destructured user object:', user);
      // console.log('Destructured user.role:', user.role);
      // console.log('Destructured user.username:', user.username);
      // --- END DEBUGGING LOGS ---

      if (!access_token || !user || !user.role || !user.username) {
        console.error(
          "Critical Error: Token or user data is undefined after login API call."
        );
        message.error(
          "Login successful but failed to get user data. Please contact support."
        );
        setLoading(false);
        return;
      }

      message.success("Login successful! Redirecting to dashboard...");
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("username", user.username);

      navigate("/dashboard");
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
          ParkIQ Central Admin Login
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
