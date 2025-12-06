import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  @Matches(/^[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.)?(microsoft\.com|outlook\.com|office365\.com|uta\.edu\.ec)$/i, {
    message: 'El correo debe ser de Microsoft 365',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsString()
  @MinLength(8)
  password: string;
}
