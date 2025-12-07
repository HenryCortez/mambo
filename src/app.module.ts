import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { CommonModule } from './common/common.module'
import { AuthModule } from './auth/auth.module'
import { DocsModule } from './docs/docs.module'

@Module({
  imports: [
    UsersModule,
    CommonModule,
    AuthModule,
    DocsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
