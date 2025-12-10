// src/docs/dto/create-doc.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsEnum } from 'class-validator'
export enum TYPES {
  OFFICE,
  MEMORANDUM
}

export enum CATEGORY {
  NORMAL,
  ENCRYPTED
}

export class CreateDocDto {
  @ApiProperty({ description: 'Contraseña para el documento (opcional)' })
  @IsString()
  password?: string

  @ApiProperty({ enum: TYPES, description: 'Tipo de documento' })
  @IsEnum(TYPES)
  @IsNotEmpty()
  type: string

  @ApiProperty({ enum: CATEGORY, description: 'Categoría del documento' })
  @IsEnum(CATEGORY)
  @IsNotEmpty()
  category: string
}