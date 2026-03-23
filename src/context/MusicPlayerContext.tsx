// src/context/MusicPlayerContext.tsx
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { songService } from '../services/songService'; // Import service để gọi API tăng view

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;
}

interface MusicPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;     // Thêm thời gian hiện tại
  duration: number;        // Thêm tổng thời gian
  playSong: (song: Song) => void;
  togglePlay: () => void;
  seek: (time: number) => void; // Thêm hàm tua nhạc
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Hàm xử lý tua nhạc
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong]);

  return (
    <MusicPlayerContext.Provider value={{ currentSong, isPlaying, progress, currentTime, duration, playSong, togglePlay, seek, audioRef }}>
      {children}
      <audio 
        ref={audioRef} 
        onLoadedMetadata={() => {
          // Khi tải xong meta data của file mp3, lấy luôn tổng thời gian
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
          }
        }}
        onEnded={async () => {
          setIsPlaying(false);
          // 💥 ĐIỂM ĂN TIỀN: Khi hết bài, âm thầm gọi API tăng View!
          if (currentSong) {
            try {
              await songService.incrementPlayCount(currentSong.id);
              console.log("Đã tăng view cho bài hát:", currentSong.title);
            } catch (error) {
              console.error("Lỗi khi tăng view:", error);
            }
          }
        }}
      />
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) throw new Error("useMusicPlayer phải nằm trong MusicPlayerProvider");
  return context;
};