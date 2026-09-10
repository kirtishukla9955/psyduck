import { create } from 'zustand';
import { User, Role } from '@/types';
import { authService } from '@/api/serviceFactory';
import { LoginRequest } from '@/api/contracts/auth.contract';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (request: LoginRequest) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null, token?: string) => void;
  hasRole: (roles: Role | Role[]) => boolean;
}

const STORAGE_AUTH_USER = 'land_stack_auth_user';
const STORAGE_AUTH_TOKEN = 'land_stack_auth_token';

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuth = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem(STORAGE_AUTH_TOKEN),
  isAuthenticated: !!getStoredUser(),
  isLoading: false,
  error: null,

  login: async (request: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(request);
      localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_AUTH_TOKEN, response.token);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.user;
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_AUTH_USER);
    localStorage.removeItem(STORAGE_AUTH_TOKEN);
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user: User | null, token?: string) => {
    if (user) {
      localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user));
      if (token) localStorage.setItem(STORAGE_AUTH_TOKEN, token);
      set({ user, token: token || get().token, isAuthenticated: true });
    } else {
      localStorage.removeItem(STORAGE_AUTH_USER);
      localStorage.removeItem(STORAGE_AUTH_TOKEN);
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  hasRole: (roles: Role | Role[]) => {
    const { user } = get();
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  },
}));
