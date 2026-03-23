import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthPage from "./pages/AuthPage";
import UserRoutes from "./routes/UserRoutes";
import { MusicPlayerProvider } from "./context/MusicPlayerContext"; // IMPORT MỚI

function App() {
  return (
    <MusicPlayerProvider> {/* BỌC TOÀN BỘ APP */}
      <BrowserRouter>
        <ToastContainer theme="dark" position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/home/*" element={<UserRoutes />} />
        </Routes>
      </BrowserRouter>
    </MusicPlayerProvider>
  );
}
export default App;