import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator'

export enum TYPES {
  OFFICE = 'OFFICE',
  MEMORANDUM = 'MEMORANDUM',
  NONE = 'NONE'
}

export enum CATEGORY {
  NORMAL = 'NORMAL',
  ENCRYPTED = 'ENCRYPTED'
}

export class CreateDocDto {
  @ApiProperty({
    description: 'Contraseña para el documento (opcional)',
    required: false,
    example: '123456'
  })
  @IsString()
  @IsOptional()
  password?: string

  @ApiProperty({
    enum: TYPES,
    description: 'Tipo de documento',
    example: 'OFFICE'
  })
  @IsEnum(TYPES)
  @IsNotEmpty()
  type: TYPES

  @ApiProperty({
    enum: CATEGORY,
    description: 'Categoría del documento',
    example: 'NORMAL'
  })
  @IsEnum(CATEGORY)
  @IsNotEmpty()
  category: CATEGORY

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Archivo a subir',
    required: true
  })
  @IsOptional()
  file?: Express.Multer.File
}
