// src/services/userService.ts
import api from '../api/api';

export const userService = {
  // Lấy thông tin User đang đăng nhập
  getMe: async () => {
    return await api.get('/users/me');
  },

  // Cập nhật thông tin (Dùng FormData vì có upload file Avatar)
  updateProfile: async (formData: FormData) => {
    // Axios sẽ tự động cấu hình header 'multipart/form-data' khi nhận diện được FormData
    return await api.patch('/users/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Đổi mật khẩu
  changePassword: async (data: any) => {
    return await api.patch('/users/me/password', data);
  }
};