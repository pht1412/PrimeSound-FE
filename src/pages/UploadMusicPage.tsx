// src/pages/UploadPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { songService } from '../services/songService';

// Tailwind classes dùng chung cho form input cho gọn
const inputClasses = "w-full bg-[#202020] text-white rounded-lg px-5 py-4 border border-[#303030] outline-none focus:border-[#878787] transition-all placeholder:text-[#838383]";
const labelClasses = "block text-sm font-medium text-[#b3b3b3] mb-2.5";

export const UploadPage = () => {
  const navigate = useNavigate();

  // 1. State quản lý inputs văn bản
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
  });

  // 2. State quản lý inputs file
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // 3. State quản lý trạng thái tải lên
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Xử lý thay đổi input văn bản
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý thay đổi file (chú ý dùng files[0])
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    } else {
      setter(null);
    }
  };

  // === CHỨC NĂNG XỬ LÝ SUBMIT (Nối với Service) ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate cơ bản
    if (!formData.title || !formData.artist || !audioFile || !coverFile) {
      setMessage({ type: 'error', text: 'Vui lòng điền tên bài, nghệ sĩ, file nhạc và ảnh bìa.' });
      setLoading(false);
      return;
    }

    // TẠO FORMDATA (Keypoint để upload file)
    // Tên key (audio, cover, title...) phải khớp 100% với backend controllers
    const dataToSubmit = new FormData();
    dataToSubmit.append('title', formData.title);
    dataToSubmit.append('artist', formData.artist);
    dataToSubmit.append('genre', formData.genre);
    dataToSubmit.append('audio', audioFile); // 'audio' khớp backend
    dataToSubmit.append('cover', coverFile); // 'cover' khớp backend

    try {
      await songService.uploadSong(dataToSubmit);      
      setMessage({ type: 'success', text: 'Đã tải lên thành công! Bài hát đang chờ Admin duyệt.' });
      
      // Chuyển hướng người dùng sau 2 giây
      setTimeout(() => navigate('/home'), 2000); 

    } catch (error: any) {
      console.error("Lỗi upload:", error);
      const errorMsg = error.response?.data?.message || "Lỗi không xác định khi tải lên.";
      setMessage({ type: 'error', text: `Tải lên thất bại: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#101010] px-12 py-10">
      
      {/* Tiêu đề trang */}
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Upload New Song</h1>
        <button onClick={() => navigate(-1)} className="text-white hover:text-[#1ed760] font-medium text-sm transition">
          &lt; Back
        </button>
      </div>

      {/* Hiển thị thông báo (Thành công/Lỗi) */}
      {message && (
        <div className={`w-full max-w-[800px] mx-auto mb-8 p-5 rounded-lg font-medium text-center ${message.type === 'success' ? 'bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/50' : 'bg-red-500/10 text-red-500 border border-red-500/50'}`}>
          {message.text}
        </div>
      )}

      {/* === FORM CONTAINER === */}
      <form onSubmit={handleSubmit} className="w-full max-w-[800px] mx-auto bg-[#181818] rounded-2xl p-10 shadow-2xl border border-[#282828]">
        
        {/* VStack cho các inputs */}
        <div className="flex flex-col gap-8">
          
          {/* Tên bài hát */}
          <div>
            <label htmlFor="title" className={labelClasses}>Song Title <span className="text-red-500">*</span></label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Ex: Cơn mưa ngang qua" className={inputClasses} required />
          </div>

          {/* Cụm 2 cột (Nghệ sĩ & Thể loại) */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label htmlFor="artist" className={labelClasses}>Artist / Singer <span className="text-red-500">*</span></label>
              <input type="text" id="artist" name="artist" value={formData.artist} onChange={handleInputChange} placeholder="Ex: Sơn Tùng M-TP" className={inputClasses} required />
            </div>
            <div>
              <label htmlFor="genre" className={labelClasses}>Genre (Thể loại)</label>
              <input type="text" id="genre" name="genre" value={formData.genre} onChange={handleInputChange} placeholder="Ex: Pop, Lofi, Rap..." className={inputClasses} />
            </div>
          </div>

          {/* === Cụm Tải File (Audio & Cover) === */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#282828]">
            
            {/* Tải File Audio */}
            <div>
              <label htmlFor="audio" className={labelClasses}>Audio File (MP3) <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="file" id="audio" accept=".mp3, audio/*" onChange={(e) => handleFileChange(e, setAudioFile)} className="hidden" />
                <label htmlFor="audio" className={`flex flex-col items-center justify-center h-[120px] rounded-lg border-2 border-dashed ${audioFile ? 'border-[#1ed760] bg-[#1ed760]/5' : 'border-[#404040] hover:border-[#878787]'} cursor-pointer transition`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={audioFile ? 'text-[#1ed760]' : 'text-[#838383]'}>
                    <path d="M9 18V5L21 3V16M9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15C7.65685 15 9 16.3431 9 18ZM21 16C21 17.6569 19.6569 19 18 19C16.3431 19 15 17.6569 15 16C15 14.3431 16.3431 13 18 13C19.6569 13 21 14.3431 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className={`text-xs mt-3 ${audioFile ? 'text-white font-medium' : 'text-[#838383]'}`}>{audioFile ? audioFile.name : 'Choose Audio File'}</span>
                </label>
              </div>
            </div>

            {/* Tải File Ảnh Bìa */}
            <div>
              <label htmlFor="cover" className={labelClasses}>Cover Image (JPG/PNG) <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="file" id="cover" accept="image/*" onChange={(e) => handleFileChange(e, setCoverFile)} className="hidden" />
                <label htmlFor="cover" className={`flex flex-col items-center justify-center h-[120px] rounded-lg border-2 border-dashed ${coverFile ? 'border-[#1ed760] bg-[#1ed760]/5' : 'border-[#404040] hover:border-[#878787]'} cursor-pointer transition`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={coverFile ? 'text-[#1ed760]' : 'text-[#838383]'}>
                    <path d="M12 15L15 18L19 13M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H12M16 3H21M18.5 1V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className={`text-xs mt-3 ${coverFile ? 'text-white font-medium' : 'text-[#838383]'}`}>{coverFile ? coverFile.name : 'Choose Cover Image'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* === Nút Submit === */}
          <div className="pt-8 border-t border-[#282828] flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-[#1ed760] text-black font-extrabold px-12 py-4 rounded-full transition transform hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg'}`}
            >
              {loading ? 'UPLOADING...' : 'PUBLISH SONG'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};