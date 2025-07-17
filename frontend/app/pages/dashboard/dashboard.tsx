import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Typography,
  Button,
  Spin,
  message,
  Grid,
  Drawer,
  Avatar,
  Dropdown,
  Space,
} from "antd";
import {
  DashboardOutlined,
  CarOutlined,
  DollarOutlined,
  UsergroupAddOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";

const { Header, Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

export function meta() {
  return [{ title: "CarCheese - Admin Dashboard" }];
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [username, setUsername] = useState<string>("Admin");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedUsername = localStorage.getItem("username");
    if (storedRole) {
      setUserRole(storedRole);
      if (storedUsername) setUsername(storedUsername);
    } else {
      message.warning("Please log in to access the dashboard.");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    message.success("Logged out successfully!");
    navigate("/login");
  };

  // Menu
  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Monitoring</Link>,
    },
    {
      key: "/dashboard/payments",
      icon: <DollarOutlined />,
      label: <Link to="/dashboard/payments">Payment History</Link>,
    },
    ...(userRole === "admin"
      ? [
          {
            key: "/dashboard/slot-management",
            icon: <CarOutlined />,
            label: <Link to="/dashboard/slot-management">Slot Management</Link>,
          },
          {
            key: "/dashboard/accounts",
            icon: <UsergroupAddOutlined />,
            label: <Link to="/dashboard/accounts">Admin Accounts</Link>,
          },
        ]
      : []),
  ];

  // Auto Highlight
  const getDefaultSelectedKey = () => {
    const { pathname } = location;
    let bestMatchKey = "/dashboard";
    let longestMatchLength = 0;
    menuItems.forEach((item) => {
      if (typeof item.key === "string") {
        if (pathname.startsWith(item.key) && item.key.length > longestMatchLength) {
          bestMatchKey = item.key;
          longestMatchLength = item.key.length;
        }
      }
    });
    return bestMatchKey;
  };

  const avatarMenuItems = [
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  if (!userRole) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Verifying access..." />
      </div>
    );
  }

  const isMobile = screens.md === false;

  return (
    <Layout style={{ minHeight: "100vh", background: "#F8F9FC" }}>
      {/* SIDEBAR */}
      {!isMobile && (
        <Layout.Sider
          width={210}
          theme="dark"
          style={{
            background: "#23272F",
            borderRight: "2px solid #FFD60022",
            boxShadow: "2px 0 12px #2222",
            position: "relative",
            zIndex: 10,
            paddingTop: 0,
            minHeight: "100vh",
          }}
        >
          <div
            style={{
              padding: "38px 0 26px 0",
              textAlign: "center",
              borderBottom: "1.5px solid #FFD60033",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize: 24,
                color: "#FFD600",
                fontFamily: "Montserrat, sans-serif",
                letterSpacing: 1.3,
                textShadow: "0 1px 8px #FFD60016",
                userSelect: "none",
              }}
            >
              CarCheese
            </div>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getDefaultSelectedKey()]}
            items={menuItems}
            style={{
              background: "transparent",
              border: "none",
              fontWeight: 600,
              fontSize: 16,
              color: "#fff",
            }}
          />
        </Layout.Sider>
      )}

      {/* MOBILE DRAWER */}
      {isMobile && (
        <Drawer
          title={<div style={{ fontWeight: 900, color: "#FFD600" }}>CarCheese</div>}
          placement="left"
          closable={true}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0, background: "#23272F" }}
          headerStyle={{ background: "#23272F", color: "#FFD600" }}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getDefaultSelectedKey()]}
            items={menuItems}
            onClick={() => setDrawerVisible(false)}
          />
        </Drawer>
      )}

      <Layout>
        {/* HEADER */}
        <Header
          style={{
            background: "#fff",
            padding: "0 30px",
            borderBottom: "2px solid #FFE06633",
            position: "sticky",
            top: 0,
            zIndex: 20,
            minHeight: 65,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 10px #FFD60006",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {isMobile && (
                <Button
                  type="text"
                  icon={<MenuOutlined style={{ fontSize: 28, color: "#FFD600" }} />}
                  onClick={() => setDrawerVisible(true)}
                  style={{ marginRight: 8 }}
                />
              )}
              {/* LOGO MOBIL + ADMIN DASHBOARD */}
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontWeight: 900,
                fontFamily: "Montserrat, sans-serif",
                color: "#222",
                fontSize: 22,
                letterSpacing: 1.2,
              }}>
                <CarOutlined style={{ color: "#FFD600", fontSize: 26 }} />
                Admin Dashboard
              </span>
            </div>
            <Dropdown menu={{ items: avatarMenuItems }}>
              <a onClick={e => e.preventDefault()}>
                <Space size="small">
                  <Avatar size="large" style={{
                    backgroundColor: '#FFD600',
                    color: '#23272F',
                    fontWeight: 700,
                    fontSize: 20,
                  }} icon={<UserOutlined />} />
                  {!isMobile && (
                    <Typography.Text strong style={{ color: "#23272F" }}>{username}</Typography.Text>
                  )}
                </Space>
              </a>
            </Dropdown>
          </div>
        </Header>
        {/* MAIN CONTENT */}
        <Content style={{
          margin: isMobile ? "18px 0 0 0" : "30px 26px 0 26px",
          padding: isMobile ? 12 : 24,
          minHeight: 360,
          background: "#fff",
          borderRadius: 28,
          boxShadow: "0 6px 36px #FFD60013, 0 2px 16px #bbb2",
        }}>
          <Outlet />
        </Content>
        {/* FOOTER */}
        <Layout.Footer
          style={{
            textAlign: "center",
            background: "#23272F",
            color: "#FFD600",
            borderTop: "1.6px solid #ffe06633",
            fontWeight: 500,
            letterSpacing: ".5px",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          CarCheese Admin Panel ©{new Date().getFullYear()} | Smart Parking System
        </Layout.Footer>
      </Layout>
    </Layout>
  );
}
