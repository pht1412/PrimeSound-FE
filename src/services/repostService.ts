import api from '../api/api';

const BASE_URL = '/reposts'; 

export const repostService = {
  /**
   * Lấy danh sách repost của một user
   * @param userId ID của người dùng
   */
  getUserReposts: async (userId: string) => {
    return await api.get(`${BASE_URL}/user/${userId}`);
  },

  /**
   * Đăng lại (Repost) một bài hát hoặc danh sách phát
   * @param data Payload chứa itemId và itemType ('Song' hoặc 'Playlist')
   */
  createRepost: async (data: { itemId: string; itemType: 'Song' | 'Playlist' }) => {
    // Controller của bạn yêu cầu itemId và itemType.
    return await api.post(BASE_URL, data);
  },

  /**
   * Hủy đăng lại (Un-repost)
   * @param itemId ID của bài hát hoặc danh sách phát cần hủy repost
   */
  deleteRepost: async (itemId: string) => {
    return await api.delete(`${BASE_URL}/${itemId}`);
  }
};