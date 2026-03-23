// src/routes/UserRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";

export default function UserRoutes() {
  return (
    <Routes>
      {/* Các route dành riêng cho User sẽ nằm ở đây */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      
      {/* Ví dụ sau này có thêm trang: <Route path="/playlist" element={<PlaylistPage />} /> */}

      {/* Nếu gõ sai đường dẫn, tự động văng về trang chủ của user */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}