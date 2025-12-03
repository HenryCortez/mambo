// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto'
import { LoginUserDto } from './dto/lgoin-user.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateOrCreateUser(profile: any) {
    const { email, firstName, lastName, microsoftId, accessToken, refreshToken } = profile;
    
    const user = await this.prisma.user.upsert({
      where: { email },
      update: { 
        lastLogin: new Date(),
        accessToken,
        refreshToken,
        tokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
      create: {
        email,
        firstName,
        lastName,
        microsoftId,
        accessToken,
        refreshToken,
        tokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        displayName: `${firstName} ${lastName}`.trim(),
        role: 'USER',
        isActive: true,
      },
    });

    return user;
  }

  async register(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;
    
    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('El correo electrónico ya está registrado');
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`.trim(),
        role: 'USER',
        isActive: true,
      },
    });

    // Eliminar la contraseña del objeto de respuesta
    const { password: _, ...result } = user;
    return result;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password!))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }

  async loginLocal(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }
}