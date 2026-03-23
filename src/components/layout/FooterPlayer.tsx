// src/components/layout/FooterPlayer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export const FooterPlayer = () => {
  // 1. LẤY DỮ LIỆU TỪ CONTEXT (Lấy thêm audioRef để chỉnh âm lượng)
  const { currentSong, isPlaying, togglePlay, progress, currentTime, duration, seek, audioRef } = useMusicPlayer();

  // 2. CÁC STATE QUẢN LÝ KÉO TRƯỢT (DRAG)
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [dragProgress, setDragProgress] = useState(0); // Lưu % thanh tiến trình khi đang kéo

  const [volume, setVolume] = useState(1); // Âm lượng từ 0 -> 1
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1); // Lưu lại âm lượng trước khi Mute
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  // 3. REFERENCES (Để đo kích thước thanh cuộn)
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
      // Khi đang kéo thanh TUA NHẠC
      if (isDraggingProgress && progressBarRef.current && duration) {
        const rect = progressBarRef.current.getBoundingClientRect();
        // Tính % vị trí chuột (giới hạn từ 0 đến 1)
        const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setDragProgress(p * 100);
      }

      // Khi đang kéo thanh ÂM LƯỢNG
      if (isDraggingVolume && volumeBarRef.current) {
        const rect = volumeBarRef.current.getBoundingClientRect();
        const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setVolume(v);
        if (isMuted && v > 0) setIsMuted(false); // Đang kéo thì bỏ mute
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Khi thả chuột ở thanh TUA NHẠC -> Gọi hàm seek() để tua thật
      if (isDraggingProgress && progressBarRef.current && duration) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        seek(p * duration);
        setIsDraggingProgress(false);
      }

      // Khi thả chuột ở thanh ÂM LƯỢNG
      if (isDraggingVolume) {
        setIsDraggingVolume(false);
      }
    };

    // Chỉ gán sự kiện cho window khi đang có thao tác kéo
    if (isDraggingProgress || isDraggingVolume) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    // Dọn dẹp sự kiện
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingProgress, isDraggingVolume, duration, seek, isMuted]);


  // --- LOGIC: CLICK ĐỂ MUTE/UNMUTE ---
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume > 0 ? prevVolume : 1); // Khôi phục volume
    } else {
      setPrevVolume(volume); // Cất volume hiện tại đi
      setIsMuted(true);
      setVolume(0);
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
          
          <button className="text-[#b3b3b3] hover:text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg></button>
        </div>
        
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