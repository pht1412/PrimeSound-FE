import api from '../api/api';

export const notificationService = {
  // Thêm tham số userId vào đây
  getNotifications: async (userId: string, page = 1, limit = 20) => {
    return await api.get(`/notifications?userId=${userId}&page=${page}&limit=${limit}`);
  },

  markAsRead: async (id: string) => {
    return await api.patch(`/notifications/${id}/read`);
  }
};