// src/context/PlaylistContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { playlistService } from '../services/playlistService';
import { toast } from 'react-toastify';

export interface PlaylistSummary {
  _id: string;
  name: string;
  description?: string;
  songCount: number;
  firstSongCover?: string;
}

interface PlaylistContextType {
  playlists: PlaylistSummary[];
  isLoading: boolean;
  fetchPlaylists: () => Promise<void>;
  createNewPlaylist: (name: string, description?: string) => Promise<boolean>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider = ({ children }: { children: React.ReactNode }) => {
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hàm tải danh sách Playlist từ API
  const fetchPlaylists = async () => {
    try {
      setIsLoading(true);
      // Lấy 50 playlist để cover phần lớn nhu cầu của user thông thường
      const response: any = await playlistService.getUserPlaylists(1, 50);
      if (response.success) {
        setPlaylists(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách Playlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động tải Playlist khi người dùng vào app
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchPlaylists();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Hàm tạo Playlist mới và tự động cập nhật danh sách
  const createNewPlaylist = async (name: string, description?: string) => {
    try {
      const response: any = await playlistService.createPlaylist(name, description);
      if (response.success) {
        toast.success("Tạo Playlist thành công!");
        // Chèn Playlist mới vào đầu danh sách (Optimistic UI)
        const newPl = response.data;
        setPlaylists(prev => [{ _id: newPl._id, name: newPl.name, description: newPl.description, songCount: 0 }, ...prev]);
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo Playlist!");
      return false;
    }
  };

  return (
    <PlaylistContext.Provider value={{ playlists, isLoading, fetchPlaylists, createNewPlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
};

// Hook tiện ích để các component khác sử dụng
export const usePlaylists = () => {
  const context = useContext(PlaylistContext);
  if (!context) throw new Error("usePlaylists phải nằm trong PlaylistProvider");
  return context;
};