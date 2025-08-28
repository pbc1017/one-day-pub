import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  ApiResponse,
} from '@kamf/interface';
import { UserRole } from '@kamf/interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(loginRequest: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const { email, password } = loginRequest;

    // Mock authentication logic
    if (email === 'admin@example.com' && password === 'password') {
      const loginResponse: LoginResponse = {
        user: {
          id: '1',
          email: 'admin@example.com',
          username: 'admin',
          role: UserRole.ADMIN,
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
        },
      };

      return {
        success: true,
        data: loginResponse,
        message: 'Login successful',
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async refresh(refreshRequest: RefreshTokenRequest): Promise<ApiResponse<LoginResponse>> {
    // Mock refresh token logic
    if (refreshRequest.refreshToken === 'mock-refresh-token') {
      const loginResponse: LoginResponse = {
        user: {
          id: '1',
          email: 'admin@example.com',
          username: 'admin',
          role: UserRole.ADMIN,
        },
        tokens: {
          accessToken: 'new-mock-access-token',
          refreshToken: 'new-mock-refresh-token',
          expiresIn: 3600,
        },
      };

      return {
        success: true,
        data: loginResponse,
        message: 'Token refreshed successfully',
      };
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  async logout(): Promise<ApiResponse<void>> {
    return {
      success: true,
      message: 'Logout successful',
    };
  }
}
