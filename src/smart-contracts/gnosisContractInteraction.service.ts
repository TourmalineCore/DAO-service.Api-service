import { Injectable } from '@nestjs/common';
import { Contract, ethers, PopulatedTransaction } from 'ethers';
import GNOSIS_SAFE_ABI from '../web3/abis/gnosisSafe.abi';
import { Web3Service } from '../web3/web3.service';

@Injectable()
export class GnosisContractInteractionService {
  constructor(private readonly web3Service: Web3Service) {}

  async execTransactionAsync(
    daoAddress: string,
    senderAddress: string,
    signature: string,
    payload,
  ): Promise<PopulatedTransaction> {
    const gnosisSafe = this.getGnosisSafeContract(daoAddress);

    return await gnosisSafe.populateTransaction.execTransaction(
      payload.to,
      payload.value,
      payload.data,
      payload.operation,
      payload.safeTxGas,
      payload.baseGas,
      payload.gasPrice,
      payload.gasToken,
      payload.refundReceiver,
      signature,
      { from: senderAddress },
    );
  }

  private getGnosisSafeContract(daoAddress: string): Contract {
    return new ethers.Contract(
      daoAddress,
      GNOSIS_SAFE_ABI,
      this.web3Service.ethersProvider,
    );
  }
}
