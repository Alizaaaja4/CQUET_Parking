// PARK-IQ-CENTRAL-FE/app/routes/dashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  theme,
  Typography,
  Button,
  Spin,
  message,
  Grid,
  Drawer,
  Avatar, // <<<--- Already imported
  Dropdown, // <<<--- Already imported
  type MenuProps, // <<<--- Already imported
  Space, // <<<--- IMPORT Space for aligning header items
} from "antd";
import {
  DashboardOutlined,
  CarOutlined,
  DollarOutlined,
  UsergroupAddOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined, // <<<--- Already imported
} from "@ant-design/icons";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import type { ItemType } from "antd/es/menu/interface";
import type { MenuClickEventHandler } from "rc-menu/lib/interface";

const { Header, Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

export function meta() {
  return [{ title: "ParkIQ Central - Admin Dashboard" }];
}

export default function DashboardLayout() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [username, setUsername] = useState<string>('Admin'); // State for username, default to 'Admin'

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedUsername = localStorage.getItem('username'); // Assuming you store username on login
    if (storedRole) {
      setUserRole(storedRole);
      if (storedUsername) {
        setUsername(storedUsername); // Set username if available
      }
    } else {
      message.warning("Please log in to access the dashboard.");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username"); // Clear username on logout
    message.success("Logged out successfully!");
    navigate("/login");
  };

  const getMenuItems = (role: string | null): ItemType[] => {
    const items: ItemType[] = [
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
    ];

    if (role === "admin") {
      items.push(
        {
          key: "/dashboard/slot-management",
          icon: <CarOutlined />,
          label: <Link to="/dashboard/slot-management">Slot Management</Link>,
        },
        {
          key: "/dashboard/accounts",
          icon: <UsergroupAddOutlined />,
          label: <Link to="/dashboard/accounts">Admin Accounts</Link>,
        }
      );
    }
    return items;
  };

  const menuItems = getMenuItems(userRole);

  const getDefaultSelectedKey = (): string => {
    const { pathname } = location;
    let bestMatchKey = "/dashboard";
    let longestMatchLength = 0;

    menuItems.forEach((item) => {
      if (item && typeof item.key === "string") {
        if (pathname.startsWith(item.key) && item.key.length > longestMatchLength) {
          bestMatchKey = item.key;
          longestMatchLength = item.key.length;
        }
      }
    });
    return bestMatchKey;
  };

  // --- NEW: Dropdown Menu Items for Avatar ---
  const avatarMenuItems: MenuProps['items'] = [
    {
      key: 'my-account-header', // Use a unique key for header
      label: "My Account",
      type: 'group', // Make it a group for header
    },
    {
      type: 'divider',
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />, // Add an icon
      onClick: () => {
        message.info('Profile clicked (not implemented yet).');
        // navigate('/dashboard/profile'); // Example navigation
      },
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <DashboardOutlined />, // Example icon
      onClick: () => {
        message.info('Settings clicked (not implemented yet).');
        // navigate('/dashboard/settings'); // Example navigation
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true, // Make logout button red
      onClick: handleLogout, // <<<--- LINK LOGOUT FUNCTION HERE
    },
  ];

  // --- NEW: Handle Menu click for the Drawer ---
  const handleDrawerMenuItemClick: MenuClickEventHandler = (e) => {
    setDrawerVisible(false); // Close drawer on menu item click
    if (typeof e.key === "string") {
      navigate(e.key); // Navigate using the clicked key
    } else {
      console.warn("Menu item key is not a string:", e.key);
    }
  };

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
    <Layout style={{ minHeight: "100vh" }}>
      {/* --- DESKTOP SIDEBAR (Sider) --- */}
      {!isMobile && (
        <Layout.Sider width={200} theme="dark">
          <div
            className="demo-logo-vertical"
            style={{
              height: 32,
              margin: 16,
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: 6,
            }}
          />
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getDefaultSelectedKey()]}
            items={menuItems}
          />
        </Layout.Sider>
      )}

      {/* --- MOBILE DRAWER (Drawer) --- */}
      {isMobile && (
        <Drawer
          title="Admin Menu"
          placement="top"
          closable={true}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          key="mobile-drawer"
          height="auto"
          styles={{
            body: { padding: 0 },
            header: { background: colorBgContainer, padding: "16px 24px" },
          }}
        >
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[getDefaultSelectedKey()]}
            items={menuItems}
            onClick={handleDrawerMenuItemClick}
          />
        </Drawer>
      )}

      <Layout>
        <Header style={{ paddingTop: 0, background: colorBgContainer }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 24px",
            }}
          >
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                style={{ fontSize: "16px", width: 64, height: 64 }}
              />
            )}
            <Title
              level={4}
              style={{
                margin: 0,
                marginLeft: isMobile && !drawerVisible ? 0 : 24,
              }}
            >
              Dashboard
            </Title>
            {/* --- REPLACED LOGOUT BUTTON WITH DROPDOWN AVATAR --- */}
            <Dropdown menu={{ items: avatarMenuItems }} trigger={['click']}>
              <a onClick={(e) => e.preventDefault()}> {/* Use <a> for clickable trigger */}
                <Space size="small">
                    <Avatar size="large" style={{ backgroundColor: '#fde3cf', color: '#f56a00' }} icon={<UserOutlined />} />
                    {!isMobile && ( // Show username next to avatar only on desktop
                        <Typography.Text strong>{username}</Typography.Text>
                    )}
                </Space>
              </a>
            </Dropdown>
            {/* Removed the old logout button */}
          </div>
        </Header>
        <Content style={{ margin: "24px 16px 0" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Layout.Footer style={{ textAlign: "center" }}>
          CarCheese ©{new Date().getFullYear()} Created by CarCheese Developer Team
        </Layout.Footer>
      </Layout>
    </Layout>
  );
}