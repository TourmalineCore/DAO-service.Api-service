import axios, { AxiosResponse } from 'axios';
import { ethers, PopulatedTransaction } from 'ethers';
import { ETHER_NAME } from '../consts';
import { ethersProvider, gnosisSafeAbi } from '../web3/abis/hyperDao.abi';
import DaoAsset from '../models/DaoAsset';
import parseDaoAssets from './parseDaoAssets';
import {
  SafeInfoResponseType,
  SafeMultisigEstimateTxResponseV2Type,
  SafeMultisigTransactionEstimateResponseType,
  SafeMultisigTransactionType,
  TransactionType,
} from '../types/types';

type GnosisParams = {
  sender?: string;
  DAOaddress: string;
};

function useGnosis(
  userId,
  { sender: senderAddress, DAOaddress }: GnosisParams,
) {
  const gnosisSafe = new ethers.Contract(
    DAOaddress,
    gnosisSafeAbi,
    ethersProvider,
  );

  async function getDaoAssets(): Promise<DaoAsset[]> {
    try {
      const response = await axios.get(
        `https://safe-transaction.rinkeby.gnosis.io/api/v1/safes/${DAOaddress}/balances/?trusted=false&exclude_spam=false`,
      );

      return parseDaoAssets(response.data);
    } catch (error) {
      console.log("[ERROR] Couldn't get dao balance");
      throw new Error(error);
    }
  }

  async function getBalanceInEth() {
    return parseFloat(
      (await getDaoAssets()).find((asset) => asset.tokenName === ETHER_NAME)
        .balance,
    );
  }

  async function addOwnerWithThreshold(
    address: string,
    threshold: number,
  ): Promise<PopulatedTransaction> {
    let data: null | PopulatedTransaction = null;

    try {
      data = await gnosisSafe.populateTransaction.addOwnerWithThreshold(
        address,
        threshold,
        {
          from: senderAddress,
        },
      );
    } catch (error) {
      console.log(
        '[ERROR] Gnosis populate a transaction "addOwnerWithThreshold" failed',
        error,
      );
      throw new Error(error);
    }

    return data;
  }

  async function saveToGnosis(
    payload: SafeMultisigTransactionType,
  ): Promise<AxiosResponse<SafeMultisigTransactionEstimateResponseType, any>> {
    const multisigTransactionsData = {
      ...payload,
      value: payload.value.toString(),
    };

    try {
      return await axios.post(
        `https://safe-transaction.rinkeby.gnosis.io/api/v1/safes/${DAOaddress}/multisig-transactions/`,
        JSON.stringify(multisigTransactionsData),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async function getTransactionHash(payload: TransactionType): Promise<string> {
    try {
      return await gnosisSafe.callStatic.getTransactionHash(
        payload.to,
        payload.value,
        payload.data,
        payload.operation,
        payload.safeTxGas,
        payload.baseGas,
        payload.gasPrice,
        payload.gasToken,
        payload.refundReceiver,
        payload.nonce,
      );
    } catch (error) {
      console.log('[ERROR] Gnosis getting a Transaction Hash failed', error);
      throw new Error(error);
    }
  }

  async function getDAO(): Promise<SafeInfoResponseType> {
    try {
      const response = await axios.get(
        `https://safe-transaction.rinkeby.gnosis.io/api/v1/safes/${DAOaddress}`,
      );
      return response.data;
    } catch (error) {
      console.log('[ERROR] Getting DAO from Gnosis failed');
      throw new Error(error);
    }
  }

  async function getGasEstimation(
    transaction: TransactionType,
  ): Promise<SafeMultisigEstimateTxResponseV2Type> {
    const payload: TransactionType = {
      data: transaction.data,
      to: DAOaddress,
      value: 0,
      operation: 0,
    };

    try {
      const response = await axios.post(
        `https://safe-relay.rinkeby.gnosis.io/api/v2/safes/${DAOaddress}/transactions/estimate/`,
        payload,
      );
      return response.data;
    } catch (error) {
      const errorText =
        error?.response?.data?.exception || 'something went wrong';
      console.log('[ERROR] Safe relay failed', errorText);
      throw new Error(errorText);
    }
  }

  async function isOwnerAsync(ownerAddress: string) {
    const { owners } = await getDAO();

    return (
      owners.filter((x) => x.toLowerCase() === ownerAddress.toLowerCase())
        .length > 0
    );
  }

  async function removeOwner(
    prevOwner: string,
    address: string,
    treshold: number,
  ): Promise<PopulatedTransaction> {
    try {
      /**
       * @param prevOwner Owner that pointed to the owner to be removed in the linked list
       * @param owner Owner address to be removed.
       * @param _threshold New threshold.
       */
      return await gnosisSafe.populateTransaction.removeOwner(
        prevOwner,
        address,
        treshold,
      );
    } catch (error) {
      console.log(
        '[ERROR] Gnosis populate a transaction "removeOwner" failed',
        error,
      );
      throw new Error(error);
    }
  }

  return {
    getDaoAssets,
    getBalanceInEth,
    addOwnerWithThreshold,
    saveToGnosis,
    getTransactionHash,
    getDAO,
    getGasEstimation,
    isOwnerAsync,
    removeOwner,
  };
}

export default useGnosis;
