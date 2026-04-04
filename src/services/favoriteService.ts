import api from "../api/api";

export const favoriteService = {
    getMyLikedSongs: async () => {
        return await api.get('/favorites/my-liked');
    },

    likeSong: async (songId: string) => {
        return await api.post(`/favorites/${songId}`);
    },

    unlikeSong: async (songId: string) => {
        return await api.delete(`/favorites/${songId}`);
    }
};