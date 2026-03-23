// src/api/authService.ts
import api from '../api/api'; // Import instance Axios đã được cấu hình sẵn từ api.ts

export const authService = {
  // Đăng ký tài khoản mới
  register: async (userData: object) => {
    return await api.post('/auth/register', userData);
  },

  // Đăng nhập
  login: async (credentials: object) => {
    return await api.post('/auth/login', credentials);
  }
};