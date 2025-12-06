import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { EncryptionService } from './encryption/encryption.service'
import { EncryptDocDto } from './encryption/dto/encrypt-doc.dto'

@ApiTags('Docs')
@Controller('docs')
export class DocsController {
  constructor(private readonly encryptionService: EncryptionService) {}

  @Post('encrypt')
  @ApiOperation({ summary: 'Encriptar el contenido de un documento' })
  @ApiResponse({ status: 201, description: 'Documento encriptado exitosamente' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @ApiResponse({ status: 400, description: 'Documento ya encriptado o contenido vacío' })
  async encrypt(@Body() encryptDocDto: EncryptDocDto) {
    const { id_doc, content } = encryptDocDto
    const encryption = await this.encryptionService.encrypt(id_doc, content)
    return {
      message: 'Documento encriptado exitosamente',
      encryption
    }
  }

  @Get('decrypt/:id_doc')
  @ApiOperation({ summary: 'Desencriptar un documento y obtener el contenido original' })
  @ApiParam({ name: 'id_doc', description: 'ID del documento a desencriptar' })
  @ApiResponse({ status: 200, description: 'Contenido desencriptado' })
  @ApiResponse({ status: 404, description: 'Encriptación no encontrada' })
  async decrypt(@Param('id_doc', ParseIntPipe) id_doc: number) {
    const decryptedContent = await this.encryptionService.decrypt(id_doc)
    return {
      id_doc,
      content: decryptedContent
    }
  }
}
