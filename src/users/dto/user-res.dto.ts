// src/users/dto/user-res.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'The unique identifier of the user' })
  id: number;

  @ApiProperty({ description: 'The email address of the user' })
  email: string;

  @ApiProperty({ required: false, description: 'The first name of the user' })
  name?: string;

  @ApiProperty({ required: false, description: 'The last name of the user' })
  lastname?: string;
}