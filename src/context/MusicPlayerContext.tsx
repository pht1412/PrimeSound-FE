// src/context/MusicPlayerContext.tsx
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { songService } from "../services/songService";
import { useHistory } from "./HistoryContext";

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  releaseDate?: string;
  album?: string;
  duration?: number;
  uploadedBy?: string;
  cover: string;
  audioUrl: string;
}

export type RepeatMode = "off" | "all" | "one";

export interface PlaySongOptions {
  /** Danh sách để Next/Previous/Shuffle (vd: cả hàng Discovery) */
  queue?: Song[];
}

interface MusicPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  playSong: (song: Song, opts?: PlaySongOptions) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  shuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: RepeatMode;
  cycleRepeat: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  // Hook để thêm bài hát vào lịch sử
  const { addToHistory } = useHistory();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Song[]>([]);
  const currentIndexRef = useRef(0);
  const currentSongRef = useRef<Song | null>(null);
  const repeatModeRef = useRef<RepeatMode>("off");
  const shuffleRef = useRef(false);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);
  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);
  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const playNext = useCallback(() => {
    const q = queueRef.current;
    const idx = currentIndexRef.current;
    if (!q.length) {
      setIsPlaying(false);
      return;
    }

    if (shuffleRef.current && q.length > 1) {
      let ni = idx;
      while (ni === idx) ni = Math.floor(Math.random() * q.length);
      setCurrentIndex(ni);
      setCurrentSong(q[ni]);
      setIsPlaying(true);
      return;
    }

    let next = idx + 1;
    if (next >= q.length) {
      if (repeatModeRef.current === "all") next = 0;
      else {
        setIsPlaying(false);
        return;
      }
    }
    setCurrentIndex(next);
    setCurrentSong(q[next]);
    setIsPlaying(true);
  }, []);

  const playPrevious = useCallback(() => {
    const q = queueRef.current;
    const idx = currentIndexRef.current;
    if (!q.length) return;

    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    let prev = idx - 1;
    if (prev < 0) {
      if (repeatModeRef.current === "all") prev = q.length - 1;
      else {
        if (audio) {
          audio.currentTime = 0;
          setCurrentTime(0);
        }
        return;
      }
    }
    setCurrentIndex(prev);
    setCurrentSong(q[prev]);
    setIsPlaying(true);
  }, []);

  const playNextRef = useRef(playNext);
  playNextRef.current = playNext;

  const playSong = useCallback((song: Song, opts?: PlaySongOptions) => {
    // ================= BẮT ĐẦU: CHỐT CHẶN BÀI HÁT TRÙNG LẶP =================
    // Kiểm tra xem bài hát em vừa bấm có ID trùng với bài đang phát hay không
    if (currentSongRef.current?.id === song.id) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          // Nếu đang tạm dừng -> Phát tiếp tục
          audioRef.current.play().catch(error => console.warn("Trình duyệt chặn:", error));
          setIsPlaying(true);
        } else {
          // Nếu đang hát -> Tạm dừng
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
      // QUAN TRỌNG NHẤT: Bắt buộc dùng 'return' để thoát hàm ngay tại đây!
      // Không cho code chạy xuống dưới để tránh việc set lại 'currentSong' làm reset nhạc.
      return; 
    }
    // ================= KẾT THÚC: CHỐT CHẶN =================

    // Thêm bài hát vào lịch sử nghe nhạc
    addToHistory({
      id: song.id,
      title: song.title,
      artist: song.artist,
      cover: song.cover,
      audioUrl: song.audioUrl,
      playedAt: Date.now()
    });

    if (opts?.queue && opts.queue.length > 0) {
      const q = [...opts.queue];
      const idx = q.findIndex((s) => s.id === song.id);
      if (idx >= 0) {
        setQueue(q);
        setCurrentIndex(idx);
        setCurrentSong(q[idx]);
      } else {
        setQueue([song]);
        setCurrentIndex(0);
        setCurrentSong(song);
      }
    } else {
      setQueue([song]);
      setCurrentIndex(0);
      setCurrentSong(song);
    }
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSongRef.current) return;
    if (audioRef.current.paused) {
      void audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => !s);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, []);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.play().catch(error => console.warn("Trình duyệt tạm chặn tự phát nhạc:", error)); setIsPlaying(true);
    }
  }, [currentSong]);

  const handleEnded = useCallback(async () => {
    if (repeatModeRef.current === "one" && audioRef.current) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    const ended = currentSongRef.current;
    if (ended) {
      try {
        await songService.incrementPlayCount(ended.id);
      } catch (e) {
        console.error("Lỗi khi tăng view:", e);
      }
    }

    playNextRef.current();
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        currentTime,
        duration,
        playSong,
        togglePlay,
        seek,
        playNext,
        playPrevious,
        shuffle,
        toggleShuffle,
        repeatMode,
        cycleRepeat,
        audioRef,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration || 0);
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            const d = audioRef.current.duration;
            setProgress(d ? (audioRef.current.currentTime / d) * 100 : 0);
          }
        }}
        onEnded={handleEnded}
      />
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) throw new Error("useMusicPlayer phải nằm trong MusicPlayerProvider");
  return context;
};
