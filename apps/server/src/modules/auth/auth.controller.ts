import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  ApiResponse as ApiResponseType,
} from '@kamf/interface';
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginRequest: LoginRequest): Promise<ApiResponseType<LoginResponse>> {
    return this.authService.login(loginRequest);
  }

  @Post('refresh')
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Body() refreshRequest: RefreshTokenRequest
  ): Promise<ApiResponseType<LoginResponse>> {
    return this.authService.refresh(refreshRequest);
  }

  @Post('logout')
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(): Promise<ApiResponseType<void>> {
    return this.authService.logout();
  }
}
