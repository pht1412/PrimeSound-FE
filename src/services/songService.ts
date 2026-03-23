// src/services/songService.ts
import api from '../api/api';

export const songService = {
  // Lấy các bài hát thịnh hành
  getTrendingSongs: async () => {
    return await api.get('/songs/trending');
  },

  // Lấy các bài hát mới nhất
  getLatestSongs: async () => {
    return await api.get('/songs/latest');
  },

  // Lấy các bài hát khám phá
  getDiscoverySongs: async () => {
    return await api.get('/songs/discovery');
  },

  // Lấy tất cả bài hát (có phân trang)
  getAllSongs: async (page = 1, limit = 20) => {
    return await api.get('/songs', { page, limit });
  },
  // Gọi API tăng lượt nghe
  incrementPlayCount: async (id: string) => {
    return await api.post(`/songs/${id}/play-count`);
  }
};