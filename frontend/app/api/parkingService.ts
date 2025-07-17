// PARK-IQ-CENTRAL-FE/app/api/parkingService.ts
import axiosInstance from './axiosInstance';

// Define specific response/payload types for clarity
export interface SlotRecommendation {
    recommended_slot: { // Changed to match backend key
        slot_id: string; // Ensure this matches the actual slot identifier
        level: string;
        zone: string; // Add zone as per your backend recommend_slot
        status: boolean; // Add status as per your backend recommend_slot
        id?: number; // Flask model usually has an integer ID
    };
    navigation_info: {
        level: string;
        zone: string;
        slot_id: string;
    };
}

// PARK-IQ-CENTRAL-FE/app/api/parkingService.ts

export interface ParkingSlot {
    id: number;
    slot_id: string;
    level: string;
    type?: 'Car' | 'Motorcycle' | 'Both';
    status: 'available' | 'occupied' | 'maintenance'; // 🔥 CHANGE THIS to string literals
    vehiclePlate?: string; // These are not in your current Postman response, but good to keep if they'll be added
    entryTime?: string;   // These are not in your current Postman response, but good to keep if they'll be added
    zone: string;
    created_at?: string;
    updated_at?: string;
}

// ... rest of your parkingService.ts

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

// 🔥 IMPORTANT: This interface must match the backend's /api/slots GET response exactly
export interface GetAllParkingSlotsAdminResponse {
    slots: ParkingSlot[];
    statistics: ParkingStatistics;
}


export const parkingService = {
    // --- PUBLIC ENDPOINTS (Adjust paths if your backend differs from these assumptions) ---

    // The backend `get_available_slots` returns grouped_slots and total_available, not directly ParkingSlot[]
    // This function needs to be updated to parse that or a new specific function for it
    // For now, let's assume a simpler structure if this is for the general user view
    getAvailableParkingSlots: async (): Promise<any> => { // Adjust return type based on exact backend response for /available
        try {
            // Your backend's /available endpoint returns { 'available_slots': grouped_slots, 'total_available': len(slots) }
            // So, ParkingSlot[] is not the direct return type. You'll need to parse this.
            const response = await axiosInstance.get('/slots/available');
            // You might want to return response.data.available_slots or transform it here
            return response.data; // Return the raw data for now, or process it in the component
        } catch (error) {
            console.error('Error fetching available parking slots:', error);
            throw error;
        }
    },

    /**
     * GET Slot Recommendation (Public)
     * Fetches a recommended available slot (e.g., nearest, easiest to access for public users).
     * Endpoint: /api/slots/recommend
     * @returns Promise<SlotRecommendation> Object with recommended slot details.
     */
    getSlotRecommendation: async (): Promise<SlotRecommendation> => {
        try {
            const response = await axiosInstance.get<SlotRecommendation>('/slots/recommend');
            return response.data;
        } catch (error) {
            console.error('Error fetching slot recommendation:', error);
            throw error;
        }
    },

    /**
     * POST Occupy Slot (Public)
     * Marks a slot as occupied as part of the vehicle entry process.
     * Endpoint: /api/slots/occupy
     * @param payload { slot_id } (Backend expects 'slot_id', not 'slotId')
     * @returns Promise<SlotOperationResponse> Confirmation of slot occupation.
     */
    occupyParkingSlot: async (payload: OccupyReleasePayload): Promise<SlotOperationResponse> => {
        try {
            // Ensure payload matches backend (slot_id not slotId)
            const response = await axiosInstance.post<SlotOperationResponse>('/slots/occupy', { slot_id: payload.slot_id });
            return response.data;
        } catch (error) {
            console.error('Error occupying parking slot:', error);
            throw error;
        }
    },

    /**
     * POST Release Slot (Public)
     * Marks a slot as available as part of the vehicle exit process.
     * Endpoint: /api/slots/release
     * @param payload { slot_id } (Backend expects 'slot_id', not 'slotId')
     * @returns Promise<SlotOperationResponse> Confirmation of slot release.
     */
    releaseParkingSlot: async (payload: OccupyReleasePayload): Promise<SlotOperationResponse> => {
        try {
            // Ensure payload matches backend (slot_id not slotId)
            const response = await axiosInstance.post<SlotOperationResponse>('/slots/release', { slot_id: payload.slot_id });
            return response.data;
        } catch (error) {
            console.error('Error releasing parking slot:', error);
            throw error;
        }
    },

    // --- ADMIN ONLY ENDPOINTS (Used in Dashboard, requires admin/operator token) ---

    /**
     * GET Get All Slots (Admin Only)
     * Fetches all parking slots (available, occupied, maintenance) for admin dashboard monitoring.
     * Endpoint: /api/slots
     * @returns Promise<GetAllParkingSlotsAdminResponse> Object with array of all slots and statistics.
     */
    getAllParkingSlotsAdmin: async (): Promise<GetAllParkingSlotsAdminResponse> => {
        try {
            // 🔥 Correctly type the response. The backend returns { slots: [...], statistics: {...} }
            const response = await axiosInstance.get<GetAllParkingSlotsAdminResponse>('/slots/');
            return response.data; // Return the entire data object
        } catch (error) {
            console.error('Error fetching all parking slots for admin:', error);
            throw error;
        }
    },

    /**
     * POST Create Slot (Admin Only)
     * Creates a new parking slot (for admin management).
     * Endpoint: /api/slots
     * @param data Partial ParkingSlot object with details for new slot.
     * @returns Promise<SlotOperationResponse> Confirmation and created slot details.
     */
    createParkingSlotAdmin: async (data: Omit<ParkingSlot, 'id' | 'status' | 'vehiclePlate' | 'entryTime'>): Promise<SlotOperationResponse> => {
    try {
      // The 'data' parameter already contains the required 'slot_id', 'level', 'zone'
      // due to the Omit type, ensuring the correct input format for the backend.
      // The URL '/slots/' resolves to http://localhost:8000/api/slots/ via the Vite proxy.
      const response = await axiosInstance.post<SlotOperationResponse>('/slots/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating parking slot (admin):', error);
      throw error;
    }
  },

    /**
     * PUT Update Slot (Admin Only)
     * Updates an existing parking slot (for admin management).
     * Endpoint: /api/slots/{id}
     * @param slotId ID of the slot to update. Note: Your backend's update endpoint uses the actual numeric ID from the database, not the `slot_id` string.
     * @param data Partial ParkingSlot object with details to update.
     * @returns Promise<SlotOperationResponse> Confirmation and updated slot details.
     */
    updateParkingSlotAdmin: async (slotId: number, data: Partial<ParkingSlot>): Promise<SlotOperationResponse> => { // Changed slotId type to number
        try {
            // Your backend's update route is `/slots/<int:slot_id>` which means it expects the numeric ID from the DB.
            // Ensure you pass the correct `id` from the `ParkingSlot` object, not the `slot_id` string.
            const response = await axiosInstance.put<SlotOperationResponse>(`/slots/${slotId}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating slot ${slotId} (admin):`, error);
            throw error;
        }
    },

    /**
     * DELETE Delete Slot (Admin Only)
     * Deletes a parking slot (for admin management).
     * Endpoint: /api/slots/{id}
     * @param slotId ID of the slot to delete.
     * @returns Promise<void> Confirmation of deletion.
     */
    deleteParkingSlotAdmin: async (slotId: number): Promise<void> => { // Changed slotId type to number
        try {
            // Your backend's delete route is `/slots/<int:slot_id>` which means it expects the numeric ID from the DB.
            // Ensure you pass the correct `id` from the `ParkingSlot` object, not the `slot_id` string.
            await axiosInstance.delete(`/slots/${slotId}`);
        } catch (error) {
            console.error(`Error deleting slot ${slotId} (admin):`, error);
            throw error;
        }
    },

    // NOTE: PaymentRecord and getPaymentHistory are typically handled in paymentService.ts
};