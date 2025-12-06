import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { TotpService } from './totp/totp.service'

@Global()
@Module({
  providers: [PrismaService, TotpService],
  exports: [PrismaService, TotpService]
})
export class CommonModule {}
