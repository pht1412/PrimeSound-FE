// src/pages/AccountPage.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userService } from "../services/userService";
import { FooterPlayer } from "../components/layout/FooterPlayer";
import { followService, type FollowListUser } from "../services/followService";
import { EditProfileModal } from "../components/profile/EditProfileModal";
import { useMusicPlayer, type Song } from "../context/MusicPlayerContext";
import { songService } from "../services/songService";
import { playlistService, type PlaylistDetail, type PlaylistSummary } from "../services/playlistService";

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const getMediaUrl = (url: string | undefined) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const filename = url.replace(/^.*[\\/]/, "");
  return `${BACKEND_URL}/uploads/${filename}`;
};

const formatSeconds = (sec: number | undefined) => {
  if (sec == null || Number.isNaN(sec)) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

const mapToPlayerSong = (song: {
  _id: string;
  title: string;
  audioUrl: string;
  coverUrl?: string;
  duration?: number;
  artist?: { name?: string } | string;
}): Song => ({
  id: song._id,
  title: song.title,
  artist:
    typeof song.artist === "object" && song.artist?.name
      ? song.artist.name
      : typeof song.artist === "string"
        ? song.artist
        : "Unknown Artist",
  cover: getMediaUrl(song.coverUrl) || "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f4b0",
  audioUrl: getMediaUrl(song.audioUrl),
});

const mapApiSongToPlayer = (song: Record<string, unknown>): Song => {
  const artist = song.artist as { name?: string } | string | undefined;
  return mapToPlayerSong({
    _id: String(song._id ?? ""),
    title: String(song.title ?? ""),
    audioUrl: String(song.audioUrl ?? ""),
    coverUrl: song.coverUrl as string | undefined,
    duration: typeof song.duration === "number" ? song.duration : undefined,
    artist,
  });
};

const getAvatarUrl = (url: string | undefined) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const filename = url.replace(/^.*[\\/]/, "");
  return `${BACKEND_URL}/uploads/${filename}`;
};

const getInitials = (name: string) => {
  const t = name?.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return t.slice(0, 3).toUpperCase();
};

const PrimeSoundLogo = () => (
  <div className="flex w-8 h-8 items-center justify-center pl-[9px] pr-[7px] py-0 relative bg-[#1db954] rounded-full">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 18V5l12-2v13"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2" />
      <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="2" />
    </svg>
  </div>
);

const HomeIcon = ({ active }: { active?: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "white" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const LibraryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const NotificationIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MessageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 14s-6-3.5-6-8a4 4 0 0 1 6-3.46A4 4 0 0 1 14 6c0 4.5-6 8-6 8z"
      fill={filled ? "#1db954" : "none"}
      stroke={filled ? "#1db954" : "currentColor"}
      strokeWidth="1.2"
    />
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const MoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const SettingsGearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PlayCircleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#1db954" />
    <path d="M10 8l6 4-6 4V8z" fill="white" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const tabs = ["Playlist", "Reposts", "Likes", "Followers", "Following"] as const;
type ProfileTab = (typeof tabs)[number];

const sidebarLinkClass = (active: boolean, accent?: boolean) =>
  `flex items-center gap-4 w-full text-left font-bold text-[15px] transition ${
    accent && active ? "text-[#1db954]" : active ? "text-white" : "text-[#99a1ae]"
  } hover:text-white`;

export const AccountPage = () => {
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying, togglePlay } = useMusicPlayer();

  const [activeTab, setActiveTab] = useState<ProfileTab>("Playlist");
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profilePlayLoading, setProfilePlayLoading] = useState(false);

  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistDetail, setPlaylistDetail] = useState<PlaylistDetail | null>(null);
  const [playlistDetailLoading, setPlaylistDetailLoading] = useState(false);

  const [me, setMe] = useState<{
    _id: string;
    name?: string;
    avatar?: string;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList] = useState<FollowListUser[]>([]);
  const [followingList, setFollowingList] = useState<FollowListUser[]>([]);
  const [listsLoading, setListsLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setProfileLoading(false);
      navigate("/auth", { replace: true });
      return;
    }
    try {
      setProfileLoading(true);
      const userData = (await userService.getMe()) as typeof me;
      setMe(userData);
    } catch {
      localStorage.removeItem("accessToken");
      navigate("/auth", { replace: true });
    } finally {
      setProfileLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const id = me?._id;
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setListsLoading(true);
        const [fRes, gRes] = await Promise.all([
          followService.getFollowers(id),
          followService.getFollowing(id),
        ]);
        if (cancelled) return;
        setFollowersCount(fRes.count ?? fRes.followers?.length ?? 0);
        setFollowingCount(gRes.count ?? gRes.following?.length ?? 0);
        setFollowersList(fRes.followers ?? []);
        setFollowingList(gRes.following ?? []);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setFollowersList([]);
          setFollowingList([]);
        }
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [me?._id]);

  const loadPlaylists = useCallback(async () => {
    setPlaylistsLoading(true);
    try {
      const res = await playlistService.getMine(1, 50);
      setPlaylists(res.data ?? []);
    } catch {
      setPlaylists([]);
      toast.error("Không tải được danh sách playlist.");
    } finally {
      setPlaylistsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "Playlist") {
      setPlaylistDetail(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!me || activeTab !== "Playlist") return;
    void loadPlaylists();
  }, [me, activeTab, loadPlaylists]);

  useEffect(() => {
    if (!moreMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [moreMenuOpen]);

  const openPlaylistDetail = async (id: string) => {
    setPlaylistDetailLoading(true);
    setPlaylistDetail(null);
    try {
      const res = await playlistService.getById(id);
      setPlaylistDetail(res.data);
    } catch {
      toast.error("Không tải được chi tiết playlist.");
    } finally {
      setPlaylistDetailLoading(false);
    }
  };

  const handleProfilePlay = async () => {
    if (playlistDetail?.songs?.length) {
      const queue = playlistDetail.songs.map(mapToPlayerSong);
      playSong(queue[0], { queue });
      return;
    }
    setProfilePlayLoading(true);
    try {
      const raw = (await songService.getDiscoverySongs()) as Record<string, unknown>[];
      if (!raw?.length) {
        toast.info("Chưa có bài hát để phát. Hãy tạo playlist và thêm bài trên ứng dụng.");
        return;
      }
      const queue = raw.map((s) => mapApiSongToPlayer(s));
      playSong(queue[0], { queue });
    } catch {
      toast.error("Không phát được nhạc.");
    } finally {
      setProfilePlayLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setMoreMenuOpen(false);
    navigate("/auth", { replace: true });
  };

  const displayName = me?.name?.trim() || "Tài khoản";
  const initials = getInitials(displayName);
  const avatarSrc = getAvatarUrl(me?.avatar);
  const followerCount = followersCount;
  const followingCnt = followingCount;

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !me) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh.");
      return;
    }
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const updated = (await userService.updateProfile(formData)) as typeof me;
      setMe((prev) => {
        if (!updated) return prev;
        if (!prev) return updated;
        return {
          ...prev,
          ...updated,
          followers: updated.followers ?? prev.followers,
          following: updated.following ?? prev.following,
        };
      });
      toast.success("Đã cập nhật ảnh đại diện.");
    } catch (err: unknown) {
      const msg = typeof err === "object" && err !== null && "message" in err ? String((err as { message?: string }).message) : "";
      toast.error(msg || "Không thể cập nhật ảnh.");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (profileLoading && !me) {
    return (
      <div className="h-screen w-full bg-black text-white flex items-center justify-center font-sans">
        <div
          className="w-10 h-10 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin"
          aria-label="Đang tải"
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden font-sans">
      <div className="flex flex-1 min-h-0 gap-2 pt-2 px-2 pb-0 w-full">
        <aside className="flex flex-col w-64 shrink-0 p-6 bg-[#121212] rounded-lg overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 pb-8">
            <PrimeSoundLogo />
            <span className="font-bold text-white text-[19px] tracking-tight">PrimeSound</span>
          </div>

          <nav className="flex flex-col gap-5">
            <NavLink to="/home" end className={({ isActive }) => sidebarLinkClass(isActive)}>
              {({ isActive }) => (
                <>
                  <HomeIcon active={isActive} />
                  Home
                </>
              )}
            </NavLink>

            <button
              type="button"
              onClick={() => navigate("/discover")}
              className={sidebarLinkClass(false)}
            >
              <SearchIcon />
              Search
            </button>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className={sidebarLinkClass(false)}
            >
              <LibraryIcon />
              Library
            </button>

            <div className="w-full border-t border-white/10 pt-6" />

            <button type="button" onClick={() => navigate("/home")} className={sidebarLinkClass(false)}>
              <NotificationIcon />
              Notifications
            </button>

            <button type="button" onClick={() => navigate("/home")} className={sidebarLinkClass(false)}>
              <MessageIcon />
              Messages
            </button>

            <NavLink to="/home/account" className={({ isActive }) => sidebarLinkClass(isActive, true)}>
              <>
                <ProfileIcon />
                <span className="truncate min-w-0 text-left">Profile ({displayName})</span>
              </>
            </NavLink>
          </nav>
        </aside>

        <main className="relative flex-1 min-w-0 min-h-0 flex flex-col bg-[#121212] rounded-lg overflow-hidden">
          <header className="flex shrink-0 items-center justify-between px-6 sm:px-8 py-4 bg-[#121212]/95 border-b border-white/[0.06] backdrop-blur-md z-10">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="w-8 h-8 flex items-center justify-center bg-black rounded-full hover:bg-black/80 transition"
              aria-label="Back"
            >
              <BackIcon />
            </button>
            <h1 className="font-bold text-[17px]">Account</h1>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="w-8 h-8 flex items-center justify-center bg-[#1e1e1e] rounded-full hover:bg-[#2e2e2e] transition"
              aria-label="Cài đặt tài khoản"
            >
              <SettingsGearIcon />
            </button>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div className="w-full border-b border-white/[0.06]">
              <div className="w-full max-w-4xl xl:max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 pb-8">
                <div className="flex flex-col items-center">
              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <button
                type="button"
                disabled={avatarUploading || !me}
                onClick={() => avatarFileInputRef.current?.click()}
                className="relative w-36 h-36 rounded-full bg-[#3a3a3a] flex items-center justify-center shadow-inner ring-1 ring-white/10 overflow-hidden shrink-0 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1db954]"
                aria-label="Đổi ảnh đại diện"
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-bold text-white/90">{initials}</span>
                )}
                <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                  {avatarUploading ? (
                    <span className="text-[11px] font-bold text-white px-2 text-center">Đang tải…</span>
                  ) : (
                    <>
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        className="mb-1"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <span className="text-[11px] font-bold text-white">Đổi ảnh</span>
                    </>
                  )}
                </div>
                <div className="pointer-events-none absolute bottom-1 right-1 z-10 w-9 h-9 bg-[#1db954] rounded-full flex items-center justify-center border-[3px] border-[#121212] shadow-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </button>

              <p className="mt-6 text-4xl font-black tracking-tight text-center px-2">{displayName}</p>

              <div className="flex gap-6 mt-3 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("Followers")}
                  className="text-left hover:opacity-90 transition rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1db954]"
                >
                  <span className="font-bold text-white">{followerCount}</span>
                  <span className="font-semibold text-[#99a1ae]"> Followers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("Following")}
                  className="text-left hover:opacity-90 transition rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1db954]"
                >
                  <span className="font-bold text-white">{followingCnt}</span>
                  <span className="font-semibold text-[#99a1ae]"> Following</span>
                </button>
              </div>

              <div className="flex items-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-6 py-2 rounded-full bg-white/10 font-bold text-sm text-white hover:bg-white/15 transition"
                >
                  Chỉnh sửa hồ sơ
                </button>
                <div className="relative" ref={moreMenuRef}>
                  <button
                    type="button"
                    onClick={() => setMoreMenuOpen((v) => !v)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#282828] hover:bg-[#3e3e3e] transition"
                    aria-label="Thêm tùy chọn"
                    aria-expanded={moreMenuOpen}
                  >
                    <MoreIcon />
                  </button>
                  {moreMenuOpen ? (
                    <div className="absolute right-0 top-full mt-2 z-30 min-w-[180px] py-1 rounded-xl bg-[#282828] border border-white/10 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10"
                      >
                        Chỉnh sửa hồ sơ
                      </button>
                      <button
                        type="button"
                        onClick={logout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-300 hover:bg-white/10"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (playlistDetail?.songs?.length) {
                      const queue = playlistDetail.songs.map(mapToPlayerSong);
                      if (currentSong?.id === queue[0].id && isPlaying) {
                        togglePlay();
                        return;
                      }
                      playSong(queue[0], { queue });
                      return;
                    }
                    void handleProfilePlay();
                  }}
                  disabled={profilePlayLoading}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1db954] shadow-[0_0_20px_rgba(29,185,84,0.35)] hover:scale-105 transition disabled:opacity-60 disabled:scale-100"
                  aria-label={
                    playlistDetail?.songs?.length &&
                    currentSong?.id === mapToPlayerSong(playlistDetail.songs[0]).id &&
                    isPlaying
                      ? "Tạm dừng"
                      : "Phát nhạc"
                  }
                >
                  {profilePlayLoading ? (
                    <span className="w-5 h-5 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
                  ) : playlistDetail?.songs?.length &&
                    currentSong?.id === mapToPlayerSong(playlistDetail.songs[0]).id &&
                    isPlaying ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#121818">
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                  ) : (
                    <PlayCircleIcon />
                  )}
                </button>
              </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-4xl xl:max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 py-6">
              <div
                role="tablist"
                aria-label="Nội dung hồ sơ"
                className="flex flex-nowrap items-end justify-center sm:justify-start gap-6 sm:gap-8 overflow-x-auto border-b border-white/10 pb-0"
              >
                {tabs.map((tab) => {
                  const isActive = activeTab === tab;
                  const labelClass = isActive ? "text-white" : "text-[#99a1ae]";
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab)}
                      className="relative shrink-0 pt-1 pb-3 font-bold text-sm transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1db954] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212] rounded-sm"
                    >
                      {tab === "Likes" ? (
                        <span className={`flex items-center gap-1.5 ${labelClass}`}>
                          <span>Likes</span>
                          <span className={isActive ? "text-[#1db954]" : "text-current"}>
                            <HeartIcon filled={isActive} />
                          </span>
                        </span>
                      ) : (
                        <span className={labelClass}>{tab}</span>
                      )}
                      {isActive && (
                        <span
                          className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#1db954] rounded-full pointer-events-none"
                          aria-hidden
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 mt-6 pb-10">
                {activeTab === "Followers" || activeTab === "Following" ? (
                  listsLoading ? (
                    <p className="text-[#99a1ae] text-sm py-6 text-center">Đang tải danh sách…</p>
                  ) : (
                    (() => {
                      const list = activeTab === "Followers" ? followersList : followingList;
                      const emptyMsg =
                        activeTab === "Followers"
                          ? "Chưa có người theo dõi bạn."
                          : "Bạn chưa theo dõi ai.";
                      if (list.length === 0) {
                        return <p className="text-[#99a1ae] text-sm py-6 text-center">{emptyMsg}</p>;
                      }
                      return list.map((u) => {
                        const rowAvatar = getAvatarUrl(u.avatar);
                        const rowInitials = getInitials(u.name);
                        return (
                          <div
                            key={u._id}
                            className="flex items-center gap-4 p-3 w-full bg-[#1a1a1a] rounded-xl hover:bg-[#252525] transition"
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#3a3a3a] flex items-center justify-center">
                              {rowAvatar ? (
                                <img src={rowAvatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-white/90">{rowInitials}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white text-sm truncate">{u.name}</div>
                              {u.email ? (
                                <div className="text-[#99a1ae] text-[11px] truncate">{u.email}</div>
                              ) : null}
                            </div>
                          </div>
                        );
                      });
                    })()
                  )
                ) : activeTab === "Playlist" ? (
                  playlistDetailLoading ? (
                    <p className="text-[#99a1ae] text-sm py-8 text-center">Đang tải playlist…</p>
                  ) : playlistDetail ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setPlaylistDetail(null)}
                        className="mb-4 text-sm font-bold text-[#1db954] hover:underline w-fit"
                      >
                        ← Tất cả playlist
                      </button>
                      <p className="text-lg font-black text-white mb-4 truncate">{playlistDetail.name}</p>
                      {!playlistDetail.songs?.length ? (
                        <p className="text-[#99a1ae] text-sm py-6">Playlist chưa có bài hát nào.</p>
                      ) : (
                        playlistDetail.songs.map((s) => {
                          const playerSong = mapToPlayerSong(s);
                          const queue = playlistDetail.songs.map(mapToPlayerSong);
                          const active = currentSong?.id === s._id;
                          return (
                            <div
                              key={s._id}
                              role="button"
                              tabIndex={0}
                              onClick={() => playSong(playerSong, { queue })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  playSong(playerSong, { queue });
                                }
                              }}
                              className={`flex items-center gap-4 p-3 w-full rounded-xl transition cursor-pointer ${
                                active
                                  ? "bg-[#1db8531a] border border-[#1db954]/30"
                                  : "bg-[#1a1a1a] hover:bg-[#252525]"
                              }`}
                            >
                              <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-[#282828]">
                                <img
                                  src={playerSong.cover}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-white text-sm truncate">{s.title}</div>
                                <div className="text-[#99a1ae] text-[11px] truncate">{playerSong.artist}</div>
                              </div>
                              <div className="flex items-center gap-2 text-[#99a1ae] text-[11px] shrink-0 tabular-nums">
                                <ClockIcon />
                                <span>{formatSeconds(s.duration)}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </>
                  ) : playlistsLoading ? (
                    <p className="text-[#99a1ae] text-sm py-8 text-center">Đang tải playlist…</p>
                  ) : playlists.length === 0 ? (
                    <div className="py-10 text-center px-4">
                      <p className="text-[#99a1ae] text-sm mb-4">Bạn chưa có playlist nào.</p>
                      <p className="text-[#99a1ae] text-xs mb-6">Tạo playlist và thêm bài hát từ trang chủ hoặc API backend.</p>
                      <button
                        type="button"
                        onClick={() => navigate("/home")}
                        className="px-6 py-2.5 rounded-full bg-[#1db954] text-black font-bold text-sm hover:scale-[1.02] transition"
                      >
                        Về trang chủ
                      </button>
                    </div>
                  ) : (
                    playlists.map((pl) => (
                      <button
                        key={pl._id}
                        type="button"
                        onClick={() => void openPlaylistDetail(pl._id)}
                        className="flex items-center gap-4 p-3 w-full text-left bg-[#1a1a1a] rounded-xl hover:bg-[#252525] transition"
                      >
                        <div className="w-12 h-12 rounded-md bg-[#282828] flex items-center justify-center shrink-0 text-[#1db954]">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm truncate">{pl.name}</div>
                          <div className="text-[#99a1ae] text-[11px]">
                            {pl.songCount} bài hát
                          </div>
                        </div>
                      </button>
                    ))
                  )
                ) : activeTab === "Reposts" ? (
                  <div className="py-10 text-center px-4">
                    <p className="text-[#99a1ae] text-sm mb-2">Chưa có bài đăng lại.</p>
                    <p className="text-[#99a1ae] text-xs mb-6">Tính năng Repost sẽ được kết nối API sau.</p>
                    <button
                      type="button"
                      onClick={() => navigate("/home")}
                      className="px-6 py-2.5 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition"
                    >
                      Khám phá nhạc
                    </button>
                  </div>
                ) : activeTab === "Likes" ? (
                  <div className="py-10 text-center px-4">
                    <p className="text-[#99a1ae] text-sm mb-2">Chưa có bài yêu thích.</p>
                    <p className="text-[#99a1ae] text-xs mb-6">
                      Backend hiện chưa có API &quot;liked songs&quot;. Bạn vẫn có thể nghe từ playlist hoặc trang chủ.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/home")}
                      className="px-6 py-2.5 rounded-full bg-[#1db954] text-black font-bold text-sm hover:scale-[1.02] transition"
                    >
                      Về trang chủ
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </main>
      </div>

      <FooterPlayer />

      {isEditModalOpen && me ? (
        <EditProfileModal
          user={me}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            void loadProfile().then(() => setIsEditModalOpen(false));
          }}
        />
      ) : null}
    </div>
  );
};

export default AccountPage;
