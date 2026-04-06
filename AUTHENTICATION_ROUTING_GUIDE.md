# 🔐 Authentication & Routing System Architecture

## 📋 Tổng Quan
Hệ thống xác thực và định tuyến đã được thiết kế với 2 loài người dùng chính:
- **User**: Người dùng thông thường - truy cập `/home/*` routes
- **Admin**: Quản trị viên - truy cập `/admin` dashboard

---

## 🔑 Các Thành Phần Chính

### 1. **AuthContext** (`src/context/AuthContext.tsx`)
**Vai trò**: Quản lý trạng thái xác thực toàn bộ ứng dụng

**Cung cấp các giá trị**:
```tsx
{
  user: User | null                    // Thông tin user hiện tại
  token: string | null                 // JWT token
  isAuthenticated: boolean              // Đã đăng nhập chưa
  isAdmin: boolean                      // Có phải admin không
  login(token, userData)                // Hàm đăng nhập
  logout()                              // Hàm đăng xuất
  checkAuth()                           // Kiểm tra xác thực khi mount
}
```

**Cách hoạt động**:
- Decode JWT token tự động để lấy thông tin user
- Backend cần gửi `role` trong JWT payload (ví dụ: `admin`, `user`)
- Token được lưu trong `localStorage` với key `accessToken`

**Cấu trúc JWT Token (Backend cần trả về)**:
```json
{
  "userId": "123456",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin"  // "admin" hoặc "user"
}
```

---

### 2. **ProtectedRoute** (`src/components/routes/ProtectedRoute.tsx`)
**Vai trò**: Bảo vệ các route yêu cầu xác thực

**Sử dụng**:
```tsx
<ProtectedRoute requireAdmin={false}>
  <UserRoutes />
</ProtectedRoute>

<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>
```

**Luồng xử lý**:
1. Nếu chưa đăng nhập → Redirect tới `/auth`
2. Nếu yeeu cầu admin nhưng user không phải admin → Redirect tới `/home`
3. Nếu hợp lệ → Hiển thị component

---

### 3. **Routes Architecture** (`src/App.tsx`)
```
/                    → Chuyển hướng tới /auth
/auth                → Trang đăng nhập/đăng ký
/admin               → Admin Dashboard (chỉ admin)
/home/*              → User Routes (chỉ user)
```

**Các User Routes**:
```
/home                      → Trang chủ
/home/profile              → Hồ sơ người dùng
/home/profile/:userId      → Hồ sơ người khác
/home/upload               → Tải bài hát lên
/home/favorites            → Bài hát yêu thích
/home/notifications        → Thông báo
/home/reposts              → Tái đăng
/home/search              → Tìm kiếm
/home/playlists           → Danh sách phát
/home/playlists/:id       → Chi tiết danh sách phát
```

---

## 🔄 Luồng Đăng Nhập

### **Trường hợp 1: Đăng nhập User**
```
1. User nhập email/password ở /auth
2. API trả về JWT token (role: "user")
3. AuthContext.login() lưu token + decode role => isAdmin = false
4. useEffect ở AuthPage check isAuthenticated + isAdmin
5. Redirect tới /home (không phải /admin)
6. MainLayout render (Sidebar + Header + Player)
```

### **Trường hợp 2: Đăng nhập Admin**
```
1. Admin nhập email/password ở /auth
2. API trả về JWT token (role: "admin")
3. AuthContext.login() lưu token + decode role => isAdmin = true
4. useEffect ở AuthPage check isAuthenticated + isAdmin
5. Redirect tới /admin
6. AdminDashboard render (không có Sidebar/Player)
7. Admin không thể truy cập /home routes
```

---

## 🛡️ Admin Dashboard (`src/pages/AdminDashboard.tsx`)

### **Tính năng**:
- ✅ Xem danh sách bài hát chờ duyệt
- ✅ Phê duyệt bài hát (Approved)
- ✅ Từ chối bài hát (Rejected)
- ✅ Logout button
- ✅ Chỉ Admin được truy cập

### **API Endpoints sử dụng**:
```
GET /admin/list                    → Lấy danh sách bài hát (pending/approved/rejected)
PATCH /admin/:id/status            → Cập nhật trạng thái bài hát
  Body: { status: "approved" | "rejected" }
```

### **Status báng hát**:
- `pending`: Chờ duyệt
- `approved`: Đã phê duyệt
- `rejected`: Bị từ chối

---

## 📶 Logout & Session

### **Header Component cải tiến**:
- Thêm menu dropdown khi click vào profile
- Nút "Đăng xuất"当 người dùng click:
  1. Gọi `logout()` từ AuthContext
  2. Xóa token khỏi localStorage
  3. Reset user state
  4. Redirect tới `/auth`

### **Auto-logout** (Optional):
```tsx
// Có thể thêm kiểm tra token expired
setInterval(() => {
  const token = localStorage.getItem('accessToken');
  if (!token || isTokenExpired(token)) {
    logout();
  }
}, 60000); // Check mỗi phút
```

---

## 🔧 Cách Sử Dụng trong Component

### **Kiểm tra xem user có phải admin không**:
```tsx
import { useAuth } from '../context/AuthContext';

export const MyComponent = () => {
  const { isAdmin, user } = useAuth();
  
  if (isAdmin) {
    return <AdminFeature />;
  }
  
  return <UserFeature />;
};
```

### **Đăng xuất user**:
```tsx
const { logout } = useAuth();

const handleLogout = () => {
  logout();
  navigate('/auth');
};
```

### **Lấy thông tin user**:
```tsx
const { user, isAuthenticated } = useAuth();

if (isAuthenticated) {
  console.log(user.name, user.email, user.role);
}
```

---

## ⚠️ Lưu Ý và Troubleshooting

### **Nếu người dùng nhập URL trực tiếp**:
- `/admin` → Check role, nếu không phải admin → Redirect `/home`
- `/home/*` → Check token, nếu không có → Redirect `/auth`
- `/auth` → Nếu đã login → Redirect `/home` hoặc `/admin`

### **Token hết hạn**:
Cần thêm interceptor ở `api.ts`:
```tsx
if (response.status === 401) {
  localStorage.removeItem('accessToken');
  window.location.href = '/auth';
}
```

### **Kiểm tra Token được lưu đúng không**:
```javascript
// Mở DevTools → Application → Local Storage
// Xem key "accessToken" có token không
```

---

## 📝 Checklist Cấu Hình Backend

- [ ] JWT token chứa `userId`, `email`, `name`, `role`
- [ ] Role là `"admin"` hoặc `"user"` (chính xác)
- [ ] Endpoint `/admin/list` có middleware `requireAdmin`
- [ ] Endpoint `/admin/:id/status` có middleware `requireAdmin`
- [ ] Endpoint `/auth/login` trả về `{ token: "..." }`
- [ ] Token được encode đúng format JWT

---

## 🎯 Flow Diagram

```
                     ┌─────────────┐
                     │  AuthPage   │
                     └──────┬──────┘
                            │
                    ┌───────┴───────┐
                    │               │
            ┌───────▼────────┐  ┌──▼──────────┐
             │ Email/Password │  │  API Call  │
             └───────┬────────┘  └──┬──────────┘
                     │              │
              ┌──────▼──────────────▼─────┐
              │  AuthContext.login()      │
              │  (Save Token + Decode)    │
              └──────┬────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼────────┐           ┌───▼────────┐
    │ isAdmin=   │           │ isAdmin=   │
    │ false      │           │ true       │
    │ (User)     │           │ (Admin)    │
    └───┬────────┘           └───┬────────┘
        │                         │
    ┌───▼──────────┐         ┌───▼──────────┐
    │ /home        │         │ /admin       │
    │ MainLayout   │         │ AdminDash    │
    │ + Sidebar    │         │ (No sidebar) │
    └─────────────┘         └──────────────┘
```

---

## 🚀 Tiếp Theo
1. Backend cần trả về JWT với role trong payload
2. Test đăng nhập với user và admin accounts
3. Kiểm tra ProtectedRoute redirect chính xác
4. Cấu hình API interceptor cho unauthorized (401)
