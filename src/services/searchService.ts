// src/services/searchService.ts
import api from '../api/api';

export const searchService = {
  // Hàm gọi API tìm kiếm tổng hợp (nhận vào từ khóa, trang, số lượng)
  searchAll: async (keyword: string, page = 1, limit = 20) => {
    // Gọi đến GET /api/v1/search?q=keyword
    return await api.get(`/search?q=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`);
  }
};