// PARK-IQ-CENTRAL-FE/app/api/parkingService.ts
import axiosInstance from './axiosInstance';

// Define specific response/payload types for clarity
export interface SlotRecommendation {
    recommended_slot: {
        slot_id: string;
        level: string;
        zone: 'A' | 'B' | 'C';
        status: 'available' | 'occupied' | 'maintenance';
        id: number;
    };
    navigation_info: {
        level: string;
        zone: 'A' | 'B' | 'C';
        slot_id: string;
    };
}

export interface ParkingSlot {
    id: number;
    slot_id: string;
    level: string;
    status: 'available' | 'occupied' | 'maintenance';
    vehiclePlate?: string;
    entryTime?: string;
    zone: 'A' | 'B' | 'C';
    created_at?: string;
    updated_at?: string;
}

export interface OccupyReleasePayload {
    slot_id: string;
    vehiclePlate?: string;
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
    // --- PUBLIC ENDPOINTS ---

    getAvailableParkingSlots: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/slots/available');
            return response.data;
        } catch (error) {
            console.error('Error fetching available parking slots:', error);
            throw error;
        }
    },

    /**
     * POST Slot Recommendation (Public) - Now accepts vehicle details in body
     * Fetches a recommended available slot based on vehicle type.
     * Endpoint: /api/slots/recommend
     * @param vehicleType The type of vehicle ('Bike', 'Car', 'Heavy')
     * @param vehiclePlate The license plate of the vehicle
     * @returns Promise<SlotRecommendation> Object with recommended slot details.
     */
    getSlotRecommendation: async (vehicleType: 'Bike' | 'Car' | 'Heavy', vehiclePlate: string): Promise<SlotRecommendation> => {
        try {
            const payload = {
                vehicleType: vehicleType,
                vehiclePlate: vehiclePlate,
            };
            // 🔥 Changed to POST request
            const response = await axiosInstance.post<SlotRecommendation>('/slots/recommend', payload);
            return response.data;
        } catch (error) {
            console.error('Error fetching slot recommendation:', error);
            throw error;
        }
    },

    /**
     * POST Occupy Slot (Public)
     * Marks a slot as occupied when vehicle enters.
     * Endpoint: /api/slots/occupy
     * @param payload { slot_id, vehiclePlate, entryTime }
     * @returns Promise<SlotOperationResponse> Confirmation of slot occupation.
     */
    occupyParkingSlot: async (payload: OccupyReleasePayload): Promise<SlotOperationResponse> => {
        try {
            const response = await axiosInstance.post<SlotOperationResponse>('/slots/occupy', {
                slot_id: payload.slot_id,
                vehiclePlate: payload.vehiclePlate,
                entryTime: payload.entryTime
            });
            return response.data;
        } catch (error) {
            console.error('Error occupying parking slot:', error);
            throw error;
        }
    },

    /**
     * POST Release Slot (Public)
     * Marks a slot as available when vehicle exits.
     * Endpoint: /api/slots/release
     * @param payload { slot_id }
     * @returns Promise<SlotOperationResponse> Confirmation of slot release.
     */
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

    createParkingSlotAdmin: async (data: Omit<ParkingSlot, 'id' | 'status' | 'vehiclePlate' | 'entryTime' | 'created_at' | 'updated_at'>): Promise<SlotOperationResponse> => {
      try {
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
