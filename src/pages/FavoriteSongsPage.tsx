// src/pages/FavoriteSongsPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SongRow } from '../components/shared/SongRow';
import { favoriteService } from '../services/favoriteService';
import { useMusicPlayer, type Song } from '../context/MusicPlayerContext';
import { useFavorites } from '../context/FavoritesContext';

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
  const { playSong } = useMusicPlayer();
  
  // Lấy likedSongIds để làm Dependency lắng nghe sự thay đổi
  const { likedSongIds } = useFavorites(); 
  
  const [songs, setSongs] = useState<FavoriteSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFileUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    const filename = url.replace(/^.*[\\\/]/, '');
    return `${BACKEND_URL}/uploads/${filename}`;
  };

  const fetchFavoriteSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res: any = await favoriteService.getMyLikedSongs();
      
      const songsArray = Array.isArray(res) ? res : (res?.data || res?.favorites || res?.songs || []);
      
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
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách bài hát yêu thích:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavoriteSongs();
  }, [likedSongIds.size, fetchFavoriteSongs]); 

  const totalDurationSeconds = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);

  const gridTemplate = "grid grid-cols-[40px_minmax(250px,2fr)_minmax(150px,1fr)_minmax(150px,1fr)_120px] gap-4 px-4";

  // LẤY ẢNH CỦA BÀI HÁT ĐẦU TIÊN LÀM COVER
  const heroCover = songs.length > 0 ? songs[0].coverUrl : null;

  return (
    <div className="w-full min-h-screen bg-[#101010] text-white relative custom-scrollbar overflow-y-auto pb-28">
      
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#1A5333] to-[#101010] z-0 pointer-events-none"></div>

      <div className="relative z-10 px-8 py-6">
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="text-white hover:text-[#1ed760] transition p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        </div>

        <div className="flex items-end gap-6 mb-8">
          
          {/* LOGIC ĐỔI ẢNH BÌA TỰ ĐỘNG Ở ĐÂY */}
          <div className="w-[220px] h-[220px] shadow-2xl flex items-center justify-center rounded-md overflow-hidden shrink-0 bg-[#282828]">
            {heroCover ? (
              <img src={heroCover} alt="Favorites Cover" className="w-full h-full object-cover shadow-[0_8px_24px_rgba(0,0,0,0.5)]" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="white">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3 pb-2">
            <h1 className="text-6xl font-extrabold tracking-tighter">Your Favorites</h1>
            <p className="text-[#b3b3b3] text-sm font-medium mt-2">All the songs you've saved.</p>
            
            <div className="flex items-center gap-2 mt-4 text-sm font-medium">
              <span className="text-white">{songs.length} songs</span>
              <span className="text-[#b3b3b3]">•</span>
              <span className="text-[#b3b3b3]">{totalHours > 0 ? `${totalHours}h ` : ''}{totalMinutes}m</span>
              
              <button 
                onClick={() => {
                  if (songs.length > 0) {
                    const queue = songs.map(s => ({
                      id: s._id, title: s.title, artist: s.artist,
                      cover: s.coverUrl, audioUrl: s.audioUrl || ""
                    }));
                    playSong(queue[0], { queue });
                  }
                }}
                className="ml-6 flex items-center gap-2 text-white font-bold text-lg hover:scale-105 transition transform"
              >
                Play All
                <div className="w-12 h-12 rounded-full bg-[#1ed760] flex items-center justify-center text-black shadow-lg hover:bg-[#3be477] transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full mt-10">
          <div className={`${gridTemplate} text-[#b3b3b3] text-xs font-semibold uppercase tracking-wider border-b border-[#282828] pb-2 mb-4`}>
            <div className="text-center">#</div>
            <div>Title</div>
            <div>Release Date</div>
            <div>Album</div>
            <div className="text-right flex items-center justify-end">Time</div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-[#1ed760]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1ed760]"></div>
            </div>
          ) : songs.length > 0 ? (
            <div className="flex flex-col gap-1">
              {songs.map((song, index) => (
                <SongRow 
                  key={song._id} 
                  song={song} 
                  index={index + 1}
                  onPlayClick={(mappedSong: any) => playSong(mappedSong as Song)}
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