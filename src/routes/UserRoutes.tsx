// src/routes/UserRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
// Sửa đường dẫn Import cho đúng với file HomePage của bạn
import { Home } from "../pages/HomePage";
import { ProfilePage } from "../pages/ProfilePage"; // Nhớ import
import { UploadPage } from "../pages/UploadMusicPage";
import { FavoriteSongsPage } from "../pages/FavoriteSongsPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import RepostPage from "../pages/RepostPage";
import { SearchPage } from "../pages/SearchPage";
import { PlaylistPage } from "../pages/PlaylistPage";
import { PlaylistDetailPage } from "../pages/PlaylistDetailPage";

export default function UserRoutes() {
  return (
    <Routes>
      {/* Route Cha chứa Layout */}
      <Route element={<MainLayout />}>
        {/* Các Route con sẽ được render vào thẻ <Outlet /> bên trong MainLayout */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/favorites" element={<FavoriteSongsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reposts" element={<RepostPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/playlists" element={<PlaylistPage />} />
        <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}