// src/pages/RepostPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // BƯỚC 1: Nút Back
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
import { useFavorites } from '../context/FavoritesContext'; // BƯỚC 4: Nút Like
import { useMusicPlayer } from '../context/MusicPlayerContext'; // BƯỚC 5: Play Nhạc
import RepostButton from '../components/repost/RepostButton';

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// Hàm chuẩn hóa đường dẫn Ảnh (BƯỚC 2 & 3)
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

const RepostPage: React.FC = () => {
  const navigate = useNavigate(); // Dùng để điều hướng nút Back
  const { isLiked, toggleLike } = useFavorites(); // Lấy logic thả tim
  const { playSong } = useMusicPlayer() as any; // Lấy logic play nhạc (Lưu ý: đổi tên hàm playSong nếu context của bạn dùng tên khác)

  const [reposts, setReposts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroCover, setHeroCover] = useState<string>("https://placehold.co/240x240/1f1f1f/white?text=Reposts");
  const [locallyUnreposted, setLocallyUnreposted] = useState<string[]>([]);
  const { currentSong, updateCurrentSong } = useMusicPlayer() as any;

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

  useEffect(() => {
    if (currentSong && typeof currentSong.isReposted === 'boolean') {
      const { id, isReposted } = currentSong;
      
      setLocallyUnreposted(prev => {
        const isAlreadyLocallyUnreposted = prev.includes(id);

        if (!isReposted && !isAlreadyLocallyUnreposted) {
          return [...prev, id];
        } else if (isReposted && isAlreadyLocallyUnreposted) {
          return prev.filter(repostId => repostId !== id);
        }
        
        return prev;
      });
    }
  }, [currentSong, currentSong?.isReposted]);

  const handleToggleRepost = (itemId: string, isReposted: boolean) => {
    setLocallyUnreposted(prev => 
      isReposted ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );

    if (currentSong?.id === itemId) {
      updateCurrentSong({ isReposted });
    }
  };

  // BƯỚC 5: Hàm xử lý phát nhạc chung
  const handlePlaySong = (songData: any) => {
    if (!playSong) {
      console.warn("Chưa tìm thấy hàm playSong trong Context");
      return;
    }
    const isReposted = !locallyUnreposted.includes(songData._id);
    // Gửi định dạng data vào MusicContext (Bạn có thể điều chỉnh lại các key cho khớp với interface của MusicContext hiện tại)
    playSong({
      id: songData._id,
      title: songData.title,
      artist: songData.artist?.name || songData.artist?.stageName || 'Unknown Artist',
      cover: getImageUrl(songData.coverUrl),
      audioUrl: `${BACKEND_URL}/api/v1/songs/${songData._id}/stream`,
      isReposted: isReposted
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
        
        {/* BƯỚC 1: Gắn sự kiện navigate về home cho nút Back */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/home')} className="p-2 bg-black/40 hover:bg-black/70 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* HERO SECTION */}
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
                <span>{reposts.length} items</span>
              </div>
              
              {/* BƯỚC 5: Nút PLAY ALL (Phát bài đầu tiên trong list) */}
              <div 
                className="flex items-center gap-4 cursor-pointer hover:scale-105 transition"
                onClick={() => {
                  if (reposts.length > 0) handlePlaySong(reposts[0].repostedItem);
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
          <div className="grid grid-cols-[40px_minmax(250px,2fr)_minmax(120px,1fr)_minmax(200px,2fr)_minmax(150px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">
            <div>#</div>
            <div>Title</div>
            <div>Release Date</div>
            <div>Album</div>
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
                
                // BƯỚC 4: Kiểm tra trạng thái Like
                const currentlyLiked = isLiked(item._id);

                return (
                  <div 
                    key={repost._id} 
                    onClick={() => handlePlaySong(item)} // Click vào dòng sẽ phát bài đó
                    className="grid grid-cols-[40px_minmax(250px,2fr)_minmax(120px,1fr)_minmax(200px,2fr)_minmax(150px,1fr)] gap-4 px-4 py-3 items-center hover:bg-white/10 rounded-md transition group cursor-pointer"
                  >
                    <div className="text-gray-400 font-medium text-lg relative w-full">
                      {/* Số thứ tự sẽ biến thành Icon Play khi hover */}
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play className="w-4 h-4 fill-white hidden group-hover:block absolute top-[2px]" />
                    </div>
                    
                    <div className="flex items-center gap-4 pr-4">
                      {/* BƯỚC 2: Hiển thị ảnh của từng bài hát */}
                      <img 
                        src={getImageUrl(item.coverUrl)} 
                        alt={item.title} 
                        className="w-10 h-10 rounded shadow object-cover bg-[#333]"
                      />
                      <div className="flex flex-col truncate">
                        <span className="font-semibold text-base text-white truncate">
                          {item.title || 'Unknown Title'}
                        </span>
                        <span className="text-sm text-gray-400 truncate">
                          {repost.user.name || item.artist?.name || 'Unknown Artist'}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-400 truncate pr-4">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </div>

                    <div className="text-sm text-gray-400 truncate pr-4">
                      {repost.repostedItemType === 'Playlist' ? 'Playlist' : (item.album || 'Single')}
                    </div>

                    <div className="flex items-center justify-end gap-5 text-gray-400">
                      
                      {/* BƯỚC 4: Nút Like (Đã có logic thả tim) */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Chặn sự kiện click dòng (play nhạc)
                          toggleLike(item._id);
                        }}
                        className="transition hover:scale-110"
                      >
                        <Heart className={`w-5 h-5 transition-colors ${currentlyLiked ? 'fill-[#1ed760] text-[#1ed760]' : 'hover:text-white'}`} />
                      </button>

                      <RepostButton
                        itemId={item._id}
                        itemType="Song"
                        initialIsReposted={!locallyUnreposted.includes(item._id)}
                        onToggle={(isReposted) => handleToggleRepost(item._id, isReposted)}
                      />

                      <span className="text-sm w-8 text-right">
                        {formatTime(item.duration)}
                      </span>
                      <MoreHorizontal className="w-5 h-5 hover:text-white transition opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()} />
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

export default RepostPage;