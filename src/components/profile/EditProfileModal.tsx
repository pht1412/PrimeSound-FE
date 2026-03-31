// src/components/profile/EditProfileModal.tsx
import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../../services/userService';

interface EditProfileModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void; // Hàm gọi lại để refresh data ở trang ngoài
}

export const EditProfileModal = ({ user, onClose, onSuccess }: EditProfileModalProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);

  // --- STATE CHO TAB PROFILE ---
  const [name, setName] = useState(user?.name ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE CHO TAB PASSWORD ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Xử lý chọn ảnh (Preview ngay lập tức)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Tạo link ảo để xem trước ảnh
    }
  };

  // Submit Cập nhật Profile (Gửi FormData vì có file)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      if (name) formData.append('name', name);
      if (avatarFile) formData.append('avatar', avatarFile); // Tên field 'avatar' khớp với Backend

      await userService.updateProfile(formData);
      toast.success("Cập nhật thông tin thành công!");
      onSuccess(); // Refresh lại trang
    } catch (error: any) {
      toast.error(error.message || "Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Submit Đổi mật khẩu (Gửi JSON bình thường)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Vui lòng nhập đủ mật khẩu!");
      return;
    }
    setLoading(true);
    try {
      await userService.changePassword({ oldPassword, newPassword });
      toast.success("Đổi mật khẩu thành công!");
      onClose(); // Đổi pass xong thì đóng luôn modal
    } catch (error: any) {
      toast.error(error.message || "Mật khẩu cũ không chính xác!");
    } finally {
      setLoading(false);
    }
  };

  // --- GIAO DIỆN ---
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-[#282828] w-full max-w-[500px] rounded-xl shadow-2xl overflow-hidden">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between p-6 border-b border-[#3e3e3e]">
          <h2 className="text-xl font-bold text-white">Edit details</h2>
          <button onClick={onClose} className="text-[#a7a7a7] hover:text-white transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#3e3e3e]">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'profile' ? 'text-white border-b-2 border-[#1ed760]' : 'text-[#a7a7a7] hover:text-white'}`}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'password' ? 'text-white border-b-2 border-[#1ed760]' : 'text-[#a7a7a7] hover:text-white'}`}
          >
            Password
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="p-6">
          {activeTab === 'profile' ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex items-center gap-6">
                {/* Khu vực bấm đổi Avatar */}
                <div
                  className="relative w-32 h-32 rounded-full overflow-hidden bg-[#121212] group cursor-pointer border-2 border-transparent hover:border-[#1ed760] transition-all shadow-xl flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {/* Hiển thị ảnh ảo (nếu vừa chọn) hoặc ảnh cũ */}
                  {(avatarPreview || user?.avatar) ? (
                    <img
                      src={
                        avatarPreview ||
                        (user?.avatar
                          ? `${import.meta.env.VITE_SERVER_URL || "http://localhost:5000"}/uploads/${user.avatar.replace(/^.*[\\/]/, "")}`
                          : "")
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#555]">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                  )}
                  {/* Lớp phủ đen khi Hover báo hiệu có thể click */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                
                {/* Đổi tên */}
                <div className="flex-1">
                  <label className="block text-xs font-bold text-white mb-2">Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#3e3e3e] text-white text-sm px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-[#1ed760]"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="bg-white hover:scale-105 text-black font-bold py-3 px-8 rounded-full transition-transform disabled:opacity-50">
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-[#3e3e3e] text-white text-sm px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-[#1ed760]"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#3e3e3e] text-white text-sm px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-[#1ed760]"
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={loading} className="bg-white hover:scale-105 text-black font-bold py-3 px-8 rounded-full transition-transform disabled:opacity-50">
                  {loading ? "Updating..." : "Change Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};