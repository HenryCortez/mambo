import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

@Injectable()
export class TotpService {
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  async generateQrCode(email: string, secret: string): Promise<string> {
    const otpauth = authenticator.keyuri(email, 'SistemaDocs', secret);
    return QRCode.toDataURL(otpauth);
  }

  verify(code: string, secret: string): boolean {
    return authenticator.verify({ token: code, secret });
  }
}
