import { Injectable } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';
import { Web3Service } from '../web3/web3.service';
import TransactionReceiptLogsParser from './parsers/transactionReceiptLogsParser';
import { Group, GROUP_STATE } from '../models/Group';
import {
  findGroupByIdAsync,
  findPendingGroupsAsync,
  findUserDaoGroupsAsync,
  isGroupOwnerAsync,
} from '../queries/groupQueries';
import {
  createGroupAsync,
  initDaoAsync,
  updateGroupStateAsync,
} from '../commands/groupCommands';
import { getAddress } from 'ethers/lib/utils';
import { findUserByIdAsync } from '../queries/userQueries';
import { buildLinkToGnosisUI } from '../utils/buildLinkToGnosisUI';
import { NETWORK } from '../consts';

const SUCCESS_STATUS_CODE = 1;

@Injectable()
export class GroupsService {
  constructor(
    private readonly walletService: WalletService,
    private readonly web3Service: Web3Service,
  ) {}

  async findByIdAsync(groupId: number): Promise<Group> {
    return await findGroupByIdAsync(groupId);
  }

  async findPendingGroupsAsync(userId: number): Promise<Group[]> {
    return await findPendingGroupsAsync(userId);
  }

  async findDaoGroupsAsync(userId: number): Promise<Group[]> {
    return await findUserDaoGroupsAsync(userId);
  }

  async checkIsUserInGroupAsync(
    groupId: number,
    userId: number,
  ): Promise<void> {
    const isGroupOwner = await isGroupOwnerAsync(groupId, userId);

    if (!isGroupOwner) {
      throw new Error(`User is not a group owner`);
    }
  }

  async updateGroupAsync(
    groupId: number,
    newGroupState: GROUP_STATE,
    userId: number,
  ): Promise<void> {
    const group = await this.findByIdAsync(groupId);

    if (!group) {
      throw new Error('Group not found');
    }

    if (userId !== group.ownerId) {
      throw new Error('Only group owner can change group status');
    }

    if (newGroupState === GROUP_STATE.DAO_CREATED) {
      throw new Error(
        `The group state cannot be changed on ${GROUP_STATE.DAO_CREATED}`,
      );
    }

    await updateGroupStateAsync(group, newGroupState);
  }

  async initDaoAsync(groupId, owners, threshold, userId): Promise<string> {
    const group = await this.findByIdAsync(groupId);

    if (!group) {
      throw new Error(`Group not found`);
    }

    if (group.state === GROUP_STATE.DAO_CREATED) {
      throw new Error(`DAO has already been initialized`);
    }

    if (group.state !== GROUP_STATE.DAO_INITIALIZATION) {
      throw new Error(
        `The group must has state '${GROUP_STATE.DAO_INITIALIZATION}' to create a DAO`,
      );
    }

    if (group.ownerId !== userId) {
      throw new Error(`Only group owner can init DAO`);
    }

    const groupOwner = await findUserByIdAsync(group.ownerId);
    const normalizedOwnerAddresses = this.normalizeOwnerAddresses(
      owners,
      groupOwner.address,
    );

    this.validateDaoCreationParams(threshold, normalizedOwnerAddresses);

    const userNonce = await this.web3Service.ethersProvider.getTransactionCount(
      groupOwner.address,
    );

    const transaction =
      await this.web3Service.hyperDAO.populateTransaction.assembleDao(
        normalizedOwnerAddresses,
        threshold,
        { from: groupOwner.address },
      );

    const transactionFin = {
      data: transaction.data,
      from: transaction.from,
      to: transaction.to,
      gasPrice: '0x02540be400',
      gas: '0x4c4b40',
      value: '0',
      nonce: userNonce,
    };

    const txHash = await this.walletService.sendTransaction(
      group.ownerId,
      transactionFin,
    );

    const daoAddress = await this.waitForDaoInitialization(txHash);

    const gnosisUrl = buildLinkToGnosisUI(NETWORK.RINKEBY, daoAddress);

    await initDaoAsync(
      group,
      daoAddress,
      gnosisUrl,
      normalizedOwnerAddresses,
      threshold,
    );

    return daoAddress;
  }

  async createGroupAsync(
    id: number,
    title: string,
    ownerId: number,
    ownerUsername: string,
    ownerFirstName: string,
    ownerLastName: string,
  ): Promise<number> {
    return createGroupAsync(
      id,
      title,
      ownerId,
      ownerUsername,
      ownerFirstName,
      ownerLastName,
    );
  }

  private validateDaoCreationParams(
    threshold: number,
    ownerAddresses: string[],
  ): void {
    if (threshold < 1) {
      throw new Error('The threshold cannot be less than 1');
    }

    if (ownerAddresses.length < 2) {
      throw new Error('DAO must have at least 2 owners');
    }

    if (threshold > ownerAddresses.length) {
      throw new Error('The threshold cannot be more than owners count');
    }

    if (new Set(ownerAddresses).size !== ownerAddresses.length) {
      throw new Error("Owner's addresses should be unique");
    }
  }

  private normalizeOwnerAddresses(
    ownerAddresses: string[],
    groupOwnerAddress,
  ): string[] {
    const normalizedOwnerAddresses = ownerAddresses.map((address) =>
      getAddress(address),
    );

    if (!normalizedOwnerAddresses.includes(groupOwnerAddress)) {
      normalizedOwnerAddresses.push(groupOwnerAddress);
    }

    return normalizedOwnerAddresses;
  }

  private waitForDaoInitialization(
    txHash: string,
    trackingInterval = 5_000,
    maxTrackingTime = 120_000,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let isTransactionFound = false;

      const timerId = setInterval(async () => {
        let receipt = null;

        try {
          receipt = await this.web3Service.ethersProvider.getTransactionReceipt(
            txHash,
          );

          if (receipt) {
            clearInterval(timerId);
            isTransactionFound = true;

            if (receipt.status === SUCCESS_STATUS_CODE) {
              const daoAddress = TransactionReceiptLogsParser.parseDaoAddress(
                receipt.logs,
              );
              resolve(daoAddress);
            }

            reject(new Error('Transaction failed'));
          }
        } catch (err) {
          reject(new Error(err));
        }
      }, trackingInterval);

      setTimeout(async () => {
        if (!isTransactionFound) {
          clearInterval(timerId);
          const maxTrackingSeconds = maxTrackingTime / 1000;
          reject(
            new Error(
              `We were tracking transaction for ${maxTrackingSeconds} seconds but haven't found it`,
            ),
          );
        }
      }, maxTrackingTime);
    });
  }
}
