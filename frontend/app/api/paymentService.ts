// PARK-IQ-CENTRAL-FE/app/api/paymentService.ts
import axiosInstance from './axiosInstance';

/**
 * Interface for a single payment record, aligning with common backend structures.
 * Adjust types (e.g., string vs. Date for times, number vs. string for amount)
 * if your backend's actual JSON response differs.
 */
export interface PaymentRecord {
  id: number; // Assuming numeric ID from database
  vehiclePlate: string;
  entryTime: string; // ISO 8601 string (e.g., "2025-07-10T10:00:00Z")
  exitTime: string;  // ISO 8601 string
  duration: string; // e.g., "2h 30m" - this might be calculated on backend or frontend
  amount: number;   // Numeric amount
  status: 'Completed' | 'Refunded' | 'Pending'; // String literals for status
  // Add any other fields your backend might return for a payment record
  slotId?: string; // Optional: Link to the slot
  userId?: string; // Optional: Link to the user
}

/**
 * Interface for the response when fetching payment history.
 * Assumes the backend returns an array of PaymentRecord directly.
 * If your backend returns an object with 'records' and 'statistics', adjust this.
 */
export interface GetPaymentHistoryResponse {
  payments: PaymentRecord[];
  // You might also include total revenue or other stats from the backend here if available
  totalRevenue?: number;
  totalTransactions?: number;
}

export const paymentService = {
  /**
   * Fetches the payment history from the backend.
   * Assumes the endpoint is /api/payments/history
   * @returns Promise<GetPaymentHistoryResponse> An object containing payment records.
   */
  getPaymentHistory: async (): Promise<GetPaymentHistoryResponse> => {
    try {
      // Assuming your Flask backend has an endpoint like /api/payments/history
      // If your backend endpoint is different, adjust the URL here.
      const response = await axiosInstance.get<GetPaymentHistoryResponse>('/payments/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  // You can add more payment-related API calls here (e.g., getPaymentDetails, processPayment, refundPayment)
};
