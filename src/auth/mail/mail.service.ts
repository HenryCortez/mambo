import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendWelcome(email: string, name: string) {
    await this.mailer.sendMail({
      to: email,
      subject: 'Bienvenido',
      html: `<p>Hola ${name}, tu cuenta ha sido creada correctamente.</p>`,
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailer.sendMail({
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <p>Para restablecer tu contraseña usa el siguiente enlace:</p>
        <a href="${url}">${url}</a>
      `,
    });
  }

  async sendOtpBackupCodes(email: string, codes: string[]) {
    await this.mailer.sendMail({
      to: email,
      subject: 'Códigos de respaldo 2FA',
      html: `
        <p>Guarda estos códigos en un lugar seguro:</p>
        <pre>${codes.join('\n')}</pre>
      `,
    });
  }
}
