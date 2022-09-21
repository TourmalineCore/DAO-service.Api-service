import { Module } from '@nestjs/common';
import { WalletConnectSessionsModule } from '../wallet-connect-sessions/walletConnectSessions.module';
import { WalletService } from './wallet.service';

@Module({
  providers: [WalletService],
  exports: [WalletService],
  imports: [WalletConnectSessionsModule],
})
export class WalletModule {}
