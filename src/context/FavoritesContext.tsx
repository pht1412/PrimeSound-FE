// src/context/FavoritesContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService';

interface FavoritesContextType {
  likedSongIds: Set<string>;
  isLoading: boolean;
  toggleLike: (songId: string) => Promise<void>;
  isLiked: (songId: string) => boolean;
  initializeLikedSongs: () => Promise<void>;
  getLikedCount: () => number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const initializeLikedSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res: any = await favoriteService.getMyLikedSongs();
      
      // SỬA LỖI GỐC: Trích xuất mảng thông minh từ nhiều định dạng API
      const songsArray = Array.isArray(res) ? res : (res?.data || res?.favorites || res?.songs || []);
      
      const likedIds = new Set<string>(
        songsArray.map((song: any) => song.song?._id || song._id || song.id)
      );
      
      setLikedSongIds(likedIds);
    } catch (error) {
      console.error('❌ Lỗi khi load danh sách bài hát yêu thích:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleLike = useCallback(async (songId: string) => {
    const currentlyLiked = likedSongIds.has(songId);
    const newLikedState = !currentlyLiked;

    setLikedSongIds((prev) => {
      const newSet = new Set(prev);
      if (newLikedState) newSet.add(songId);
      else newSet.delete(songId);
      return newSet;
    });

    try {
      if (newLikedState) await favoriteService.likeSong(songId);
      else await favoriteService.unlikeSong(songId);
    } catch (error) {
      // Phục hồi UI nếu API thất bại (Rollback)
      setLikedSongIds((prev) => {
        const newSet = new Set(prev);
        if (currentlyLiked) newSet.add(songId);
        else newSet.delete(songId);
        return newSet;
      });
      throw error; 
    }
  }, [likedSongIds]);

  const isLiked = useCallback((songId: string): boolean => {
    return likedSongIds.has(songId);
  }, [likedSongIds]);

  const getLikedCount = useCallback((): number => {
    return likedSongIds.size;
  }, [likedSongIds]);

  useEffect(() => {
    initializeLikedSongs();
  }, [initializeLikedSongs]);

  return (
    <FavoritesContext.Provider value={{ likedSongIds, isLoading, toggleLike, isLiked, initializeLikedSongs, getLikedCount }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites phải nằm trong FavoritesProvider');
  return context;
};