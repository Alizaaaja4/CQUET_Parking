// PARK-IQ-CENTRAL-FE/app/api/parkingService.ts
import axiosInstance from './axiosInstance';

// Define specific response/payload types for clarity
export interface SlotRecommendation {
  recommendedSlotId: string;
  level: string; // Changed from number to string to match backend L1, L2, etc.
  type: string;
}

export interface ParkingSlot {
  id: number; // Backend provides numeric ID
  slot_id: string; // This is the actual slot identifier like 'L1A01'
  level: string; // Backend provides level as string (e.g., "L1")
  type?: 'Car' | 'Motorcycle' | 'Both'; // Made optional as it might not always be present
  status: 'available' | 'occupied' | 'maintenance';
  vehiclePlate?: string; // Optional (for occupied)
  entryTime?: string; // Optional (for occupied)
  zone?: string; // New field from backend
  created_at?: string; // New field from backend
  updated_at?: string; // New field from backend
}

export interface OccupyReleasePayload {
  slotId: string;
  vehiclePlate: string;
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

  getAvailableParkingSlots: async (): Promise<ParkingSlot[]> => {
    try {
      const response = await axiosInstance.get<ParkingSlot[]>('/slots/available'); // Assumed endpoint
      return response.data;
    } catch (error) {
      console.error('Error fetching available parking slots:', error);
      throw error;
    }
  },

  /**
   * GET Slot Recommendation (Public)
   * Fetches a recommended available slot (e.g., nearest, easiest to access for public users).
   * Endpoint: /api/slots/recommendation
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
   * @param payload { slotId, vehiclePlate, entryTime }
   * @returns Promise<SlotOperationResponse> Confirmation of slot occupation.
   */
  occupyParkingSlot: async (payload: OccupyReleasePayload): Promise<SlotOperationResponse> => {
    try {
      const response = await axiosInstance.post<SlotOperationResponse>('/slots/occupy', payload);
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
   * @param payload { slotId, vehiclePlate, exitTime }
   * @returns Promise<SlotOperationResponse> Confirmation of slot release.
   */
  releaseParkingSlot: async (payload: OccupyReleasePayload): Promise<SlotOperationResponse> => {
    try {
      const response = await axiosInstance.post<SlotOperationResponse>('/slots/release', payload);
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
   * @returns Promise<ParkingSlot[]> Array of all slots.
   */
  getAllParkingSlotsAdmin: async (): Promise<ParkingSlot[]> => { // Renamed from getParkingSlots
    try {
      const response = await axiosInstance.get<ParkingSlot[]>('/slots');
      return response.data;
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
      const response = await axiosInstance.post<SlotOperationResponse>('/slots', data);
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
   * @param slotId ID of the slot to update.
   * @param data Partial ParkingSlot object with details to update.
   * @returns Promise<SlotOperationResponse> Confirmation and updated slot details.
   */
  updateParkingSlotAdmin: async (slotId: string, data: Partial<ParkingSlot>): Promise<SlotOperationResponse> => {
    try {
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
  deleteParkingSlotAdmin: async (slotId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/slots/${slotId}`);
    } catch (error) {
      console.error(`Error deleting slot ${slotId} (admin):`, error);
      throw error;
    }
  },

  // NOTE: PaymentRecord and getPaymentHistory are typically handled in paymentService.ts
};