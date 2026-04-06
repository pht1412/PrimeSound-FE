#!/bin/bash

# 🎯 TESTING CHECKLIST & VERIFICATION GUIDE

## ✅ Phase 1: Setup Verification

### Check if all files are created:
- [ ] `src/context/AuthContext.tsx` exists and exports useAuth hook
- [ ] `src/components/routes/ProtectedRoute.tsx` exists
- [ ] `src/pages/AdminDashboard.tsx` exists
- [ ] `src/App.tsx` wrapped with AuthProvider
- [ ] `src/pages/AuthPage.tsx` uses useAuth hook
- [ ] `src/components/layout/Header.tsx` has logout button

### Browser DevTools Check:
```javascript
// Open DevTools Console and run:
localStorage.getItem('accessToken')
// Should show JWT token after login, null before login
```

---

## 🔍 Phase 2: Backend Integration Testing

### Step 1: Ensure Backend Returns Correct JWT

The backend **MUST** return a JWT token with this structure:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

The JWT payload **MUST** contain:
```json
{
  "userId": "user_id_here",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user"  // or "admin"
}
```

### Step 2: Test Real Login Flow

Backend must have 2 test accounts:
- **User account**: `role: "user"`
- **Admin account**: `role: "admin"`

```bash
# Test endpoint
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Response:
# { "token": "eyJhbGc..." }
```

### Test Cases with Real Backend:
1. **Test User Login (role: "user")**
   - Enter any email/password
   - Should redirect to `/home`
   - Should see MainLayout (Sidebar, Header, Player)
   - Should NOT be able to access `/admin`

2. **Test Admin Login (role: "admin")**
   - Change mock token role to "admin"
   - Should redirect to `/admin`
   - Should see AdminDashboard
   - Should NOT see MainLayout
   - Should see logout button

3. **Test Logout**
   - Click profile dropdown menu
   - Click "Đăng xuất"
   - Should redirect to `/auth`
   - localStorage should be cleared

4. **Test Protected Routes**
   - Try accessing `/home` without login → Should redirect to `/auth`
   - Try accessing `/admin` without login → Should redirect to `/auth`
   - Try accessing `/admin` as user → Should redirect to `/home`

---

## � Running the Application

### Start Frontend Development Server:
```bash
npm run dev
```
Output:
```
  VITE v8.0.3  ready in XXX ms
  ➜  Local:   http://localhost:5174/
```

### Login with User Account:
1. Open http://localhost:5174
2. Enter user email/password
3. **Expected redirect**: `/home` (see MainLayout with Sidebar)

### Login with Admin Account:
1. Open http://localhost:5174
2. Enter admin email/password  
3. **Expected redirect**: `/admin` (see AdminDashboard)
4. **If admin tries `/home`**: Still accessible (can navigate between sections)
5. **If admin logs out**: Redirects to `/auth`

---

## 🗝️ Backend Requirements Checklist

Verify your backend has:

- [ ] **JWT Token Endpoint** - `POST /auth/login`
  - Accepts: `{ email: string, password: string }`
  - Returns: `{ token: string }`
  - Token contains: `userId`, `email`, `name`, `role`

- [ ] **Admin List Endpoint** - `GET /admin/list`
  - Headers: `Authorization: Bearer {token}`
  - Middleware: Checks `role === "admin"` (requireAdmin)
  - Returns: Array of songs with `_id`, `title`, `artist`, `status`, `uploadedAt`, `uploader`

- [ ] **Admin Update Status Endpoint** - `PATCH /admin/:id/status`
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ status: "approved" | "rejected" }`
  - Middleware: Checks `role === "admin"` (requireAdmin)

- [ ] **Test Accounts Created**
  - User account: email & password with `role: "user"`
  - Admin account: email & password with `role: "admin"`

- [ ] **CORS Configuration** - Allow requests from `http://localhost:5174`

---

## 🐛 Troubleshooting

## 🐛 Troubleshooting

### If Token is Not Saved After Login:
```javascript
// Check in DevTools → Application → Local Storage
localStorage.getItem('accessToken')
// Should return JWT token after successful login
```

### If JWT Token Cannot Be Decoded:
- Token format must be: `header.payload.signature` (3 parts separated by dots)
- Check backend is returning a valid JWT (not base64 encoded or wrapped)
- Open DevTools → Console and check for decode errors

### If Users Can Still Access `/auth` After Logo In:
Check `src/pages/AuthPage.tsx` line ~30:
```jsx
useEffect(() => {
  if (isAuthenticated) {
    if (isAdmin) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
  }
}, [isAuthenticated, isAdmin, navigate]);
```
✅ This should automatically redirect logged-in users

### If Authentication Doesn't Persist on Page Refresh:
Check localStorage has token:
```javascript
localStorage.getItem('accessToken')  // Should exist
```
Then check `AuthContext.tsx` runs `checkAuth()` on mount (line ~65)

### If Admin Dashboard Shows Empty List:
1. Check Network tab → GET `/admin/list` response
2. Check console for error messages
3. Verify admin token has `role: "admin"`
4. Verify middleware `requireAdmin` is working on backend

### If Logout Doesn't Work:
Check `Header.tsx` has logout handler (line ~37):
```jsx
const handleLogout = () => {
  logout();  // From AuthContext
  toast.success('Đã đăng xuất thành công');
  navigate('/auth');
};
```
✅ This should clear token and redirect to auth

---

## 📊 Expected Behavior Reference

Testing Scenario → Expected Result:

| Action | Result |
|--------|--------|
| Unauthenticated user visits `/home` | Redirects to `/auth` |
| Unauthenticated user visits `/admin` | Redirects to `/auth` |
| User logs in | Redirects to `/home` |
| Admin logs in | Redirects to `/admin` |
| User visits `/admin` | Redirects to `/home` |
| Admin visits `/home` | Shows home page ✓ |
| Admin clicks Logout | Redirects to `/auth`, token deleted |
| User refreshes page | Stays logged in (token restored) |

---

## 🔧 Debug Commands

### Clear all browser storage and reload:
```javascript
// In DevTools Console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Check JWT token contents:
```javascript
// In DevTools Console:
const token = localStorage.getItem('accessToken');
console.log(JSON.parse(atob(token.split('.')[1])));
// Shows: { userId, email, name, role, ... }
```

### See current auth state in component:
```jsx
// Add temporarily to any component:
import { useAuth } from './context/AuthContext';

export const DebugInfo = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  console.log({ user, isAdmin, isAuthenticated });
  return null;
};
```

---

## 📋 Pre-Production Checklist

- [ ] `npm run dev` starts without errors
- [ ] Can login with user account → redirects to `/home`
- [ ] Can login with admin account → redirects to `/admin`  
- [ ] Token saved in localStorage after login
- [ ] Page refresh preserves login state
- [ ] Logout button removes token and redirects to `/auth`
- [ ] Cannot access `/admin` as regular user
- [ ] Cannot access `/auth` after logging in
- [ ] Admin dashboard loads songs from API
- [ ] Admin can approve/reject songs
- [ ] No console errors or warnings
- [ ] CORS working (no CORS errors in console)

---

## 🚀 Performance Tips

1. **Memoize useAuth calls** to prevent unnecessary re-renders:
```tsx
const memoizedUser = useMemo(() => user, [user]);
```

2. **Add loading state** while fetching auth on mount:
```tsx
if (isLoading) return <LoadingScreen />;
```

3. **Cache user data** in localStorage to show instant UI:
```tsx
// Store user info separately
localStorage.setItem('user', JSON.stringify(user));
```

4. **Debounce token refresh** if you add auto-refresh logic:
```tsx
const refreshToken = useMemo(() => debounce(checkAuth, 30000), []);
```

---

## ✨ Enhancement Ideas

After finishing testing:
- [ ] Add "Remember Me" checkbox
- [ ] Add password reset flow
- [ ] Add 2FA (Two-Factor Authentication)
- [ ] Add token refresh on expiration
- [ ] Add role-based menu items in sidebar
- [ ] Add permission-based feature toggles
- [ ] Add audit logging for admin actions
- [ ] Add session timeout warning

---

## ⚠️ IMPORTANT: Real Backend Token Required

**Do NOT use mock tokens or base64 encoded objects as JWT**

The authentication system expects:
- ✅ **Real JWT tokens** from backend endpoint `POST /auth/login`
- ✅ **Valid JWT format**: `header.payload.signature` (3 parts with dots)
- ✅ **Payload must contain**: `userId`, `email`, `name`, `role`
- ❌ **NOT**: base64 encoded JSON objects
- ❌ **NOT**: mock tokens for testing

Frontend `AuthContext.tsx` automatically:
1. Decodes real JWT tokens
2. Extracts user data and role
3. Determines redirect destination (`/home` for users, `/admin` for admins)

**Backend must return real JWT in login response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJlbWFpbCI6Ii4uLiIsIm5hbWUiOiIuLi4iLCJyb2xlIjoiYWRtaW4ifQ...."
}
```

---

Good luck with testing! 🚀
If you encounter any issues, check the console output and network tab in DevTools!
