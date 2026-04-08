import { useEffect, useRef, useState, type KeyboardEvent, type UIEvent } from "react";
import {
  Clock,
  Download,
  Heart,
  Home,
  Library,
  ListMusic,
  Maximize2,
  MessageCircle,
  Mic2,
  MonitorSpeaker,
  MoreHorizontal,
  Music,
  Pause,
  Play,
  PlusSquare,
  Repeat,
  Search,
  Send,
  Shuffle,
  SkipBack,
  SkipForward,
  Smile,
  Volume2,
  X,
} from "lucide-react";
import { useComingSoon } from "../context/ComingSoonContext";

const THEME = {
  accent: "#1DB954",
  gradientTop: "#4c1d95",
} as const;

type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
  date: string;
  time: string;
  liked: boolean;
};

type Comment = {
  id: number;
  user: string;
  avatar: string;
  colorClass: string;
  content: string;
  time: string;
  likes: number;
  isLiked: boolean;
};

const songs: Song[] = [
  { id: 1, title: "Mưa Mùa Ngâu Nằm Cạnh", artist: "Vũ Cát Tường", album: "Inner Me", date: "2 ngày trước", time: "4:12", liked: true },
  { id: 2, title: "Lạ Lùng", artist: "Vu.", album: "Lạ Lùng (Single)", date: "5 ngày trước", time: "3:45", liked: true },
  { id: 3, title: "Nàng Thơ", artist: "Hoàng Dũng", album: "25", date: "1 tuần trước", time: "5:20", liked: false },
  { id: 4, title: "Có Chàng Trai Viết Lên Cây", artist: "Phan Mạnh Quỳnh", album: "Mắt Biếc OST", date: "2 tuần trước", time: "4:58", liked: true },
  { id: 5, title: "Một Đêm Say", artist: "Thịnh Suy", album: "Một Đêm Say", date: "1 tháng trước", time: "3:15", liked: false },
  { id: 6, title: "Chuyện Rằng", artist: "Thịnh Suy", album: "Chuyện Rằng", date: "1 tháng trước", time: "4:05", liked: false },
  { id: 7, title: "Bước Qua Nhau", artist: "Vu.", album: "Một Vạn Năm", date: "2 tháng trước", time: "4:18", liked: true },
  { id: 8, title: "Thói Quen", artist: "Hoàng Dũng, GDucky", album: "25", date: "2 tháng trước", time: "3:50", liked: false },
];

const initialComments: Comment[] = [
  {
    id: 1,
    user: "Minh Tuấn",
    avatar: "MT",
    colorClass: "bg-blue-600",
    content: "Nghe bài đầu tiên cuốn quá, hợp ngày mưa thật sự.",
    time: "2 giờ trước",
    likes: 124,
    isLiked: false,
  },
  {
    id: 2,
    user: "Anh Khoa",
    avatar: "AK",
    colorClass: "bg-green-600",
    content: "List này chill phết, thanks ad đã tạo playlist nha.",
    time: "5 giờ trước",
    likes: 89,
    isLiked: true,
  },
  {
    id: 3,
    user: "Thảo Vy",
    avatar: "TV",
    colorClass: "bg-purple-600",
    content: "Nàng Thơ lúc nào nghe cũng thấy bồi hồi...",
    time: "1 ngày trước",
    likes: 56,
    isLiked: false,
  },
];

export default function MusicWebAppPage() {
  const { showComingSoon } = useComingSoon();
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeSong, setActiveSong] = useState(1);
  const [progress, setProgress] = useState(35);
  const [isScrolled, setIsScrolled] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setProgress((currentProgress) => (currentProgress >= 100 ? 0 : currentProgress + 0.5));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSendComment = () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment) {
      return;
    }

    setComments((currentComments) => [
      ...currentComments,
      {
        id: Date.now(),
        user: "Bạn",
        avatar: "ME",
        colorClass: "bg-[#1DB954]",
        content: trimmedComment,
        time: "Vừa xong",
        likes: 0,
        isLiked: false,
      },
    ]);
    setNewComment("");
  };

  const handleCommentKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendComment();
    }
  };

  const handlePlaylistScroll = (event: UIEvent<HTMLDivElement>) => {
    setIsScrolled(event.currentTarget.scrollTop > 150);
  };

  const currentTrack = songs.find((song) => song.id === activeSong) ?? songs[0];

  return (
    <div className="flex h-screen w-full min-w-[1024px] flex-col overflow-hidden bg-black font-sans text-white">
      <div className="flex flex-1 gap-2 overflow-hidden p-2 pb-0">
        <div className="flex w-60 shrink-0 flex-col overflow-hidden rounded-lg bg-[#121212]">
          <div className="space-y-5 p-6">
            <div className="flex cursor-pointer items-center gap-4 font-bold text-white transition-colors">
              <Home size={24} />
              <span>Trang chủ</span>
            </div>
            <div className="flex cursor-pointer items-center gap-4 font-bold text-[#B3B3B3] transition-colors hover:text-white">
              <Search size={24} />
              <span>Tìm kiếm</span>
            </div>
            <div className="flex cursor-pointer items-center gap-4 font-bold text-[#B3B3B3] transition-colors hover:text-white">
              <Library size={24} />
              <span>Thư viện</span>
            </div>
          </div>

          <div className="mt-4 space-y-4 px-6">
            <div className="flex cursor-pointer items-center gap-4 font-bold text-[#B3B3B3] transition-colors hover:text-white">
              <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#B3B3B3] text-black">
                <PlusSquare size={16} />
              </div>
              <span>Tạo playlist</span>
            </div>
            <div className="flex cursor-pointer items-center gap-4 font-bold text-[#B3B3B3] transition-colors hover:text-white">
              <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-500 to-purple-400 text-white">
                <Heart size={14} fill="currentColor" />
              </div>
              <span>Bài hát đã thích</span>
            </div>
          </div>

          <div className="custom-scrollbar mx-6 mt-4 flex-1 overflow-y-auto border-t border-white/10 pt-4">
            <p className="cursor-pointer py-2 text-sm text-[#B3B3B3] hover:text-white">V-Pop Indie Chill</p>
            <p className="cursor-pointer py-2 text-sm text-[#B3B3B3] hover:text-white">Lofi Làm Việc</p>
            <p className="cursor-pointer py-2 text-sm text-[#B3B3B3] hover:text-white">Rap Việt Quẩy Lên</p>
            <p className="cursor-pointer py-2 text-sm text-[#B3B3B3] hover:text-white">Nhạc Hoa Lời Việt</p>
            <p className="cursor-pointer py-2 text-sm text-[#B3B3B3] hover:text-white">US-UK Top Hits 2024</p>
          </div>
        </div>

        <div
          className="custom-scrollbar relative flex flex-1 flex-col overflow-y-auto rounded-lg bg-[#121212]"
          onScroll={handlePlaylistScroll}
        >
          <div
            className={`sticky top-0 z-20 flex h-16 items-center justify-between px-6 transition-all duration-300 ${
              isScrolled ? "border-b border-white/10 bg-[#121212] shadow-lg" : "bg-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50">
                <Search size={16} />
              </div>
            </div>
            <span className={`font-bold transition-opacity ${isScrolled ? "opacity-100" : "opacity-0"}`}>
              V-Pop Indie Chill
            </span>
            <div className="flex items-center gap-3">
              <button className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-transform hover:scale-105">
                Nâng cấp
              </button>
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#1E1E1E] text-xs font-bold">
                MT
              </div>
            </div>
          </div>

          <div
            className="absolute left-0 right-0 top-0 z-0 h-[340px]"
            style={{ background: `linear-gradient(to bottom, ${THEME.gradientTop}, #121212)` }}
          />

          <div className="relative z-10 flex items-end gap-6 px-6 pb-6 pt-6">
            <div className="h-[232px] w-[232px] shrink-0 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
              <div className="flex h-full w-full items-center justify-center rounded border border-white/10 bg-gradient-to-br from-indigo-500 to-purple-600 text-6xl shadow-inner">
                <Music size={64} className="text-white/85" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold uppercase tracking-wider">Playlist</span>
              <h1 className="mb-2 text-7xl font-black leading-none tracking-tighter">
                V-Pop Indie
                <br />
                Chill
              </h1>
              <p className="text-sm font-medium text-[#B3B3B3]">
                Những giai điệu chữa lành tâm hồn cho những ngày mưa rơi rả rích.
              </p>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                <span className="cursor-pointer font-bold text-white hover:underline">Spotify</span>
                <span className="text-[#B3B3B3]">• 245,321 lượt thích</span>
                <span className="text-[#B3B3B3]">• 50 bài hát, 3 giờ 15 phút</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-6 bg-black/20 px-6 py-4">
            <button
              onClick={() => setIsPlaying((playing) => !playing)}
              className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: THEME.accent }}
            >
              {isPlaying ? (
                <Pause size={28} fill="black" className="text-black" />
              ) : (
                <Play size={28} fill="black" className="ml-1 text-black" />
              )}
            </button>
            <button className="text-[#1DB954] transition-transform hover:scale-105">
              <Heart size={32} fill="currentColor" />
            </button>
            <button className="text-[#B3B3B3] transition-colors hover:text-white">
              <Download size={32} />
            </button>
            <button className="text-[#B3B3B3] transition-colors hover:text-white">
              <MoreHorizontal size={32} />
            </button>
          </div>

          <div className="relative z-10 px-6 pb-10">
            <div className="mb-4 grid grid-cols-[40px_minmax(200px,2fr)_minmax(150px,1.5fr)_minmax(120px,1fr)_80px] border-b border-white/10 px-4 pb-2 text-sm text-[#B3B3B3]">
              <div className="text-center">#</div>
              <div>Tiêu đề</div>
              <div>Album</div>
              <div>Ngày thêm</div>
              <div className="flex justify-end">
                <Clock size={16} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {songs.map((song, index) => {
                const isActive = activeSong === song.id;

                return (
                  <div
                    key={song.id}
                    onClick={() => setActiveSong(song.id)}
                    className={`group grid cursor-pointer grid-cols-[40px_minmax(200px,2fr)_minmax(150px,1.5fr)_minmax(120px,1fr)_80px] items-center rounded-md px-4 py-2.5 text-sm transition-colors ${
                      isActive ? "bg-white/10" : "hover:bg-[#2A2A2A]"
                    }`}
                  >
                    <div className="flex w-6 justify-center text-center text-[#B3B3B3]">
                      {isActive && isPlaying ? (
                        <div className="flex h-4 items-end gap-[2px]">
                          <div className="w-[3px] animate-[bounce_0.8s_ease-in-out_infinite] bg-[#1DB954]" />
                          <div className="w-[3px] animate-[bounce_1.1s_ease-in-out_infinite_0.1s] bg-[#1DB954]" />
                          <div className="w-[3px] animate-[bounce_0.9s_ease-in-out_infinite_0.2s] bg-[#1DB954]" />
                          <div className="w-[3px] animate-[bounce_1.2s_ease-in-out_infinite_0.3s] bg-[#1DB954]" />
                        </div>
                      ) : (
                        <span className="group-hover:hidden">{index + 1}</span>
                      )}
                      {!isActive && <Play size={14} fill="white" className="hidden text-white group-hover:block" />}
                    </div>

                    <div className="flex items-center gap-3 overflow-hidden pr-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-white/5 bg-[#282828] text-xs">
                        <Music size={16} className="text-[#B3B3B3]" />
                      </div>
                      <div className="truncate">
                        <div className={`truncate font-medium ${isActive ? "text-[#1DB954]" : "text-white"}`}>
                          {song.title}
                        </div>
                        <div className="truncate text-[13px] text-[#B3B3B3] transition-colors group-hover:text-white">
                          {song.artist}
                        </div>
                      </div>
                    </div>

                    <div className="truncate pr-4 text-[#B3B3B3] transition-colors group-hover:text-white">{song.album}</div>
                    <div className="truncate pr-4 text-[#B3B3B3]">{song.date}</div>

                    <div className="flex items-center justify-end gap-3 text-[#B3B3B3]">
                      <Heart
                        size={16}
                        className={`transition-all ${
                          song.liked ? "fill-[#1DB954] text-[#1DB954]" : "opacity-0 hover:text-white group-hover:opacity-100"
                        }`}
                      />
                      <span className="w-8 text-right [font-variant-numeric:tabular-nums]">{song.time}</span>
                      <MoreHorizontal size={16} className="opacity-0 transition-all hover:text-white group-hover:opacity-100" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative flex w-80 shrink-0 flex-col overflow-hidden rounded-lg border-l border-white/5 bg-[#121212]">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-5">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <MessageCircle size={20} className="text-[#1DB954]" /> Bình luận
            </h2>
            <button className="rounded-full p-1 text-[#B3B3B3] transition-colors hover:bg-white/10 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
            {comments.map((comment) => (
              <div key={comment.id} className="animate-fadeIn rounded-xl border border-white/5 bg-[#1E1E1E] p-3.5 shadow-sm">
                <div className="flex gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${comment.colorClass} text-xs font-bold shadow-sm`}
                  >
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="cursor-pointer text-sm font-bold text-white transition-colors hover:text-[#1DB954]">
                        {comment.user}
                      </span>
                      <span className="text-[10px] text-[#B3B3B3]">{comment.time}</span>
                    </div>
                    <p className="mt-1 text-sm leading-snug text-[#E5E5E5]">{comment.content}</p>
                    <div className="mt-2.5 flex items-center gap-4">
                      <button
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                          comment.isLiked ? "text-[#1DB954]" : "text-[#B3B3B3] hover:text-white"
                        }`}
                      >
                        <Heart size={14} className={comment.isLiked ? "fill-current" : ""} />
                        {comment.likes}
                      </button>
                      <button className="text-xs font-medium text-[#B3B3B3] transition-colors hover:text-white">
                        Trả lời
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>

          <div className="shrink-0 border-t border-white/5 bg-[#181818] p-4">
            <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
              {["Đỉnh", "Chill quá", "Nhạc dính"].map((text) => (
                <button
                  key={text}
                  onClick={() => setNewComment(text)}
                  className="whitespace-nowrap rounded-full border border-white/5 bg-[#2A2A2A] px-2.5 py-1 text-[11px] font-medium text-[#B3B3B3] transition-colors hover:border-white/20 hover:text-white"
                >
                  {text}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <div className="flex flex-1 items-center rounded-xl border border-white/10 bg-[#1E1E1E] px-3 py-2 transition-colors focus-within:border-[#1DB954]/50">
                <input
                  type="text"
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  onKeyDown={handleCommentKeyDown}
                  placeholder="Thêm bình luận..."
                  className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-[#B3B3B3]"
                />
                <Smile size={18} className="ml-2 cursor-pointer text-[#B3B3B3] transition-colors hover:text-white" />
              </div>
              <button
                onClick={handleSendComment}
                disabled={!newComment.trim()}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  newComment.trim()
                    ? "bg-[#1DB954] text-black hover:scale-105"
                    : "cursor-not-allowed bg-[#2A2A2A] text-[#B3B3B3] opacity-50"
                }`}
              >
                <Send size={16} className={newComment.trim() ? "ml-0.5" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="z-50 flex h-[90px] shrink-0 items-center justify-between border-t border-white/10 bg-[#181818] px-4">
        <div className="flex w-[30%] min-w-[180px] items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <Music size={20} className="text-white/80" />
          </div>
          <div className="flex flex-col justify-center overflow-hidden">
            <button onClick={showComingSoon} className="truncate text-sm font-bold text-white hover:underline text-left cursor-pointer">
              {currentTrack.title}
            </button>
            <button onClick={showComingSoon} className="truncate text-xs text-[#B3B3B3] hover:text-white hover:underline text-left cursor-pointer">
              {currentTrack.artist}
            </button>
          </div>
          <button className="ml-2 text-[#1DB954] transition-transform hover:scale-110">
            <Heart size={16} fill="currentColor" />
          </button>
        </div>

        <div className="flex w-[40%] max-w-[722px] flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-6">
            <button className="text-[#B3B3B3] transition-colors hover:text-white">
              <Shuffle size={16} />
            </button>
            <button className="text-[#B3B3B3] transition-colors hover:text-white">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              onClick={() => setIsPlaying((playing) => !playing)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause size={16} fill="black" className="text-black" />
              ) : (
                <Play size={16} fill="black" className="ml-1 text-black" />
              )}
            </button>
            <button className="text-[#B3B3B3] transition-colors hover:text-white">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button className="relative text-[#1DB954] transition-colors hover:text-[#1DB954]/80">
              <Repeat size={16} />
              <div className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#1DB954]" />
            </button>
          </div>

          <div className="flex w-full items-center gap-2 text-[11px] font-medium text-[#B3B3B3] [font-variant-numeric:tabular-nums]">
            <span>1:24</span>
            <div className="group relative flex h-1 flex-1 cursor-pointer items-center rounded-full bg-[#4D4D4D]">
              <div className="h-full rounded-full bg-white transition-colors group-hover:bg-[#1DB954]" style={{ width: `${progress}%` }} />
              <div
                className="absolute h-3 w-3 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
            <span>{currentTrack.time}</span>
          </div>
        </div>

        <div className="flex w-[30%] min-w-[180px] items-center justify-end gap-4 text-[#B3B3B3]">
          <button className="transition-colors hover:text-white" title="Lời bài hát">
            <Mic2 size={16} />
          </button>
          <button className="transition-colors hover:text-white" title="Danh sách chờ">
            <ListMusic size={16} />
          </button>
          <button className="transition-colors hover:text-white" title="Kết nối thiết bị">
            <MonitorSpeaker size={16} />
          </button>

          <div className="group flex w-24 items-center gap-2">
            <button className="transition-colors hover:text-white">
              <Volume2 size={16} />
            </button>
            <div className="relative flex h-1 flex-1 cursor-pointer items-center rounded-full bg-[#4D4D4D]">
              <div className="h-full w-2/3 rounded-full bg-white transition-colors group-hover:bg-[#1DB954]" />
              <div className="absolute left-2/3 h-3 w-3 -translate-x-1.5 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100" />
            </div>
          </div>

          <button className="ml-2 transition-colors hover:text-white" title="Toàn màn hình">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          border: 2px solid #121212;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.4);
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

