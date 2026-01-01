import { Controller, Post, Body, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      const result = await this.authService.verifyEmail(token);

      // Redirect to frontend with token in URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
      return res.redirect(
        `${frontendUrl}?verified=true&token=${result.access_token}`,
      );
    } catch (error) {
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return res.redirect(
        `${frontendUrl}?verified=false&error=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body.email);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
