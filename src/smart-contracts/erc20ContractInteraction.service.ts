import { Injectable } from '@nestjs/common';
import { BigNumber, Contract, ethers, PopulatedTransaction } from 'ethers';
import ERC20_ABI from '../web3/abis/erc20.abi';
import { Web3Service } from '../web3/web3.service';

@Injectable()
export class Erc20ContractInteractionService {
  constructor(private readonly web3Service: Web3Service) {}

  async transferErc20TokenAsync(
    tokenAddress: string,
    to: string,
    amount: BigNumber,
  ): Promise<PopulatedTransaction> {
    const erc20Contract = this.getErc20Contract(tokenAddress);

    return await erc20Contract.populateTransaction.transfer(to, amount);
  }

  private getErc20Contract(tokenAddress: string): Contract {
    return new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      this.web3Service.ethersProvider,
    );
  }
}
