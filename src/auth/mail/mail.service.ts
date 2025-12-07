import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendWelcome(email: string,password: string, name: string, qrCode: string) {
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
          
          <p>Tus credenciales de acceso son las siguientes:</p>
          <ul>
            <li><strong>Usuario:</strong> ${email}</li>
            <li><strong>Contraseña:</strong> ${password}</li>
          </ul>
          <p>¡Gracias por unirte a Mambo!</p>
          
          <p>El equipo de Mambo</p>
        </div>
      `,
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `${process.env.API_URL || 'http://localhost:3000'}/auth/reset-password-form?token=${token}`

    await this.mailer.sendMail({
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Restablecer Contraseña</h2>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Para continuar, haz clic en el siguiente botón:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Restablecer Contraseña
            </a>
          </div>
          
          <p>Si no solicitaste este cambio, puedes ignorar este correo electrónico.</p>
          <p>Este enlace expirará en 15 minutos por razones de seguridad.</p>
          
          <p>Si el botón no funciona, copia y pega esta URL en tu navegador:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
        </div>
      `
    })
  }

  async sendOtpBackupCodes(email: string, codes: string[]) {
    await this.mailer.sendMail({
      to: email,
      subject: 'Códigos de respaldo 2FA',
      html: `
        <p>Guarda estos códigos en un lugar seguro:</p>
        <pre>${codes.join('\n')}</pre>
      `
    })
  }
}
