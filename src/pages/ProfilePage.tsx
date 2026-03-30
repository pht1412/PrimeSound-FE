// src/pages/ProfilePage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { EditProfileModal } from '../components/profile/EditProfileModal'; // IMPORT MODAL MỚI

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // STATE ĐIỀU KHIỂN MODAL
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getAvatarUrl = (url: string) => {
    if (!url) return "https://ui-avatars.com/api/?name=User&background=1ed760&color=fff";
    if (url.startsWith('http')) return url; 
    const filename = url.replace(/^.*[\\\/]/, ''); 
    return `${BACKEND_URL}/uploads/${filename}`; 
  };

  // Đưa hàm fetchUser ra ngoài bằng useCallback để tái sử dụng
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await userService.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Lỗi khi tải Profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi API lần đầu khi vào trang
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading && !user) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-[#1ed760] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="w-full h-full text-white animate-fade-in pb-10">
      
      {/* ... CÁC PHẦN TOP BAR GIỮ NGUYÊN ... */}
      <div className="flex items-center justify-between sticky top-0 bg-[#121212] z-10 py-4">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/80 transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <h2 className="text-sm font-bold tracking-widest uppercase">Account</h2>
        <div className="w-8"></div>
      </div>

      <div className="flex flex-col items-center mt-6">
        <div className="relative">
          <img 
            src={getAvatarUrl(user?.avatar)} 
            alt="Profile Avatar" 
            className="w-40 h-40 rounded-full object-cover shadow-2xl bg-[#282828]"
          />
          <div className="absolute bottom-2 right-2 bg-[#1ed760] text-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#121212]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold mt-4 mb-2">{user?.name || "User"}</h1>
        
        <div className="flex gap-4 text-sm text-[#a7a7a7] font-medium mb-6">
          <p><span className="text-white font-bold">2511</span> Followers</p>
          <p><span className="text-white font-bold">1412</span> Following</p>
        </div>

        <div className="flex items-center gap-4">
          {/* GẮN SỰ KIỆN MỞ MODAL VÀO NÚT NÀY */}
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-5 py-2 rounded-full border border-[#727272] text-sm font-bold text-white hover:border-white transition"
          >
            Edit profile
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#282828] hover:bg-[#3e3e3e] transition text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5"></path><path d="M4 20L21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l6 6"></path><path d="M4 4l5 5"></path></svg>
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1ed760] hover:scale-105 transition text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
          </button>
        </div>
      </div>

      {/* ... (Các phần Tab và Danh sách bài hát phía dưới giữ nguyên như cũ) ... */}
      
      {/* HIỂN THỊ MODAL NẾU isEditModalOpen === true */}
      {isEditModalOpen && (
        <EditProfileModal 
          user={user} 
          onClose={() => setIsEditModalOpen(false)} 
          onSuccess={() => {
            setIsEditModalOpen(false); // Cập nhật thành công thì đóng Modal
            fetchUser(); // Tải lại thông tin để cập nhật Avatar/Name mới ngay lập tức
          }}
        />
      )}

    </div>
  );
};
