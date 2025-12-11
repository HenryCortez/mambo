import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Logger,
  UseGuards,
  Req
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth
} from '@nestjs/swagger'
import { CreateDocDto } from './dto/create-doc.dto'
import { DocsService } from './docs.service'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { CommonService } from 'src/common/common.service'

@ApiTags('docs')
@Controller('docs')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
export class DocsController {
  constructor(
    private readonly docsService: DocsService,
    private readonly jwtService: CommonService
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
    @Body() createDocDto: CreateDocDto,
    @Req() req
  ) {
    try {
      const decodedToken = this.jwtService.getDatosToken(req.headers.authorization)
      const dtoWithFile = {
        ...createDocDto,
        file
      }
      return await this.docsService.createDocument(dtoWithFile, decodedToken)
    } catch (error) {
      Logger.error('Error processing document upload:', error)
      throw error
    }
  }

  @Get('my-documents')
  @ApiOperation({ summary: 'Get all documents created by the user' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async getMyDocuments(@Req() req) {
    try {
      const decodedToken = this.jwtService.getDatosToken(req.headers.authorization)
      return await this.docsService.getDocumentsByUser(decodedToken.sub)
    } catch (error) {
      Logger.error('Error getting user documents:', error)
      throw error
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found or access denied' })
  async getDocumentById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    try {
      const decodedToken = this.jwtService.getDatosToken(req.headers.authorization)
      return await this.docsService.getDocumentById(id, decodedToken.sub)
    } catch (error) {
      Logger.error('Error getting document by ID:', error)
      throw error
    }
  }
}
