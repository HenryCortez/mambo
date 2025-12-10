import { Module } from '@nestjs/common'
import { StrapiService } from './strapi.service'
import { StrapiController } from './strapi.controller'

@Module({
  providers: [StrapiService],
  exports: [StrapiService],
  controllers: [StrapiController]
})
export class StrapiModule {}
