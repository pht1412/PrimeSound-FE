// src/context/FavoritesContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService';
<<<<<<< HEAD
import { useAuth } from './AuthContext';
=======
import { AUTH_CHANGED_EVENT } from '../utils/authEvents';
>>>>>>> origin/feature/khogabamia

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
  const { isAuthenticated } = useAuth(); // ✅ Check xem user có đăng nhập không

  const initializeLikedSongs = useCallback(async () => {
    // ✅ Chỉ gọi API nếu user đã đăng nhập
    if (!isAuthenticated) {
      console.log('⏭️  FavoritesContext: Skipping initializeLikedSongs (not authenticated)');
      return;
    }

    try {
      console.log('🔄 FavoritesContext: initializeLikedSongs() called');
      setIsLoading(true);
      const res: any = await favoriteService.getMyLikedSongs();
      
      // SỬA LỖI GỐC: Trích xuất mảng thông minh từ nhiều định dạng API
      const songsArray = Array.isArray(res) ? res : (res?.data || res?.favorites || res?.songs || []);
      
      const likedIds = new Set<string>(
        songsArray.map((song: any) => song.song?._id || song._id || song.id)
      );
      
      setLikedSongIds(likedIds);
      console.log('✅ FavoritesContext: Liked songs loaded:', likedIds.size);
    } catch (error) {
      console.error('❌ FavoritesContext: Lỗi khi load danh sách bài hát yêu thích:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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
<<<<<<< HEAD
    // ✅ Gọi initializeLikedSongs khi user vừa đăng nhập
    if (isAuthenticated) {
      console.log('📝 FavoritesContext: useEffect - isAuthenticated changed to true, initializing...');
      initializeLikedSongs();
    } else {
      // ✅ Clear liked songs khi user đăng xuất
      console.log('📝 FavoritesContext: useEffect - isAuthenticated changed to false, clearing...');
      setLikedSongIds(new Set());
    }
  }, [isAuthenticated, initializeLikedSongs]);
=======
    const syncFromToken = () => {
      const token = localStorage.getItem('accessToken');
      if (token) void initializeLikedSongs();
      else {
        setLikedSongIds(new Set());
        setIsLoading(false);
      }
    };
    syncFromToken();
    window.addEventListener(AUTH_CHANGED_EVENT, syncFromToken);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, syncFromToken);
  }, [initializeLikedSongs]);
>>>>>>> origin/feature/khogabamia

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