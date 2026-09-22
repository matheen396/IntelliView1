import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import api from "../services/api";

interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const ENABLE_REAL_AUTH =
  import.meta.env.PROD || import.meta.env.VITE_ENABLE_REAL_AUTH === "true";
const isLocalDemoMode =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_REAL_AUTH !== "true";

const normalizeApiBaseUrl = (baseUrl: string) => {
  if (baseUrl.endsWith("/api")) return baseUrl;
  return `${baseUrl.replace(/\/$/, "")}/api`;
};

const mockUser: User = {
  id: "mock-user-123",
  email: "demo@intelliview.com",
  name: "Demo User",
  picture: null,
  role: "STUDENT",
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(
    isLocalDemoMode ? mockUser : null
  );
  const [loading, setLoading] = useState(isLocalDemoMode ? false : true);
  const [error, setError] = useState<string | null>(null);

  const login = () => {
    if (ENABLE_REAL_AUTH) {
      window.location.href = `${normalizeApiBaseUrl(API_URL)}/auth/google`;
      return;
    }

    setUser(mockUser);
    setError(null);
  };

  const logout = async () => {
    if (ENABLE_REAL_AUTH) {
      try {
        await api.post("/auth/logout");
      } catch (logoutError) {
        console.warn("Logout request failed, continuing with local cleanup", logoutError);
      }
    }

    setUser(null);
    setError(null);
    localStorage.removeItem("accessToken");
  };

  const refreshAuth = async () => {
    if (!ENABLE_REAL_AUTH) {
      setUser(mockUser);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      setUser(response.data?.user ?? response.data ?? null);
      setError(null);
    } catch (refreshError) {
      console.warn("Auth refresh failed", refreshError);
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    if (!ENABLE_REAL_AUTH) {
      setUser(isLocalDemoMode ? mockUser : null);
      setLoading(false);
      return;
    }

    const hydrateUser = async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/me");
        setUser(response.data?.user ?? response.data ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        refreshAuth,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
