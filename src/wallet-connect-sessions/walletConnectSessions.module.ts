import { Module } from '@nestjs/common';
import { WalletConnectSessionsService } from './walletConnectSessions.service';
import { WalletConnectSessionsController } from './walletConnectSessions.controller';
import { RedisModule } from '../infrastructure/redis/redis.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [WalletConnectSessionsController],
  providers: [WalletConnectSessionsService],
  exports: [WalletConnectSessionsService],
  imports: [RedisModule, UsersModule],
})
export class WalletConnectSessionsModule {}
