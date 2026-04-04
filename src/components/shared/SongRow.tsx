import React, { useState, useMemo } from 'react';
import { useFavorites } from '../../context/FavoritesContext';

interface Song {
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

interface SongRowProps {
    song: Song;
    index: number;
    onPlayClick?: (song: Song) => void; // Callback khi click để phát nhạc
}

export const SongRow: React.FC<SongRowProps> = ({ song, index, onPlayClick }) => {
    // 1. LẤY CONTEXT: Trạng thái like toàn cục từ FavoritesContext
    const { isLiked, toggleLike } = useFavorites();
    
    // 2. LOCAL STATE: Chỉ dùng để track loading state của từng button
    const [isLikeLoading, setIsLikeLoading] = useState(false);

    // 3. DERIVED STATE: Lấy trạng thái like của bài hát này từ global context
    const currentlyLiked = useMemo(() => isLiked(song._id), [isLiked(song._id)]);

    // Hàm chuyển đổi giây sang định dạng M:SS (ví dụ 210s -> 3:30)
    const formatTime = (seconds?: number) => {
        if (!seconds) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleToggleLike = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài làm play nhạc
        
        if (isLikeLoading) return; // Prevent rapid clicks

        setIsLikeLoading(true);
        try {
          // Gọi global toggleLike - nó sẽ handle optimistic update + API sync
          await toggleLike(song._id);
        } catch (error) {
          console.error("❌ Lỗi khi tương tác tim:", error);
        } finally {
          setIsLikeLoading(false);
        }
    };

    return (
        <div 
            onClick={() => {
                if (onPlayClick) {
                    const songData = {
                        id: song._id,
                        title: song.title,
                        artist: song.artist,
                        uploadedBy: song.uploadedBy,
                        cover: song.coverUrl,
                        audioUrl: song.audioUrl || '',
                        _id: song._id,
                        coverUrl: song.coverUrl
                    };
                    onPlayClick(songData as any);
                }
            }}
            className="group grid grid-cols-[40px_minmax(250px,2fr)_minmax(150px,1fr)_minmax(150px,1fr)_120px] items-center px-4 py-2.5 hover:bg-[#282828]/60 rounded-lg transition-colors cursor-pointer text-[#b3b3b3] text-sm">

            {/* Cột 1: Số thứ tự (Index) */}
            <div className="text-center font-medium group-hover:text-white">
                {index}
            </div>

            {/* Cột 2: Hình ảnh + Tiêu đề + Nghệ sĩ */}
            <div className="flex items-center gap-4 pr-4">
                <img
                    src={song.coverUrl || "https://placehold.co/40x40/202020/FFFFFF?text=Cover"}
                    alt={song.title}
                    className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                />
                <div className="flex flex-col truncate">
                    <span className="text-base text-white font-medium truncate group-hover:underline">
                        {song.title}
                    </span>
                    <span className="text-[13px] hover:text-white transition-colors truncate">
                        {song.uploadedBy}
                    </span>
                </div>
            </div>

            {/* Cột 3: Release Date */}
            <div className="truncate pr-4">
                {song.releaseDate || 'Nov 4, 2023'}
            </div>

            {/* Cột 4: Album */}
            <div className="truncate pr-4">
                {song.album || 'Single'}
            </div>

            {/* Cột 5: Actions & Thời gian */}
            <div className="flex items-center justify-end gap-4" onClick={(e) => e.stopPropagation()}>
                {/* Nút Sync (Tạm thời là icon tĩnh theo Figma) */}
                <button className="text-[#b3b3b3] hover:text-white transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                </button>

                {/* Nút Trái Tim (Xử lý UX Like/Unlike mượt mà) */}
                <button 
                    onClick={handleToggleLike} 
                    disabled={isLikeLoading}
                    className={`transition transform active:scale-90 ${isLikeLoading ? 'opacity-50' : ''}`}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={currentlyLiked ? "#1ed760" : "none"} // Đổi màu fill nếu Liked
                        stroke={currentlyLiked ? "#1ed760" : "currentColor"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-colors duration-200 ${currentlyLiked ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'}`}
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>

                {/* Thời lượng bài hát */}
                <span className="w-10 text-right tabular-nums">
                    {formatTime(song.duration)}
                </span>

                {/* Nút 3 chấm (More Options) - Hiện mờ mờ, hover thì sáng lên */}
                <button className="text-[#b3b3b3] opacity-0 group-hover:opacity-100 hover:text-white transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                </button>
            </div>

        </div>
    );
};