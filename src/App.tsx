// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthPage from "./pages/AuthPage";
import UserRoutes from "./routes/UserRoutes";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      <Routes>
        {/* Tự động chuyển hướng từ gốc (/) sang trang /auth */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* Nhánh 1: Xác thực */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Nhánh 2: Dành cho User (Đổi path thành /home/* để phân biệt) */}
        <Route path="/home/*" element={<UserRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;