// src/pages/HomePage.tsx
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center font-sans">
      <div className="text-center animate-fade-up">
        <h1 className="text-5xl font-bold text-white mb-4">
          Hello <span className="text-[#1ed760]">World</span> 🌍
        </h1>
        <p className="text-[#a7a7a7] text-lg font-medium">
          Chào mừng bạn đến với trang chủ của PrimeSound dành cho User!
        </p>
      </div>
    </div>
  );
}