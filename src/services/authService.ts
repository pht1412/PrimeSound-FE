// src/api/authService.ts
import api from '../api/api'; // Import instance Axios đã được cấu hình sẵn từ api.ts

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  number?: string;
};

type LoginResponse = {
  token: string;
};

export const authService = {
  // Đăng ký tài khoản mới
  register: async (userData: RegisterPayload) => {
    return await api.post('/auth/register', userData);
  },

  // Đăng nhập
  login: async (credentials: LoginPayload): Promise<LoginResponse> => {
    return await api.post('/auth/login', credentials) as unknown as LoginResponse;
  }
};
