// PARK-IQ-CENTRAL-FE/app/api/userService.ts
import axiosInstance from './axiosInstance'; // <<<--- IMPORT your custom axios instance

// Define types for your User/Auth API responses
export interface UserLoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string; // <<<--- CHANGE 'token' to 'access_token'
  user: {
    id: string;
    username: string;
    role: string; // 'admin', 'operator', 'user'
    email?: string;
    // Add other user details
  };
}
export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  role: string;
  // Add other fields relevant for admin accounts
}

// Add a new type for the GetAdminAccounts response
export interface GetAdminAccountsResponse {
  users: AdminAccount[];
}


export const userService = {
  // Login function is special: it doesn't need the token *yet* when it's called
  // But it uses the axiosInstance, which is good for consistent error handling/base URL
  login: async (credentials: UserLoginCredentials): Promise<AuthResponse> => {
    try {
      // This endpoint should authenticate user and return a token
      const response = await axiosInstance.post<AuthResponse>(`/users/login`, credentials); // <<<--- Use axiosInstance
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post(`/auth/logout`); // <<<--- Use axiosInstance
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  getAdminAccounts: async (): Promise<AdminAccount[]> => {
    try {
      const response = await axiosInstance.get<AdminAccount[]>(`/users/users`); // <<<--- Use axiosInstance
      return response.data;
    } catch (error) {
      console.error('Error fetching admin accounts:', error);
      throw error;
    }
  },

  createAdminAccount: async (adminData: Omit<AdminAccount, 'id'> & { password: string }): Promise<AdminAccount> => {
    try {
      const response = await axiosInstance.post<AdminAccount>(`/users/create_users`, adminData); // <<<--- Use axiosInstance
      return response.data;
    } catch (error) {
      console.error('Error creating admin account:', error);
      throw error;
    }
  },

  updateAdminAccount: async (id: string, adminData: Partial<Omit<AdminAccount, 'id'>>): Promise<AdminAccount> => {
    try {
      const response = await axiosInstance.put<AdminAccount>(`/users/${id}`, adminData); // <<<--- Use axiosInstance
      return response.data;
    } catch (error) {
      console.error(`Error updating admin account ${id}:`, error);
      throw error;
    }
  },

  deleteAdminAccount: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/users/${id}`); // <<<--- Use axiosInstance
    } catch (error) {
      console.error(`Error deleting admin account ${id}:`, error);
      throw error;
    }
  },
};