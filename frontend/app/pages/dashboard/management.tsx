// PARK-IQ-CENTRAL-FE/app/routes/dashboard/management.tsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  Button,
  Space,
  Modal,
  Popconfirm,
  message,
  Spin,
  Alert,
  Tag,
  Select,
  Input,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  parkingService,
  type ParkingSlot,
  type GetAllParkingSlotsAdminResponse,
} from "../../api/parkingService";

const { Title } = Typography;
const { Option } = Select; // Keep Select and Option imports as they are still used

export function meta() {
  return [{ title: "Dashboard - Slot Management" }];
}

interface ParkingSlotDisplay
  extends Omit<
    ParkingSlot,
    "created_at" | "updated_at" | "vehiclePlate" | "entryTime" | "type"
  > {
  key: string;
}

// Define the form state interface for clarity
interface CustomSlotFormState {
  slot_id: string;
  level: string;
  zone: string;
  status: "available" | "occupied" | "maintenance";
}

export default function SlotManagementPage() {
  const [slots, setSlots] = useState<ParkingSlotDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ParkingSlotDisplay | null>(
    null
  );
  // Custom form state for manual handling
  const [formState, setFormState] = useState<CustomSlotFormState>({
    slot_id: "",
    level: "",
    zone: "",
    status: "available", // Default status for new slots
  });
  const [formErrors, setFormErrors] = useState<{
    [key: string]: string | undefined;
  }>({});

  // Function to fetch all slots from the backend
  const fetchSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: GetAllParkingSlotsAdminResponse =
        await parkingService.getAllParkingSlotsAdmin();
      setSlots(
        response.slots.map((slot) => ({ ...slot, key: slot.id.toString() }))
      );
    } catch (err: any) {
      console.error("Error fetching parking slots:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch parking slots.";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch slots on component mount
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      setError("Authentication token missing. Please log in.");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      fetchSlots();
    }, 50);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
    // Clear error for the field as user types/selects
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  // Specific handler for Ant Design Select component
  const handleSelectChange = (
    value: "available" | "occupied" | "maintenance"
  ) => {
    setFormState((prevState) => ({ ...prevState, status: value }));
    setFormErrors((prevErrors) => ({ ...prevErrors, status: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string | undefined } = {};

    // Validate Slot ID
    if (!formState.slot_id.trim()) {
      errors.slot_id = "Slot ID is required!";
    }
    // Validate Level
    if (!formState.level.trim()) {
      errors.level = "Level is required!";
    }
    // Validate Zone
    if (!formState.zone.trim()) {
      errors.zone = "Zone is required!";
    }
    // Status is only required if editing an existing slot
    if (editingSlot && !formState.status) {
      errors.status = "Status is required!";
    }

    setFormErrors(errors);

    // Log validation results for debugging
    console.log("Validation Errors:", errors);
    console.log("Is Form Valid:", Object.keys(errors).length === 0);

    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleAdd = () => {
    setEditingSlot(null);
    setFormState({
      slot_id: "",
      level: "",
      zone: "",
      status: "available", // Default status for new slots
    });
    setFormErrors({}); // Clear previous errors
    setIsModalVisible(true);
  };

  const handleEdit = (record: ParkingSlotDisplay) => {
    setEditingSlot(record);
    setFormState({
      slot_id: record.slot_id,
      level: record.level,
      zone: record.zone,
      status: record.status,
    });
    setFormErrors({}); // Clear previous errors
    setIsModalVisible(true);
  };

  const handleDelete = async (
    slotIdToDelete: number,
    slotIdentifier: string
  ) => {
    setLoading(true);
    try {
      await parkingService.deleteParkingSlotAdmin(slotIdToDelete);
      message.success(`Slot ${slotIdentifier} deleted successfully!`);
      fetchSlots();
    } catch (err: any) {
      console.error(`Error deleting slot ${slotIdentifier}:`, err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        `Failed to delete slot ${slotIdentifier}.`;
      message.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    if (!validateForm()) {
      message.error("Please fill in all required fields correctly.");
      return;
    }

    console.log("Form state submitted:", formState);

    setLoading(true);
    try {
      if (editingSlot) {
        const payload: Partial<ParkingSlot> = {
          slot_id: formState.slot_id,
          level: formState.level,
          zone: formState.zone,
          status: formState.status,
        };
        await parkingService.updateParkingSlotAdmin(editingSlot.id, payload);
        message.success(`Slot ${formState.slot_id} updated successfully!`);
      } else {
        const payload: Omit<
          ParkingSlot,
          | "id"
          | "status"
          | "vehiclePlate"
          | "entryTime"
          | "created_at"
          | "updated_at"
          | "type"
        > = {
          slot_id: formState.slot_id,
          level: formState.level,
          zone: formState.zone,
        };
        await parkingService.createParkingSlotAdmin(payload);
        message.success(`Slot ${formState.slot_id} added successfully!`);
      }
      setIsModalVisible(false);
      fetchSlots();
    } catch (err) {
      console.error("API Error:", err);
      const errorMessage =
        (err as any).response?.data?.error ||
        (err as any).message ||
        "Operation failed.";
      message.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Slot ID", dataIndex: "slot_id", key: "slot_id" },
    { title: "Level", dataIndex: "level", key: "level" },
    { title: "Zone", dataIndex: "zone", key: "zone" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: "available" | "occupied" | "maintenance") => (
        <Tag
          color={
            status === "available"
              ? "success"
              : status === "occupied"
              ? "error"
              : "warning"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: ParkingSlotDisplay) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title={`Are you sure to delete slot ${record.slot_id}?`}
            onConfirm={() => handleDelete(record.id, record.slot_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Loading slot data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable // Keeps the default 'x' close button
          onClose={() => setError(null)} // Clear the error message on 'x' click, don't refresh
        />
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Button
            size="small"
            type="primary"
            onClick={() => window.location.reload()}
          >
            OK
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <Title level={3}>Parking Slot Management</Title>{" "}
      {/* Changed title back to original */}
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
        Add New Slot
      </Button>
      <Table dataSource={slots} columns={columns} rowKey="id" />
      <Modal
        title={editingSlot ? "Edit Parking Slot" : "Add New Parking Slot"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
      >
        {/* Custom form using HTML inputs and React state */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              htmlFor="slot_id"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Slot ID (e.g., L1A01):
            </label>
            <Input
              id="slot_id"
              name="slot_id"
              value={formState.slot_id}
              onChange={handleInputChange}
              disabled={!!editingSlot}
              status={formErrors.slot_id ? "error" : ""}
            />
            {formErrors.slot_id && (
              <div
                style={{ color: "red", fontSize: "0.85em", marginTop: "4px" }}
              >
                {formErrors.slot_id}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="level"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Level (e.g., L1, L2):
            </label>
            <Input
              id="level"
              name="level"
              value={formState.level}
              onChange={handleInputChange}
              status={formErrors.level ? "error" : ""}
            />
            {formErrors.level && (
              <div
                style={{ color: "red", fontSize: "0.85em", marginTop: "4px" }}
              >
                {formErrors.level}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="zone"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Zone (e.g., A, B):
            </label>
            <Input
              id="zone"
              name="zone"
              value={formState.zone}
              onChange={handleInputChange}
              status={formErrors.zone ? "error" : ""}
            />
            {formErrors.zone && (
              <div
                style={{ color: "red", fontSize: "0.85em", marginTop: "4px" }}
              >
                {formErrors.zone}
              </div>
            )}
          </div>

          {editingSlot && (
            <div>
              <label
                htmlFor="status"
                style={{ display: "block", marginBottom: "4px" }}
              >
                Status:
              </label>
              <Select
                id="status"
                value={formState.status}
                onChange={handleSelectChange} // Use the specific handler for Select
                status={formErrors.status ? "error" : ""}
              >
                <Option value="available">Available</Option>
                <Option value="occupied">Occupied</Option>
                <Option value="maintenance">Maintenance</Option>
              </Select>
              {formErrors.status && (
                <div
                  style={{ color: "red", fontSize: "0.85em", marginTop: "4px" }}
                >
                  {formErrors.status}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </Space>
  );
}
