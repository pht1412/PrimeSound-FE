// src/pages/AuthPage.tsx
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Import hook chuyển trang
import { notifyAuthChanged } from "../utils/authEvents";
import { toast } from "react-toastify"; // Import hàm gọi popup

import InputField from "../components/login/InputField";
import { authService } from "../services/authService";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const navigate = useNavigate(); // Khởi tạo hàm chuyển trang

  useEffect(() => {
    if (searchParams.get("signup") === "1") setIsLogin(false);
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    try {
      if (isLogin) {
        // === LUỒNG ĐĂNG NHẬP (GỌI API THẬT) ===
        const response = await authService.login({
          email: formData.email,
          password: formData.password,
        }) as { token: string };
        
        // 1. Lưu token thật vào F12 -> Application -> Local Storage
        localStorage.setItem("accessToken", response.token); 
        notifyAuthChanged();
        
        // 2. Hiện popup thành công
        toast.success("Đăng nhập thành công! Đang chuyển hướng...");
        
        // 3. Bay thẳng vào trang Home
        navigate("/home"); 
        
      } else {
        // === LUỒNG ĐĂNG KÝ (GỌI API THẬT) ===
        await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          // Gửi thêm số điện thoại nếu backend của bạn có trường này:
          // number: formData.number 
        });
        
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        
        // Xóa pass cũ, tự động chuyển UI về tab Đăng nhập
        setFormData({ ...formData, password: "" });
        setIsLogin(true);
      }
    } catch (error: any) {
      // Axios interceptor đã bóc tách lỗi giúp chúng ta, giờ chỉ cần in ra
      setErrorMsg(error?.message || "Sai email hoặc mật khẩu, vui lòng thử lại!");
      toast.error("Thao tác thất bại!"); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4 animate-fade-in">
      
      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tighter">
            Prime <span className="text-[#1ed760]">Sound</span> 🎵
          </h1>
        </div>

        <h2 className="text-3xl font-bold mb-10 text-center tracking-tight">
          {isLogin ? "Log in to PrimeSound" : "Sign up to start listening"}
        </h2>

        {/* Form nhập liệu chính */}
        <form onSubmit={handleSubmit} className="w-full space-y-5 animate-fade-up">
          {errorMsg && (
            <div className="spotify-error-box">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              {errorMsg}
            </div>
          )}

          {!isLogin && (
            <>
              <InputField label="What's your name?" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your profile name" />
              <InputField label="Phone Number" name="number" value={formData.number} onChange={handleChange} placeholder="Enter your phone number" />
            </>
          )}

          <InputField label="Email address or username" name="email" value={formData.email} onChange={handleChange} placeholder="Email address or username" />
          <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" />

          {isLogin && (
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="remember" className="w-4 h-4 bg-[#121212] border-[#727272] rounded cursor-pointer accent-[#1ed760]" />
              <label htmlFor="remember" className="text-sm font-medium cursor-pointer text-[#a7a7a7] hover:text-white transition-colors">
                Remember me
              </label>
            </div>
          )}

          <div className="pt-6">
            <button type="submit" disabled={loading} className="btn-spotify-primary">
              {loading ? "Processing..." : (isLogin ? "Log In" : "Sign Up")}
            </button>
          </div>
          
          {isLogin && (
            <div className="text-center mt-6">
              <a href="#" className="text-white hover:text-[#1ed760] underline transition text-sm font-semibold">
                Forgot your password?
              </a>
            </div>
          )}
        </form>

        <div className="spotify-divider w-full">
          <div className="spotify-divider-line"></div>
        </div>

        <div className="text-center w-full pb-10">
          <p className="text-[#a7a7a7] font-medium mb-5">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}
            className="btn-spotify-outline"
          >
            {isLogin ? "Sign up for PrimeSound" : "Log in to PrimeSound"}
          </button>
        </div>

      </div>
    </div>
  );
}
