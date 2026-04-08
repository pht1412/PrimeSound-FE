// src/pages/ProfilePage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, Loader2, Heart, Play, Settings, Shuffle, CheckCircle2 } from 'lucide-react';
import { userService } from '../services/userService';
import { followService } from '../services/followService';
import { songService } from '../services/songService';
import { repostService } from '../services/repostService';
import api from '../api/api';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { toast } from 'react-toastify';
import { useMusicPlayer } from '../context/MusicPlayerContext';

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// --- COMPONENT THẺ BÀI HÁT (TÍCH HỢP TIM & REPOST) ---
const ProfileSongItem = ({ song, onPlay, queue, isPlaying }: any) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md transition group cursor-pointer ${isPlaying ? 'bg-white/10' : 'hover:bg-white/5'
        }`}
      onClick={() => onPlay(song, { queue })}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-[#333] shrink-0">
          <img src={song.cover} alt="cover" className="w-full h-full object-cover" />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-4 h-4 bg-[#1ed760] rounded-full animate-pulse" />
            </div>
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className={`font-bold text-sm truncate ${isPlaying ? 'text-[#1ed760]' : 'text-white'}`}>
            {song.title}
          </span>
          <span className="text-[#a7a7a7] text-xs truncate">{song.artist}</span>
        </div>
      </div>

      <div className="flex items-center gap-6 px-4">
        <div className="hidden md:flex items-center gap-2 text-[#a7a7a7] text-xs">
          <Play className="w-3 h-3 fill-current" />
          <span>{song.plays.split(' ')[0]}</span>
        </div>
        <div className="flex items-center gap-2 text-[#a7a7a7] text-xs min-w-[40px] justify-end">
          {song.duration || '3:45'}
        </div>
        {isPlaying ? (
          <Heart className="w-5 h-5 fill-[#1ed760] text-[#1ed760]" />
        ) : (
          <div className="w-5 h-5" />
        )}
      </div>
    </div>
  );
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { playSong, currentSong } = useMusicPlayer();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // STATE FOLLOW & SONGS
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [userSongs, setUserSongs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Playlist' | 'Reposts' | 'Likes'>('Reposts');
  const [tabLoading, setTabLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isOwnProfile = !userId || (currentUser && userId === currentUser._id);

  const getFileUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f4b0";
    if (url.startsWith('http')) return url;
    const filename = url.replace(/^.*[\\\/]/, '');
    return `${BACKEND_URL}/uploads/${filename}`;
  };

  const getAvatarUrl = (url: string) => {
    if (!url) return "https://ui-avatars.com/api/?name=User&background=1ed760&color=fff";
    if (url.startsWith('http')) return url;
    const filename = url.replace(/^.*[\\\/]/, '');
    return `${BACKEND_URL}/uploads/${filename}`;
  };

  const fetchTabData = useCallback(async (tab: string, targetId: string) => {
    setTabLoading(true);
    try {
      let songs: any[] = [];
      if (tab === 'Playlist') {
        const res: any = await songService.getSongsByUserId(targetId);
        songs = res.data || [];
      } else if (tab === 'Reposts') {
        const res: any = await repostService.getUserReposts(targetId);
        songs = (res.data?.reposts || []).map((r: any) => r.repostedItem).filter(Boolean);
      } else if (tab === 'Likes' && isOwnProfile) {
        await userService.getMe(); // To refresh current user
        const likesRes: any = await api.get('/favorites/my-liked'); // Using raw api if service is limited
        songs = likesRes.data || likesRes || [];
      }

      const mappedSongs = songs.map((s: any) => ({
        id: s._id || s.id,
        title: s.title,
        artist: s.artist?.name || s.uploadedBy?.name || profileData?.name || "Unknown Artist",
        cover: getFileUrl(s.coverUrl),
        audioUrl: getFileUrl(s.audioUrl),
        plays: `${(s.playCount || 0).toLocaleString()} Plays`,
        duration: s.duration ? `${Math.floor(s.duration / 60)}:${(s.duration % 60).toString().padStart(2, '0')}` : '3:45'
      }));
      setUserSongs(mappedSongs);
    } catch (error) {
      console.error("Error fetching tab data:", error);
    } finally {
      setTabLoading(false);
    }
  }, [isOwnProfile, profileData?.name]);

  const fetchProfileAndFollowData = useCallback(async () => {
    try {
      setLoading(true);
      const me: any = await userService.getMe();
      setCurrentUser(me);
      const targetId = userId || me._id;

      let targetUser = targetId === me._id ? me : await userService.getUserById(targetId);
      const finalProfileData = targetUser?.data || targetUser;
      setProfileData(finalProfileData);

      if (finalProfileData && finalProfileData._id) {
        const [followersRes, followingRes] = await Promise.all([
          followService.getFollowers(targetId),
          followService.getFollowing(targetId)
        ]);

        setFollowersCount(followersRes.count || followersRes.followers?.length || 0);
        setFollowingCount(followingRes.count || followingRes.following?.length || 0);

        // Fetch initial tab data
        await fetchTabData(activeTab, targetId);
      }

      if (targetId !== me._id) {
        const statusRes: any = await followService.getFollowStatus(targetId);
        setIsFollowing(statusRes.isFollowing || statusRes.data?.isFollowing || false);
      }
    } catch (error) {
      toast.error("Không thể tải thông tin hồ sơ!");
      navigate('/home');
    } finally {
      setLoading(false);
    }
  }, [userId, navigate, activeTab, fetchTabData]);

  useEffect(() => { fetchProfileAndFollowData(); }, [fetchProfileAndFollowData]);

  // Handle tab change
  useEffect(() => {
    if (profileData?._id) {
      fetchTabData(activeTab, profileData._id);
    }
  }, [activeTab, fetchTabData, profileData?._id]);

  const handleToggleFollow = async () => { /* Giữ nguyên logic cũ */
    if (!profileData || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(profileData._id);
        setIsFollowing(false); setFollowersCount(p => p - 1); toast.info(`Đã hủy theo dõi ${profileData.name}`);
      } else {
        await followService.followUser(profileData._id);
        setIsFollowing(true); setFollowersCount(p => p + 1); toast.success(`Đang theo dõi ${profileData.name}`);
      }
    } catch (error) { toast.error("Có lỗi xảy ra!"); } finally { setFollowLoading(false); }
  };

  if (loading || !profileData) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-[#1ed760] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="w-full h-full text-white animate-fade-in pb-10 bg-[#121212]">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between sticky top-0 bg-[#121212]/95 backdrop-blur-sm z-10 py-4 px-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center bg-black rounded-full hover:bg-black/80 transition shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <h2 className="text-base font-bold tracking-wide">Account</h2>
        <button className="w-10 h-10 flex items-center justify-center bg-black/40 rounded-full hover:bg-black/60 transition">
          <Settings className="w-5 h-5 text-[#a7a7a7] hover:text-white transition" />
        </button>
      </div>

      {/* PROFILE HEADER */}
      <div className="flex flex-col items-center mt-6 px-6">
        <div className="relative group">
          <div className="w-44 h-44 rounded-full overflow-hidden shadow-2xl bg-[#282828] border-4 border-black/20">
            <img
              src={getAvatarUrl(profileData?.avatar)}
              alt="Avatar"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="absolute bottom-2 right-2 bg-black rounded-full p-0.5 border-2 border-black">
            <CheckCircle2 className="w-7 h-7 text-[#1ed760] fill-black" />
          </div>
        </div>

        <h1 className="text-5xl font-black mt-6 tracking-tight">
          {profileData?.name || "User"}
        </h1>

        <div className="flex gap-5 text-sm mt-3 mb-8">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold">{followersCount}</span>
            <span className="text-[#a7a7a7]">Followers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold">{followingCount}</span>
            <span className="text-[#a7a7a7]">Following</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-4 mb-10">
          {isOwnProfile ? (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-6 py-2.5 rounded-full bg-[#2a2a2a] text-sm font-bold text-white hover:bg-[#3e3e3e] transition border border-[#404040]"
            >
              Edit profile
            </button>
          ) : (
            <button
              onClick={handleToggleFollow}
              disabled={followLoading}
              className={`px-8 py-2.5 rounded-full font-bold text-sm transition flex items-center gap-2 ${isFollowing
                  ? 'bg-transparent border border-[#727272] text-white hover:border-white'
                  : 'bg-[#1ed760] text-black hover:scale-105 active:scale-95'
                }`}
            >
              {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          <button className="w-10 h-10 flex items-center justify-center text-[#a7a7a7] hover:text-white transition">
            <Shuffle className="w-6 h-6" />
          </button>

          <button
            className="w-14 h-14 flex items-center justify-center bg-[#1ed760] rounded-full text-black hover:scale-105 transition shadow-[0_8px_16px_rgba(30,215,96,0.3)] active:scale-95"
            onClick={() => userSongs.length > 0 && playSong(userSongs[0], { queue: userSongs })}
          >
            <Play className="w-7 h-7 fill-current ml-1" />
          </button>
        </div>
      </div>

      {/* TABS & CONTENT */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-8 border-b border-white/5 mb-6">
          {(['Playlist', 'Reposts', 'Likes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold transition relative ${activeTab === tab ? 'text-white' : 'text-[#a7a7a7] hover:text-white'
                }`}
            >
              {tab === 'Likes' ? (
                <span className="flex items-center gap-1.5">Likes <Heart className="w-3.5 h-3.5" /></span>
              ) : tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1ed760] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1 min-h-[300px]">
          {tabLoading ? (
            <div className="flex flex-col gap-4 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                  <div className="w-12 h-12 bg-white/5 rounded-md" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/5 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : userSongs.length === 0 ? (
            <div className="text-center text-[#a7a7a7] py-16 bg-white/5 rounded-2xl border border-white/5 mt-4">
              <p className="text-lg font-medium">Chưa có dữ liệu cho phần này.</p>
              <p className="text-sm mt-1 opacity-60">Hãy bắt đầu khám phá âm nhạc ngay!</p>
            </div>
          ) : (
            userSongs.map((song, idx) => (
              <ProfileSongItem
                key={song.id || idx}
                song={song}
                onPlay={playSong}
                queue={userSongs}
                isPlaying={currentSong?.id === song.id}
              />
            ))
          )}
        </div>
      </div>

      {isEditModalOpen && isOwnProfile && (
        <EditProfileModal user={currentUser} onClose={() => setIsEditModalOpen(false)} onSuccess={() => { setIsEditModalOpen(false); fetchProfileAndFollowData(); }} />
      )}
    </div>
  );
};