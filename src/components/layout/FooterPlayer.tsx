// src/components/layout/FooterPlayer.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useFavorites } from '../../context/FavoritesContext';
import { userService } from '../../services/userService';
import { repostService } from '../../services/repostService';
import { toast } from 'react-toastify';

export const FooterPlayer = () => {
  // 1. LẤY DỮ LIỆU TỪ CONTEXT
  const { currentSong, isPlaying, togglePlay, progress, currentTime, duration, seek, audioRef } = useMusicPlayer();
  const { isLiked, toggleLike } = useFavorites();

  // 2. CÁC STATE QUẢN LÝ KÉO TRƯỢT (DRAG)
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  // 3. LIKE STATE: Chỉ track loading state, trạng thái like lấy từ global context
  const [likeLoading, setLikeLoading] = useState(false);

  // ==================== BẮT ĐẦU LOGIC REPOST ====================
  const [isReposted, setIsReposted] = useState(false);
  const [repostLoading, setRepostLoading] = useState(false);

  // 1. Tự động kiểm tra trạng thái Repost mỗi khi bài hát thay đổi
  useEffect(() => {
    const checkRepostStatus = async () => {
      if (!currentSong) return;
      try {
        const user: any = await userService.getMe();
        const res: any = await repostService.getUserReposts(user._id || user.id);
        const userReposts = res.data?.reposts || [];

        // Kiểm tra xem bài hát hiện tại có trong mảng reposts không
        const isFound = userReposts.some((r: any) => r.repostedItem?._id === currentSong.id);
        setIsReposted(isFound);
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái repost:", error);
      }
    };

    checkRepostStatus();
  }, [currentSong]);

  // 2. Hàm xử lý khi Click vào nút Repost
  const handleToggleRepost = async () => {
    if (!currentSong || repostLoading) return;
    setRepostLoading(true);

    try {
      if (isReposted) {
        // Hủy Repost
        await repostService.deleteRepost(currentSong.id);
        setIsReposted(false);
        toast.success("Đã xóa bài đăng lại!");
      } else {
        // Tạo Repost mới
        await repostService.createRepost({ itemId: currentSong.id, itemType: 'Song' });
        setIsReposted(true);
        toast.success("Đã đăng lại bài hát!");
      }
    } catch (error: any) {
      // Bắt lỗi nếu user thao tác quá nhanh dẫn đến Duplicate (409)
      if (error?.status === 409 || error?.message?.includes('đã đăng lại')) {
        toast.info("Bạn đã đăng lại bài này rồi!");
        setIsReposted(true); // Cập nhật lại UI cho đúng
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } finally {
      setRepostLoading(false);
    }
  };
  // ==================== KẾT THÚC LOGIC REPOST ====================

  // 4. DERIVED STATE: Lấy trạng thái like của bài hát hiện tại
  const currentlyLiked = useMemo(() => {
    return currentSong ? isLiked(currentSong.id) : false;
  }, [currentSong?.id, isLiked]);

  // 5. REFERENCES
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  // --- HÀM TIỆN ÍCH ---
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- LOGIC: CẬP NHẬT ÂM LƯỢNG CHO THẺ AUDIO ---
  useEffect(() => {
    if (audioRef?.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, audioRef]);

  // --- LOGIC: XỬ LÝ KÉO TRƯỢT MƯỢT MÀ TỪ WINDOW ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingProgress && progressBarRef.current && duration) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setDragProgress(p * 100);
      }

      if (isDraggingVolume && volumeBarRef.current) {
        const rect = volumeBarRef.current.getBoundingClientRect();
        const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setVolume(v);
        if (isMuted && v > 0) setIsMuted(false);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDraggingProgress && progressBarRef.current && duration) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        seek(p * duration);
        setIsDraggingProgress(false);
      }

      if (isDraggingVolume) {
        setIsDraggingVolume(false);
      }
    };

    if (isDraggingProgress || isDraggingVolume) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingProgress, isDraggingVolume, duration, seek, isMuted]);

  // --- LOGIC: CLICK ĐỂ MUTE/UNMUTE ---
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume > 0 ? prevVolume : 1);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
    }
  };

  // --- LOGIC: LIKE/UNLIKE BÀI HÁT - Sử dụng global context ---
  const handleToggleLike = async () => {
    if (!currentSong || likeLoading) return;

    setLikeLoading(true);
    try {
      // Gọi global toggleLike - nó sẽ handle optimistic update + API sync
      await toggleLike(currentSong.id);
    } catch (error) {
      console.error("❌ Lỗi khi like/unlike bài hát:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  // Tính toán thời gian & % tiến trình để hiển thị UI
  const displayProgress = isDraggingProgress ? dragProgress : progress;
  const displayTime = isDraggingProgress ? (dragProgress / 100) * duration : currentTime;
  const displayVolume = isMuted ? 0 : volume;


  return (
    <footer className="h-[90px] w-full bg-[#181818] border-t border-[#282828] flex items-center justify-between px-4 z-50 flex-shrink-0 select-none">

      {/* 1. THÔNG TIN BÀI HÁT */}
      <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
        {currentSong ? (
          <>
            <img src={currentSong.cover} alt="Album art" className="w-14 h-14 rounded-md object-cover shadow-lg" />
            <div className="flex flex-col">
              <a href="#" className="text-white text-sm font-semibold hover:underline line-clamp-1">{currentSong.title}</a>
              <a href="#" className="text-[#b3b3b3] text-xs hover:underline hover:text-white line-clamp-1">{currentSong.artist}</a>
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-sm">Chưa có bài hát</div>
        )}
      </div>

      {/* 2. BẢNG ĐIỀU KHIỂN & THANH TIẾN TRÌNH */}
      <div className="flex flex-col items-center justify-center w-[40%] max-w-[722px] gap-2">
        <div className="flex items-center gap-6">
          <button className="text-[#b3b3b3] hover:text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></button>

          <button
            onClick={togglePlay}
            disabled={!currentSong}
            className={`w-8 h-8 flex items-center justify-center bg-white rounded-full text-black transition-transform ${currentSong ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'}`}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
            )}
          </button>

          {/* NÚT LIKE/UNLIKE */}
          <button
            onClick={handleToggleLike}
            disabled={!currentSong || likeLoading}
            className={`text-[#b3b3b3] hover:text-white transition ${!currentSong ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={currentlyLiked ? "#1ed760" : "none"}
              stroke={currentlyLiked ? "#1ed760" : "currentColor"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors duration-200"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          {/* NÚT REPOST / UNREPOST */}
          <button
            onClick={handleToggleRepost}
            disabled={!currentSong || repostLoading}
            className={`transition-colors duration-200 ${!currentSong ? 'opacity-50 cursor-not-allowed text-[#b3b3b3]'
                : isReposted ? 'text-[#1ed760] hover:text-[#1ed760]/80'
                  : 'text-[#b3b3b3] hover:text-white'
              }`}
            title={isReposted ? "Hủy đăng lại" : "Đăng lại"}
          >
            {repostLoading ? (
              // Icon loading xoay xoay khi đang gọi API
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              // Icon Refresh (Repost)
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 1l4 4-4 4"></path>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <path d="M7 23l-4-4 4-4"></path>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
            )}
          </button>        </div>

        {/* THANH TIẾN TRÌNH (Bắt sự kiện MouseDown) */}
        <div className="flex items-center w-full gap-2 text-xs text-[#a7a7a7]">
          <span className="min-w-[35px] text-right">{formatTime(displayTime)}</span>

          <div
            ref={progressBarRef}
            className="h-1 flex-1 rounded-full group cursor-pointer flex items-center relative py-2"
            onMouseDown={(e) => {
              if (duration) {
                setIsDraggingProgress(true);
                // Cập nhật vị trí ngay lập tức khi click chuột xuống
                const rect = e.currentTarget.getBoundingClientRect();
                setDragProgress(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100);
              }
            }}
          >
            {/* Thanh màu nền */}
            <div className="absolute h-1 w-full bg-[#4d4d4d] rounded-full top-[50%] translate-y-[-50%]"></div>
            {/* Thanh chạy màu xanh/trắng */}
            <div
              className={`h-1 rounded-full relative z-10 ${isDraggingProgress ? 'bg-[#1ed760]' : 'bg-white group-hover:bg-[#1ed760]'}`}
              style={{ width: `${displayProgress}%` }}
            >
              {/* Nút tròn nhỏ (Thumb) */}
              <div className={`w-3 h-3 bg-white rounded-full absolute right-[-6px] top-[-4px] shadow ${isDraggingProgress ? 'block' : 'hidden group-hover:block'}`}></div>
            </div>
          </div>

          <span className="min-w-[35px]">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. CÔNG CỤ & ÂM LƯỢNG */}
      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px] text-[#b3b3b3]">

        {/* NÚT LOA MUTE / UNMUTE (Đổi Icon theo Volume) */}
        <button className="hover:text-white w-5 flex justify-center" onClick={toggleMute}>
          {displayVolume === 0 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v6a3 3 0 0 0 3 3h3l5 5V4.98"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          ) : displayVolume < 0.5 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          )}
        </button>

        {/* THANH KÉO ÂM LƯỢNG */}
        <div
          ref={volumeBarRef}
          className="w-24 h-1 rounded-full flex items-center cursor-pointer group relative py-2"
          onMouseDown={(e) => {
            setIsDraggingVolume(true);
            const rect = e.currentTarget.getBoundingClientRect();
            const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setVolume(v);
            if (isMuted && v > 0) setIsMuted(false);
          }}
        >
          {/* Thanh nền */}
          <div className="absolute h-1 w-full bg-[#4d4d4d] rounded-full top-[50%] translate-y-[-50%]"></div>
          {/* Thanh mức âm lượng */}
          <div className={`h-1 rounded-full relative z-10 ${isDraggingVolume ? 'bg-[#1ed760]' : 'bg-white group-hover:bg-[#1ed760]'}`} style={{ width: `${displayVolume * 100}%` }}>
            {/* Nút tròn nhỏ */}
            <div className={`w-3 h-3 bg-white rounded-full absolute right-[-6px] top-[-4px] shadow ${isDraggingVolume ? 'block' : 'hidden group-hover:block'}`}></div>
          </div>
        </div>

      </div>
    </footer>
  );
};
