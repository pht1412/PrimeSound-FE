// src/routes/UserRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
// Sửa đường dẫn Import cho đúng với file HomePage của bạn
import { Home } from "../pages/HomePage"; 

export default function UserRoutes() {
  return (
    <Routes>
      {/* Route Cha chứa Layout */}
      <Route element={<MainLayout />}>
        {/* Các Route con sẽ được render vào thẻ <Outlet /> bên trong MainLayout */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}