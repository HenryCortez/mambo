import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { StrapiService } from 'src/common/strapi/strapi.service'
import { CreateDocDto } from './dto/create-doc.dto'

@Injectable()
export class DocsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly strapi: StrapiService
  ) {}

  async createDocument(dto: CreateDocDto, file: Express.Multer.File,) {}
}
