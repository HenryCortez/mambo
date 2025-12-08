import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { TotpService } from './totp/totp.service'
import { StrapiModule } from './strapi/strapi.module'

@Global()
@Module({
  providers: [PrismaService, TotpService],
  exports: [PrismaService, TotpService, StrapiModule],
  imports: [StrapiModule]
})
export class CommonModule {}
