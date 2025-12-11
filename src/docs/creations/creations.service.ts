import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'

@Injectable()
export class CreationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCreation(id_user: number, id_doc: number) {
    return await this.prisma.creations.create({
      data: {
        id_user,
        id_doc,
        status: 'DRAFT'
      }
    })
  }
}
