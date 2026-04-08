import { Link, useNavigate } from "react-router-dom";
import { MoveLeft, Music, Disc3 } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#121212] text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1ed760]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center text-center animate-fade-in">
        <div className="relative mb-8">
          {/* Animated SVG Graphic */}
          <div className="absolute -inset-4 bg-[#1ed760]/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative bg-[#282828] p-8 rounded-full border border-[#3e3e3e] shadow-[0_0_40px_rgba(30,215,96,0.3)]">
            <Disc3 size={80} className="text-[#1ed760] animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        <h1 className="text-8xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a7a7a7]">
          404
        </h1>

        <h2 className="text-3xl font-bold mb-4">Mất kết nối - Dương Domic</h2>
        <p className="text-[#a7a7a7] max-w-[400px] mb-8 text-[15px] leading-relaxed">

        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white border border-[#4d4d4d] hover:border-white hover:bg-white/10 transition"
          >
            <MoveLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>

          <Link
            to="/home"
            className="flex items-center gap-2 px-8 py-3 rounded-full font-bold bg-[#1ed760] text-black hover:scale-105 transition shadow-[0_0_20px_rgba(30,215,96,0.4)]"
          >
            <Music className="w-5 h-5" />
            <span>Về Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
