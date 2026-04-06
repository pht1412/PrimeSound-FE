// src/components/home/NavigationSidebarSection.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { RefreshCcw, X, Loader2, Music } from "lucide-react"; // Import thêm icon cho Modal
import { usePlaylists } from "../../context/PlaylistContext"; // Import Context

export const NavigationSidebarSection = () => {
  // 1. Kéo dữ liệu và hàm tạo từ Context
  const { playlists, createNewPlaylist } = usePlaylists();

  // 2. State quản lý Modal tạo Playlist
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const activeClass = "flex items-center gap-4 px-4 py-3 bg-[#379546] rounded-xl text-white font-bold transition shadow-md";
  const inactiveClass = "flex items-center gap-4 px-4 py-3 text-sm font-semibold text-white hover:text-[#379546] transition";

  // Hàm xử lý khi ấn nút "Create" trong Modal
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    setIsCreating(true);
    
    // Gọi hàm từ Context, nó sẽ tự lo gọi API và cập nhật danh sách
    const success = await createNewPlaylist(newPlaylistName.trim());
    
    if (success) {
      setIsModalOpen(false); // Đóng modal
      setNewPlaylistName(''); // Reset input
    }
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#121212] pt-8 pb-6 text-white font-sans border-r border-[#282828] relative">
      
      {/* LOGO */}
      <div className="flex items-center gap-1 px-8 mb-10 cursor-pointer">
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          Prime<span className="text-[#379546]">Sound</span>
        </h1>
      </div>

      {/* NỘI DUNG CUỘN ĐƯỢC */}
      <div className="flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar pb-10">
        
        {/* MENU CHÍNH */}
        <div>
          <ul className="space-y-1">
            <li>
              <NavLink to="/home" end className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/home/discover" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                Discover
              </NavLink>
            </li>
            <li>
              <NavLink to="/home/albums" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                Albums
              </NavLink>
            </li>
            <li>
              <NavLink to="/home/artists" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Artists
              </NavLink>
            </li>
            <li>
              <NavLink to="/home/reposts" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <RefreshCcw className="w-5 h-5" />
                Reposts
              </NavLink>
            </li>
          </ul>
        </div>

        {/* LIBRARY */}
        <div>
          <h3 className="text-xs font-medium text-[#379546] mb-3 px-4 uppercase tracking-wider">Library</h3>
          <ul className="space-y-1">
            <li>
              <NavLink to="/home/library/recent" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Recently Added
              </NavLink>
            </li>
            <li>
              <NavLink to="/home/library/most-played" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                Most played
              </NavLink>
            </li>
          </ul>
        </div>

        {/* PLAYLIST AND FAVORITE */}
        <div>
          <h3 className="text-xs font-medium text-[#379546] mb-3 px-4 uppercase tracking-wider">Playlist and favorite</h3>
          <ul className="space-y-1">
            <li>
              <NavLink to="/home/favorites" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                Your favorites
              </NavLink>
            </li>
            <li>
              <NavLink to="/home/playlists" end className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                Your playlist
              </NavLink>
            </li>
            
            {/* HIỂN THỊ 2 PLAYLIST MỚI NHẤT TỪ CONTEXT */}
            {playlists.slice(0, 2).map((pl) => (
              <li key={pl._id}>
                <NavLink 
                  to={`/home/playlists/${pl._id}`} 
                  className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                >
                  <Music className="w-5 h-5 shrink-0 text-[#a7a7a7]" />
                  <span className="truncate w-full text-left">{pl.name}</span>
                </NavLink>
              </li>
            ))}

            <li>
              {/* NÚT MỞ MODAL THÊM PLAYLIST */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold text-[#00aeff] hover:text-[#3dbfff] transition"
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                Add playlist
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* ================= MODAL TẠO PLAYLIST ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          {/* Box Modal */}
          <div className="bg-[#282828] w-full max-w-md rounded-xl p-6 shadow-2xl transform transition-all animate-fade-in relative">
            
            {/* Nút X đóng Modal */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#a7a7a7] hover:text-white transition bg-transparent border-none"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Create new playlist</h2>
            
            {/* Input gõ tên */}
            <input 
              autoFocus
              type="text" 
              placeholder="My awesome playlist..." 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreatePlaylist();
              }}
              className="w-full bg-[#3e3e3e] text-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#1ed760] transition mb-6"
            />

            {/* Các nút hành động */}
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-full font-bold text-white hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim() || isCreating}
                className="px-6 py-2.5 rounded-full font-bold bg-[#1ed760] text-black hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
              >
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= END MODAL ================= */}
      
    </div>
  );
};