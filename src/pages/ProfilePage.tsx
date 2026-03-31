// src/pages/ProfilePage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'; // Import Icon cho nút Follow
import { userService } from '../services/userService';
import { followService } from '../services/followService';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const ProfilePage = () => {
  const navigate = useNavigate();
  // Lấy ID từ URL (nếu có)
  const { userId } = useParams<{ userId: string }>(); 
  
  const [currentUser, setCurrentUser] = useState<any>(null); // Người đang đăng nhập
  const [profileData, setProfileData] = useState<any>(null); // Dữ liệu của trang đang xem
  const [loading, setLoading] = useState(true);
  
  // STATE FOLLOW
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Xác định xem mình đang xem trang của chính mình hay của người khác
  const isOwnProfile = !userId || (currentUser && userId === currentUser._id);

  const getAvatarUrl = (url: string) => {
    if (!url) return "https://ui-avatars.com/api/?name=User&background=1ed760&color=fff";
    if (url.startsWith('http')) return url; 
    const filename = url.replace(/^.*[\\\/]/, ''); 
    return `${BACKEND_URL}/uploads/${filename}`; 
  };

  const fetchProfileAndFollowData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Lấy thông tin user đang đăng nhập
      const me: any = await userService.getMe();
      setCurrentUser(me);

      // Xác định ID của trang Profile cần load
      const targetId = userId || me._id;

      // 2. Lấy thông tin của trang Profile đó (Là mình thì dùng luôn 'me', người khác thì gọi API)
      let targetUser = targetId === me._id ? me : await userService.getUserById(targetId);
      // Tùy theo cấu trúc trả về của API getUserById mà lấy .data hoặc lấy trực tiếp
      const finalProfileData = targetUser?.data || targetUser;
      setProfileData(finalProfileData);

      // 3. Lấy số lượng Follow của trang đó
      if (finalProfileData && finalProfileData._id) {
        const [followersRes, followingRes] = await Promise.all([
          followService.getFollowers(targetId),
          followService.getFollowing(targetId)
        ]);
        setFollowersCount(followersRes.count || followersRes.followers?.length || 0);
        setFollowingCount(followingRes.count || followingRes.following?.length || 0);
      }

      // 4. Nếu đang xem trang người khác, kiểm tra xem mình đã follow họ chưa
      if (targetId !== me._id) {
        const statusRes: any = await followService.getFollowStatus(targetId);
        setIsFollowing(statusRes.isFollowing || statusRes.data?.isFollowing || false);
      }

    } catch (error) {
      console.error("Lỗi khi tải Profile:", error);
      toast.error("Không thể tải thông tin hồ sơ!");
      navigate('/home'); // Lỗi thì trả về Home
    } finally {
      setLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    fetchProfileAndFollowData();
  }, [fetchProfileAndFollowData]);

  // HÀM XỬ LÝ BẤM NÚT FOLLOW / UNFOLLOW
  const handleToggleFollow = async () => {
    if (!profileData || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Đang theo dõi -> Bấm để Hủy
        await followService.unfollowUser(profileData._id);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        toast.info(`Đã hủy theo dõi ${profileData.name}`);
      } else {
        // Chưa theo dõi -> Bấm để Theo dõi
        await followService.followUser(profileData._id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success(`Đang theo dõi ${profileData.name}`);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thao tác!");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading || !profileData) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-[#1ed760] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="w-full h-full text-white animate-fade-in pb-10">
      
      {/* TOP BAR */}
      <div className="flex items-center justify-between sticky top-0 bg-[#121212] z-10 py-4 px-6 border-b border-white/10">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/80 transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <h2 className="text-sm font-bold tracking-widest uppercase">Profile</h2>
        <div className="w-8"></div>
      </div>

      <div className="flex flex-col items-center mt-10">
        <div className="relative">
          <img 
            src={getAvatarUrl(profileData?.avatar)} 
            alt="Profile Avatar" 
            className="w-40 h-40 rounded-full object-cover shadow-2xl bg-[#282828]"
          />
        </div>

        <h1 className="text-4xl font-bold mt-4 mb-2">{profileData?.name || "User"}</h1>
        
        <div className="flex gap-4 text-sm text-[#a7a7a7] font-medium mb-6">
          <p><span className="text-white font-bold">{followersCount}</span> Followers</p>
          <p><span className="text-white font-bold">{followingCount}</span> Following</p>
        </div>

        {/* KHU VỰC NÚT ĐIỀU KHIỂN CHÍNH */}
        <div className="flex items-center gap-4">
          
          {/* Lô-gíc Phân Luồng Hiển Thị Nút */}
          {isOwnProfile ? (
            // 1. NÚT CỦA CHỦ NHÀ
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="px-5 py-2 rounded-full border border-[#727272] text-sm font-bold text-white hover:border-white transition"
            >
              Edit profile
            </button>
          ) : (
            // 2. NÚT CỦA KHÁCH: FOLLOW / FOLLOWING
            <button 
              onClick={handleToggleFollow}
              disabled={followLoading}
              className={`px-6 py-2 rounded-full font-bold text-sm transition flex items-center gap-2 ${
                isFollowing 
                  ? 'border border-[#727272] text-white hover:border-white bg-transparent' // Style khi ĐÃ Follow
                  : 'bg-[#1ed760] text-black hover:scale-105' // Style khi CHƯA Follow
              }`}
            >
              {followLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFollowing ? (
                <UserCheck className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#282828] hover:bg-[#3e3e3e] transition text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
        </div>
      </div>

      {/* HIỂN THỊ MODAL CHỈ KHI LÀ CHỦ NHÀ VÀ BẤM EDIT */}
      {isEditModalOpen && isOwnProfile && (
        <EditProfileModal 
          user={currentUser} 
          onClose={() => setIsEditModalOpen(false)} 
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchProfileAndFollowData(); 
          }}
        />
      )}

    </div>
  );
};