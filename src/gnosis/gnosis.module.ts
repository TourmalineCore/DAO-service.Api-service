import { Module } from '@nestjs/common';
import { Web3Module } from '../web3/web3.module';
import { GnosisTransactionsService } from './gnosisTransactions.service';

@Module({
  exports: [GnosisTransactionsService],
  providers: [GnosisTransactionsService],
  imports: [Web3Module],
})
export class GnosisModule {}
