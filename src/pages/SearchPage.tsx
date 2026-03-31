// src/pages/SearchPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play, Loader2, Music, User, Clock, X, MoreHorizontal } from 'lucide-react';
import { searchService } from '../services/searchService';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { AddToPlaylistModal } from '../components/modals/AddToPlaylistModal';

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const MAX_RECENTS = 10; // Giới hạn lưu tối đa 10 từ khóa

const getImageUrl = (url: string) => {
  if (!url) return "https://placehold.co/150x150/1f1f1f/white?text=No+Image";
  if (url.startsWith('http')) return url;
  const filename = url.replace(/^.*[\\\/]/, '');
  return `${BACKEND_URL}/uploads/${filename}`;
};

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('q') || '';

  const { playSong } = useMusicPlayer() as any;

  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);

  // State lưu trữ Lịch sử tìm kiếm
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // SỬA LỖI: Đưa State quản lý Modal vào BÊN TRONG Component
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  // 1. Khi load trang, đọc dữ liệu từ localStorage
  useEffect(() => {
    const savedRecents = JSON.parse(localStorage.getItem('prime_recent_searches') || '[]');
    setRecentSearches(savedRecents);
  }, []);

  // 2. Logic lưu từ khóa mới vào localStorage khi có keyword
  useEffect(() => {
    if (!keyword.trim()) return;

    const savedRecents = JSON.parse(localStorage.getItem('prime_recent_searches') || '[]');

    // Xóa từ khóa cũ nếu bị trùng (để đẩy nó lên đầu danh sách)
    let updatedRecents = savedRecents.filter((item: string) => item.toLowerCase() !== keyword.toLowerCase());

    // Thêm từ khóa mới lên đầu mảng
    updatedRecents.unshift(keyword.trim());

    // Cắt bớt nếu vượt quá giới hạn
    if (updatedRecents.length > MAX_RECENTS) {
      updatedRecents.pop();
    }

    // Lưu lại vào trình duyệt và cập nhật state
    localStorage.setItem('prime_recent_searches', JSON.stringify(updatedRecents));
    setRecentSearches(updatedRecents);
  }, [keyword]); // Chạy mỗi khi từ khóa trên URL thay đổi

  // 3. Logic Xóa 1 từ khóa
  const handleRemoveRecent = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài thẻ cha
    const updatedRecents = recentSearches.filter(item => item !== itemToRemove);
    localStorage.setItem('prime_recent_searches', JSON.stringify(updatedRecents));
    setRecentSearches(updatedRecents);
  };

  // 4. Logic xóa sạch lịch sử
  const handleClearAllRecents = () => {
    localStorage.removeItem('prime_recent_searches');
    setRecentSearches([]);
  };

  // 5. Logic gọi API tìm kiếm
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!keyword) {
        // Nếu không có từ khóa, clear kết quả cũ
        setSongs([]);
        setArtists([]);
        return;
      }

      try {
        setIsLoading(true);
        const response: any = await searchService.searchAll(keyword);

        if (response.success) {
          setSongs(response.data.songs || []);
          setArtists(response.data.artists || []);
        }
      } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword]);

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

  const formatTime = (totalSeconds: number) => {
    if (!totalSeconds) return "0:00";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 bg-[#121212] min-h-screen text-white overflow-y-auto custom-scrollbar p-8 pb-28 relative">

      {/* TRẠNG THÁI 1: KHÔNG CÓ TỪ KHÓA -> HIỂN THỊ LỊCH SỬ TÌM KIẾM */}
      {!keyword ? (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent searches</h2>
            {recentSearches.length > 0 && (
              <button
                onClick={handleClearAllRecents}
                className="text-sm font-semibold text-[#a7a7a7] hover:text-white transition"
              >
                Clear All
              </button>
            )}
          </div>

          {recentSearches.length === 0 ? (
            <div className="text-[#a7a7a7] italic mt-10">You have no recent searches.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recentSearches.map((item, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/home/search?q=${encodeURIComponent(item)}`)}
                  className="bg-[#181818] p-4 rounded-md flex items-center justify-between hover:bg-[#282828] transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Clock className="w-5 h-5 text-[#a7a7a7] shrink-0" />
                    <span className="font-semibold text-white truncate">{item}</span>
                  </div>

                  {/* Nút xóa từ khóa (Chỉ hiện khi rê chuột) */}
                  <button
                    onClick={(e) => handleRemoveRecent(e, item)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/20 rounded-full transition"
                  >
                    <X className="w-4 h-4 text-[#a7a7a7] hover:text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TRẠNG THÁI 2: CÓ TỪ KHÓA -> HIỂN THỊ KẾT QUẢ TÌM KIẾM */
        <>
          <div className="mb-8 mt-4">
            <h1 className="text-2xl font-bold">
              Search results for <span className="text-[#1ed760]">"{keyword}"</span>
            </h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#1ed760]" />
            </div>
          ) : (
            <div className="flex flex-col gap-10">

              {/* NẾU KHÔNG TÌM THẤY GÌ */}
              {songs.length === 0 && artists.length === 0 && (
                <div className="text-center py-20 text-[#a7a7a7]">
                  <div className="text-xl font-bold text-white mb-2">No results found for "{keyword}"</div>
                  <p>Please make sure your words are spelled correctly or use less or different keywords.</p>
                </div>
              )}

              {/* SECTION: NGHỆ SĨ (Hiển thị dạng Grid) */}
              {artists.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" /> Artists
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {artists.map((artist) => (
                      <div
                        key={artist._id}
                        onClick={() => navigate(`/home/profile/${artist._id}`)} // BƯỚC QUAN TRỌNG NHẤT Ở ĐÂY
                        className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition cursor-pointer group"
                      >
                        <div className="relative mb-4 pb-[100%] shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-full overflow-hidden">
                          <img
                            src={getImageUrl(artist.avatarUrl)}
                            alt={artist.name}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                        </div>
                        <div className="font-bold text-white truncate">{artist.name}</div>
                        <div className="text-sm text-[#a7a7a7] mt-1">Artist</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SECTION: BÀI HÁT (Hiển thị dạng List) */}
              {songs.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Music className="w-5 h-5" /> Songs
                  </h2>
                  <div className="flex flex-col">
                    {songs.map((song) => (
                      <div
                        key={song._id}
                        onClick={() => handlePlaySong(song)}
                        className="flex items-center justify-between p-3 hover:bg-white/10 rounded-md transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="relative w-12 h-12 shrink-0">
                            <img
                              src={getImageUrl(song.coverUrl)}
                              alt={song.title}
                              className="w-full h-full object-cover rounded shadow"
                            />
                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded">
                              <Play className="w-5 h-5 fill-white text-white" />
                            </div>
                          </div>

                          <div className="flex flex-col truncate pr-4">
                            <span className="font-semibold text-base text-white truncate group-hover:text-[#1ed760] transition-colors">
                              {song.title}
                            </span>
                            <span className="text-sm text-[#a7a7a7] truncate hover:underline">
                              {song.artist?.name || song.artist?.stageName || 'Unknown Artist'}
                            </span>
                          </div>
                        </div>

                        {/* THỜI GIAN & NÚT 3 CHẤM (MỞ MODAL) */}
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-[#a7a7a7] w-12 text-right">
                            {formatTime(song.duration)}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Ngăn phát nhạc khi ấn nút 3 chấm
                              setSelectedSongId(song._id);
                              setIsAddModalOpen(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-full transition"
                            title="Thêm vào Playlist"
                          >
                            <MoreHorizontal className="w-5 h-5 text-white" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          )}
        </>
      )}

      {/* CHÈN MODAL VÀO CUỐI TRANG */}
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