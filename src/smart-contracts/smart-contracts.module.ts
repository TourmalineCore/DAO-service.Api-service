import { Module } from '@nestjs/common';
import { Web3Module } from '../web3/web3.module';
import { Erc20ContractInteractionService } from './erc20ContractInteraction.service';
import { GnosisContractInteractionService } from './gnosisContractInteraction.service';

@Module({
  providers: [
    Erc20ContractInteractionService,
    GnosisContractInteractionService,
  ],
  exports: [Erc20ContractInteractionService, GnosisContractInteractionService],
  imports: [Web3Module],
})
export class SmartContractsModule {}
