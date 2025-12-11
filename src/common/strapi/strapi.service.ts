import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import axios, { AxiosRequestConfig } from 'axios'
import { ResUploadDto } from './dto/res-upload.dto'

@Injectable()
export class StrapiService {
  private readonly logger = new Logger(StrapiService.name)
  private readonly strapiUrl: string
  private readonly apiKey: string

  constructor() {
    this.strapiUrl = process.env.STRAPI_URL!
    this.apiKey = process.env.API_KEY_STRAPI!

    if (!this.strapiUrl || !this.apiKey) {
      this.logger.warn('⚠️ STRAPI_URL o API_KEY_STRAPI no configurados')
    }
  }

  async uploadPdf(file: Express.Multer.File, customFilename?: string): Promise<ResUploadDto> {
    try {
      if (!this.strapiUrl || !this.apiKey) {
        throw new InternalServerErrorException('Configuración de Strapi faltante')
      }

      // Validar que sea un PDF
      if (file.mimetype !== 'application/pdf') {
        throw new Error('Solo se permiten archivos PDF')
      }

      // Crear FormData con el archivo
      const FormData = require('form-data')
      const formData = new FormData()

      // Usar nombre personalizado o el original, asegurando extensión .pdf
      let filename = customFilename || file.originalname
      if (!filename.toLowerCase().endsWith('.pdf')) {
        filename += '.pdf'
      }

      // Usar el buffer directamente con el FormData
      formData.append('files', file.buffer, {
        filename: filename,
        contentType: 'application/pdf',
        knownLength: file.size
      })

      // Configuración para subir a la carpeta "mambo"
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data'
        },
        params: {
          path: 'mambo' // Especificar la carpeta de destino
        }
      }

      // Subir a Strapi
      const response = await axios.post(`${this.strapiUrl}/upload`, formData, config)

      if (response.data && response.data.length > 0) {
        const uploadedFile = response.data[0]

        // Si Strapi devuelve URL relativa, convertir a absoluta
        let fileUrl = uploadedFile.url
        if (fileUrl.startsWith('/')) {
          const baseUrl = this.strapiUrl.replace('/api', '')
          fileUrl = `${baseUrl}${fileUrl}`
        }

        this.logger.log(`✅ PDF subido exitosamente: ${fileUrl}`)
        return {
          url: fileUrl,
          id: uploadedFile.id,
          name: file.originalname
        } as ResUploadDto
      } else {
        throw new Error('Strapi no devolvió ningún archivo')
      }
    } catch (error) {
      this.logger.error('❌ Error al subir PDF a Strapi:', error.response?.data || error.message)
      throw new InternalServerErrorException('Falló la subida del PDF a Strapi')
    }
  }

  async getFile(fileId: number) {
    try {
      const response = await axios.get(`${this.strapiUrl}/upload/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        }
      })

      if (!response.data) {
        throw new NotFoundException('Archivo no encontrado')
      }

      const fileData = response.data
      return {
        id: fileData.id,
        name: fileData.name,
        url: this.getFileUrl(fileData.url),
        mime: fileData.mime,
        size: fileData.size,
        createdAt: fileData.createdAt,
        updatedAt: fileData.updatedAt,
        // Otros metadatos que pueda devolver Strapi
        ...fileData
      }
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException('Archivo no encontrado')
      }
      this.logger.error(
        'Error al obtener archivo de Strapi:',
        error.response?.data || error.message
      )
      throw new InternalServerErrorException('Error al obtener el archivo')
    }
  }

  async getFileUrlById(fileId: number): Promise<string> {
    const file = await this.getFile(fileId)
    return file.url
  }

  async deleteFile(fileId: number): Promise<void> {
    try {
      // Primero verificamos que el archivo exista
      await this.getFile(fileId)

      // Si llegamos aquí, el archivo existe, procedemos a eliminarlo
      await axios.delete(`${this.strapiUrl}/upload/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        }
      })

      this.logger.log(`✅ Archivo ${fileId} eliminado exitosamente`)
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException('Archivo no encontrado')
      }
      this.logger.error(
        '❌ Error al eliminar archivo de Strapi:',
        error.response?.data || error.message
      )
      throw new InternalServerErrorException('Error al eliminar el archivo de Strapi')
    }
  }

  private getFileUrl(path: string): string | null {
    if (!path) return null
    if (path.startsWith('http')) return path
    const baseUrl = this.strapiUrl.replace('/api', '')
    return `${baseUrl}${path}`
  }
}
