// src/components/layout/Header.tsx
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="flex items-center justify-between w-full h-[80px] px-8 bg-transparent">
      
      {/* Cụm bên trái: Navigation Links */}
      <nav className="flex items-center gap-8">
        <Link to="/music" className="text-[#1ed760] font-medium text-[15px] tracking-wide hover:opacity-80 transition">
          MUSIC
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
        <div className="flex items-center w-full bg-[#202020] rounded-full px-5 py-2.5 border border-transparent focus-within:border-[#878787] transition-all">
          <input
            type="text"
            placeholder="Type your search here"
            className="flex-1 bg-transparent text-white text-[15px] outline-none placeholder:text-[#838383]"
          />
          <button className="text-[#838383] hover:text-white transition ml-2">
            {/* Icon Search */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Cụm bên phải: User Profile & Actions */}
      <div className="flex items-center gap-6">
        <button className="text-white hover:text-[#1ed760] transition relative">
          {/* Icon Notification */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {/* Dấu chấm đỏ thông báo (Tùy chọn) */}
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="text-white hover:text-[#1ed760] transition">
          {/* Icon Settings */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

        {/* User Info (Tạm thời cứng, Giai đoạn 4 sẽ map với API) */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-[#202020] px-3 py-1.5 rounded-full transition">
          <img
            src="https://via.placeholder.com/40" // Thay URL avatar tạm
            alt="User Avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
          <span className="text-white text-sm font-medium">tt.thuat410</span>
        </div>
      </div>
      
    </header>
  );
};