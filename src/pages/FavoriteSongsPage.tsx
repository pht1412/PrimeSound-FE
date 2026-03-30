import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SongRow } from '../components/shared/SongRow';
import { favoriteService } from '../services/favoriteService';
import { useMusicPlayer, type Song } from '../context/MusicPlayerContext';
import { useFavorites } from '../context/FavoritesContext';

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// Khai báo interface cho Song (Nên đưa ra 1 file types.ts dùng chung sau này)
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
  const { playSong } = useMusicPlayer();
  const { getLikedCount } = useFavorites();
  const [songs, setSongs] = useState<FavoriteSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFileUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    const filename = url.replace(/^.*[\\\/]/, '');
    return `${BACKEND_URL}/uploads/${filename}`;
  };

  // Hàm lấy danh sách bài hát yêu thích
  const fetchFavoriteSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await favoriteService.getMyLikedSongs();
      console.log(`📋 Loaded ${(Array.isArray(data) ? data : []).length} favorite songs`);
      
      // Map bài hát với đường dẫn ảnh và audio đúng
      const mappedSongs = (Array.isArray(data) ? data : []).map((song: any) => ({
        _id: song._id,
        title: song.title,
        artist: song.uploadedBy?.name || song.artist || "Unknown",
        uploadedBy: song.uploadedBy?.name || song.artist || "Unknown",
        coverUrl: getFileUrl(song.coverUrl),
        releaseDate: song.releaseDate,
        album: song.album,
        duration: song.duration,
        audioUrl: getFileUrl(song.audioUrl)
      }));
      
      setSongs(mappedSongs);
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách bài hát yêu thích:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Gọi API lấy nhạc đã thả tim on mount
  useEffect(() => {
    fetchFavoriteSongs();
  }, [fetchFavoriteSongs]);

  // Re-fetch khi liked count thay đổi (sync với global state)
  useEffect(() => {
    const likedCount = getLikedCount();
    console.log(`🔄 Liked count changed: ${likedCount}`);
    // Optionally refresh list periodically, nhưng có thể gây lag
    // fetchFavoriteSongs();
  }, [getLikedCount()]);

  // Tính tổng thời gian (Tùy chọn: Tính ra số giờ và phút)
  const totalDurationSeconds = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);

  // Chuỗi Grid dùng chung cho cả Header và Row đảm bảo thẳng cột 100%
  const gridTemplate = "grid grid-cols-[40px_minmax(250px,2fr)_minmax(150px,1fr)_minmax(150px,1fr)_120px] gap-4 px-4";

  return (
    // Wrapper chính với màu nền đen và hiệu ứng gradient màu xanh lá ở trên cùng
    <div className="w-full min-h-screen bg-[#101010] text-white relative">
      
      {/* Background Gradient mô phỏng ánh sáng mờ dần từ trên xuống */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#1A5333] to-[#101010] z-0 pointer-events-none"></div>

      <div className="relative z-10 px-8 py-6">
        {/* --- Top Bar: Nút Back và Links (Mô phỏng Figma) --- */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="text-white hover:text-[#1ed760] transition p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          
          <div className="flex items-center gap-6 font-medium text-sm">
            <button className="hover:text-[#1ed760] transition">Share</button>
            <button className="hover:text-[#1ed760] transition">About</button>
            <button className="hover:text-[#1ed760] transition">Premium</button>
            {/* User Icon (Nếu header tổng có rồi thì có thể bỏ khối này) */}
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
        </div>

        {/* --- Hero Section: Cover + Thông tin --- */}
        <div className="flex items-end gap-6 mb-8">
          {/* Cover Image (Có thể dùng 1 ảnh đặc trưng cho Favorites hoặc màu solid) */}
          <div className="w-[220px] h-[220px] shadow-2xl bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center rounded-sm">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="white">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
            </svg>
          </div>
          
          <div className="flex flex-col gap-3 pb-2">
            <h1 className="text-6xl font-extrabold tracking-tighter">Your Favorites</h1>
            <p className="text-[#b3b3b3] text-sm font-medium mt-2">
              All the songs you've saved.
            </p>
            
            <div className="flex items-center gap-2 mt-4 text-sm font-medium">
              <span className="text-white">{songs.length} songs</span>
              <span className="text-[#b3b3b3]">•</span>
              <span className="text-[#b3b3b3]">{totalHours > 0 ? `${totalHours}h ` : ''}{totalMinutes}m</span>
              
              {/* Nút Play All giống Figma */}
              <button className="ml-6 flex items-center gap-2 text-white font-bold text-lg hover:scale-105 transition transform">
                Play All
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black shadow-lg hover:bg-[#1ed760] transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* --- Bảng Danh Sách Bài Hát --- */}
        <div className="w-full mt-10">
          
          {/* Header Bảng (Dùng chung cấu trúc Grid với SongRow) */}
          <div className={`${gridTemplate} text-[#b3b3b3] text-xs font-semibold uppercase tracking-wider border-b border-[#282828] pb-2 mb-4`}>
            <div className="text-center">#</div>
            <div>Title</div>
            <div>Release Date</div>
            <div>Album</div>
            <div className="text-right flex items-center justify-end">
              Time
            </div>
          </div>

          {/* Render danh sách bài hát */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-[#1ed760]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1ed760]"></div>
            </div>
          ) : songs.length > 0 ? (
            <div className="flex flex-col gap-1">
              {songs.map((song, index) => (
                // Trạng thái like lấy từ global FavoritesContext
                <SongRow 
                  key={song._id} 
                  song={song} 
                  index={index + 1}
                  onPlayClick={(mappedSong: any) => {
                    playSong(mappedSong as Song);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-[#b3b3b3] font-medium">
              You haven't added any favorite songs yet.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};