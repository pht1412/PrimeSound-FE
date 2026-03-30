// src/pages/HomePage.tsx
import { useState, useEffect } from "react";
import { songService } from "../services/songService";
// Thêm 'type' trước Song để tuân thủ verbatimModuleSyntax
import { useMusicPlayer, type Song } from "../context/MusicPlayerContext";

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// Mở rộng kiểu dữ liệu Song để thêm trường 'plays' phục vụ cho việc hiển thị UI
interface HomeSong extends Song {
  plays?: string;
}

export const Home = () => {
  const { playSong, currentSong, isPlaying, togglePlay } = useMusicPlayer();
  const [trendingSong, setTrendingSong] = useState<HomeSong | null>(null);
  const [topArtists, setTopArtists] = useState<HomeSong[]>([]);
  const [billboards, setBillboards] = useState<HomeSong[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Hàm chuẩn hóa đường dẫn ảnh cực mạnh
  const getFileUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    const filename = url.replace(/^.*[\\\/]/, '');
    return `${BACKEND_URL}/uploads/${filename}`;
  };

  // Hàm chuyển đổi dữ liệu
  const mapSongData = (song: any): HomeSong => {
    return {
      id: song._id,
      title: song.title,
      artist: song.uploadedBy?.name || song.artist || "Unknown Artist",
      uploadedBy: song.uploadedBy?.name,
      cover: getFileUrl(song.coverUrl) || "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f4b0",
      audioUrl: getFileUrl(song.audioUrl),
      plays: `${(song.playCount || 0).toLocaleString()} Plays`
    };
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Ép kiểu (Casting) kết quả trả về thành mảng bất kỳ (any[]) để TS bỏ qua lỗi AxiosResponse
        const [trendingRes, latestRes, discoveryRes] = await Promise.all([
          songService.getTrendingSongs(),
          songService.getLatestSongs(),
          songService.getDiscoverySongs()
        ]) as any[];

        // 1. Lấy bài hát đầu tiên trong list Trending làm Hero Banner
        if (trendingRes && trendingRes.length > 0) {
          setTrendingSong(mapSongData(trendingRes[0]));
        }

        // 2. Gán list Discovery cho mục Top Artists
        if (discoveryRes) {
          setTopArtists(discoveryRes.slice(0, 10).map(mapSongData));
        }

        // 3. Gán list Latest cho Billboard
        if (latestRes) {
          setBillboards(latestRes.slice(0, 10).map(mapSongData));
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full text-white">
        <div className="w-10 h-10 border-4 border-[#1ed760] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 animate-fade-in">

      {/* CỘT TRÁI */}
      <div className="flex flex-col gap-8">

        {/* BANNER TRENDING */}
        {trendingSong && (
          <div className="relative w-full h-[280px] bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] rounded-3xl overflow-hidden flex items-center p-10 group shadow-2xl">
            <img
              src={trendingSong.cover}
              alt="Trending"
              className="absolute right-0 top-0 w-1/2 h-full object-cover opacity-40 mix-blend-luminosity mask-image-gradient group-hover:scale-105 transition-transform duration-700"
            />
            <div className="relative z-10 flex flex-col items-start gap-2">
              <span className="text-sm font-medium text-white tracking-widest uppercase">Trending Now</span>
              <h2 className="text-5xl font-bold text-white tracking-tight">{trendingSong.title}</h2>
              <p className="text-lg text-[#a7a7a7] font-medium mb-4">{trendingSong.artist}</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => playSong(trendingSong)}
                  className="bg-[#1ed760] hover:bg-[#3be477] text-black font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all hover:scale-105"
                >
                  {currentSong?.id === trendingSong.id && isPlaying ? "Pause" : "Play Now"}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOP ARTISTS */}
        <div className="bg-[#1a1a1a] p-6 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Discovery Songs</h3>
            <a href="#" className="text-sm text-[#a7a7a7] hover:text-white font-medium transition">See All</a>
          </div>
          <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-4">
            {topArtists.map((song) => (
              <div key={song.id} className="flex flex-col items-center gap-3 min-w-[140px] group cursor-pointer" onClick={() => playSong(song)}>
                <div className="w-[140px] h-[140px] overflow-hidden rounded-2xl shadow-md">
                  <img src={song.cover} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="text-center w-full">
                  <h4 className="text-white font-bold text-base truncate group-hover:text-[#1ed760] transition">{song.title}</h4>
                  <p className="text-[#a7a7a7] text-xs font-medium truncate">{song.artist}</p>
                  <p className="text-[#a7a7a7] text-[10px] mt-1">{song.plays}</p>
                </div>
              </div>
            ))}
            {topArtists.length === 0 && <p className="text-gray-500 text-sm">Chưa có dữ liệu bài hát.</p>}
          </div>
        </div>

        {/* BILLBOARD */}
        <div className="bg-[#1a1a1a] p-6 rounded-3xl shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Latest Releases</h3>
            <a href="#" className="text-sm text-[#a7a7a7] hover:text-white font-medium transition">See All</a>
          </div>
          <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-4">
            {billboards.map((song) => (
              <div key={song.id} className="flex flex-col items-center gap-3 min-w-[140px] group cursor-pointer" onClick={() => playSong(song)}>
                <div className="w-[140px] h-[140px] overflow-hidden rounded-2xl shadow-md">
                  <img src={song.cover} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="text-center w-full">
                  <h4 className="text-white font-bold text-base truncate group-hover:text-[#1ed760] transition">{song.title}</h4>
                  <p className="text-[#a7a7a7] text-xs font-medium truncate">{song.artist}</p>
                </div>
              </div>
            ))}
            {billboards.length === 0 && <p className="text-gray-500 text-sm">Chưa có bài hát mới nào.</p>}
          </div>
        </div>

      </div>

      {/* CỘT PHẢI (NOW PLAYING) */}
      {/* ================= CỘT PHẢI: TOP ARTISTS ================= */}
      <div className="hidden xl:block">
        <div className="bg-[#1a1a1a] rounded-3xl p-6 flex flex-col sticky top-0 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Popular Artists</h3>
            <button className="text-[#a7a7a7] hover:text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Tạm thời mượn data của list topArtists để hiển thị danh sách ca sĩ */}
            {topArtists.slice(0, 5).map((song, index) => (
              <div key={`artist-${index}`} className="flex items-center gap-4 group cursor-pointer hover:bg-[#282828] p-2 rounded-xl transition">
                {/* Dùng luôn cover bài hát làm Avatar ca sĩ (bo tròn) */}
                <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg">
                  <img src={song.cover} alt={song.artist} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex flex-col flex-1">
                  <h4 className="text-white font-bold text-sm group-hover:text-[#1ed760] transition">{song.artist}</h4>
                  <p className="text-[#a7a7a7] text-xs font-medium">Artist</p>
                </div>
                <button className="text-[#a7a7a7] opacity-0 group-hover:opacity-100 transition-opacity hover:text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                </button>
              </div>
            ))}
            {topArtists.length === 0 && <p className="text-gray-500 text-sm">Chưa có dữ liệu.</p>}
          </div>

          <button className="w-full mt-6 py-3 border border-[#4d4d4d] rounded-full text-sm font-bold text-white tracking-widest uppercase hover:border-white transition">
            View All
          </button>
        </div>
      </div>
    </div>
  );
};