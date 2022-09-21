import { ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';

export default class DaoAsset {
  public readonly tokenName: string;
  public readonly tokenSymbol: string;
  public readonly balance: string;
  public readonly balanceInEthers: string;
  public readonly tokenAddress: string | null;

  constructor(
    tokenName: string,
    tokenSymbol: string,
    balance: string,
    tokenAddress: string | null,
  ) {
    if (!tokenName) {
      throw new Error('The dao asset should have a token name');
    }

    if (!tokenSymbol) {
      throw new Error('The dao asset should have a token symbol');
    }

    if (!balance) {
      throw new Error('The dao asset should have a balance');
    }

    if (tokenAddress) {
      if (!ethers.utils.isAddress(tokenAddress)) {
        throw new Error('The token address is invalid');
      }
    }

    this.tokenName = tokenName;
    this.tokenSymbol = tokenSymbol;
    this.balance = balance;
    this.balanceInEthers = formatEther(balance);
    this.tokenAddress = tokenAddress;
  }
}
