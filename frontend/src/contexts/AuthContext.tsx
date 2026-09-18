import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";

// User interface matching backend response
interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  role: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true; // Important for cookies!

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // 🔓 BYPASS MODE: Mock user for development
  const [user] = useState<User | null>({
    id: "mock-user-123",
    email: "demo@intelliview.com",
    name: "Demo User",
    picture: null,
    role: "STUDENT",
  });
  const [loading] = useState(false); // Set to false to skip loading
  const [error, setError] = useState<string | null>(null);

  // Redirect to Google OAuth (DISABLED in bypass mode)
  const login = () => {
    console.log("� Auth bypassed - login disabled");
    alert("Authentication is bypassed. You're already logged in as Demo User!");
  };

  // Logout user (DISABLED in bypass mode)
  const logout = async () => {
    console.log("🔓 Auth bypassed - logout disabled");
    alert("Logout disabled in bypass mode. Refresh the page to continue.");
  };

  // Refresh authentication tokens (DISABLED in bypass mode)
  const refreshAuth = async () => {
    console.log("🔓 Auth bypassed - refresh disabled");
  };

  // Clear error
  const clearError = () => setError(null);

  // Initial auth check on mount (DISABLED in bypass mode)
  useEffect(() => {
    console.log("🔓 Auth bypass mode active - skipping authentication");
    // Skip all auth checks
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

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
