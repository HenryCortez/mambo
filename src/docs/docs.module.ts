import { Module } from '@nestjs/common'
import { EncryptionModule } from './encryption/encryption.module'
import { SendsModule } from './sends/sends.module'
import { DocsController } from './docs.controller'
import { EncryptionService } from './encryption/encryption.service'
import { DocsService } from './docs.service'
import { CreationsService } from './creations/creations.service'
import { PdfService } from './pdf/pdf.service'

@Module({
  imports: [EncryptionModule, SendsModule],
  controllers: [DocsController],
  providers: [EncryptionService, DocsService, CreationsService, PdfService],
  exports: [EncryptionModule, SendsModule]
})
export class DocsModule {}
