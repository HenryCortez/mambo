import { Controller, Post, Body, HttpStatus, Get, Query, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { RegisterUserDto } from './dto/register-user.dto'
import { LoginUserDto } from './dto/login-user.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully registered' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User already exists' })
  @ApiBody({ type: RegisterUserDto })
  register(@Body() dto: RegisterUserDto) {
    return this.service.register(dto)
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User successfully logged in' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  @ApiBody({ type: LoginUserDto })
  login(@Body() dto: LoginUserDto) {
    return this.service.login(dto)
  }

  @Post('request-reset')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password reset email sent' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiBody({ type: ForgotPasswordDto })
  requestReset(@Body() dto: ForgotPasswordDto) {
    return this.service.requestPasswordReset(dto)
  }

  @Get('reset-password-form')
  async showResetPasswordForm(@Query('token') token: string, @Res() res) {
    try {
      // Verify the token is valid
      await this.service.verifyResetToken(token)

      // If valid, serve the password reset form
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Restablecer Contraseña</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="password"] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            button { background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
            .error { color: red; margin-top: 5px; }
          </style>
        </head>
        <body>
          <h1>Restablecer Contraseña</h1>
          <form id="resetForm" action="/auth/reset-password" method="POST">
            <input type="hidden" name="token" value="${token}">
            <div class="form-group">
              <label for="newPassword">Nueva Contraseña:</label>
              <input type="password" id="newPassword" name="newPassword" required minlength="8">
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirmar Contraseña:</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required minlength="8">
            </div>
            <button type="submit">Guardar Nueva Contraseña</button>
            <div id="error" class="error" style="display: none;"></div>
          </form>

          <script>
            document.getElementById('resetForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const form = e.target;
              const formData = new FormData(form);
              const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  token: formData.get('token'),
                  newPassword: formData.get('newPassword'),
                  confirmPassword: formData.get('confirmPassword')
                })
              });

              const result = await response.json();
              
              if (response.ok) {
                alert('¡Contraseña actualizada exitosamente!');
                window.close(); // Close the tab after successful password reset
              } else {
                document.getElementById('error').style.display = 'block';
                document.getElementById('error').textContent = result.message || 'Error al actualizar la contraseña';
              }
            });
          </script>
        </body>
        </html>
      `)
    } catch (error) {
      // If token is invalid or expired, show an error message
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Enlace Inválido</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; text-align: center; }
            .error { color: red; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>Enlace Inválido o Expirado</h1>
          <p class="error">${error.message || 'El enlace de restablecimiento de contraseña es inválido o ha expirado.'}</p>
          <p>Por favor, solicita un nuevo enlace de restablecimiento de contraseña.</p>
        </body>
        </html>
      `)
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password successfully reset' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid or expired token' })
  @ApiBody({ type: ResetPasswordDto })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(dto)
  }
}
