import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { StrapiService } from 'src/common/strapi/strapi.service'
import { CreateDocDto } from './dto/create-doc.dto'

@Injectable()
export class DocsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly strapi: StrapiService
  ) {}

  async createDocument(dto: CreateDocDto) {
    const { file, ...dtores } = dto
    if (file === null || file === undefined) throw new Error('No se proporciono un archivo')
    if (file.mimetype !== 'application/pdf') throw new Error('Solo se permiten archivos PDF')
    const doc_upload = await this.strapi.uploadPdf(file)

    

    return {
      fileName: file.originalname,
      fileSize: file.size,
      dtores
    }
  }
}
