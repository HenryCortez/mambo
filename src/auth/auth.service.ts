// src/auth/auth.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async handleMicrosoftLogin(profile: any) {
    const { email, firstName, lastName, microsoftId, accessToken, refreshToken } = profile;
    
    // Buscar o crear el usuario
    const user = await this.prisma.user.upsert({
      where: { email },
      update: { 
        lastLogin: new Date(),
        accessToken,
        refreshToken,
        tokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
      },
      create: {
        email,
        firstName,
        lastName,
        microsoftId,
        accessToken,
        refreshToken,
        tokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
        displayName: `${firstName} ${lastName}`.trim(),
        role: 'USER',
        isActive: true,
      },
    });

    return await this.login(user);
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      id: user.id,
      role: user.role 
    };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }
}