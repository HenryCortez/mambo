import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { StrapiService } from 'src/common/strapi/strapi.service'
import { CATEGORY, CreateDocDto } from './dto/create-doc.dto'
import { EncryptionService } from './encryption/encryption.service'
import { CreateEncryptionDto } from './encryption/dto/create-encryption.dto'
import { DecodedToken } from 'src/common/common.service'
import { CreationsService } from './creations/creations.service'

@Injectable()
export class DocsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly strapi: StrapiService,
    private readonly encryption: EncryptionService,
    private readonly creation: CreationsService
  ) {}

  async createDocument(dto: CreateDocDto, decodeToken: DecodedToken) {
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

    switch (doc_temp.category) {
      case CATEGORY.NORMAL:
        if (dto_res.password === null || dto_res.password === undefined)
          throw new Error('Un documento categoria normal, nesesita contraseña')
        doc_temp.password = dto_res.password
        break
      case CATEGORY.ENCRYPTED:
        if (
          dto_res.code === null ||
          dto_res.code === undefined ||
          dto_res.length === 0 ||
          dto_res.length === undefined ||
          dto_res.frequencies === null ||
          dto_res.frequencies === undefined
        )
          throw new Error('No se proporcionaron los datos del encriptado')
        const data_encrypted: CreateEncryptionDto = {
          id_doc: doc_temp.id,
          code: dto_res.code,
          length: dto_res.length,
          frequencies: dto_res.frequencies
        }

        await this.encryption.createEncryption(data_encrypted)

        break
      default:
        break
    }

    const doc_upload = await this.strapi.uploadPdf(file)
    doc_temp.url = doc_upload.url
    doc_temp.id_strapi = doc_upload.id
    const doc_response = await this.prisma.docs.update({
      where: { id: doc_temp.id },
      data: doc_temp
    })

    await this.creation.createCreation(decodeToken.sub, doc_temp.id)

    return doc_response
  }
}
