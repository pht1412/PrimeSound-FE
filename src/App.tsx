// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthPage from "./pages/AuthPage";
import UserRoutes from "./routes/UserRoutes";
import { MusicPlayerProvider } from "./context/MusicPlayerContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { PlaylistProvider } from "./context/PlaylistContext";


function App() {
  return (
    <FavoritesProvider> {/* QUẢN LÝ TRẠNG THÁI LIKE TOÀN CỤC */}
    <PlaylistProvider>
      <MusicPlayerProvider> {/* QUẢN LÝ PLAYER */}
        <BrowserRouter>
          <ToastContainer theme="dark" position="top-right" autoClose={3000} />
          
          {/* TỔNG ĐÀI ĐIỀU HƯỚNG CẤP 1 */}
          <Routes>
            {/* Mặc định vào thẳng trang Auth */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* Nhánh 1: Xác thực (Giao diện full màn hình, không có Sidebar/Player) */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Nhánh 2: Không gian User (Giao lại toàn quyền cho UserRoutes) */}
            {/* Dấu /* cực kỳ quan trọng, nó báo cho React biết: "Cứ cái gì bắt đầu bằng /home thì đưa cho UserRoutes xử lý tiếp" */}
            <Route path="/home/*" element={<UserRoutes />} />
          </Routes>
          
        </BrowserRouter>
      </MusicPlayerProvider>
      </PlaylistProvider>
    </FavoritesProvider>
  );
}

export default App;
