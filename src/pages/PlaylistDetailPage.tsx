// src/pages/PlaylistDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Trash2, Heart, MoreHorizontal, Loader2, Music } from 'lucide-react';
import { playlistService } from '../services/playlistService';
import { useFavorites } from '../context/FavoritesContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const getImageUrl = (url: string) => {
  if (!url) return "https://placehold.co/240x240/1f1f1f/white?text=No+Cover";
  if (url.startsWith('http')) return url;
  const filename = url.replace(/^.*[\\\/]/, '');
  return `${BACKEND_URL}/uploads/${filename}`;
};

const formatTime = (totalSeconds: number) => {
  if (!totalSeconds) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const PlaylistDetailPage: React.FC = () => {
  // Lấy ID playlist từ URL (VD: /home/playlists/123xyz)
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { isLiked, toggleLike } = useFavorites();
  const { playSong } = useMusicPlayer() as any;

  const [playlist, setPlaylist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu chi tiết Playlist
  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response: any = await playlistService.getPlaylistById(id);
        
        if (response.success && response.data) {
          setPlaylist(response.data);
        } else {
          setError('Không tìm thấy dữ liệu playlist.');
        }
      } catch (err) {
        console.error('Lỗi tải playlist:', err);
        setError('Không thể tải playlist. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistDetails();
  }, [id]);

  // Xử lý Xóa bài hát khỏi Playlist
  const handleRemoveSong = async (e: React.MouseEvent, songId: string) => {
    e.stopPropagation(); // Chặn click dòng (play nhạc)
    if (!id) return;
    
    try {
      await playlistService.removeSongFromPlaylist(id, songId);
      toast.success("Đã xóa bài hát khỏi Playlist!");
      
      // Cập nhật state trực tiếp để UI phản hồi ngay (Optimistic Update)
      setPlaylist((prev: any) => ({
        ...prev,
        songs: prev.songs.filter((song: any) => song._id !== songId)
      }));
    } catch (error) {
      console.error('Lỗi khi xóa bài hát:', error);
      toast.error('Không thể xóa bài hát này!');
    }
  };

  const handlePlaySong = (songData: any) => {
    if (!playSong) return;
    playSong({
      id: songData._id,
      title: songData.title,
      artist: songData.artist?.name || songData.artist?.stageName || 'Unknown Artist',
      cover: getImageUrl(songData.coverUrl),
      audioUrl: `${BACKEND_URL}/api/v1/songs/${songData._id}/stream`
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#121212] min-h-screen flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#1ed760]" />
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="flex-1 bg-[#121212] min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <p className="text-red-400">{error || "Playlist không tồn tại."}</p>
        <button onClick={() => navigate('/home/playlists')} className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Xác định ảnh Cover (Lấy bài đầu tiên, nếu không có thì dùng màu/icon)
  const heroCover = playlist.songs && playlist.songs.length > 0 
    ? getImageUrl(playlist.songs[0].coverUrl) 
    : null;

  return (
    <div className="flex-1 bg-[#121212] min-h-screen text-white overflow-y-auto custom-scrollbar">
      <div className="bg-gradient-to-b from-[#2a593e] to-[#121212] px-8 py-6 min-h-full pb-28">
        
        {/* Nút Back */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/home/playlists')} className="p-2 bg-black/40 hover:bg-black/70 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* HERO SECTION */}
        <div className="flex items-end gap-6 mb-8">
          <div className="w-60 h-60 shadow-2xl shadow-black/50 shrink-0 bg-[#282828] flex items-center justify-center rounded-md overflow-hidden border border-white/10">
            {heroCover ? (
              <img src={heroCover} alt="Playlist Cover" className="w-full h-full object-cover" />
            ) : (
              <Music className="w-20 h-20 text-white/30" />
            )}
          </div>
          
          <div className="flex flex-col justify-end w-full pb-2">
            <p className="uppercase text-sm font-bold tracking-widest text-white/80 mb-2">Playlist</p>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight truncate max-w-[800px]" title={playlist.name}>
              {playlist.name}
            </h1>
            <p className="text-gray-300 text-sm mb-6 max-w-xl leading-relaxed">
              {playlist.description || "Danh sách phát cá nhân của bạn."}
            </p>
            
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                <span>{playlist.songs.length} songs</span>
                {playlist.totalDuration > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatTime(playlist.totalDuration)} total time</span>
                  </>
                )}
              </div>
              
              {/* Nút PLAY ALL */}
              <div 
                className={`flex items-center gap-4 transition ${playlist.songs.length > 0 ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => {
                  if (playlist.songs.length > 0) handlePlaySong(playlist.songs[0]);
                }}
              >
                <span className="font-semibold text-lg">Play All</span>
                <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center bg-[#1ed760] text-black border-none hover:bg-[#3be477]">
                  <Play className="w-6 h-6 fill-black ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DANH SÁCH BÀI HÁT */}
        <div className="mt-10">
          <div className="grid grid-cols-[40px_minmax(250px,2fr)_minmax(120px,1fr)_minmax(150px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">
            <div>#</div>
            <div>Title</div>
            <div>Date Added</div>
            <div className="text-right pr-8">Time</div>
          </div>

          <div className="flex flex-col pb-10">
            {playlist.songs.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Playlist này chưa có bài hát nào.</p>
                <p className="text-sm mt-2">Hãy tìm kiếm bài hát và thêm vào đây nhé!</p>
              </div>
            ) : (
              playlist.songs.map((song: any, index: number) => {
                const currentlyLiked = isLiked(song._id);

                return (
                  <div 
                    key={`${song._id}-${index}`} 
                    onClick={() => handlePlaySong(song)}
                    className="grid grid-cols-[40px_minmax(250px,2fr)_minmax(120px,1fr)_minmax(150px,1fr)] gap-4 px-4 py-3 items-center hover:bg-white/10 rounded-md transition group cursor-pointer"
                  >
                    {/* Số thứ tự / Nút Play */}
                    <div className="text-gray-400 font-medium text-lg relative w-full">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play className="w-4 h-4 fill-white hidden group-hover:block absolute top-[2px]" />
                    </div>
                    
                    {/* Ảnh và Tên bài hát */}
                    <div className="flex items-center gap-4 pr-4">
                      <img 
                        src={getImageUrl(song.coverUrl)} 
                        alt={song.title} 
                        className="w-10 h-10 rounded shadow object-cover bg-[#333]"
                      />
                      <div className="flex flex-col truncate">
                        <span className="font-semibold text-base text-white truncate group-hover:text-[#1ed760] transition-colors">
                          {song.title || 'Unknown Title'}
                        </span>
                        <span className="text-sm text-gray-400 truncate hover:underline">
                          {song.artist?.name || song.artist?.stageName || 'Unknown Artist'}
                        </span>
                      </div>
                    </div>

                    {/* Ngày thêm vào */}
                    <div className="text-sm text-gray-400 truncate pr-4">
                      {song.addedAt ? new Date(song.addedAt).toLocaleDateString() : 'N/A'}
                    </div>

                    {/* Các Action (Tim, Xóa, Thời gian) */}
                    <div className="flex items-center justify-end gap-5 text-gray-400">
                      
                      {/* Nút Like */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          toggleLike(song._id);
                        }}
                        className="transition hover:scale-110"
                      >
                        <Heart className={`w-5 h-5 transition-colors ${currentlyLiked ? 'fill-[#1ed760] text-[#1ed760]' : 'hover:text-white'}`} />
                      </button>

                      {/* Nút Xóa khỏi Playlist */}
                      <button 
                        onClick={(e) => handleRemoveSong(e, song._id)}
                        className="opacity-0 group-hover:opacity-100 hover:scale-110 transition"
                        title="Xóa khỏi Playlist"
                      >
                        <Trash2 className="w-5 h-5 hover:text-red-500" />
                      </button>

                      <span className="text-sm w-8 text-right">
                        {formatTime(song.duration)}
                      </span>
                      <MoreHorizontal className="w-5 h-5 hover:text-white transition opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};