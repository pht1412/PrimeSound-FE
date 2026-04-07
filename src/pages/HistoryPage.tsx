// src/pages/HistoryPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Trash2, 
  Clock,
  Loader2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useHistory } from '../context/HistoryContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { getImageUrl } from '../services/historyService';

const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return 'Vừa xong';
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
};

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { history, isLoading, error, clearHistory, removeFromHistory, fetchHistory } = useHistory();
  const { playSong } = useMusicPlayer() as any;

  // Tải lại lịch sử khi trang được mount
  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  // Xử lý phát bài hát
  const handlePlaySong = (songData: any) => {
    if (!playSong) return;
    playSong({
      id: songData.id,
      title: songData.title,
      artist: songData.artist,
      cover: getImageUrl(songData.cover),
      audioUrl: songData.audioUrl
    });
  };

  // Xử lý xóa sạch lịch sử
  const handleClearHistory = async () => {
    if (history.length === 0) return;
    try {
      await clearHistory();
    } catch (err) {
      // Error đã được handle trong context
    }
  };

  // Xử lý xóa một bài
  const handleRemoveOne = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromHistory(songId);
  };

  // Phát tất cả từ đầu
  const handlePlayAll = () => {
    if (history.length > 0) {
      handlePlaySong(history[0]);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 bg-[#121212] min-h-screen flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#3be477]" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 bg-[#121212] min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => void fetchHistory()} 
            className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#121212] min-h-screen text-white overflow-y-auto custom-scrollbar">
      <div className="bg-gradient-to-b from-[#2a1a3a] to-[#121212] px-8 py-6 min-h-full pb-28">
        
        {/* Header với nút back */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/home')} 
            className="p-2 bg-black/40 hover:bg-black/70 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {/* Nút xóa sạch */}
          {history.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 rounded-full transition"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-sm font-medium">Xóa sạch lịch sử</span>
            </button>
          )}
        </div>

        {/* Hero Section */}
        <div className="flex items-end gap-6 mb-8">
          <div className="w-60 h-60 shadow-2xl shadow-black/50 shrink-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg flex items-center justify-center">
            <Clock className="w-24 h-24 text-purple-400/50" />
          </div>
          
          <div className="flex flex-col justify-end w-full pb-2">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Playlist</p>
            <h1 className="text-6xl font-bold mb-4 tracking-tight">
              Lịch sử nghe nhạc
            </h1>
            <p className="text-gray-300 text-sm mb-6 max-w-xl leading-relaxed">
              Những bài hát bạn đã nghe gần đây. Xóa sạch để bắt đầu lại từ đầu.
            </p>
            
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3 text-sm font-medium">
                <span>{history.length} bài hát</span>
              </div>
              
              <div 
                className="flex items-center gap-4 cursor-pointer hover:scale-105 transition"
                onClick={handlePlayAll}
              >
                <span className="font-semibold text-lg">Phát tất cả</span>
                <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center bg-[#1ed760] text-black border-none hover:bg-[#3be477]">
                  <Play className="w-6 h-6 fill-black ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách bài hát */}
        <div className="mt-10">
          {history.length === 0 ? (
            <div className="text-center py-20">
              <XCircle className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Chưa có lịch sử nghe nhạc</h3>
              <p className="text-gray-500">Hãy nghe một vài bài hát, chúng sẽ xuất hiện ở đây</p>
            </div>
          ) : (
            <div className="flex flex-col pb-10">
              {history.map((song, index) => (
                <div 
                  key={`${song.id}-${song.playedAt}`}
                  onClick={() => handlePlaySong(song)}
                  className="grid grid-cols-[40px_minmax(250px,2fr)_minmax(150px,1fr)_minmax(100px,1fr)] gap-4 px-4 py-3 items-center rounded-md transition group cursor-pointer hover:bg-white/10"
                >
                  {/* STT */}
                  <div className="text-gray-400 font-medium text-lg relative w-full">
                    <span className="group-hover:hidden">{index + 1}</span>
                    <Play className="w-4 h-4 fill-white hidden group-hover:block absolute top-[2px]" />
                  </div>
                  
                  {/* Thông tin bài hát */}
                  <div className="flex items-center gap-4 pr-4">
                    <img 
                      src={getImageUrl(song.cover)} 
                      alt={song.title} 
                      className="w-10 h-10 rounded shadow object-cover bg-[#333]"
                    />
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-base text-white truncate">
                        {song.title || 'Unknown Title'}
                      </span>
                      <span className="text-sm text-gray-400 truncate">
                        {song.artist || 'Unknown Artist'}
                      </span>
                    </div>
                  </div>

                  {/* Thời gian nghe */}
                  <div className="text-sm text-gray-400 truncate pr-4">
                    <span title={formatDate(song.playedAt)}>
                      {formatRelativeTime(song.playedAt)}
                    </span>
                  </div>

                  {/* Hành động */}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={(e) => handleRemoveOne(song.id, e)}
                      className="p-2 rounded-full hover:bg-white/10 transition opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400"
                      title="Xóa khỏi lịch sử"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HistoryPage;