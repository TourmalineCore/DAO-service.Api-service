import { Module } from '@nestjs/common';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';
import { WalletModule } from '../wallet/wallet.module';
import { GnosisModule } from '../gnosis/gnosis.module';
import { UsersModule } from '../users/users.module';
import { GroupsModule } from '../groups/groups.module';
import { SmartContractsModule } from '../smart-contracts/smart-contracts.module';
import { DaoModule } from '../dao/dao.module';

@Module({
  controllers: [ProposalsController],
  providers: [ProposalsService],
  imports: [
    WalletModule,
    GnosisModule,
    UsersModule,
    GroupsModule,
    SmartContractsModule,
    DaoModule,
  ],
})
export class ProposalsModule {}
