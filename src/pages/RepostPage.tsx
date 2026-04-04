// src/pages/RepostPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  RefreshCcw, 
  Heart, 
  MoreHorizontal, 
  Loader2
} from 'lucide-react';
import { repostService } from '../services/repostService';
import { userService } from '../services/userService'; 
import { useFavorites } from '../context/FavoritesContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { AddToPlaylistModal } from '../components/modals/AddToPlaylistModal';
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

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const RepostPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLiked, toggleLike } = useFavorites(); 
  const { playSong } = useMusicPlayer() as any; 

  const [reposts, setReposts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroCover, setHeroCover] = useState<string>("https://placehold.co/240x240/1f1f1f/white?text=Reposts");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  // 👇 STATE MỚI: Quản lý danh sách các bài hát vừa bị lỡ tay xóa (Soft Delete) 👇
  const [softDeletedIds, setSoftDeletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUserAndReposts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userResponse: any = await userService.getMe();
        const currentUserId = userResponse._id || userResponse.id;

        if (!currentUserId) throw new Error('Could not find user ID.');

        const repostsResponse: any = await repostService.getUserReposts(currentUserId);
        const repostsArray = repostsResponse.data?.reposts || [];
        setReposts(repostsArray);

        if (repostsArray.length > 0) {
          const firstSongCover = repostsArray[0].repostedItem?.coverUrl;
          setHeroCover(getImageUrl(firstSongCover));
        }

      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError('Could not load your reposts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndReposts();
  }, []);

  // 👇 HÀM MỚI: Xử lý bật/tắt (Toggle) Repost thay vì xóa cứng 👇
  const handleToggleRepost = async (itemId: string) => {
    try {
      if (softDeletedIds.has(itemId)) {
        // 1. NẾU ĐÃ XÓA MỀM -> Khôi phục lại (Gọi API Create)
        await repostService.createRepost({ itemId, itemType: 'Song' });
        
        setSoftDeletedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        toast.success('Đã khôi phục bài đăng lại!');
      } else {
        // 2. NẾU ĐANG BÌNH THƯỜNG -> Xóa mềm (Gọi API Delete nhưng không xóa khỏi UI)
        await repostService.deleteRepost(itemId);
        
        setSoftDeletedIds(prev => {
          const newSet = new Set(prev);
          newSet.add(itemId);
          return newSet;
        });
        toast.info('Đã gỡ bài đăng lại (Tải lại trang để biến mất hoàn toàn).');
      }
    } catch (err) {
      console.error('Failed to toggle repost:', err);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
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
        <Loader2 className="w-10 h-10 animate-spin text-[#3be477]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-[#121212] min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#121212] min-h-screen text-white overflow-y-auto custom-scrollbar">
      <div className="bg-gradient-to-b from-[#2a593e] to-[#121212] px-8 py-6 min-h-full pb-28">
        
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/home')} className="p-2 bg-black/40 hover:bg-black/70 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-end gap-6 mb-8">
          <div className="w-60 h-60 shadow-2xl shadow-black/50 shrink-0">
            <img src={heroCover} alt="Mix Cover" className="w-full h-full object-cover rounded-md" />
          </div>
          
          <div className="flex flex-col justify-end w-full pb-2">
            <h1 className="text-6xl font-bold mb-4 tracking-tight">
              Repost songs <span className="text-[#3be477] font-medium opacity-80">mix</span>
            </h1>
            <p className="text-gray-300 text-sm mb-6 max-w-xl leading-relaxed">
              Your personal collection of shared tracks and playlists.
            </p>
            
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3 text-sm font-medium">
                {/* Tính toán số lượng thực tế: Tổng số trừ đi những bài bị soft delete */}
                <span>{reposts.length - softDeletedIds.size} items</span>
              </div>
              
              <div 
                className="flex items-center gap-4 cursor-pointer hover:scale-105 transition"
                onClick={() => {
                  // Chỉ phát những bài chưa bị soft delete
                  const activeReposts = reposts.filter(r => !softDeletedIds.has(r.repostedItem._id));
                  if (activeReposts.length > 0) handlePlaySong(activeReposts[0].repostedItem);
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

        <div className="mt-10">
          <div className="grid grid-cols-[40px_minmax(250px,2fr)_minmax(120px,1fr)_minmax(200px,2fr)_minmax(150px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">
            <div>#</div>
            <div>Title</div>
            <div>Release Date</div>
            <div>Artist</div>
            <div className="text-right pr-8">Time</div>
          </div>

          <div className="flex flex-col pb-10">
            {reposts.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                You haven't reposted any songs yet.
              </div>
            ) : (
              reposts.map((repost, index) => {
                const item = repost.repostedItem; 
                if (!item) return null;
                
                const currentlyLiked = isLiked(item._id);
                
                // 👇 Kiểm tra xem bài hát này có đang bị "lỡ tay xóa" không 👇
                const isSoftDeleted = softDeletedIds.has(item._id);

                return (
                  <div 
                    key={repost._id} 
                    onClick={() => {
                      if (!isSoftDeleted) handlePlaySong(item);
                    }}
                    // Nếu bị xóa mềm, làm mờ đi để người dùng nhận diện
                    className={`grid grid-cols-[40px_minmax(250px,2fr)_minmax(120px,1fr)_minmax(200px,2fr)_minmax(150px,1fr)] gap-4 px-4 py-3 items-center rounded-md transition group cursor-pointer ${isSoftDeleted ? 'opacity-40 grayscale hover:bg-transparent' : 'hover:bg-white/10'}`}
                  >
                    <div className="text-gray-400 font-medium text-lg relative w-full">
                      <span className={`${!isSoftDeleted && 'group-hover:hidden'}`}>{index + 1}</span>
                      {!isSoftDeleted && <Play className="w-4 h-4 fill-white hidden group-hover:block absolute top-[2px]" />}
                    </div>
                    
                    <div className="flex items-center gap-4 pr-4">
                      <img 
                        src={getImageUrl(item.coverUrl)} 
                        alt={item.title} 
                        className="w-10 h-10 rounded shadow object-cover bg-[#333]"
                      />
                      <div className="flex flex-col truncate">
                        <span className={`font-semibold text-base truncate ${isSoftDeleted ? 'text-gray-400 line-through' : 'text-white'}`}>
                          {item.title || 'Unknown Title'}
                        </span>
                        <span className="text-sm text-gray-400 truncate">
                          {item.artist?.name || item.artist?.stageName || 'Unknown Artist'}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-400 truncate pr-4">
                      {formatDate(item.createdAt)}
                    </div>

                    <div className="text-sm text-gray-400 truncate pr-4">
                      {repost.repostedItemType === 'Playlist' ? 'Playlist' : (item.artist?.name || item.artist?.stageName || 'Unknown Artist')}
                    </div>

                    <div className="flex items-center justify-end gap-5 text-gray-400">
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isSoftDeleted) toggleLike(item._id);
                        }}
                        className={`transition hover:scale-110 ${isSoftDeleted ? 'pointer-events-none' : ''}`}
                      >
                        <Heart className={`w-5 h-5 transition-colors ${currentlyLiked ? 'fill-[#1ed760] text-[#1ed760]' : 'hover:text-white'}`} />
                      </button>

                      {/* 👇 Nút Toggle Repost 👇 */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleToggleRepost(item._id);
                        }}
                        className="hover:scale-110 transition"
                        title={isSoftDeleted ? "Khôi phục bài đăng" : "Gỡ bài đăng"}
                      >
                        <RefreshCcw className={`w-5 h-5 ${isSoftDeleted ? 'text-gray-500' : 'text-[#1ed760]'}`} />
                      </button>

                      <span className="text-sm w-8 text-right">
                        {formatTime(item.duration)}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isSoftDeleted) {
                            setSelectedSongId(item._id);
                            setIsAddModalOpen(true);
                          }
                        }}
                        className={`p-1 rounded-full transition ${isSoftDeleted ? 'pointer-events-none' : 'hover:bg-white/10'}`}
                        title="Add to Playlist"
                      >
                        <MoreHorizontal className="w-5 h-5 hover:text-white transition opacity-0 group-hover:opacity-100" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
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

export default RepostPage;