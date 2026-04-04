// src/services/followService.ts
import api from '../api/api';

const BASE_URL = '/follow';

export const followService = {
  // Bấm follow
  followUser: async (userId: string) => {
    return await api.post(`${BASE_URL}/${userId}`);
  },

  // Hủy follow
  unfollowUser: async (userId: string) => {
    return await api.delete(`${BASE_URL}/${userId}`);
  },

  // Lấy danh sách người đang theo dõi mình
  getFollowers: async (userId: string, page = 1, limit = 20) => {
    const res: any = await api.get(`${BASE_URL}/${userId}/followers?page=${page}&limit=${limit}`);
    return res; // Trả về { count, page, followers } theo thiết kế của Backend
  },

  // Lấy danh sách người mình đang theo dõi
  getFollowing: async (userId: string, page = 1, limit = 20) => {
    const res: any = await api.get(`${BASE_URL}/${userId}/following?page=${page}&limit=${limit}`);
    return res;
  },

  // Kiểm tra xem mình đã follow user này chưa
  getFollowStatus: async (userId: string) => {
    const res: any = await api.get(`${BASE_URL}/${userId}/status`);
    return res; // Trả về { isFollowing: true/false }
  }
};