import { Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiBearerAuth
} from '@nestjs/swagger'
import { StrapiService } from './strapi.service'

@ApiTags('Strapi - Gestión de Archivos')
@ApiBearerAuth()
@Controller('strapi')
export class StrapiController {
  constructor(private readonly strapiService: StrapiService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir un archivo PDF a Strapi',
    description: 'Sube un archivo PDF al servidor Strapi y lo almacena en la carpeta "mambo"'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo PDF a subir'
        }
      },
      required: ['file']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo subido exitosamente',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'http://localhost:1337/uploads/documento_123.pdf' },
        id: { type: 'number', example: 1 }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Formato de archivo no válido' })
  @ApiResponse({ status: 500, description: 'Error al subir el archivo' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.strapiService.uploadPdf(file)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener información de un archivo',
    description: 'Obtiene la información detallada de un archivo por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del archivo en Strapi', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Información del archivo',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'documento.pdf' },
        url: { type: 'string', example: 'http://localhost:1337/uploads/documento.pdf' },
        mime: { type: 'string', example: 'application/pdf' },
        size: { type: 'number', example: 1024 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al obtener el archivo' })
  async getFile(@Param('id') id: string) {
    return this.strapiService.getFile(Number(id))
  }

  @Get(':id/url')
  @ApiOperation({
    summary: 'Obtener URL de un archivo',
    description: 'Obtiene la URL pública de un archivo por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del archivo en Strapi', type: Number })
  @ApiResponse({
    status: 200,
    description: 'URL del archivo',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'http://localhost:1337/uploads/documento.pdf' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al obtener la URL del archivo' })
  async getFileUrl(@Param('id') id: string) {
    const url = await this.strapiService.getFileUrlById(Number(id))
    return { url }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un archivo',
    description: 'Elimina un archivo del servidor Strapi por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del archivo a eliminar', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Archivo eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Archivo eliminado correctamente' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al eliminar el archivo' })
  async deleteFile(@Param('id') id: string) {
    await this.strapiService.deleteFile(Number(id))
    return {
      success: true,
      message: 'Archivo eliminado correctamente'
    }
  }
}
