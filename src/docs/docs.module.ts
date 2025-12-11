import { Module } from '@nestjs/common'
import { EncryptionModule } from './encryption/encryption.module'
import { DocsController } from './docs.controller'
import { EncryptionService } from './encryption/encryption.service'
import { DocsService } from './docs.service'
import { CreationsService } from './creations/creations.service';

@Module({
  imports: [EncryptionModule],
  controllers: [DocsController],
  providers: [EncryptionService, DocsService, CreationsService],
  exports: [EncryptionModule]
})
export class DocsModule {}
