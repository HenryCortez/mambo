import { Module } from '@nestjs/common'
import { EncryptionModule } from './encryption/encryption.module'
import { DocsController } from './docs.controller'
import { EncryptionService } from './encryption/encryption.service'
import { CommonModule } from '../common/common.module'
import { DocsService } from './docs.service'

@Module({
  imports: [EncryptionModule, CommonModule],
  controllers: [DocsController],
  providers: [EncryptionService, DocsService],
  exports: [EncryptionModule]
})
export class DocsModule {}
