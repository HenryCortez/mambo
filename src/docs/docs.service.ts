import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'

@Injectable()
export class DocsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveDocumentOnCloud(document: any) {
    let url
    return url
  }

  async createDocument(dto: any) {}
}
