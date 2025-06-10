import axios from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
// import toast from "react-hot-toast";

interface UserType {
  name: string;
  email: string;
  googleId: string;
  picture: string;
}

interface AuthType {
  user: UserType | null;
  isLoading: boolean;
  error: string | null;
}

interface UserContextType extends AuthType {
  //setState: React.Dispatch<React.SetStateAction<AuthType>>;
  loginWithGoogle: (code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("usercontext not defined");
  }
  return context;
};

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthType>({
    user: null,
    isLoading: true,
    error: null,
  });

  const loginWithGoogle = async (code: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await axios.post("http://localhost:8000/auth/google", {
        code,
      });
      localStorage.setItem("token", res.data.token);
      setState({
        user: res.data.user,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      setState({ user: null, isLoading: false, error: "Login failed" });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setState({ user: null, isLoading: false, error: null });
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState({ user: null, isLoading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await axios.get("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setState({ user: res.data.user, isLoading: false, error: null });
    } catch (err: any) {
      console.log("error refreshing user", err);
      logout();
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ ...state, loginWithGoogle, logout, refreshUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
