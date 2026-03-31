import api from "../api/api";

export type FollowListUser = {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
};

export type FollowersResponse = {
  count: number;
  page: number;
  totalPages: number;
  followers: FollowListUser[];
};

export type FollowingResponse = {
  count: number;
  page: number;
  totalPages: number;
  following: FollowListUser[];
};

export const followService = {
  getFollowers: (userId: string, page = 1, limit = 100) =>
    api.get(`/follow/${userId}/followers`, { page, limit }) as Promise<FollowersResponse>,

  getFollowing: (userId: string, page = 1, limit = 100) =>
    api.get(`/follow/${userId}/following`, { page, limit }) as Promise<FollowingResponse>,
};
