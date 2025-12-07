import { Module } from '@nestjs/common'
import { EncryptionService } from './encryption.service'
import { CommonModule } from '../../common/common.module'

@Module({
  imports: [CommonModule],
  providers: [EncryptionService],
  exports: [EncryptionService]
})
export class EncryptionModule {}
