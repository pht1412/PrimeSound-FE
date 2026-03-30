import { useEffect, useMemo, useState } from "react";
import { Megaphone, Repeat2, Trash2 } from "lucide-react";
import type { Song } from "../../context/MusicPlayerContext";
import { repostService, type SongRepost } from "../../services/repostService";

type SongRepostPanelProps = {
  song: Song;
};

const formatTimeAgo = (dateString: string) => {
  const timestamp = new Date(dateString).getTime();
  if (Number.isNaN(timestamp)) {
    return "Vừa xong";
  }

  const diffInMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  return `${Math.floor(diffInHours / 24)} ngày trước`;
};

const getAvatarLabel = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

export const SongRepostPanel = ({ song }: SongRepostPanelProps) => {
  const [reposts, setReposts] = useState<SongRepost[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasReposted, setHasReposted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isLoggedIn = useMemo(() => Boolean(localStorage.getItem("accessToken")), []);

  useEffect(() => {
    const fetchReposts = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await repostService.getSongReposts(song.id);
        setReposts(data.items);
        setHasReposted(data.hasReposted);
      } catch (error) {
        console.error("Lỗi khi tải repost:", error);
        setErrorMessage("Không tải được danh sách repost cho bài hát này.");
      } finally {
        setLoading(false);
      }
    };

    fetchReposts();
  }, [song.id]);

  const handleCreateRepost = async () => {
    if (!isLoggedIn) {
      setErrorMessage("Bạn cần đăng nhập để repost bài hát.");
      return;
    }

    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      const createdRepost = await repostService.createSongRepost(song.id, note.trim());
      setReposts((currentReposts) => {
        const withoutMine = currentReposts.filter((item) => !item.canDelete);
        return [createdRepost, ...withoutMine];
      });
      setHasReposted(true);
      setNote("");
    } catch (error) {
      console.error("Lỗi khi repost bài hát:", error);
      setErrorMessage("Repost chưa thành công. Thử lại giúp mình nhé.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRepost = async (repostId: string) => {
    try {
      setErrorMessage("");
      await repostService.deleteSongRepost(song.id, repostId);
      setReposts((currentReposts) => currentReposts.filter((item) => item.id !== repostId));
      setHasReposted(false);
    } catch (error) {
      console.error("Lỗi khi xóa repost:", error);
      setErrorMessage("Không gỡ repost được lúc này.");
    }
  };

  return (
    <div className="rounded-3xl bg-[#1a1a1a] p-6 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <Megaphone size={18} className="text-[#1ed760]" />
            <span>Repost bài hát</span>
          </div>
          <p className="mt-1 text-xs text-[#a7a7a7]">
            Chia sẻ nhanh track này lên khu vực hoạt động của bạn.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-[#a7a7a7]">
          {reposts.length} repost
        </span>
      </div>

      <div className="mb-4 rounded-2xl border border-white/10 bg-[#202020] p-3">
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={isLoggedIn ? "Viết một dòng ngắn khi repost..." : "Đăng nhập để repost bài hát..."}
          disabled={!isLoggedIn || submitting}
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-[#7c7c7c] disabled:cursor-not-allowed"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#7c7c7c]">
            {hasReposted ? "Bạn đã repost bài này, bấm lại để cập nhật ghi chú." : "Mỗi người có 1 lượt repost cho mỗi bài hát."}
          </span>
          <button
            onClick={handleCreateRepost}
            disabled={!isLoggedIn || submitting}
            className="flex items-center gap-2 rounded-full bg-[#1ed760] px-3 py-1.5 text-xs font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Repeat2 size={14} />
            {submitting ? "Đang xử lý" : hasReposted ? "Cập nhật repost" : "Repost ngay"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="custom-scrollbar flex max-h-[340px] flex-col gap-3 overflow-y-auto pr-1">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1ed760] border-t-transparent" />
          </div>
        )}

        {!loading && reposts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#151515] px-4 py-6 text-center text-sm text-[#8a8a8a]">
            Chưa có ai repost bài này. Bạn có thể mở đầu trước.
          </div>
        )}

        {!loading &&
          reposts.map((repost) => (
            <div key={repost.id} className="rounded-2xl border border-white/5 bg-[#202020] p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1ed760] text-xs font-bold text-black">
                  {getAvatarLabel(repost.user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-semibold text-white">{repost.user.name}</div>
                    <div className="shrink-0 text-[11px] text-[#8a8a8a]">{formatTimeAgo(repost.createdAt)}</div>
                  </div>
                  <p className="mt-1 text-xs text-[#9a9a9a]">
                    đã repost: <span className="text-white">{song.title}</span>
                  </p>
                  {repost.note && (
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#e5e5e5]">
                      {repost.note}
                    </p>
                  )}
                  {repost.canDelete && (
                    <div className="mt-3 flex items-center">
                      <button
                        onClick={() => handleDeleteRepost(repost.id)}
                        title="Gỡ repost của mình"
                        aria-label="Gỡ repost của mình"
                        className="flex items-center text-xs font-medium text-[#a7a7a7] transition hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
