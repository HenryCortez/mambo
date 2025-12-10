import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsJSON } from 'class-validator'

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
  @IsOptional()
  @IsString()
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

  @ApiProperty({
    description: 'Codigo de encriptado front',
    required: false,
    example: '15.5135135151'
  })
  @IsOptional()
  @IsString()
  code?: string

  @ApiProperty({
    description: 'Largo del texto del mensaje',
    required: false,
    example: '2000'
  })
  @IsOptional()
  @IsNumber()
  length?: number

  @ApiProperty({
    description: '',
    required: false,
    example: '123456'
  })
  @IsOptional()
  @IsJSON()
  frequencies?: string

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Archivo a subir',
    required: true
  })
  @IsOptional()
  file?: Express.Multer.File
}
