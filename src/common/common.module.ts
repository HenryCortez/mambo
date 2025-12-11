import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaService } from './prisma/prisma.service'
import { TotpService } from './totp/totp.service'
import { StrapiModule } from './strapi/strapi.module'
import { CommonService } from './common.service';

@Global()
@Module({
  imports: [
    StrapiModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' }
    })
  ],
  providers: [PrismaService, TotpService, CommonService],
  exports: [PrismaService, TotpService, StrapiModule, CommonService]
})
export class CommonModule {}
