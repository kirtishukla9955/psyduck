import { AuthService, LoginRequest, AuthSessionResponse } from '../contracts/auth.contract';
import { mockStore } from './mockStore';
import { User, Role } from '@/types';
import { ApiError } from '../contracts/common';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockAuthService implements AuthService {
  async login(request: LoginRequest): Promise<AuthSessionResponse> {
    await delay();
    const users = mockStore.getUsers();

    let matchedUser: User | undefined;

    if (request.requestedRole) {
      matchedUser = users.find((u) => u.role === request.requestedRole);
    } else if (request.userType === 'citizen') {
      matchedUser = users.find(
        (u) =>
          u.role === 'CITIZEN' &&
          (u.email?.toLowerCase() === request.identifier.toLowerCase() ||
            u.name.toLowerCase().includes(request.identifier.toLowerCase()) ||
            u.id === request.identifier)
      ) || users.find((u) => u.role === 'CITIZEN');
    } else {
      matchedUser = users.find(
        (u) =>
          u.role !== 'CITIZEN' &&
          (u.email?.toLowerCase() === request.identifier.toLowerCase() ||
            u.name.toLowerCase().includes(request.identifier.toLowerCase()) ||
            u.id === request.identifier)
      ) || users.find((u) => u.role === 'REVENUE_OFFICER');
    }

    if (!matchedUser) {
      throw new ApiError({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid credentials or persona not found in demo registry.',
      });
    }

    const token = `mock_jwt_token_${matchedUser.id}_${Date.now()}`;
    return { token, user: matchedUser };
  }

  async logout(): Promise<void> {
    await delay(50);
  }

  async getSession(): Promise<User | null> {
    await delay(50);
    return null; // Session maintained by Zustand store
  }
}
