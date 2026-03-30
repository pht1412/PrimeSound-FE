// src/components/home/NavigationSidebarSection.tsx
import { RefreshCcw } from "lucide-react";
import { NavLink } from "react-router-dom";

export const NavigationSidebarSection = () => {
  // Định nghĩa sẵn 2 trạng thái UI: Đang chọn (Active) và Chưa chọn (Inactive)
  const activeClass = "flex items-center gap-4 px-4 py-3 bg-[#379546] rounded-xl text-white font-bold transition shadow-md";
  const inactiveClass = "flex items-center gap-4 px-4 py-3 text-sm font-semibold text-white hover:text-[#379546] transition";

  return (
    <div className="flex flex-col w-full h-full bg-[#121212] pt-8 pb-6 text-white font-sans border-r border-[#282828]">
      
      {/* 1. LOGO */}
      <div className="flex items-center gap-1 px-8 mb-10 cursor-pointer">
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          Prime<span className="text-[#379546]">Sound</span>
        </h1>
      </div>

      {/* 2. NỘI DUNG CUỘN ĐƯỢC */}
      <div className="flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar pb-10">
        
        {/* MENU CHÍNH */}
        <div>
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/home" 
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/discover" 
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                Discover
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/albums" 
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                Albums
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/artists" 
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Artists
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/home/reposts" 
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <RefreshCcw className="w-5 h-5 hover:text-[#2db35d] transition" />
                Reposts
              </NavLink>
            </li>
          </ul>
        </div>

        {/* LIBRARY */}
        <div>
          <h3 className="text-xs font-medium text-[#379546] mb-3 px-4">Library</h3>
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/library/recent" 
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Recently Added
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/library/most-played" 
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                Most played
              </NavLink>
            </li>
          </ul>
        </div>

        {/* PLAYLIST AND FAVORITE */}
        <div>
          <h3 className="text-xs font-medium text-[#379546] mb-3 px-4">Playlist and favorite</h3>
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/home/favorites" 
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                Your favorites
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/playlists" 
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                Your playlist
              </NavLink>
            </li>
            <li>
              <button className="w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold text-[#00aeff] hover:text-[#3dbfff] transition">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                Add playlist
              </button>
            </li>
          </ul>
        </div>

        {/* GENERAL */}
        <div>
          <h3 className="text-xs font-medium text-[#379546] mb-3 px-4">general</h3>
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/settings" 
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Setting
              </NavLink>
            </li>
            <li>
              <button className="w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold text-white hover:text-red-500 transition">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Logout
              </button>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};