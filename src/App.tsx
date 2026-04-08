// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthPage from "./pages/AuthPage";
import UserRoutes from "./routes/UserRoutes";
import { AdminDashboard } from "./pages/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";

import { MusicPlayerProvider } from "./context/MusicPlayerContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { PlaylistProvider } from "./context/PlaylistContext";
import { AuthProvider } from "./context/AuthContext";
import { HistoryProvider } from "./context/HistoryContext";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { ComingSoonProvider } from "./context/ComingSoonContext";


function App() {
  // Debug: Cho phép reset localStorage bằng cách gõ window.clearAppStorage()
  (window as any).clearAppStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Storage cleared, reloading...');
    window.location.reload();
  };

  return (
    <AuthProvider> {/* QUẢN LÝ AUTHENTICATION + ROLE */}
    <FavoritesProvider> {/* QUẢN LÝ TRẠNG THÁI LIKE TOÀN CỤC */}
    <PlaylistProvider>
      <HistoryProvider> {/* QUẢN LÝ LỊCH SỬ NGHE NHẠC */}
        <MusicPlayerProvider> {/* QUẢN LÝ PLAYER */}
        <ComingSoonProvider> {/* QUẢN LÝ POPUP COMING SOON */}
        <BrowserRouter>
          <ToastContainer theme="dark" position="top-right" autoClose={3000} />
          
          {/* TỔNG ĐÀI ĐIỀU HƯỚNG CẤP 1 */}
          <Routes>
            {/* Mặc định vào thẳng trang Auth */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* Nhánh 1: Xác thực (Giao diện full màn hình, không có Sidebar/Player) */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Nhánh 2: Admin Dashboard (Chỉ admin được truy cập) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Nhánh 3: Không gian User (Cần đăng nhập, không phải admin) */}
            {/* Dấu /* cực kỳ quan trọng, nó báo cho React biết: "Cứ cái gì bắt đầu bằng /home thì đưa cho UserRoutes xử lý tiếp" */}
            <Route
              path="/home/*"
              element={
                <ProtectedRoute>
                  <UserRoutes />
                </ProtectedRoute>
              }
            />
            
            {/* Nhánh 4: Bắt tất cả các route sai ở root level (VD: /phat, /xyz) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          
        </BrowserRouter>
        </ComingSoonProvider>
      </MusicPlayerProvider>
      </HistoryProvider>
      </PlaylistProvider>
    </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
