// src/pages/HomePage.tsx
import { useState, useEffect } from "react";
import { SongCommentsPanel } from "../components/comments/SongCommentsPanel";
import { songService } from "../services/songService";
import { useMusicPlayer, type Song } from "../context/MusicPlayerContext";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { followService } from "../services/followService";
import { toast } from "react-toastify";
import { useComingSoon } from "../context/ComingSoonContext";

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

interface HomeSong extends Song {
  plays?: string;
  uploaderId?: string;
  uploaderAvatar?: string;
}

export const Home = () => {
  const navigate = useNavigate();
  const { showComingSoon } = useComingSoon();
  const { playSong, currentSong, isPlaying } = useMusicPlayer();
  const [trendingSong, setTrendingSong] = useState<HomeSong | null>(null);
  const [topArtists, setTopArtists] = useState<HomeSong[]>([]);
  const [billboards, setBillboards] = useState<HomeSong[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showComments, setShowComments] = useState<boolean>(false);

  // === CÁC STATE PHỤC VỤ TÍNH NĂNG FOLLOW POPUP ===
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [followStatuses, setFollowStatuses] = useState<Record<string, boolean>>({});

  // Đóng Popup khi click ra ngoài
  useEffect(() => {
    const closeDropdown = () => setActiveDropdownId(null);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  // Tự động mở Comment Panel khi có bài hát
  useEffect(() => {
    if (currentSong) setShowComments(true);
  }, [currentSong]);

  const getFileUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    const filename = url.replace(/^.*[\\\/]/, '');
    return `${BACKEND_URL}/uploads/${filename}`;
  };

  const mapSongData = (song: any): HomeSong => {
    const artistName = song.artist?.name || song.artist?.stageName || song.uploadedBy?.name || (typeof song.artist === 'string' ? song.artist : "Unknown Artist");
    return {
      id: song._id,
      title: song.title,
      artist: artistName,
      uploadedBy: song.uploadedBy?.name,
      uploaderId: song.uploadedBy?._id,
      uploaderAvatar: song.uploadedBy?.avatar,
      cover: getFileUrl(song.coverUrl) || "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f4b0",
      audioUrl: getFileUrl(song.audioUrl),
      plays: `${(song.playCount || 0).toLocaleString()} Plays`
    };
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Lấy thông tin User hiện tại (Để biết có quyền Follow hay ko)
        try {
          const user = await userService.getMe();
          setCurrentUser(user);
        } catch (e) { console.log("Khách chưa đăng nhập"); }

        const [trendingRes, latestRes, discoveryRes] = await Promise.all([
          songService.getTrendingSongs(),
          songService.getLatestSongs(),
          songService.getDiscoverySongs()
        ]) as any[];

        if (trendingRes && trendingRes.length > 0) setTrendingSong(mapSongData(trendingRes[0]));
        if (discoveryRes) setTopArtists(discoveryRes.slice(0, 10).map(mapSongData));
        if (latestRes) setBillboards(latestRes.slice(0, 10).map(mapSongData));
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // === LOGIC XỬ LÝ CLICK NÚT 3 CHẤM ===
  const handleDropdownClick = async (e: React.MouseEvent, uploaderId: string) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài (không bị nhảy trang Profile)
    if (activeDropdownId === uploaderId) {
      setActiveDropdownId(null);
      return;
    }
    setActiveDropdownId(uploaderId);

    // Fetch trạng thái follow từ API nếu chưa có dữ liệu
    if (currentUser && followStatuses[uploaderId] === undefined) {
      try {
        const status: any = await followService.getFollowStatus(uploaderId);
        setFollowStatuses(prev => ({ ...prev, [uploaderId]: status.isFollowing }));
      } catch (err) {
        console.error("Lỗi lấy trạng thái follow", err);
      }
    }
  };

  // === LOGIC XỬ LÝ CLICK CHỮ FOLLOW / FOLLOWED (ĐÃ NÂNG CẤP PHÒNG THỦ) ===
  const handleToggleFollow = async (e: React.MouseEvent, uploaderId: string) => {
    e.stopPropagation();

    // 1. Chốt chặn an toàn cho ID
    if (!uploaderId || uploaderId === "undefined") {
      console.error("❌ Lỗi: uploaderId không xác định (Có thể do thiếu populate ở backend)");
      return;
    }

    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để theo dõi Nghệ sĩ!");
      return;
    }

    const isCurrentlyFollowing = followStatuses[uploaderId];

    try {
      if (isCurrentlyFollowing) {
        await followService.unfollowUser(uploaderId);
        setFollowStatuses(prev => ({ ...prev, [uploaderId]: false }));
        toast.success("Đã hủy theo dõi");
      } else {
        await followService.followUser(uploaderId);
        setFollowStatuses(prev => ({ ...prev, [uploaderId]: true }));
        toast.success("Đã theo dõi thành công!");
      }
    } catch (err: any) {
      // ==================== CHIẾN THUẬT TỰ CHỮA LÀNH (SELF-HEALING) ====================
      const errorMsg = err.response?.data?.message || err.message || "";

      // Kịch bản A: Front-end bảo chưa Follow, gửi lệnh Follow -> Back-end báo "Already following"
      if (errorMsg.includes("already following") || errorMsg.includes("Đã theo dõi")) {
        setFollowStatuses(prev => ({ ...prev, [uploaderId]: true })); // Ép UI sang trạng thái Followed
        toast.info("Đã đồng bộ trạng thái: Bạn đang theo dõi người này.");
      }
      // Kịch bản B: Front-end bảo đã Follow, gửi lệnh Unfollow -> Back-end báo "Not following"
      else if (errorMsg.includes("not following") || errorMsg.includes("Chưa theo dõi")) {
        setFollowStatuses(prev => ({ ...prev, [uploaderId]: false })); // Ép UI về trạng thái Follow
        toast.info("Đã đồng bộ trạng thái: Bạn chưa theo dõi người này.");
      }
      // Các lỗi mạng hoặc server thật sự khác
      else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại sau!");
        console.error("❌ Follow Action Error:", errorMsg);
      }
    } finally {
      setActiveDropdownId(null); // Luôn tắt popup sau khi thao tác xong
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full text-white">
        <div className="w-10 h-10 border-4 border-[#1ed760] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  // ================= BẮT ĐẦU THÊM MỚI =================
  // Lọc ra danh sách các nghệ sĩ duy nhất (không bị trùng lặp uploaderId)
  // Chỉ dùng cho cột Popular Artists để tránh nhân bản clone
  const uniquePopularArtists = topArtists.filter(
    (song, index, self) =>
      index === self.findIndex((s) => s.uploaderId === song.uploaderId)
  );
  // ================= KẾT THÚC THÊM MỚI =================

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 animate-fade-in pb-20">

      {/* CỘT TRÁI (Trending, Discovery, Latest) */}
      <div className="flex flex-col gap-8">
        {trendingSong && (
          <div className="relative w-full h-[280px] bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] rounded-3xl overflow-hidden flex items-center p-10 group shadow-2xl">
            <img src={trendingSong.cover} alt="Trending" className="absolute right-0 top-0 w-1/2 h-full object-cover opacity-40 mix-blend-luminosity mask-image-gradient group-hover:scale-105 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col items-start gap-2">
              <span className="text-sm font-medium text-white tracking-widest uppercase">Trending Now</span>
              <h2 className="text-5xl font-bold text-white tracking-tight">{trendingSong.title}</h2>
              <p className="text-lg text-[#a7a7a7] font-medium mb-4">{trendingSong.artist}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => playSong(trendingSong, { queue: trendingSong ? [trendingSong] : undefined })}
                  className="bg-[#1ed760] hover:bg-[#3be477] text-black font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all hover:scale-105"
                >
                  {currentSong?.id === trendingSong.id && isPlaying ? "Pause" : "Play Now"}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#1a1a1a] p-6 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Discovery Songs</h3>
            <button onClick={showComingSoon} className="text-sm text-[#a7a7a7] hover:text-white font-medium transition cursor-pointer">See All</button>
          </div>
          <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-4">
            {topArtists.map((song) => (
              <div key={song.id} className="flex flex-col items-center gap-3 min-w-[140px] group cursor-pointer" onClick={() => playSong(song, { queue: topArtists })}>
                <div className="w-[140px] h-[140px] overflow-hidden rounded-2xl shadow-md">
                  <img src={song.cover} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="text-center w-full">
                  <h4 className="text-white font-bold text-base truncate group-hover:text-[#1ed760] transition">{song.title}</h4>
                  <p className="text-[#a7a7a7] text-xs font-medium truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-3xl shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Latest Releases</h3>
            <button onClick={showComingSoon} className="text-sm text-[#a7a7a7] hover:text-white font-medium transition cursor-pointer">See All</button>
          </div>
          <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-4">
            {billboards.map((song) => (
              <div key={song.id} className="flex flex-col items-center gap-3 min-w-[140px] group cursor-pointer" onClick={() => playSong(song, { queue: billboards })}>
                <div className="w-[140px] h-[140px] overflow-hidden rounded-2xl shadow-md">
                  <img src={song.cover} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="text-center w-full">
                  <h4 className="text-white font-bold text-base truncate group-hover:text-[#1ed760] transition">{song.title}</h4>
                  <p className="text-[#a7a7a7] text-xs font-medium truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CỘT PHẢI */}
      <div className="hidden xl:block">
        {currentSong && showComments ? (
          <div className="sticky top-0 flex flex-col gap-6">
            <SongCommentsPanel
              song={currentSong}
              onClose={() => setShowComments(false)}
              currentUser={currentUser}
            />          
            </div>
        ) : (
          <div className="bg-[#1a1a1a] rounded-3xl p-6 flex flex-col sticky top-0 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Popular Artists</h3>

              <div className="flex items-center gap-3">
                {currentSong && !showComments && (
                  <button
                    onClick={() => setShowComments(true)}
                    className="text-xs font-bold text-[#1ed760] hover:text-white transition tracking-widest uppercase"
                  >
                    Comments
                  </button>
                )}
                <button className="text-[#a7a7a7] hover:text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {uniquePopularArtists.slice(0, 5).map((song, index) => (
                <div
                  key={`artist-${index}`}
                  onClick={() => song.uploaderId && navigate(`/home/profile/${song.uploaderId}`)}
                  className="flex items-center gap-4 group cursor-pointer hover:bg-[#282828] p-2 rounded-xl transition relative"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg bg-[#282828] shrink-0">
                    <img
                      src={song.uploaderAvatar ? getFileUrl(song.uploaderAvatar) : "https://ui-avatars.com/api/?name=User&background=1ed760&color=fff"}
                      alt={song.artist}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h4 className="text-white font-bold text-sm truncate group-hover:text-[#1ed760] transition">{song.artist}</h4>
                    <p className="text-[#a7a7a7] text-xs font-medium">Artist</p>
                  </div>

                  {/* === NÚT 3 CHẤM BẬT POPUP FOLLOW === */}
                  <div className="relative">
                    <button
                      onClick={(e) => song.uploaderId && handleDropdownClick(e, song.uploaderId)}
                      className="text-[#a7a7a7] opacity-0 group-hover:opacity-100 transition-opacity hover:text-white p-2"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>

                    {/* HIỂN THỊ POPUP NẾU ACTIVE */}
                    {activeDropdownId === song.uploaderId && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-[#282828] border border-[#3e3e3e] rounded-md shadow-2xl z-50 overflow-hidden">
                        <button
                          onClick={(e) => handleToggleFollow(e, song.uploaderId!)}
                          className="w-full text-left px-4 py-3 text-sm font-semibold transition hover:bg-[#3e3e3e] flex items-center justify-between"
                        >
                          <span className={followStatuses[song.uploaderId!] ? 'text-[#1ed760]' : 'text-white'}>
                            {followStatuses[song.uploaderId!] ? 'Followed' : 'Follow'}
                          </span>
                          {followStatuses[song.uploaderId!] && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1ed760" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ))}
              {topArtists.length === 0 && <p className="text-gray-500 text-sm">Chưa có dữ liệu.</p>}
            </div>

            <button onClick={showComingSoon} className="w-full mt-6 py-3 border border-[#4d4d4d] rounded-full text-sm font-bold text-white tracking-widest uppercase hover:border-white transition cursor-pointer">
              View All
            </button>
        </div>
        )}
      </div>

    </div>
  );
};