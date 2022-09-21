import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Web3Module } from '../web3/web3.module';
import { WalletModule } from '../wallet/wallet.module';
import { GnosisModule } from '../gnosis/gnosis.module';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
  imports: [Web3Module, WalletModule, GnosisModule],
})
export class GroupsModule {}
