import api from "../api/api";

export type SongComment = {
  id: string;
  songId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  isLiked: boolean;
  canDelete: boolean;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
};

export const commentService = {
  getSongComments: async (songId: string): Promise<SongComment[]> => {
    return await api.get(`/songs/${songId}/comments`) as unknown as SongComment[];
  },

  createSongComment: async (songId: string, content: string): Promise<SongComment> => {
    return await api.post(`/songs/${songId}/comments`, { content }) as unknown as SongComment;
  },

  toggleSongCommentLike: async (songId: string, commentId: string): Promise<SongComment> => {
    return await api.patch(`/songs/${songId}/comments/${commentId}/like`) as unknown as SongComment;
  },

  deleteSongComment: async (songId: string, commentId: string): Promise<{ success: boolean; deletedCommentId: string }> => {
    return await api.delete(`/songs/${songId}/comments/${commentId}`) as unknown as { success: boolean; deletedCommentId: string };
  },
};
