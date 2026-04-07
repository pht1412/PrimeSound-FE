// src/services/historyService.ts
import api from '../api/api';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const historyService = {
  // Thêm bài hát vào lịch sử (gọi khi ấn play)
  addToHistory: async (songId: string) => {
    try {
      const response = await api.post(`/history/${songId}`);
      return response;
    } catch (error: any) {
      console.error('Lỗi khi thêm vào lịch sử:', error);
      throw error;
    }
  },

  // Lấy danh sách lịch sử nghe (20 bài gần nhất)
  getMyHistory: async () => {
    try {
      const response = await api.get('/history');
      // Đảm bảo luôn trả về array
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      console.error('Lỗi khi lấy lịch sử:', error);
      throw error;
    }
  },

  // Xóa toàn bộ lịch sử nghe
  clearMyHistory: async () => {
    try {
      const response = await api.delete('/history');
      return response;
    } catch (error: any) {
      console.error('Lỗi khi xóa lịch sử:', error);
      throw error;
    }
  },
};

// Helper function để lấy URL hình ảnh
export const getImageUrl = (url: string | undefined | null) => {
  if (!url) return "https://placehold.co/240x240/1f1f1f/white?text=No+Cover";
  if (url.startsWith('http')) return url;
  const filename = url.replace(/^.*[\\\/]/, '');
  return `${BACKEND_URL}/uploads/${filename}`;
};
