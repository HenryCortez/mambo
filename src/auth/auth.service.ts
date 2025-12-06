import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { TotpService } from 'src/common/totp/totp.service';
// DTOs
import { RegisterUserDto } from './dto/register-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from './mail/mail.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly totpService: TotpService,
  ) {}

  private validateMicrosoftEmail(email: string) {
    const allowed = [
      'outlook.com',
      'office.com',
      'microsoft.com',
      'onmicrosoft.com',
      'uta.edu.ec',
    ];

    const domain = email.split('@')[1];
    if (!domain) {
      throw new BadRequestException('Invalid email format');
    }

    const isAllowed = allowed.some((d) => domain.endsWith(d));
    if (!isAllowed) {
      throw new BadRequestException('Email must be Microsoft 365 domain');
    }
  }

  /* =========================================================
     REGISTER
  ========================================================== */
  async register(dto: RegisterUserDto) {
    this.validateMicrosoftEmail(dto.email);

    const exists = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Generate MFA secret
    const secret = this.totpService.generateSecret();

    // Create user
    const user = await this.prisma.users.create({
      data: {
        email: dto.email,
        name: dto.name,
        lastname: dto.lastname,
        password: passwordHash,
        mfaSecret: secret,
        mfaEnabled: true,
      },
    });

    // Generate QR
    const qr = await this.totpService.generateQrCode(dto.email, secret);

    // Send welcome email
    await this.mailService.sendWelcome(dto.email, dto.name);

    return {
      message: 'Registered successfully. Configure your MFA.',
      secret,
      qr, // base64 QR
    };
  }

  /* =========================================================
     LOGIN
  ========================================================== */
  async login(dto: LoginUserDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const valid = await bcrypt.compare(dto.password, user.password!);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // MFA required
    if (!user.mfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedException('MFA is required');
    }

    const ok = this.totpService.verify(dto.totp, user.mfaSecret);
    if (!ok) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    // Generate JWT
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      token,
    };
  }

  /* =========================================================
     REQUEST PASSWORD RESET
  ========================================================== */
  async requestPasswordReset(dto: ForgotPasswordDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Nunca revelar si el email existe o no
      return { message: 'If the account exists, a reset email was sent.' };
    }

    // Generate JWT reset token (15 min)
    const token = await this.jwtService.signAsync(
      { sub: user.id, purpose: 'password-reset' },
      { expiresIn: '15m' },
    );

    // Email with link
    await this.mailService.sendPasswordReset(dto.email, token);

    return { message: 'If the account exists, a reset email was sent.' };
  }

  /* =========================================================
     RESET PASSWORD
  ========================================================== */
  async resetPassword(dto: ResetPasswordDto) {
    try {
      const decoded: any = await this.jwtService.verifyAsync(dto.token);

      if (decoded.purpose !== 'password-reset') {
        throw new BadRequestException('Invalid token');
      }

      const userId = decoded.sub;

      const hash = await bcrypt.hash(dto.newPassword, 12);

      await this.prisma.users.update({
        where: { id: userId },
        data: { password: hash },
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
