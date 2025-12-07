import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AuthCodeDto {
  @ApiProperty({
    description: 'User ID',
    example: '1'
  })
  @IsNumber()
  id: number

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'MFA secret for two-factor authentication',
    example: 'JBSWY3DPEHPK3PXP',
  })
  @IsString()
  mfaSecret: string

  @ApiProperty({
    description: '2FA authentication code',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  totp: string
}
