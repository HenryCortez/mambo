// src/auth/auth.controller.ts
import { Body, Controller, Get, Logger, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}
