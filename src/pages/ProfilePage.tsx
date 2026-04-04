// src/pages/ProfilePage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, Loader2, Heart, Repeat2, Play } from 'lucide-react';
import { userService } from '../services/userService';
import { followService } from '../services/followService';
import { songService } from '../services/songService';
import { repostService } from '../services/repostService';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { toast } from 'react-toastify';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useFavorites } from '../context/FavoritesContext';

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// --- COMPONENT THẺ BÀI HÁT (TÍCH HỢP TIM & REPOST) ---
const ProfileSongItem = ({ song, onPlay, queue }: any) => {
  const { isLiked, toggleLike } = useFavorites();
  const [likeLoading, setLikeLoading] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [repostLoading, setRepostLoading] = useState(false);

  // Kiểm tra trạng thái repost
  useEffect(() => {
    const checkRepost = async () => {
      try {
        const me: any = await userService.getMe();
        const res: any = await repostService.getUserReposts(me._id || me.id);
        const userReposts = res.data?.reposts || [];
        setIsReposted(userReposts.some((r: any) => r.repostedItem?._id === song.id));
      } catch (error) { }
    };
    checkRepost();
  }, [song.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      await toggleLike(song.id);
    } catch (err) {
      toast.error("Lỗi khi yêu thích bài hát!");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (repostLoading) return;
    setRepostLoading(true);
    try {
      if (isReposted) {
        await repostService.deleteRepost(song.id);
        setIsReposted(false);
        toast.success("Đã hủy đăng lại!");
      } else {
        await repostService.createRepost({ itemId: song.id, itemType: 'Song' });
        setIsReposted(true);
        toast.success("Đã đăng lại bài hát!");
      }
    } catch (err) {
      toast.info("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setRepostLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#282828] transition group cursor-pointer border border-transparent hover:border-[#3e3e3e]"
      onClick={() => onPlay(song, { queue })}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-[#333] shrink-0">
          <img src={song.cover} alt="cover" className="w-full h-full object-cover group-hover:opacity-50 transition" />
          <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100 transition w-5 h-5 fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm group-hover:text-[#1ed760] transition">{song.title}</span>
          <span className="text-[#a7a7a7] text-xs">{song.plays}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition px-4">
        <button onClick={handleLike} disabled={likeLoading} className="text-[#a7a7a7] hover:text-white transition">
          <Heart className={`w-5 h-5 ${isLiked(song.id) ? 'fill-[#1ed760] text-[#1ed760]' : ''}`} />
        </button>
        <button onClick={handleRepost} disabled={repostLoading} className={`transition ${isReposted ? 'text-[#1ed760]' : 'text-[#a7a7a7] hover:text-white'}`}>
          <Repeat2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>(); 
  const { playSong } = useMusicPlayer();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // STATE FOLLOW & SONGS
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [userSongs, setUserSongs] = useState<any[]>([]); // Danh sách bài hát
  
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
        // Gọi đồng thời thông tin Follow VÀ Bài hát
        const [followersRes, followingRes, songsRes] = await Promise.all([
          followService.getFollowers(targetId),
          followService.getFollowing(targetId),
          songService.getSongsByUserId(targetId) // GỌI API BÀI HÁT TẠI ĐÂY
        ]);
        
        setFollowersCount(followersRes.count || followersRes.followers?.length || 0);
        setFollowingCount(followingRes.count || followingRes.following?.length || 0);
        
        // Map dữ liệu bài hát chuẩn format MusicPlayer
        if (songsRes && (songsRes as any).data) {
           const mappedSongs = (songsRes as any).data.map((s: any) => ({
             id: s._id,
             title: s.title,
             artist: s.artist?.name || finalProfileData.name,
             cover: getFileUrl(s.coverUrl),
             audioUrl: getFileUrl(s.audioUrl),
             plays: `${(s.playCount || 0).toLocaleString()} Plays`
           }));
           setUserSongs(mappedSongs);
        }
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
  }, [userId, navigate]);

  useEffect(() => { fetchProfileAndFollowData(); }, [fetchProfileAndFollowData]);

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
    <div className="w-full h-full text-white animate-fade-in pb-10">
      <div className="flex items-center justify-between sticky top-0 bg-[#121212] z-10 py-4 px-6 border-b border-white/10">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/80 transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <h2 className="text-sm font-bold tracking-widest uppercase">Profile</h2>
        <div className="w-8"></div>
      </div>

      <div className="flex flex-col items-center mt-10">
        <div className="relative">
          <img src={getAvatarUrl(profileData?.avatar)} alt="Avatar" className="w-40 h-40 rounded-full object-cover shadow-2xl bg-[#282828]"/>
        </div>
        <h1 className="text-4xl font-bold mt-4 mb-2">{profileData?.name || "User"}</h1>
        <div className="flex gap-4 text-sm text-[#a7a7a7] font-medium mb-6">
          <p><span className="text-white font-bold">{followersCount}</span> Followers</p>
          <p><span className="text-white font-bold">{followingCount}</span> Following</p>
        </div>

        <div className="flex items-center gap-4">
          {isOwnProfile ? (
            <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2 rounded-full border border-[#727272] text-sm font-bold text-white hover:border-white transition">Edit profile</button>
          ) : (
            <button onClick={handleToggleFollow} disabled={followLoading} className={`px-6 py-2 rounded-full font-bold text-sm transition flex items-center gap-2 ${isFollowing ? 'border border-[#727272] text-white hover:border-white bg-transparent' : 'bg-[#1ed760] text-black hover:scale-105'}`}>
              {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* --- KHU VỰC HIỂN THỊ DANH SÁCH BÀI HÁT --- */}
      <div className="max-w-4xl mx-auto mt-14 px-6">
        <h3 className="text-xl font-bold mb-4">Tracks</h3>
        {userSongs.length === 0 ? (
          <div className="text-center text-[#a7a7a7] py-10 bg-[#1a1a1a] rounded-2xl border border-[#282828]">
            <p>Chưa có bài hát nào được duyệt.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {userSongs.map((song, idx) => (
              <ProfileSongItem 
                key={idx} 
                song={song} 
                onPlay={playSong} 
                queue={userSongs} 
              />
            ))}
          </div>
        )}
      </div>

      {isEditModalOpen && isOwnProfile && (
        <EditProfileModal user={currentUser} onClose={() => setIsEditModalOpen(false)} onSuccess={() => { setIsEditModalOpen(false); fetchProfileAndFollowData(); }} />
      )}
    </div>
  );
};