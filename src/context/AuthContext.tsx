import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type UserRole = 'user' | 'admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: Partial<User>) => void;
  logout: () => void;
  checkAuth: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hàm để decode JWT token đơn giản (lấy payload)
const decodeToken = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Lỗi decode token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra xem token có hợp lệ không (có thể thêm logic kiểm tra expiry)
  const checkAuth = useCallback(() => {
    console.log('🔍 AuthContext: checkAuth() called');
    const storedToken = localStorage.getItem('accessToken');
    console.log('🔍 AuthContext: storedToken exists?', !!storedToken);
    
    if (storedToken) {
      const decoded = decodeToken(storedToken);
      console.log('🔍 AuthContext: decoded token:', decoded);
      
      if (decoded) {
        const userData: User = {
          id: decoded.userId || decoded.id || '',
          email: decoded.email || '',
          name: decoded.name || '',
          role: decoded.role || 'user'
        };
        
        setUser(userData);
        setToken(storedToken);
        console.log('✅ AuthContext: User set:', userData);
      }
    }
    console.log('✅ AuthContext: isLoading set to false');
    setIsLoading(false);
  }, []);

  // Đăng nhập
  const login = useCallback((newToken: string, userData: Partial<User>) => {
    localStorage.setItem('accessToken', newToken);
    setToken(newToken);
    
    // Decode token để lấy role nếu có
    const decoded = decodeToken(newToken);
    const role = decoded?.role || userData?.role || 'user';
    
    const fullUserData: User = {
      id: userData.id || decoded?.userId || decoded?.id || '',
      email: userData.email || decoded?.email || '',
      name: userData.name || decoded?.name || '',
      role: role as UserRole
    };
    
    setUser(fullUserData);
  }, []);

  // Đăng xuất
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
  }, []);

  // Kiểm tra auth chỉ một lần khi component mount
  useEffect(() => {
    checkAuth();
  }, []);

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải nằm trong AuthProvider');
  }
  return context;
};
