// src/api/api.ts
import axios from 'axios';

// 1. Khởi tạo instance với cấu hình mặc định
const apiClient = axios.create({
  // Sử dụng biến môi trường, trỏ thẳng vào /api/v1 theo đúng config backend của bạn
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Giới hạn thời gian chờ để tránh treo UI
});

// 2. Interceptor cho Request: Tự động đính kèm Token (nếu có) trước khi gửi đi
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Interceptor cho Response: Xử lý dữ liệu trả về và bắt lỗi Global
apiClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp data từ backend, bỏ qua các lớp config rườm rà của Axios
    return response.data;
  },
  (error) => {
    // Bắt lỗi chung từ backend gửi về
    if (error.response?.status === 401) {
      console.error("Token hết hạn hoặc bạn chưa đăng nhập!");
      // Có thể gọi hàm logout hoặc xóa token ở đây
    }
    
    // Trả lỗi về cho component tự xử lý tiếp nếu cần
    return Promise.reject(error.response?.data || error.message);
  }
);

// 4. Đóng gói thành một object chứa các phương thức tái sử dụng
const api = {
  get: (url: string, config?: object) => apiClient.get(url, config),
  post: (url: string, data?: any, config?: object) => apiClient.post(url, data, config),
  put: (url: string, data?: any, config?: object) => apiClient.put(url, data, config),
  patch: (url: string, data?: any, config?: object) => apiClient.patch(url, data, config),
  delete: (url: string, config?: object) => apiClient.delete(url, config),
};

export default api;