import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendWelcome(email: string, name: string, qrCode: string) {
    await this.mailer.sendMail({
      to: email,
      subject: 'Bienvenido a Mambo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Bienvenido a Mambo, ${name}!</h2>
          <p>Tu cuenta ha sido creada exitosamente. A continuación encontrarás tu código QR para configurar la autenticación de dos factores:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <img src="${qrCode}" alt="Código QR para autenticación" style="max-width: 300px; height: auto; border: 1px solid #eee; padding: 10px; background: white;"/>
          </div>
          
          <p>Por favor, escanea este código QR con tu aplicación de autenticación favorita (como Google Authenticator o Microsoft Authenticator) para configurar la autenticación de dos factores.</p>
          
          <p>Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.</p>
          
          <p>¡Gracias por unirte a Mambo!</p>
          
          <p>El equipo de Mambo</p>
        </div>
      `,
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
