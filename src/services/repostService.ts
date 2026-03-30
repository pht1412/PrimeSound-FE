import api from "../api/api";

export type SongRepost = {
  id: string;
  songId: string;
  note: string;
  createdAt: string;
  canDelete: boolean;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
};

export type SongRepostListResponse = {
  items: SongRepost[];
  total: number;
  hasReposted: boolean;
};

export const repostService = {
  getSongReposts: async (songId: string) => {
    return await api.get(`/songs/${songId}/reposts`) as unknown as SongRepostListResponse;
  },

  createSongRepost: async (songId: string, note: string) => {
    return await api.post(`/songs/${songId}/reposts`, { note }) as unknown as SongRepost;
  },

  deleteSongRepost: async (songId: string, repostId: string) => {
    return await api.delete(`/songs/${songId}/reposts/${repostId}`) as unknown as { success: boolean; deletedRepostId: string };
  },
};
