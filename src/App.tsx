// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthPage from "./pages/AuthPage";
import UserRoutes from "./routes/UserRoutes";
import { MusicPlayerProvider } from "./context/MusicPlayerContext";

function App() {
  return (
    <MusicPlayerProvider> {/* BỌC TOÀN BỘ APP ĐỂ NHẠC KÊU MỌI NƠI */}
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
          <Route path="/*" element={<UserRoutes />} />
        </Routes>
        
      </BrowserRouter>
    </MusicPlayerProvider>
  );
}

export default App;