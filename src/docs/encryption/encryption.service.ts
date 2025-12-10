import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { encodeArithmetic, decodeArithmetic } from './arithmetic.util'

@Injectable()
export class EncryptionService {
  constructor(private readonly prisma: PrismaService) {}
}
