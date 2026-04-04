// src/pages/PlaylistPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Play, Trash2, Edit3, Loader2 } from 'lucide-react';
import { usePlaylists } from '../context/PlaylistContext';
import { playlistService } from '../services/playlistService';
import { toast } from 'react-toastify';

// Hàm chuẩn hóa đường dẫn ảnh
const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const getImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const filename = url.replace(/^.*[\\\/]/, '');
  return `${BACKEND_URL}/uploads/${filename}`;
};

export const PlaylistPage = () => {
  const navigate = useNavigate();
  const { playlists, isLoading, fetchPlaylists } = usePlaylists();

  // Vẫn giữ lại hàm tạo màu làm nền dự phòng (fallback) cho Playlist chưa có bài hát nào
  const generateGradient = (id: string) => {
    const gradients = [
      'from-purple-600 to-blue-600', 'from-emerald-500 to-teal-700',
      'from-orange-500 to-red-600', 'from-pink-500 to-rose-600',
      'from-cyan-500 to-blue-700', 'from-fuchsia-600 to-purple-800'
    ];
    const charCode = id.charCodeAt(id.length - 1);
    return gradients[charCode % gradients.length];
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa playlist "${name}" không?`)) {
      try {
        await playlistService.deletePlaylist(id);
        toast.success("Đã xóa playlist!");
        fetchPlaylists(); 
      } catch (error) {
        toast.error("Lỗi khi xóa playlist!");
      }
    }
  };

  const handleEdit = async (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    const newName = window.prompt("Nhập tên mới cho playlist:", currentName);
    if (newName && newName.trim() !== "" && newName !== currentName) {
      try {
        await playlistService.updatePlaylist(id, { name: newName.trim() });
        toast.success("Đã đổi tên playlist!");
        fetchPlaylists();
      } catch (error) {
        toast.error("Lỗi khi cập nhật tên!");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#121212] min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#1ed760]" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#121212] min-h-screen text-white overflow-y-auto custom-scrollbar p-8 pb-28">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Playlists</h1>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#a7a7a7]">
          <Music className="w-16 h-16 mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">Bạn chưa có Playlist nào</h2>
          <p>Hãy tạo một danh sách phát mới từ thanh công cụ bên trái nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {playlists.map((pl) => {
            // Lấy link ảnh bìa chuẩn
            const coverUrl = getImageUrl(pl.firstSongCover);

            return (
              <div 
                key={pl._id}
                onClick={() => navigate(`/home/playlists/${pl._id}`)}
                className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition duration-300 cursor-pointer group relative"
              >
                {/* LOGIC ẢNH: 
                  - Nếu có ảnh: Bỏ lớp gradient, hiện thẻ <img>
                  - Nếu chưa có ảnh: Dùng lớp nền gradient dự phòng 
                */}
                <div className={`relative w-full aspect-square mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md ${!coverUrl ? 'bg-gradient-to-br ' + generateGradient(pl._id) : 'bg-[#282828]'} flex items-center justify-center overflow-hidden`}>
                  
                  {coverUrl ? (
                    <img src={coverUrl} alt={pl.name} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-16 h-16 text-white/50 drop-shadow-lg" />
                  )}
                  
                  <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <button className="w-12 h-12 bg-[#1ed760] rounded-full flex items-center justify-center shadow-xl hover:scale-105 hover:bg-[#3be477]">
                      <Play className="w-6 h-6 fill-black text-black ml-1" />
                    </button>
                  </div>
                </div>

                <div className="font-bold text-white text-base truncate mb-1" title={pl.name}>
                  {pl.name}
                </div>
                <div className="text-sm text-[#a7a7a7] truncate">
                  {pl.songCount} {pl.songCount === 1 ? 'song' : 'songs'}
                </div>

                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={(e) => handleEdit(e, pl._id, pl.name)}
                    className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition"
                    title="Đổi tên Playlist"
                  >
                    <Edit3 className="w-4 h-4 text-white" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, pl._id, pl.name)}
                    className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500/80 transition"
                    title="Xóa Playlist"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};