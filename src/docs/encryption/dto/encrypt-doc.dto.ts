import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString } from 'class-validator'

export class EncryptDocDto {
  @ApiProperty({
    description: 'ID del documento a encriptar',
    example: 1
  })
  @IsInt()
  @IsNotEmpty()
  id_doc: number

  @ApiProperty({
    description: 'Contenido del documento (texto extraído del PDF)',
    example: 'Este es el contenido del documento...'
  })
  @IsString()
  @IsNotEmpty()
  content: string
}
