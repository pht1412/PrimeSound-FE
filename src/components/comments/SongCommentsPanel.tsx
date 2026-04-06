import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Heart, MessageCircle, Send, Trash2, X } from "lucide-react";
import type { Song } from "../../context/MusicPlayerContext";
import { commentService, type SongComment } from "../../services/commentService";

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

type SongCommentsPanelProps = {
  song: Song;
  onClose?: () => void; 
  currentUser?: any; // 👇 1. NHẬN PROPS TỪ HOMEPAGE 👇
};

const formatTimeAgo = (dateString: string) => {
  const timestamp = new Date(dateString).getTime();
  if (Number.isNaN(timestamp)) return "Vừa xong";

  const diffInMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ngày trước`;
};

const getAvatarLabel = (name: string) => {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
};

const getImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const filename = url.replace(/^.*[\\\/]/, '');
  return `${BACKEND_URL}/uploads/${filename}`;
};

const formatExactTime = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
  }).format(date);
};

// 👇 2. DESTRUCTURE THÊM BẾN currentUser 👇
export const SongCommentsPanel = ({ song, onClose, currentUser }: SongCommentsPanelProps) => {
  const [comments, setComments] = useState<SongComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isShowingAllComments, setIsShowingAllComments] = useState(false);

  const isLoggedIn = useMemo(() => Boolean(localStorage.getItem("accessToken")), []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await commentService.getSongComments(song.id);
        setComments(data);
      } catch (error) {
        setErrorMessage("Không tải được bình luận cho bài hát này.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [song.id]);

  useEffect(() => {
    setIsShowingAllComments(false);
  }, [song.id]);

  const handleSubmit = async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment || submitting) return;

    if (!isLoggedIn) {
      setErrorMessage("Bạn cần đăng nhập để gửi bình luận.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      const createdComment = await commentService.createSongComment(song.id, trimmedComment);
      setComments((currentComments) => [createdComment, ...currentComments]);
      setNewComment("");
    } catch (error) {
      setErrorMessage("Gửi bình luận thất bại. Thử lại giúp mình nhé.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSubmit();
  };

  const handleToggleLike = async (commentId: string) => {
    if (!isLoggedIn) {
      setErrorMessage("Bạn cần đăng nhập để thích bình luận.");
      return;
    }

    try {
      const updatedComment = await commentService.toggleSongCommentLike(song.id, commentId);
      setComments((currentComments) =>
        currentComments.map((comment) => (comment.id === commentId ? updatedComment : comment))
      );
    } catch (error) {
      setErrorMessage("Không cập nhật được lượt thích lúc này.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      setErrorMessage("");
      await commentService.deleteSongComment(song.id, commentId);
      setComments((currentComments) => currentComments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      setErrorMessage("Không xóa được bình luận này lúc này.");
    }
  };

  const visibleComments = isShowingAllComments ? comments : comments.slice(0, 3);
  const hasHiddenComments = comments.length > 3;

  return (
    <div className="sticky top-0 rounded-3xl bg-[#1a1a1a] p-6 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <MessageCircle size={18} className="text-[#1ed760]" />
            <span>Bình luận bài hát</span>
          </div>
          <p className="mt-1 text-xs text-[#a7a7a7]">
            {song.title} • {song.artist}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasHiddenComments && (
            <button
              onClick={() => setIsShowingAllComments((current) => !current)}
              className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-[#a7a7a7] transition hover:border-white/30 hover:text-white"
            >
              {isShowingAllComments ? "Thu gọn" : "Xem tất cả"}
            </button>
          )}
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-[#a7a7a7]">
            {comments.length} bình luận
          </span>
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-1 rounded-full text-[#a7a7a7] hover:text-white hover:bg-white/10 transition"
              title="Đóng bình luận"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-white/10 bg-[#202020] p-3">
        <input
          type="text"
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoggedIn ? "Viết bình luận cho bài này..." : "Đăng nhập để bình luận..."}
          disabled={!isLoggedIn || submitting}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#7c7c7c] disabled:cursor-not-allowed"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-[#7c7c7c]">
            {isLoggedIn ? "Nhấn Enter hoặc bấm gửi" : "Cần đăng nhập PrimeSound"}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || !isLoggedIn || submitting}
            className="flex items-center gap-2 rounded-full bg-[#1ed760] px-3 py-1.5 text-xs font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={14} />
            {submitting ? "Đang gửi" : "Gửi"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="custom-scrollbar flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1ed760] border-t-transparent" />
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#151515] px-4 py-6 text-center text-sm text-[#8a8a8a]">
            Chưa có bình luận nào. Hãy mở màn cho bài hát này trước nhé.
          </div>
        )}

        {!loading &&
          visibleComments.map((comment) => {
            const avatarUrl = getImageUrl(comment.user?.avatar); 

            // 👇 3. LOGIC CHỦ CHỐT TẠI ĐÂY 👇
            // Tự động kiểm tra ID của người comment với ID của Current User đang đăng nhập
            const commentUserId = (comment.user as any )?._id || comment.user?.id;
            const myUserId = currentUser?._id || currentUser?.id;
            const isMyComment = Boolean(myUserId && commentUserId && myUserId === commentUserId);
            
            // Nếu API cho phép xóa (canDelete) HOẶC tự nhận diện được là của mình (isMyComment)
            const showDeleteBtn = comment.canDelete || isMyComment;

            return (
              <div key={comment.id} className="rounded-2xl border border-white/5 bg-[#202020] p-3.5">
                <div className="flex items-start gap-3">
                  
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1ed760] overflow-hidden text-xs font-bold text-black">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={comment.user.name} className="h-full w-full object-cover" />
                    ) : (
                      getAvatarLabel(comment.user.name)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-semibold text-white">{comment.user.name}</div>
                      <div className="shrink-0 text-right text-[11px] text-[#8a8a8a]">
                        <div>{formatTimeAgo(comment.createdAt)}</div>
                        <div>{formatExactTime(comment.createdAt)}</div>
                      </div>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#e5e5e5]">
                      {comment.content}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => handleToggleLike(comment.id)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition ${
                          comment.isLiked ? "text-[#1ed760]" : "text-[#a7a7a7] hover:text-white"
                        }`}
                      >
                        <Heart size={14} className={comment.isLiked ? "fill-current" : ""} />
                        {comment.likesCount}
                      </button>
                      
                      {/* 👇 ĐÃ GẮN CỜ showDeleteBtn Ở ĐÂY 👇 */}
                      {showDeleteBtn && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Xóa bình luận của mình"
                          className="flex items-center text-xs font-medium text-[#a7a7a7] transition hover:text-red-300"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};