import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { StrapiService } from 'src/common/strapi/strapi.service'
import { CATEGORY, CreateDocDto } from './dto/create-doc.dto'
import { EncryptionService } from './encryption/encryption.service'

@Injectable()
export class DocsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly strapi: StrapiService,
    private readonly encryption: EncryptionService
  ) {}

  async createDocument(dto: CreateDocDto) {
    const { file, ...dto_res } = dto
    if (file === null || file === undefined) throw new Error('No se proporciono un archivo')
    if (file.mimetype !== 'application/pdf') throw new Error('Solo se permiten archivos PDF')

    const doc_temp = await this.prisma.docs.create({
      data: {
        category: dto_res.category,
        type: dto_res.type,
        name: file.originalname
      }
    })

    let doc_upload

    switch (doc_temp.category) {
      case CATEGORY.NORMAL:
        if (dto_res.password === null || dto_res.password === undefined)
          throw new Error('Un documento categoria normal, nesesita contraseña')
        doc_upload = await this.strapi.uploadPdf(file)
        doc_temp.url = doc_upload.url
        doc_temp.id_strapi = doc_upload.id
        doc_temp.password = dto_res.password!
        await this.prisma.docs.update(doc_upload)
        break
      case CATEGORY.ENCRYPTED:
        break
      default:
        break
    }

   

    //const doc = await this.prisma.docs.create()

    return {
      fileName: file.originalname,
      fileSize: file.size,
      dtores: dto_res
    }
  }
}
