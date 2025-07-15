// PARK-IQ-CENTRAL-FE/app/api/paymentService.ts
import axiosInstance from './axiosInstance'; // <<<--- IMPORT your custom axios instance

// Define types based on your actual Payment API responses
export interface PaymentRequest {
  vehiclePlate: string;
  amount: number;
  // Add any other details needed for initiating payment (e.g., duration, entryTime)
}

export interface PaymentResponse {
  transactionId: string;
  qrCodeData: string; // The data string to generate QRIS QR code
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  // Add more payment gateway specific fields as needed
}

export interface PaymentHistoryRecord {
  id: string;
  transactionId: string;
  vehiclePlate: string;
  paymentMethod: string; // e.g., 'QRIS', 'Credit Card'
  amount: number;
  timestamp: string; // ISO string
  status: 'Completed' | 'Refunded' | 'Pending';
  // Add other relevant fields
}

export const paymentService = {
  initiatePayment: async (data: PaymentRequest): Promise<PaymentResponse> => {
    try {
      const response = await axiosInstance.post<PaymentResponse>(`/payments/initiate`, data); // <<<--- Use axiosInstance
      return response.data;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  },

  checkPaymentStatus: async (transactionId: string): Promise<PaymentResponse> => {
    try {
      const response = await axiosInstance.get<PaymentResponse>(`/payments/${transactionId}/status`); // <<<--- Use axiosInstance
      return response.data;
    } catch (error) {
      console.error(`Error checking payment status for ${transactionId}:`, error);
      throw error;
    }
  },

  getPaymentHistory: async (): Promise<PaymentHistoryRecord[]> => {
    try {
      const response = await axiosInstance.get<PaymentHistoryRecord[]>(`/payments`); // <<<--- Use axiosInstance
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },
};