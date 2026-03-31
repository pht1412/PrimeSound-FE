// src/services/playlistService.ts
import api from '../api/api';

const BASE_URL = '/playlists';

export const playlistService = {
  // 1. Tạo Playlist mới
  createPlaylist: async (name: string, description?: string) => {
    return await api.post(BASE_URL, { name, description });
  },

  // 2. Lấy danh sách Playlist của User (dùng cho Sidebar và Trang tổng)
  getUserPlaylists: async (page = 1, limit = 20) => {
    return await api.get(`${BASE_URL}?page=${page}&limit=${limit}`);
  },

  // 3. Lấy chi tiết 1 Playlist (bao gồm cả mảng bài hát)
  getPlaylistById: async (id: string) => {
    return await api.get(`${BASE_URL}/${id}`);
  },

  // 4. Sửa tên/mô tả Playlist
  updatePlaylist: async (id: string, data: { name?: string; description?: string }) => {
    return await api.patch(`${BASE_URL}/${id}`, data);
  },

  // 5. Xóa mềm Playlist
  deletePlaylist: async (id: string) => {
    return await api.delete(`${BASE_URL}/${id}`);
  },

  // 6. Thêm bài hát vào Playlist
  addSongToPlaylist: async (playlistId: string, songId: string) => {
    return await api.post(`${BASE_URL}/${playlistId}/songs`, { songId });
  },

  // 7. Xóa bài hát khỏi Playlist
  removeSongFromPlaylist: async (playlistId: string, songId: string) => {
    return await api.delete(`${BASE_URL}/${playlistId}/songs/${songId}`);
  },

  // 8. Đổi vị trí bài hát (Kéo thả)
  reorderSongs: async (playlistId: string, songId: string, newIndex: number) => {
    return await api.patch(`${BASE_URL}/${playlistId}/songs/reorder`, { songId, newIndex });
  }
};
