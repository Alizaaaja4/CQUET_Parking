// PARK-IQ-CENTRAL-FE/app/api/parkingService.ts
import axiosInstance from './axiosInstance';

// Define specific response/payload types for clarity
export interface SlotRecommendation {
    recommended_slot: { // Changed to match backend key
        slot_id: string; // Ensure this matches the actual slot identifier
        level: string;
        zone: string; // Add zone as per your backend recommend_slot
        status: boolean; // This particular endpoint returns boolean status, keep as is
        id?: number; // Flask model usually has an integer ID
    };
    navigation_info: {
        level: string;
        zone: string;
        slot_id: string;
    };
}

export interface ParkingSlot {
    id: number;
    slot_id: string;
    level: string;
    type?: 'Car' | 'Motorcycle' | 'Both'; // Keep optional if not always present
    status: 'available' | 'occupied' | 'maintenance'; // 🔥 CORRECTED: Based on your Postman response, this is a string
    vehiclePlate?: string; // Optional, add if your backend sends it for occupied slots
    entryTime?: string;   // Optional, add if your backend sends it for occupied slots
    zone: string; // Mandatory from backend create_slot
    created_at?: string;
    updated_at?: string;
}

export interface OccupyReleasePayload {
    slot_id: string; // Changed to slot_id to match backend payload
    vehiclePlate?: string; // Optional in occupy payload
    entryTime?: string;
    exitTime?: string;
    duration?: string;
    amount?: number;
}

export interface SlotOperationResponse {
    message: string;
    slot?: ParkingSlot;
}

export interface ParkingStatistics {
    available: number;
    occupied: number;
    total: number;
}

export interface GetAllParkingSlotsAdminResponse {
    slots: ParkingSlot[];
    statistics: ParkingStatistics;
}


export const parkingService = {
    // --- PUBLIC ENDPOINTS (Adjust paths if your backend differs from these assumptions) ---

    getAvailableParkingSlots: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/slots/available');
            return response.data;
        } catch (error) {
            console.error('Error fetching available parking slots:', error);
            throw error;
        }
    },

    getSlotRecommendation: async (): Promise<SlotRecommendation> => {
        try {
            const response = await axiosInstance.get<SlotRecommendation>('/slots/recommend');
            return response.data;
        } catch (error) {
            console.error('Error fetching slot recommendation:', error);
            throw error;
        }
    },

    occupyParkingSlot: async (payload: OccupyReleasePayload): Promise<SlotOperationResponse> => {
        try {
            const response = await axiosInstance.post<SlotOperationResponse>('/slots/occupy', { slot_id: payload.slot_id });
            return response.data;
        } catch (error) {
            console.error('Error occupying parking slot:', error);
            throw error;
        }
    },

    releaseParkingSlot: async (payload: OccupyReleasePayload): Promise<SlotOperationResponse> => {
        try {
            const response = await axiosInstance.post<SlotOperationResponse>('/slots/release', { slot_id: payload.slot_id });
            return response.data;
        } catch (error) {
            console.error('Error releasing parking slot:', error);
            throw error;
        }
    },

    // --- ADMIN ONLY ENDPOINTS (Used in Dashboard, requires admin/operator token) ---

    getAllParkingSlotsAdmin: async (): Promise<GetAllParkingSlotsAdminResponse> => {
        try {
            const response = await axiosInstance.get<GetAllParkingSlotsAdminResponse>('/slots/');
            return response.data;
        } catch (error) {
            console.error('Error fetching all parking slots for admin:', error);
            throw error;
        }
    },

    createParkingSlotAdmin: async (data: Omit<ParkingSlot, 'id' | 'status' | 'vehiclePlate' | 'entryTime' | 'created_at' | 'updated_at' | 'type'>): Promise<SlotOperationResponse> => {
      try {
        // The 'data' parameter already contains the required 'slot_id', 'level', 'zone'
        // due to the Omit type, ensuring the correct input format for the backend.
        const response = await axiosInstance.post<SlotOperationResponse>('/slots/', data);
        return response.data;
      } catch (error) {
        console.error('Error creating parking slot (admin):', error);
        throw error;
      }
    },

    updateParkingSlotAdmin: async (slotId: number, data: Partial<ParkingSlot>): Promise<SlotOperationResponse> => {
        try {
            const response = await axiosInstance.put<SlotOperationResponse>(`/slots/${slotId}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating slot ${slotId} (admin):`, error);
            throw error;
        }
    },

    deleteParkingSlotAdmin: async (slotId: number): Promise<void> => {
        try {
            await axiosInstance.delete(`/slots/${slotId}`);
        } catch (error) {
            console.error(`Error deleting slot ${slotId} (admin):`, error);
            throw error;
        }
    },
};
