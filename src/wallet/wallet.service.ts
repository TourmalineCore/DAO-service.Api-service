import { ITxData as TransactionType } from '@walletconnect/types';
import { WalletConnectSessionsService } from '../wallet-connect-sessions/walletConnectSessions.service';
import WalletConnect from '@walletconnect/client';
import walletConnectParams from './walletConnectParams';
import { Injectable } from '@nestjs/common';
import { TransactionSigningResult } from '../models/TransactionSigningResult';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletConnectSessionsService: WalletConnectSessionsService,
  ) {}

  async sendTransaction(
    userId: number,
    transaction: TransactionType,
  ): Promise<string> {
    const connector = await this.getWalletConnector(userId);
    return connector.sendTransaction(transaction);
  }

  async trySignMessage(
    userId: number,
    args: any[],
  ): Promise<TransactionSigningResult> {
    try {
      const signature = await this.signMessage(userId, args);
      return new TransactionSigningResult(true, signature);
    } catch (err) {
      return new TransactionSigningResult(false);
    }
  }

  async signMessage(userId: number, args: any[]) {
    const connector = await this.getWalletConnector(userId);
    return connector.signMessage(args);
  }

  private async getWalletConnector(userId: number): Promise<WalletConnect> {
    const session = await this.walletConnectSessionsService.findByUserIdAsync(
      userId,
    );

    return new WalletConnect({ ...walletConnectParams, session });
  }
}
