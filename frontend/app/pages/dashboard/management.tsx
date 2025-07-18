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
const { Option } = Select;

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
  zone: 'A' | 'B' | 'C'; // 🔥 CORRECTED: Zone is now explicitly 'A', 'B', or 'C'
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
    zone: "A", // Default zone for new slots (or first option in Select)
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
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  // Specific handler for Ant Design Select component (for Status)
  const handleStatusSelectChange = (
    value: "available" | "occupied" | "maintenance"
  ) => {
    setFormState((prevState) => ({ ...prevState, status: value }));
    setFormErrors((prevErrors) => ({ ...prevErrors, status: undefined }));
  };

  // Specific handler for Ant Design Select component (for Zone)
  const handleZoneSelectChange = (value: 'A' | 'B' | 'C') => { // 🔥 NEW: Specific handler for Zone Select
    setFormState(prevState => ({ ...prevState, zone: value }));
    setFormErrors(prevErrors => ({ ...prevErrors, zone: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string | undefined } = {};

    if (!formState.slot_id.trim()) {
      errors.slot_id = "Slot ID is required!";
    }
    if (!formState.level.trim()) {
      errors.level = "Level is required!";
    }
    // 🔥 VALIDATION FOR ZONE: Ensure it's one of the valid options
    if (!formState.zone || !['A', 'B', 'C'].includes(formState.zone)) {
      errors.zone = "Zone must be A, B, or C!";
    }
    if (editingSlot && !formState.status) {
      errors.status = "Status is required!";
    }

    setFormErrors(errors);

    console.log("Validation Errors:", errors);
    console.log("Is Form Valid:", Object.keys(errors).length === 0);

    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    setEditingSlot(null);
    setFormState({
      slot_id: "",
      level: "",
      zone: "A", // Default zone for new slots
      status: "available", // Default status for new slots
    });
    setFormErrors({});
    setIsModalVisible(true);
  };

  const handleEdit = (record: ParkingSlotDisplay) => {
    setEditingSlot(record);
    setFormState({
      slot_id: record.slot_id,
      level: record.level,
      zone: record.zone, // This should now be 'A', 'B', or 'C'
      status: record.status,
    });
    setFormErrors({});
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
          zone: formState.zone, // Correctly typed as 'A' | 'B' | 'C'
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
          zone: formState.zone, // Correctly typed as 'A' | 'B' | 'C'
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
          closable
          onClose={() => setError(null)}
          action={
            <Button size="small" type="primary" onClick={() => window.location.reload()}>
              OK
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <Title level={3}>Parking Slot Management</Title>{" "}
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
              Zone (A, B, C): {/* Updated label */}
            </label>
            <Select // 🔥 Changed Input to Select for Zone
              id="zone"
              value={formState.zone}
              onChange={handleZoneSelectChange} // Use specific handler
              status={formErrors.zone ? "error" : ""}
            >
              <Option value="A">A</Option>
              <Option value="B">B</Option>
              <Option value="C">C</Option>
            </Select>
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
                onChange={handleStatusSelectChange} // Use the specific handler for Select
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
