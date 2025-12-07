import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@microsoft.com'
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!'
  })
  @IsString()
  @IsNotEmpty()
  password: string
}
