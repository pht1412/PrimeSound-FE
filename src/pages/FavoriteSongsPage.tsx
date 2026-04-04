// src/pages/FavoriteSongsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Heart, RefreshCcw, MoreHorizontal, Loader2 } from 'lucide-react';
import { favoriteService } from '../services/favoriteService';
import { repostService } from '../services/repostService';
import { userService } from '../services/userService';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useFavorites } from '../context/FavoritesContext';
import { AddToPlaylistModal } from '../components/modals/AddToPlaylistModal';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

interface FavoriteSong {
  _id: string;
  title: string;
  artist: string;
  uploadedBy: string;
  coverUrl: string;
  releaseDate?: string;
  album?: string;
  duration?: number;
  audioUrl?: string;
}

export const FavoriteSongsPage = () => {
  const navigate = useNavigate();
  const { playSong } = useMusicPlayer() as any;
  const { isLiked, toggleLike } = useFavorites(); 
  
  const [songs, setSongs] = useState<FavoriteSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // STATE: Quản lý Xóa mềm (Unlike) và Trạng thái Repost
  const [softDeletedIds, setSoftDeletedIds] = useState<Set<string>>(new Set());
  const [repostedIds, setRepostedIds] = useState<Set<string>>(new Set());
  
  // STATE: Quản lý Modal Add To Playlist
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  const getFileUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    const filename = url.replace(/^.*[\\\/]/, '');
    return `${BACKEND_URL}/uploads/${filename}`;
  };

  const formatTime = (totalSeconds?: number) => {
    if (!totalSeconds) return "0:00";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`; 
  };

  // Hàm format ngày tháng sang dd/mm/yyyy
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchFavoriteSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const me: any = await userService.getMe();
      
      const [favRes, repRes]: any = await Promise.all([
        favoriteService.getMyLikedSongs(),
        repostService.getUserReposts(me._id || me.id)
      ]);
      
      const songsArray = Array.isArray(favRes) ? favRes : (favRes?.data || favRes?.favorites || favRes?.songs || []);
      
      const mappedSongs = songsArray.map((item: any) => {
        const song = item.song || item; 
        return {
          _id: song._id,
          title: song.title,
          artist: song.uploadedBy?.name || song.artist?.name || song.artist || "Unknown Artist",
          uploadedBy: song.uploadedBy?.name || "Unknown",
          coverUrl: getFileUrl(song.coverUrl),
          releaseDate: song.releaseDate || song.createdAt,
          album: song.album,
          duration: song.duration,
          audioUrl: getFileUrl(song.audioUrl)
        };
      });
      setSongs(mappedSongs);

      const userReposts = repRes?.data?.reposts || [];
      const repostedSet = new Set<string>();
      userReposts.forEach((r: any) => {
        if (r.repostedItem && r.repostedItem._id) {
          repostedSet.add(r.repostedItem._id.toString());
        }
      });
      setRepostedIds(repostedSet);

    } catch (error) {
      console.error("❌ Lỗi khi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavoriteSongs();
  }, [fetchFavoriteSongs]); 

  // 👇 ĐÃ SỬA: Đưa logic hiển thị Toast ra KHỎI hàm set state 👇
  const handleToggleLike = async (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    try {
      await toggleLike(songId); 
      
      // Bắn thông báo (Side effect) dựa trên trạng thái HIỆN TẠI
      if (softDeletedIds.has(songId)) {
        toast.success('Đã khôi phục bài hát yêu thích!');
      } else {
        toast.info('Đã bỏ yêu thích (Tải lại trang để xóa hoàn toàn).');
      }

      // Cập nhật state nội bộ mượt mà
      setSoftDeletedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(songId)) {
          newSet.delete(songId); 
        } else {
          newSet.add(songId); 
        }
        return newSet;
      });
    } catch (err) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  const handleToggleRepost = async (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    try {
      if (repostedIds.has(songId)) {
        await repostService.deleteRepost(songId);
        setRepostedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(songId);
          return newSet;
        });
        toast.success("Đã gỡ bài đăng lại!");
      } else {
        await repostService.createRepost({ itemId: songId, itemType: 'Song' });
        setRepostedIds(prev => {
          const newSet = new Set(prev);
          newSet.add(songId);
          return newSet;
        });
        toast.success("Đã đăng lại bài hát!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thao tác!");
    }
  };

  const activeSongs = songs.filter(s => !softDeletedIds.has(s._id));
  const totalDurationSeconds = activeSongs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);

  const gridTemplate = "grid grid-cols-[40px_minmax(250px,2fr)_minmax(120px,1fr)_minmax(200px,2fr)_minmax(150px,1fr)] gap-4 px-4 items-center";
  const heroCover = songs.length > 0 ? songs[0].coverUrl : null;

  return (
    <div className="w-full min-h-screen bg-[#101010] text-white relative custom-scrollbar overflow-y-auto pb-28">
      
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#1A5333] to-[#101010] z-0 pointer-events-none"></div>

      <div className="relative z-10 px-8 py-6">
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="text-white hover:text-[#1ed760] transition p-2 bg-black/40 hover:bg-black/70 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        </div>

        <div className="flex items-end gap-6 mb-8">
          <div className="w-[220px] h-[220px] shadow-2xl flex items-center justify-center rounded-md overflow-hidden shrink-0 bg-[#282828]">
            {heroCover ? (
              <img src={heroCover} alt="Favorites Cover" className="w-full h-full object-cover shadow-[0_8px_24px_rgba(0,0,0,0.5)]" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center">
                <Heart fill="white" size={80} />
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3 pb-2 w-full">
            <h1 className="text-6xl font-extrabold tracking-tighter">Your Favorites</h1>
            <p className="text-[#b3b3b3] text-sm font-medium mt-2">All the songs you've saved.</p>
            
            <div className="flex items-center justify-between w-full mt-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="text-white">{activeSongs.length} songs</span>
                <span className="text-[#b3b3b3]">•</span>
                <span className="text-[#b3b3b3]">{totalHours > 0 ? `${totalHours}h ` : ''}{totalMinutes}m</span>
              </div>
              
              <div 
                onClick={() => {
                  if (activeSongs.length > 0) {
                    const queue = activeSongs.map(s => ({
                      id: s._id, title: s.title, artist: s.artist,
                      cover: s.coverUrl, audioUrl: s.audioUrl || ""
                    }));
                    playSong(queue[0], { queue });
                  }
                }}
                className={`flex items-center gap-4 cursor-pointer hover:scale-105 transition ${activeSongs.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <span className="font-semibold text-lg">Play All</span>
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#1ed760] text-black shadow-lg hover:bg-[#3be477]">
                  <Play className="w-6 h-6 fill-black ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-10">
          <div className={`${gridTemplate} text-[#b3b3b3] text-xs font-semibold uppercase tracking-wider border-b border-[#282828] pb-2 mb-4`}>
            <div className="text-center">#</div>
            <div>Title</div>
            <div>Release Date</div>
            <div>Artist</div> 
            <div className="text-right flex items-center justify-end pr-8">Time</div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-[#1ed760]">
              <Loader2 className="animate-spin w-10 h-10" />
            </div>
          ) : songs.length > 0 ? (
            <div className="flex flex-col gap-1">
              {songs.map((song, index) => {
                const isSoftDeleted = softDeletedIds.has(song._id);
                const currentlyLiked = isLiked(song._id);
                const isReposted = repostedIds.has(song._id);

                return (
                  <div 
                    key={song._id} 
                    onClick={() => {
                      if (!isSoftDeleted) {
                        const mappedSong = {
                          id: song._id, title: song.title, artist: song.artist,
                          cover: song.coverUrl, audioUrl: song.audioUrl || ""
                        };
                        const queue = activeSongs.map(s => ({
                          id: s._id, title: s.title, artist: s.artist,
                          cover: s.coverUrl, audioUrl: s.audioUrl || ""
                        }));
                        playSong(mappedSong, { queue });
                      }
                    }}
                    className={`${gridTemplate} py-2 rounded-xl group transition cursor-pointer relative ${isSoftDeleted ? 'opacity-40 grayscale hover:bg-transparent' : 'hover:bg-[#282828]'}`}
                  >
                    <div className="text-gray-400 font-medium text-sm w-full text-center relative flex justify-center">
                      <span className={`${!isSoftDeleted && 'group-hover:hidden'}`}>{index + 1}</span>
                      {!isSoftDeleted && <Play className="w-4 h-4 fill-white hidden group-hover:block absolute" />}
                    </div>
                    
                    <div className="flex items-center gap-4 pr-4 overflow-hidden">
                      <img 
                        src={song.coverUrl} 
                        alt={song.title} 
                        className="w-11 h-11 rounded-md shadow object-cover bg-[#333] shrink-0"
                      />
                      <div className="flex flex-col truncate w-full">
                        <span className={`font-semibold text-base truncate ${isSoftDeleted ? 'text-gray-400 line-through' : 'text-white group-hover:text-[#1ed760] transition-colors'}`}>
                          {song.title || 'Unknown Title'}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-[#a7a7a7] truncate pr-4 group-hover:text-white transition">
                      {formatDate(song.releaseDate)}
                    </div>

                    <div className="text-sm text-[#a7a7a7] truncate pr-4 group-hover:text-white transition">
                      {song.artist}
                    </div>

                    <div className="flex items-center justify-end gap-5 text-[#a7a7a7]">
                      
                      <button 
                        onClick={(e) => handleToggleLike(e, song._id)}
                        className={`transition hover:scale-110 ${isSoftDeleted ? '' : 'hover:text-white'}`}
                      >
                        <Heart className={`w-5 h-5 transition-colors ${currentlyLiked ? 'fill-[#1ed760] text-[#1ed760]' : ''}`} />
                      </button>

                      <button 
                        onClick={(e) => {
                          if (!isSoftDeleted) handleToggleRepost(e, song._id);
                        }}
                        className={`transition hover:scale-110 ${isSoftDeleted ? 'pointer-events-none' : 'hover:text-white'}`}
                        title={isReposted ? "Hủy đăng lại" : "Đăng lại"}
                      >
                        <RefreshCcw className={`w-5 h-5 ${isReposted && !isSoftDeleted ? 'text-[#1ed760]' : ''}`} />
                      </button>

                      <span className="text-sm w-8 text-right group-hover:text-white transition">
                        {formatTime(song.duration)}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isSoftDeleted) {
                            setSelectedSongId(song._id);
                            setIsAddModalOpen(true);
                          }
                        }}
                        className={`p-1 rounded-full transition ${isSoftDeleted ? 'pointer-events-none opacity-0' : 'hover:bg-white/10 opacity-0 group-hover:opacity-100 hover:text-white'}`}
                        title="Add to Playlist"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-[#b3b3b3] font-medium text-lg border border-white/5 rounded-2xl bg-[#121212]">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
              You haven't added any favorite songs yet.
            </div>
          )}
        </div>
      </div>

      <AddToPlaylistModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedSongId(null);
        }}
        songId={selectedSongId}
      />
    </div>
  );
};