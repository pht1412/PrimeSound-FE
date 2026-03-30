import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService';

interface FavoritesContextType {
  // State: Track bài hát đã like (dùng Set cho O(1) lookup)
  likedSongIds: Set<string>;
  isLoading: boolean;
  
  // Methods: Like/Unlike một bài hát
  toggleLike: (songId: string) => Promise<void>;
  isLiked: (songId: string) => boolean;
  
  // Methods: Initialize & sync
  initializeLikedSongs: () => Promise<void>;
  getLikedCount: () => number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  // 1. STATE: Lưu trữ tập hợp những bài hát đã like
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // 2. INITIALIZE: Lấy danh sách bài hát đã like từ server khi app khởi động
  const initializeLikedSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const favoriteSongs = await favoriteService.getMyLikedSongs();
      
      // Chuyển array thành Set để lookup nhanh O(1)
      const likedIds = new Set<string>(
        (Array.isArray(favoriteSongs) ? favoriteSongs : [])
          .map((song: any) => song._id)
      );
      
      setLikedSongIds(likedIds);
      console.log(`✅ Initialized ${likedIds.size} liked songs`);
    } catch (error) {
      console.error('❌ Lỗi khi load danh sách bài hát yêu thích:', error);
      // Không throw - cho phép app vẫn chạy nếu API fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. TOGGLE LIKE: Like hoặc Unlike một bài hát
  const toggleLike = useCallback(async (songId: string) => {
    // Check trạng thái hiện tại
    const currentlyLiked = likedSongIds.has(songId);
    const newLikedState = !currentlyLiked;

    // OPTIMISTIC UPDATE: Cập nhật UI ngay lập tức
    setLikedSongIds((prev) => {
      const newSet = new Set(prev);
      if (newLikedState) {
        newSet.add(songId);
      } else {
        newSet.delete(songId);
      }
      return newSet;
    });

    // SYNC WITH SERVER: Gọi API bên dưới
    try {
      if (newLikedState) {
        await favoriteService.likeSong(songId);
        console.log(`❤️ Liked song: ${songId}`);
      } else {
        await favoriteService.unlikeSong(songId);
        console.log(`💔 Unliked song: ${songId}`);
      }
    } catch (error) {
      console.error(`❌ Lỗi khi ${newLikedState ? 'like' : 'unlike'} bài hát:`, error);
      
      // ROLLBACK: Revert UI nếu API fail
      setLikedSongIds((prev) => {
        const newSet = new Set(prev);
        if (currentlyLiked) {
          newSet.add(songId);
        } else {
          newSet.delete(songId);
        }
        return newSet;
      });
      
      throw error; // Re-throw để component có thể handle
    }
  }, [likedSongIds]);

  // 4. IS_LIKED: Check xem bài hát có được like hay không
  const isLiked = useCallback((songId: string): boolean => {
    return likedSongIds.has(songId);
  }, [likedSongIds]);

  // 5. GET_LIKED_COUNT: Lấy tổng số bài hát đã like
  const getLikedCount = useCallback((): number => {
    return likedSongIds.size;
  }, [likedSongIds]);

  // 6. INITIALIZE on mount
  useEffect(() => {
    initializeLikedSongs();
  }, [initializeLikedSongs]);

  const value: FavoritesContextType = {
    likedSongIds,
    isLoading,
    toggleLike,
    isLiked,
    initializeLikedSongs,
    getLikedCount
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook: Sử dụng context
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites phải nằm trong FavoritesProvider');
  }
  return context;
};
