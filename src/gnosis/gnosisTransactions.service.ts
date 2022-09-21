import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { SafeInfoResponseType, SafeMultisigConfirmation } from '../types/types';
import DaoAsset from '../models/DaoAsset';
import parseDaoAssets from './parseDaoAssets';

@Injectable()
export class GnosisTransactionsService {
  /**
   * Used for a proposal voting
   * @param safeTxHash
   * @param payload
   */
  async updateTransactionConfirmationAsync(
    safeTxHash: string,
    payload: SafeMultisigConfirmation,
  ) {
    try {
      await axios.post(
        `https://safe-transaction.rinkeby.gnosis.io/api/v1/multisig-transactions/${safeTxHash}/confirmations/`,
        payload,
      );
    } catch (error) {
      console.log(error);
      throw new Error(
        `Couldn't confirm a transaction with safeTxHash ${safeTxHash}`,
      );
    }
  }

  async getDaoAsync(daoAddress: string): Promise<SafeInfoResponseType> {
    try {
      const response = await axios.get(
        `https://safe-transaction.rinkeby.gnosis.io/api/v1/safes/${daoAddress}`,
      );
      return response.data;
    } catch (error) {
      console.log('[ERROR] Getting DAO from Gnosis failed');
      throw new Error(error);
    }
  }

  async findMultisigTransactionBySafeTxHashAsync(
    daoAddress: string,
    safeTxHash: string,
  ) {
    try {
      const response = await axios.get(
        `https://safe-transaction.rinkeby.gnosis.io/api/v1/safes/${daoAddress}/multisig-transactions/?safe_tx_hash=${safeTxHash}`,
      );

      const { results, count } = response.data;

      if (count === 0) {
        throw new Error(`Transaction with safeTxHash ${safeTxHash} not found`);
      }

      return results[0];
    } catch (error) {
      throw new Error(error);
    }
  }

  async findMultisigTransactionsWithNonceMoreOrEqualAsync(
    daoAddress: string,
    nonce: number,
  ) {
    try {
      const response = await axios.get(
        `https://safe-transaction.rinkeby.gnosis.io/api/v1/safes/${daoAddress}/multisig-transactions/?nonce__gte=${nonce}`,
      );

      return response.data.results;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getDaoAssetsAsync(daoAddress: string): Promise<DaoAsset[]> {
    try {
      const response = await axios.get(
        `https://safe-transaction.rinkeby.gnosis.io/api/v1/safes/${daoAddress}/balances/?trusted=false&exclude_spam=false`,
      );

      return parseDaoAssets(response.data);
    } catch (error) {
      console.log("[ERROR] Couldn't get dao balance");
      throw new Error(error);
    }
  }
}
