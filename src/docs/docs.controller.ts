import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Logger
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { EncryptionService } from './encryption/encryption.service'
import { EncryptDocDto } from './encryption/dto/encrypt-doc.dto'
import { CreateDocDto } from './dto/create-doc.dto'
import { DocsService } from './docs.service'

@ApiTags('docs')
@Controller('docs')
export class DocsController {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly docsService: DocsService
  ) {}

  // @Post('encrypt')
  // @ApiOperation({ summary: 'Encriptar el contenido de un documento' })
  // @ApiResponse({ status: 201, description: 'Documento encriptado exitosamente' })
  // @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  // @ApiResponse({ status: 400, description: 'Documento ya encriptado o contenido vacío' })
  // async encrypt(@Body() encryptDocDto: EncryptDocDto) {
  //   const { id_doc, content } = encryptDocDto
  //   const encryption = await this.encryptionService.encrypt(id_doc, content)
  //   return {
  //     message: 'Documento encriptado exitosamente',
  //     encryption
  //   }
  // }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document with metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateDocDto })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocDto: CreateDocDto
  ) {
    try {
      // Combine the file with the DTO
      const dtoWithFile = {
        ...createDocDto,
        file
      }
      return await this.docsService.createDocument(dtoWithFile)
 
    } catch (error) {
      Logger.error('Error processing document upload:', error)
      throw error
    }
  }
}
