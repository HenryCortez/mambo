// src/users/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateUserDto {
  @ApiProperty({ required: false, description: 'The first name of the user' })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ required: false, description: 'The last name of the user' })
  @IsString()
  @IsOptional()
  lastname?: string
}
