import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNumber, IsOptional, IsBoolean } from 'class-validator'

export class CreateSendDto {
  @ApiProperty({
    description: 'ID del documento a enviar',
    example: 1
  })
  @IsNumber()
  id_doc: number

  @ApiProperty({
    description: 'Array de IDs de los usuarios receptores',
    example: [2, 3, 4],
    type: [Number]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  receptors: number[]

  @ApiPropertyOptional({
    description: 'Permiso de lectura para los receptores',
    default: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  reading?: boolean

  @ApiPropertyOptional({
    description: 'Permiso de escritura para los receptores',
    default: false,
    example: false
  })
  @IsOptional()
  @IsBoolean()
  writing?: boolean
}

export class SendResponseDto {
  @ApiProperty({
    description: 'ID del envío creado',
    example: 1
  })
  id: number

  @ApiProperty({
    description: 'ID del emisor',
    example: 1
  })
  id_emisor: number

  @ApiProperty({
    description: 'ID del receptor',
    example: 2
  })
  id_receptor: number

  @ApiProperty({
    description: 'ID del documento',
    example: 1
  })
  id_doc: number

  @ApiProperty({
    description: 'Permiso de lectura',
    example: true,
    required: false
  })
  reading?: boolean | null

  @ApiProperty({
    description: 'Permiso de escritura',
    example: false,
    required: false
  })
  writing?: boolean | null
}

export class MultipleSendResponseDto {
  @ApiProperty({
    description: 'Array de envíos creados',
    type: [SendResponseDto]
  })
  sends: SendResponseDto[]

  @ApiProperty({
    description: 'Mensaje de éxito',
    example: 'Document sent successfully to 3 recipients'
  })
  message: string
}
