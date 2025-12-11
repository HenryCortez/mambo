import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { encodeArithmetic, decodeArithmetic } from './arithmetic.util'
import { CreateEncryptionDto } from './dto/create-encryption.dto'

@Injectable()
export class EncryptionService {
  constructor(private readonly prisma: PrismaService) {}

  async createEncryption(dto: CreateEncryptionDto) {
    const res = encodeArithmetic(dto.code)
    return await this.prisma.encryptions.create({
      data: {
        id_doc: dto.id_doc, // Add the required doc ID
        code_front: dto.code,
        code_back: res.code,
        length_front: dto.length as number,
        length_back: res.length,
        frequencies_front: dto.frequencies,
        frequencies_back: res.frequencies
      }
    })
  }
}
