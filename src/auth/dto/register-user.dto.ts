import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@microsoft.com'
  })
  @IsEmail()
  @Matches(
    /^[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.)?(microsoft\.com|outlook\.com|office365\.com|uta\.edu\.ec)$/i,
    {
      message: 'El correo debe ser de Microsoft 365'
    }
  )
  email: string

  @ApiProperty({
    description: 'First name of the user',
    example: 'John'
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe'
  })
  @IsString()
  @IsNotEmpty()
  lastname: string

  @ApiProperty({
    description: 'User password (min 8 characters)',
    minLength: 8,
    example: 'SecurePass123!'
  })
  @IsString()
  @MinLength(8)
  password: string

  @ApiPropertyOptional({
    description: 'ID of the parent user',
    example: 1
  })
  @IsOptional()
  parent_id?: number;
}
