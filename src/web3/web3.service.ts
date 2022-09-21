import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { HYPER_DAO_ABI } from './abis/hyperDao.abi';

@Injectable()
export class Web3Service {
  public ethersProvider;
  public hyperDAO;

  constructor() {
    this.ethersProvider = ethers.getDefaultProvider('rinkeby', {
      infura: process.env.INFURA_KEY,
    });

    this.hyperDAO = new ethers.Contract(
      process.env.NIN_DAO_CONTRACT_ADDRESS,
      HYPER_DAO_ABI,
      this.ethersProvider,
    );
  }
}
