// src/context/HistoryContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { historyService } from '../services/historyService';
import { toast } from 'react-toastify';

export interface HistorySong {
  id: string;
  title: string;
  artist: string;
  artistAvatar?: string;
  cover: string;
  audioUrl: string;
  duration?: number;
  playedAt: number; // timestamp khi được thêm vào lịch sử
}

interface HistoryContextType {
  history: HistorySong[];
  isLoading: boolean;
  error: string | null;
  addToHistory: (song: HistorySong) => Promise<void>;
  clearHistory: () => Promise<void>;
  removeFromHistory: (songId: string) => void; // Chỉ xóa local, BE không có API xóa 1 bài
  fetchHistory: () => Promise<void>;
  isInHistory: (songId: string) => boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [history, setHistory] = useState<HistorySong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tải lịch sử từ BE khi khởi động (nếu đã đăng nhập)
  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await historyService.getMyHistory();
      
      // Kiểm tra data có phải array không, nếu không thì trả về mảng rỗng
      if (!Array.isArray(data)) {
        console.warn('Dữ liệu lịch sử không đúng định dạng:', data);
        setHistory([]);
        return;
      }
      
      // Transform dữ liệu từ BE sang định dạng frontend
      const transformed = data.map((item: any) => {
        // Xử lý cover URL
        let coverUrl = "https://placehold.co/240x240/1f1f1f/white?text=No+Cover";
        if (item.coverImage) {
          if (item.coverImage.startsWith('http')) {
            coverUrl = item.coverImage;
          } else {
            const filename = item.coverImage.replace(/^.*[\\\/]/, '');
            coverUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${filename}`;
          }
        }
        
        // Xử lý audio URL
        const audioUrl = item._id 
          ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/songs/${item._id}/stream`
          : '';

        return {
          id: item._id || '',
          title: item.title || 'Unknown Title',
          artist: item.artist?.name || item.artist?.stageName || 'Unknown Artist',
          artistAvatar: item.artist?.avatarUrl,
          cover: coverUrl,
          audioUrl: audioUrl,
          duration: item.duration || 0,
          playedAt: item.listenedAt ? new Date(item.listenedAt).getTime() : Date.now()
        };
      });
      
      setHistory(transformed);
    } catch (err: any) {
      console.error('Lỗi khi tải lịch sử:', err);
      setError('Không thể tải lịch sử nghe nhạc');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tải lịch sử khi component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      void fetchHistory();
    } else {
      setIsLoading(false);
    }
  }, [fetchHistory]);

  // Thêm bài hát vào lịch sử (gọi API + update local state)
  const addToHistory = useCallback(async (song: HistorySong) => {
    try {
      // Gọi API để lưu vào DB
      await historyService.addToHistory(song.id);
      
      // Update local state (đưa lên đầu)
      setHistory(prev => {
        // Loại bỏ bài trùng lặp nếu có
        const filtered = prev.filter(item => item.id !== song.id);
        return [
          { ...song, playedAt: Date.now() },
          ...filtered
        ];
      });
    } catch (err) {
      console.error('Lỗi khi thêm vào lịch sử:', err);
      // Vẫn update local state dù API lỗi
      setHistory(prev => {
        const filtered = prev.filter(item => item.id !== song.id);
        return [
          { ...song, playedAt: Date.now() },
          ...filtered
        ];
      });
    }
  }, []);

  // Xóa toàn bộ lịch sử (gọi API + clear local)
  const clearHistory = useCallback(async () => {
    try {
      await historyService.clearMyHistory();
      setHistory([]);
      toast.success('Đã xóa sạch lịch sử nghe nhạc');
    } catch (err) {
      console.error('Lỗi khi xóa lịch sử:', err);
      toast.error('Có lỗi xảy ra khi xóa lịch sử');
      throw err;
    }
  }, []);

  // Xóa 1 bài khỏi local state (BE không có API xóa 1 bài)
  const removeFromHistory = useCallback((songId: string) => {
    setHistory(prev => prev.filter(item => item.id !== songId));
    toast.success('Đã xóa bài hát khỏi lịch sử');
  }, []);

  const isInHistory = useCallback((songId: string) => {
    return history.some(item => item.id === songId);
  }, [history]);

  return (
    <HistoryContext.Provider value={{ 
      history, 
      isLoading, 
      error,
      addToHistory, 
      clearHistory, 
      removeFromHistory, 
      fetchHistory,
      isInHistory 
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

// Hook tiện ích để các component khác sử dụng
export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) throw new Error("useHistory phải nằm trong HistoryProvider");
  return context;
};
