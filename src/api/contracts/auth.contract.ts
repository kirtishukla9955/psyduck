import { Role, User } from '@/types';

export interface LoginRequest {
  identifier: string;
  credential?: string;
  userType: 'citizen' | 'officer';
  requestedRole?: Role;
}

export interface AuthSessionResponse {
  token: string;
  user: User;
}

export interface AuthService {
  login(request: LoginRequest): Promise<AuthSessionResponse>;
  logout(): Promise<void>;
  getSession(): Promise<User | null>;
}
