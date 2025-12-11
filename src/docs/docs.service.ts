import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { StrapiService } from 'src/common/strapi/strapi.service'
import { CATEGORY, CreateDocDto } from './dto/create-doc.dto'
import { EncryptionService } from './encryption/encryption.service'
import { CreateEncryptionDto } from './encryption/dto/create-encryption.dto'
import { DecodedToken } from 'src/common/common.service'
import { CreationsService } from './creations/creations.service'
import { PdfService } from './pdf/pdf.service'

@Injectable()
export class DocsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly strapi: StrapiService,
    private readonly encryption: EncryptionService,
    private readonly creation: CreationsService,
    private readonly pdfService: PdfService
  ) {}

  async createDocument(dto: CreateDocDto, decodeToken: DecodedToken) {
    const { file, ...dto_res } = dto
    if (file === null || file === undefined) throw new Error('No se proporciono un archivo')
    if (file.mimetype !== 'application/pdf') throw new Error('Solo se permiten archivos PDF')

    let fileToUpload: Express.Multer.File = file

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

        // Modificar el PDF para agregar el código de encriptado
        fileToUpload = await this.pdfService.addCodeToPdf(file, dto_res.code)

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

    const doc_upload = await this.strapi.uploadPdf(fileToUpload)
    doc_temp.url = doc_upload.url
    doc_temp.id_strapi = doc_upload.id
    const doc_response = await this.prisma.docs.update({
      where: { id: doc_temp.id },
      data: doc_temp
    })

    await this.creation.createCreation(decodeToken.sub, doc_temp.id)

    return doc_response
  }

  async getDocumentsByUser(userId: number) {
    const documents = await this.prisma.docs.findMany({
      where: {
        creations: {
          some: {
            id_user: userId
          }
        }
      },
      include: {
        creations: {
          select: {
            status: true,
            details: true
          }
        },
        encryptions: {
          select: {
            code_front: true,
            length_front: true,
            frequencies_front: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })

    return documents
  }

  async updateDocument(documentId: number, dto: CreateDocDto, decodeToken: DecodedToken) {
    const { file, ...dto_res } = dto

    // Verificar que el documento exista y pertenezca al usuario
    const existingDoc = await this.prisma.docs.findFirst({
      where: {
        id: documentId,
        creations: {
          some: {
            id_user: decodeToken.sub,
            status: 'DRAFT'
          }
        }
      },
      include: {
        encryptions: true
      }
    })

    if (!existingDoc) {
      throw new Error(
        'Documento no encontrado o no tienes acceso para editarlo (solo se pueden editar documentos con status DRAFT)'
      )
    }

    if (file === null || file === undefined) throw new Error('No se proporciono un archivo')
    if (file.mimetype !== 'application/pdf') throw new Error('Solo se permiten archivos PDF')

    let fileToUpload: Express.Multer.File = file

    // Actualizar datos básicos del documento
    const updatedDoc = await this.prisma.docs.update({
      where: { id: documentId },
      data: {
        category: dto_res.category,
        type: dto_res.type,
        name: file.originalname
      }
    })

    // Manejar categorías similar a createDocument
    switch (updatedDoc.category) {
      case CATEGORY.NORMAL:
        if (dto_res.password === null || dto_res.password === undefined)
          throw new Error('Un documento categoria normal, nesesita contraseña')

        await this.prisma.docs.update({
          where: { id: documentId },
          data: { password: dto_res.password }
        })
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

        // Modificar el PDF para agregar el código de encriptado
        fileToUpload = await this.pdfService.addCodeToPdf(file, dto_res.code)

        // Actualizar o crear encriptación
        if (existingDoc.encryptions) {
          // Eliminar encriptación anterior y crear nueva
          await this.prisma.encryptions.deleteMany({
            where: { id_doc: documentId }
          })

          const data_encrypted: CreateEncryptionDto = {
            id_doc: documentId,
            code: dto_res.code,
            length: dto_res.length,
            frequencies: dto_res.frequencies
          }
          await this.encryption.createEncryption(data_encrypted)
        } else {
          const data_encrypted: CreateEncryptionDto = {
            id_doc: documentId,
            code: dto_res.code,
            length: dto_res.length,
            frequencies: dto_res.frequencies
          }
          await this.encryption.createEncryption(data_encrypted)
        }
        break

      default:
        break
    }

    // Subir nuevo archivo a Strapi
    const doc_upload = await this.strapi.uploadPdf(fileToUpload)

    // Actualizar URL y id_strapi del documento
    const finalDoc = await this.prisma.docs.update({
      where: { id: documentId },
      data: {
        url: doc_upload.url,
        id_strapi: doc_upload.id
      }
    })

    return finalDoc
  }

  async getDocumentById(documentId: number, userId: number) {
    const document = await this.prisma.docs.findFirst({
      where: {
        id: documentId,
        creations: {
          some: {
            id_user: userId
          }
        }
      },
      include: {
        creations: {
          select: {
            status: true,
            details: true
          }
        },
        encryptions: {
          select: {
            code_front: true,
            length_front: true,
            frequencies_front: true
          }
        },
        sends: {
          include: {
            receptor: {
              select: { id: true, email: true, name: true }
            }
          }
        }
      }
    })

    if (!document) {
      throw new Error('Documento no encontrado o no tienes acceso a él')
    }

    return document
  }
}
