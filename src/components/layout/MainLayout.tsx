// src/components/layout/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { FooterPlayer } from './FooterPlayer';
import { NavigationSidebarSection } from '../home/NavigationSidebarSection';

export const MainLayout = () => {
  return (
    // Root container: Phủ kín màn hình, không cho cuộn tổng thể
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden font-sans">
      
      {/* Thân trên (Sidebar + Main Content) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Cột trái: Sidebar (Tạm thời là khối đen chờ bài sau Refactor) */}
        <aside className="w-[286px] bg-black flex-shrink-0 hidden md:flex flex-col">
           <NavigationSidebarSection />
        </aside>

        {/* Cột phải: Content chính */}
        <main className="flex-1 flex flex-col bg-[#121212] rounded-tl-[10px] sm:rounded-tl-[30px] overflow-hidden relative">
          
          {/* Header cố định trên cùng của cột phải */}
          <Header />
          
          {/* Khu vực chứa Nội dung thay đổi (Home, Playlist, Search...) có thể cuộn */}
          <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar">
             {/* Outlet chính là nơi React Router nạp các trang như HomePage vào */}
             <Outlet /> 
          </div>

        </main>
      </div>

      {/* Đáy: Footer Player */}
      <FooterPlayer />
    </div>
  );
};