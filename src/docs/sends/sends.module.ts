import { Module } from '@nestjs/common'
import { SendsService } from './sends.service'
import { SendsController } from './sends.controller'

@Module({
  providers: [SendsService],
  controllers: [SendsController],
  exports: [SendsService]
})
export class SendsModule {}
