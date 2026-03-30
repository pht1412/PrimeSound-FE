// src/components/modals/AddToPlaylistModal.tsx
import React, { useState } from 'react';
import { X, Music, Loader2, Plus } from 'lucide-react';
import { usePlaylists } from '../../context/PlaylistContext';
import { playlistService } from '../../services/playlistService';
import { toast } from 'react-toastify';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  songId: string | null;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ isOpen, onClose, songId }) => {
  const { playlists, fetchPlaylists } = usePlaylists();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen || !songId) return null;

  const handleAdd = async (playlistId: string) => {
    try {
      setLoadingId(playlistId);
      // Gọi API thêm bài hát vào Playlist
      await playlistService.addSongToPlaylist(playlistId, songId);
      toast.success('Đã thêm bài hát vào Playlist!');
      
      // Gọi Context tải lại dữ liệu để cập nhật số lượng bài hát (songCount) trên UI
      fetchPlaylists(); 
      
      onClose(); // Đóng Modal thành công
    } catch (error: any) {
      // Bắt lỗi nếu bài hát đã có sẵn trong Playlist (HTTP 400 từ Back-end)
      const errorMessage = error.response?.data?.message || 'Không thể thêm bài hát này!';
      toast.error(errorMessage);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#282828] w-full max-w-md rounded-xl p-6 shadow-2xl relative">
        
        {/* Nút Đóng */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a7a7a7] hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Add to playlist</h2>

        {/* Danh sách Playlist */}
        <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
          {playlists.length === 0 ? (
            <div className="text-center py-8 text-[#a7a7a7]">
              <Music className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Bạn chưa có Playlist nào.</p>
            </div>
          ) : (
            playlists.map((pl) => (
              <div 
                key={pl._id}
                onClick={() => handleAdd(pl._id)}
                className="flex items-center justify-between p-3 bg-[#3e3e3e]/50 hover:bg-[#3e3e3e] rounded-md cursor-pointer transition group"
              >
                <div className="flex items-center gap-4 truncate">
                  <div className="w-12 h-12 bg-[#1ed760]/20 flex items-center justify-center rounded">
                    <Music className="w-6 h-6 text-[#1ed760]" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-white text-base truncate">{pl.name}</span>
                    <span className="text-sm text-[#a7a7a7]">{pl.songCount} songs</span>
                  </div>
                </div>

                <div className="pr-2">
                  {loadingId === pl._id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#1ed760]" />
                  ) : (
                    <Plus className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};