// src/services/songService.ts
import api from "../api/api";

export const songService = {
  // === CÁC API KHÁM PHÁ ===

  // Lấy các bài hát thịnh hành
  getTrendingSongs: async () => {
    return await api.get("/songs/trending");
  },

  // Lấy các bài hát mới nhất
  getLatestSongs: async () => {
    return await api.get("/songs/latest");
  },

  // Lấy các bài hát khám phá
  getDiscoverySongs: async () => {
    return await api.get("/songs/discovery");
  },

  // === CÁC API CỐT LÕI & QUẢN LÝ ===

  // Tải lên bài hát mới
  // Nhận vào FormData object chứa title, artist, genre, file audio, file cover
  uploadSong: async (formData: FormData) => {
    return await api.post("/songs", formData, { timeout: 60000 });
  },

  // Lấy danh sách bài hát của tôi (để hiển thị status pending/approved)
  getMySongs: async () => {
    return await api.get("/users/my-songs");
  },

  // === CÁC API PLAYER ===

  // Lấy chi tiết bài hát (metadata)
  getSongById: async (id: string) => {
    return await api.get(`/songs/${id}`);
  },

  // Tăng lượt nghe
  incrementPlayCount: async (id: string) => {
    return await api.post(`/songs/${id}/play-count`);
  },

  // Lấy đường dẫn Streaming
  getStreamUrl: (id: string) => {
    // Không dùng axios, trả về URL trực tiếp cho <audio src={...}>
    const BACKEND_URL =
      import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
    return `${BACKEND_URL}/api/v1/songs/${id}/stream`;
  },
  // Lấy danh sách bài hát công khai của một user bất kỳ
  getSongsByUserId: async (userId: string) => {
    return await api.get(`/songs/user/${userId}`);
  },
};
