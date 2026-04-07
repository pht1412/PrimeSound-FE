// src/components/layout/Header.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { AUTH_CHANGED_EVENT } from '../../utils/authEvents';

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('accessToken')));
  const [searchTerm, setSearchTerm] = useState(''); // State lưu từ khóa
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setIsLoggedIn(Boolean(localStorage.getItem('accessToken')));
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync);
  }, []);

  // Hàm xử lý khi ấn Enter hoặc Click kính lúp
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn trình duyệt reload trang
    if (searchTerm.trim()) {
      // Chuyển hướng sang trang search kèm query param
      navigate(`/home/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Hàm chuẩn hóa đường dẫn Avatar
  const getAvatarUrl = (url: string) => {
    if (!url) return "https://ui-avatars.com/api/?name=User&background=1ed760&color=fff"; // Ảnh mặc định xịn xò nếu không có avatar
    if (url.startsWith('http')) return url;
    const filename = url.replace(/^.*[\\\/]/, '');
    return `${BACKEND_URL}/uploads/${filename}`;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Kiểm tra xem có token trong localStorage không thì mới gọi API
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const userData = await userService.getMe();
        setUser(userData); // Lưu thông tin user vào state
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <header className="flex items-center justify-between w-full h-[80px] px-8 bg-transparent">

      {/* Cụm bên trái: Navigation Links */}
      <nav className="flex items-center gap-8">
        <Link to="/home" className="text-[#1ed760] font-medium text-[15px] tracking-wide hover:opacity-80 transition">
          HOME
        </Link>
        <Link to="/live" className="text-white font-medium text-[15px] tracking-wide hover:text-[#1ed760] transition">
          LIVE
        </Link>
        <Link to="/podcast" className="text-white font-medium text-[15px] tracking-wide hover:text-[#1ed760] transition">
          PODCAST
        </Link>
      </nav>

      {/* Cụm ở giữa: Search Bar */}
      <div className="flex-1 max-w-[500px] mx-8">
        {/* Đổi div thành form, gắn sự kiện onSubmit */}
        <form
          onSubmit={handleSearch}
          className="flex items-center w-full bg-[#202020] rounded-full px-5 py-2.5 border border-transparent focus-within:border-[#878787] transition-all"
        >
          <input
            type="text"
            placeholder="Type your search here"
            value={searchTerm}
            // Thêm sự kiện onFocus này vào:
            onFocus={() => {
              if (!searchTerm) navigate('/home/search');
            }}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Tùy chọn: Gõ đến đâu search đến đó (Live Search)
              // navigate(`/home/search?q=${encodeURIComponent(e.target.value)}`);
            }}
            className="flex-1 bg-transparent text-white text-[15px] outline-none placeholder:text-[#838383]"
          />
          <button type="submit" className="text-[#838383] hover:text-white transition ml-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
      </div>
      {/* Cụm bên phải: khách — Sign up / Log in; đã đăng nhập — Upload, thông báo, cài đặt, profile */}
      <div className="flex items-center gap-6">
        {isLoggedIn ? (
          <>
            <Link
              to="/home/upload"
              className="flex items-center gap-2.5 bg-[#1ed760] text-black font-bold text-sm px-6 py-3 rounded-full hover:scale-105 transition transform duration-150 shadow-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span className="tracking-wide">Upload</span>
            </Link>

            <Link to="/home/notifications" className="relative text-white hover:text-[#1ed760] transition ml-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#121212]"></span>
            </Link>

            <button type="button" className="text-white hover:text-[#1ed760] transition">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>

            <Link
              to="/home/profile"
              className="flex items-center gap-3 cursor-pointer hover:bg-[#202020] px-3 py-1.5 rounded-full transition"
            >
              <img
                src={getAvatarUrl(user?.avatar)}
                alt="User Avatar"
                className="w-9 h-9 rounded-full object-cover bg-white"
              />
              <span className="text-white text-sm font-medium">
                {user ? user.name : "Guest"}
              </span>
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-5">
            <Link
              to="/auth?signup=1"
              className="text-white font-medium text-[15px] tracking-wide hover:text-[#1ed760] transition"
            >
              Sign Up
            </Link>
            <Link
              to="/auth"
              className="bg-[#1ed760] text-black font-bold text-sm px-6 py-2.5 rounded-full hover:scale-105 transition shadow-lg"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};