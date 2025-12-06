import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { encodeArithmetic, decodeArithmetic } from './arithmetic.util'

@Injectable()
export class EncryptionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Encripta el contenido de un documento y guarda el resultado en la BD
   * @param id_doc - ID del documento a encriptar
   * @param content - Contenido del documento (texto extraído del PDF)
   */
  async encrypt(id_doc: number, content: string) {
    // Verificar que el documento existe
    const doc = await this.prisma.docs.findUnique({
      where: { id: id_doc }
    })

    if (!doc) {
      throw new NotFoundException(`Documento con ID ${id_doc} no encontrado`)
    }

    // Verificar si ya está encriptado
    const existingEncryption = await this.prisma.encryptions.findFirst({
      where: { id_doc }
    })

    if (existingEncryption) {
      throw new BadRequestException(`El documento con ID ${id_doc} ya está encriptado`)
    }

    if (!content || content.trim() === '') {
      throw new BadRequestException('El contenido no puede estar vacío')
    }

    // Encriptar usando codificación aritmética
    const { code, length, frequencies } = encodeArithmetic(content)

    // Guardar la encriptación en la BD
    const encryption = await this.prisma.encryptions.create({
      data: {
        id_doc,
        code,
        length,
        frequencies
      }
    })

    // Actualizar la categoría del documento a ENCRYPTED
    await this.prisma.docs.update({
      where: { id: id_doc },
      data: { category: 'ENCRYPTED' }
    })

    return encryption
  }

  /**
   * Desencripta un documento y retorna el contenido original
   * @param id_doc - ID del documento a desencriptar
   */
  async decrypt(id_doc: number): Promise<string> {
    // Buscar la encriptación del documento
    const encryption = await this.prisma.encryptions.findFirst({
      where: { id_doc }
    })

    if (!encryption) {
      throw new NotFoundException(`No se encontró encriptación para el documento con ID ${id_doc}`)
    }

    // Desencriptar y retornar el contenido original
    const decryptedContent = decodeArithmetic(
      encryption.code,
      encryption.length,
      encryption.frequencies as Record<string, number>
    )

    return decryptedContent
  }
}
