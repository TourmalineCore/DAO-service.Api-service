import { Injectable } from '@nestjs/common';
import useGnosis from '../gnosis/useGnosis';
import { Group } from '../models/Group';
import { Proposal, PROPOSAL_TYPES } from '../models/Proposal';
import { BigNumber, ethers } from 'ethers';
import { TransactionType } from '../types/types';
import { WalletService } from '../wallet/wallet.service';
import {
  findProposalByIdAsync,
  findProposalsByParamsAsync,
} from '../queries/proposalQueries';
import { GnosisTransactionsService } from '../gnosis/gnosisTransactions.service';
import { UsersService } from '../users/users.service';
import { GroupsService } from '../groups/groups.service';
import {
  createNewProposalAsync,
  markProposalAsExecutedAsync,
} from '../commands/proposalCommands';
import { NewProposalRequestDto } from './dto/newProposalRequest.dto';
import isMultisigTransactionExecutable from '../utils/isMultisigTransactionExecutable';
import buildTransactionSignaturesString from '../utils/buildTransactionSignaturesString';
import { ethersProvider } from '../web3/abis/hyperDao.abi';
import { findUserByAddressAsync } from '../queries/userQueries';
import buildTransactionLinkToEthNetwork from '../utils/buildTransactionLinkToEthNetwork';
import { ETHER_SYMBOL, NETWORK } from '../consts';
import { GnosisContractInteractionService } from '../smart-contracts/gnosisContractInteraction.service';
import { Erc20ContractInteractionService } from '../smart-contracts/erc20ContractInteraction.service';
import { DaoService } from '../dao/dao.service';
import DaoAsset from '../models/DaoAsset';
import {
  addNewGroupOwnerAsync,
  removeGroupOwnerAsync,
} from '../commands/groupCommands';

const { AddressZero } = ethers.constants;
const { parseEther } = ethers.utils;
const DEFAULT_PREV_OWNER_ADDRESS = '0x0000000000000000000000000000000000000001';

@Injectable()
export class ProposalsService {
  constructor(
    private readonly gnosisTransactionsService: GnosisTransactionsService,
    private readonly gnosisContractInteractionService: GnosisContractInteractionService,
    private readonly erc20ContractInteractionService: Erc20ContractInteractionService,
    private readonly daoService: DaoService,
    private readonly walletService: WalletService,
    private readonly usersService: UsersService,
    private readonly groupsService: GroupsService,
  ) {}
  async findByParamsAsync(
    pageNumber: number,
    groupId: number,
    minNonce: number,
  ): Promise<Proposal[]> {
    return await findProposalsByParamsAsync(pageNumber, groupId, minNonce);
  }

  async findByIdAsync(proposalId: number): Promise<Proposal> {
    return await findProposalByIdAsync(proposalId);
  }

  async executeProposalAsync(
    proposalId: number,
    userId: number,
  ): Promise<void> {
    try {
      const proposal: Proposal = await this.findByIdAsync(proposalId);

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      await this.groupsService.checkIsUserInGroupAsync(
        proposal.groupId,
        userId,
      );

      const { DAOaddress } = await proposal.getGroup();

      const sender = await this.usersService.getUserAddressAsync(userId);

      const { nonce, threshold } =
        await this.gnosisTransactionsService.getDaoAsync(DAOaddress);

      const multisigTransaction =
        await this.gnosisTransactionsService.findMultisigTransactionBySafeTxHashAsync(
          DAOaddress,
          proposal.safeTxHash,
        );

      const multisigTransactionCanBeExecuted = isMultisigTransactionExecutable(
        multisigTransaction,
        threshold,
        nonce,
      );

      if (!multisigTransactionCanBeExecuted) {
        throw new Error('The transaction cannot be executed');
      }

      const signaturesString = buildTransactionSignaturesString(
        multisigTransaction.confirmations,
      );

      const populatedTransaction =
        await this.gnosisContractInteractionService.execTransactionAsync(
          DAOaddress,
          sender,
          signaturesString,
          multisigTransaction,
        );

      const userTransactionsCount = await ethersProvider.getTransactionCount(
        sender,
      );

      const txFin = {
        data: populatedTransaction.data,
        from: populatedTransaction.from,
        to: populatedTransaction.to,
        gasPrice: '0x02540be400',
        gas: '0x4c4b40',
        value: '0',
        network: '4',
        nonce: userTransactionsCount,
      };

      const txHash = await this.walletService.sendTransaction(userId, txFin);

      await this.waitForTransactionExecutionAsync(txHash, proposal);

      if (proposal.type === PROPOSAL_TYPES.ADD_PARTICIPANT) {
        const user = await findUserByAddressAsync(proposal.address);
        await addNewGroupOwnerAsync(
          proposal.groupId,
          proposal.address,
          user ? user.id : null,
        );
      }

      if (proposal.type === PROPOSAL_TYPES.REMOVE_PARTICIPANT) {
        await removeGroupOwnerAsync(proposal.groupId, proposal.address);
      }

      return markProposalAsExecutedAsync(proposal);
    } catch (err) {
      throw new Error(err);
    }
  }

  async voteForProposalAsync(
    proposalId: number,
    userId: number,
  ): Promise<void> {
    try {
      const proposal: Proposal = await this.findByIdAsync(proposalId);

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      await this.groupsService.checkIsUserInGroupAsync(
        proposal.groupId,
        userId,
      );

      await this.checkThatProposalIsAvailableForVotingAsync(proposal);

      const sender = await this.usersService.getUserAddressAsync(userId);

      const { isSigned, signature } = await this.walletService.trySignMessage(
        userId,
        [sender, proposal.safeTxHash],
      );

      if (!isSigned) {
        throw new Error('Transaction was rejected');
      }

      await this.gnosisTransactionsService.updateTransactionConfirmationAsync(
        proposal.safeTxHash,
        { signature },
      );
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async createProposalAsync(
    newProposalDto: NewProposalRequestDto,
    creatorId: number,
  ): Promise<Proposal> {
    const group = await this.groupsService.findByIdAsync(
      newProposalDto.groupId,
    );

    if (!group) {
      throw new Error(`Group not found`);
    }

    await this.groupsService.checkIsUserInGroupAsync(group.id, creatorId);

    const { type } = newProposalDto;

    const proposalActions = {
      [PROPOSAL_TYPES.ADD_PARTICIPANT]: () =>
        this.addParticipantAsync(group, creatorId, newProposalDto),
      [PROPOSAL_TYPES.REMOVE_PARTICIPANT]: () =>
        this.removeParticipantAsync(group, creatorId, newProposalDto),
      [PROPOSAL_TYPES.TRANSFER_FUNDS]: () =>
        this.transferFundsAsync(group, creatorId, newProposalDto),
      [PROPOSAL_TYPES.CONTRACT_INTERACTION]: () =>
        this.transferErc20TokenAsync(group, creatorId, newProposalDto),
    };

    if (!proposalActions[type]) {
      throw new Error(`The proposal action ${type} not found`);
    }

    return await proposalActions[type]();
  }

  async checkDaoBalanceAsync(group: Group): Promise<void> {
    const { DAOaddress } = group;
    const { getBalanceInEth } = useGnosis(group.id, { DAOaddress });
    const balance = await getBalanceInEth();

    if (balance === 0) {
      throw new Error(
        "⚠️ Warning! Your DAO has 0 Ethers on balance. You won't be able to execute any proposal.",
      );
    }
  }

  private async addParticipantAsync(
    group: Group,
    creatorId: number,
    newProposalDto: NewProposalRequestDto,
  ): Promise<Proposal> {
    await this.validateAddressForAddingAsync(group, newProposalDto.address);

    try {
      const { DAOaddress } = group;
      const sender = await this.usersService.getUserAddressAsync(creatorId);

      const {
        addOwnerWithThreshold,
        getGasEstimation,
        saveToGnosis,
        getTransactionHash,
        getDAO,
      } = useGnosis(creatorId, { sender, DAOaddress });

      const transaction = await addOwnerWithThreshold(
        newProposalDto.address,
        newProposalDto.threshold,
      );
      const { nonce } = await getDAO();

      const txFin: TransactionType = {
        data: transaction.data,
        to: DAOaddress,
        value: 0,
        operation: 0,
      };

      const data = await getGasEstimation(txFin);
      const { safeTxGas, gasPrice } = data;

      const hashPayload = {
        ...txFin,
        baseGas: 0,
        nonce,
        safeTxGas,
        gasPrice,
        gasToken: AddressZero,
        refundReceiver: DAOaddress,
      };

      const contractTransactionHash = await getTransactionHash(hashPayload);

      const { isSigned, signature } = await this.walletService.trySignMessage(
        creatorId,
        [sender, contractTransactionHash],
      );

      if (!isSigned) {
        throw new Error('Transaction was rejected');
      }

      await saveToGnosis({
        ...hashPayload,
        contractTransactionHash,
        signature,
        sender,
        safe: DAOaddress,
      });

      const proposalUser = await findUserByAddressAsync(newProposalDto.address);

      return await createNewProposalAsync(
        creatorId,
        group.id,
        PROPOSAL_TYPES.ADD_PARTICIPANT,
        newProposalDto.description,
        newProposalDto.address,
        newProposalDto.threshold,
        contractTransactionHash,
        nonce,
        proposalUser ? proposalUser.id : null,
      );
    } catch (error) {
      console.error(error);
      throw new Error('Transaction was rejected');
    }
  }

  private async removeParticipantAsync(
    group: Group,
    creatorId: number,
    newProposalDto: NewProposalRequestDto,
  ): Promise<Proposal> {
    await this.validateAddressForRemovingAsync(group, newProposalDto.address);

    try {
      const { DAOaddress } = group;
      const sender = await this.usersService.getUserAddressAsync(creatorId);

      const {
        removeOwner,
        getGasEstimation,
        saveToGnosis,
        getTransactionHash,
        getDAO,
      } = useGnosis(creatorId, { sender, DAOaddress });
      const { owners } = await getDAO();
      const index = owners.indexOf(newProposalDto.address);
      const prevOwner = owners[index - 1] || DEFAULT_PREV_OWNER_ADDRESS;

      const transaction = await removeOwner(
        prevOwner,
        newProposalDto.address,
        newProposalDto.threshold,
      );
      const { nonce } = await getDAO();

      const txFin: TransactionType = {
        data: transaction.data,
        to: DAOaddress,
        value: 0,
        operation: 0,
      };

      const data = await getGasEstimation(txFin);

      const { safeTxGas, gasPrice } = data;

      const hashPayload = {
        ...txFin,
        baseGas: 0,
        nonce,
        safeTxGas,
        gasPrice,
        gasToken: AddressZero,
        refundReceiver: DAOaddress,
      };

      const contractTransactionHash = await getTransactionHash(hashPayload);

      const { isSigned, signature } = await this.walletService.trySignMessage(
        creatorId,
        [sender, contractTransactionHash],
      );

      if (!isSigned) {
        throw new Error('Transaction was rejected');
      }

      await saveToGnosis({
        ...hashPayload,
        contractTransactionHash,
        signature,
        sender,
        safe: DAOaddress,
      });

      const proposalUser = await findUserByAddressAsync(newProposalDto.address);

      return await createNewProposalAsync(
        creatorId,
        group.id,
        PROPOSAL_TYPES.REMOVE_PARTICIPANT,
        newProposalDto.description,
        newProposalDto.address,
        newProposalDto.threshold,
        contractTransactionHash,
        nonce,
        proposalUser ? proposalUser.id : null,
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  private async transferFundsAsync(
    group: Group,
    userId: number,
    newProposalDto: NewProposalRequestDto,
  ): Promise<Proposal> {
    try {
      const daoAsset = await this.daoService.getDaoAssetAsync(
        newProposalDto.groupId,
        ETHER_SYMBOL,
      );

      const amountOfFunds = parseEther(newProposalDto.amountOfFunds);

      this.validateAmountForTransferring(daoAsset, amountOfFunds);

      const { DAOaddress } = group;
      const sender = await this.usersService.getUserAddressAsync(userId);

      const { saveToGnosis, getGasEstimation, getTransactionHash, getDAO } =
        useGnosis(userId, {
          DAOaddress,
        });

      const txFin = {
        data: '0x00',
        to: newProposalDto.transferTo,
        value: ethers.utils.parseEther(newProposalDto.amountOfFunds).toBigInt(),
        operation: 0,
      };

      const { nonce } = await getDAO();

      const data = await getGasEstimation(txFin);
      const { safeTxGas, gasPrice } = data;

      const hashPayload = {
        ...txFin,
        baseGas: 0,
        nonce,
        safeTxGas,
        gasPrice,
        gasToken: ethers.constants.AddressZero,
        refundReceiver: DAOaddress,
      };

      const contractTransactionHash = await getTransactionHash(hashPayload);

      const { isSigned, signature } = await this.walletService.trySignMessage(
        userId,
        [sender, contractTransactionHash],
      );

      if (!isSigned) {
        throw new Error('Transaction was rejected');
      }

      await saveToGnosis({
        ...hashPayload,
        contractTransactionHash,
        signature,
        sender,
        safe: DAOaddress,
      });

      return await createNewProposalAsync(
        userId,
        group.id,
        PROPOSAL_TYPES.TRANSFER_FUNDS,
        newProposalDto.description,
        newProposalDto.address,
        newProposalDto.threshold,
        contractTransactionHash,
        nonce,
        null,
        newProposalDto.transferTo,
        newProposalDto.amountOfFunds,
        ETHER_SYMBOL,
      );
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  private async transferErc20TokenAsync(
    group: Group,
    userId: number,
    newProposalDto: NewProposalRequestDto,
  ): Promise<Proposal> {
    try {
      const daoAsset = await this.daoService.getDaoAssetAsync(
        newProposalDto.groupId,
        newProposalDto.tokenSymbol,
      );

      const amountOfFunds = parseEther(newProposalDto.amountOfFunds);

      this.validateAmountForTransferring(daoAsset, amountOfFunds);

      const { DAOaddress } = group;
      const sender = await this.usersService.getUserAddressAsync(userId);

      const { getGasEstimation, saveToGnosis, getTransactionHash } = useGnosis(
        userId,
        { sender, DAOaddress },
      );

      const { nonce } = await this.gnosisTransactionsService.getDaoAsync(
        DAOaddress,
      );

      const transaction =
        await this.erc20ContractInteractionService.transferErc20TokenAsync(
          daoAsset.tokenAddress,
          newProposalDto.transferTo,
          amountOfFunds,
        );

      const txFin = {
        data: transaction.data,
        to: daoAsset.tokenAddress,
        value: 0,
        operation: 0,
      };

      const data = await getGasEstimation(txFin);
      const { safeTxGas, gasPrice } = data;

      const hashPayload = {
        ...txFin,
        baseGas: 0,
        nonce,
        safeTxGas,
        gasPrice,
        gasToken: ethers.constants.AddressZero,
        refundReceiver: group.DAOaddress,
      };

      const contractTransactionHash = await getTransactionHash(hashPayload);

      const { isSigned, signature } = await this.walletService.trySignMessage(
        userId,
        [sender, contractTransactionHash],
      );

      if (!isSigned) {
        throw new Error('Transaction was rejected');
      }

      await saveToGnosis({
        ...hashPayload,
        contractTransactionHash,
        signature,
        sender,
        safe: DAOaddress,
      });

      return await createNewProposalAsync(
        userId,
        group.id,
        PROPOSAL_TYPES.CONTRACT_INTERACTION,
        newProposalDto.description,
        newProposalDto.address,
        newProposalDto.threshold,
        contractTransactionHash,
        nonce,
        null,
        newProposalDto.transferTo,
        newProposalDto.amountOfFunds,
        newProposalDto.tokenSymbol,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  private validateAmountForTransferring(
    daoAsset: DaoAsset,
    amountOfFunds: BigNumber,
  ) {
    const isAmountLessThanAssetBalance =
      parseEther(daoAsset.balanceInEthers).toBigInt() >
      amountOfFunds.toBigInt();

    if (!isAmountLessThanAssetBalance) {
      throw new Error(
        `The DAO group has only ${daoAsset.balanceInEthers} ${daoAsset.tokenSymbol}. The amount in the request is greater than the balance amount`,
      );
    }

    if (amountOfFunds.isNegative()) {
      throw new Error('Amount should be positive');
    }
  }

  private async validateAddressForAddingAsync(
    group: Group,
    address: string,
  ): Promise<void> {
    const { isOwnerAsync } = useGnosis(group.ownerId, {
      DAOaddress: group.DAOaddress,
    });

    if (await isOwnerAsync(address)) {
      throw new Error(
        `The user with address ${address} already exist in the DAO.`,
      );
    }
  }

  private async validateAddressForRemovingAsync(
    group: Group,
    address: string,
  ): Promise<void> {
    const { isOwnerAsync, getDAO } = useGnosis(group.ownerId, {
      DAOaddress: group.DAOaddress,
    });

    if (!(await isOwnerAsync(address))) {
      throw new Error(
        `The user with address ${address} does not exist in the DAO.`,
      );
    }

    const { owners } = await getDAO();

    if (owners.length === 1) {
      throw new Error(
        `The DAO has only one owner one. You cannot remove anyone.`,
      );
    }
  }

  private async checkThatProposalIsAvailableForVotingAsync(proposal: Proposal) {
    const group = await this.groupsService.findByIdAsync(proposal.groupId);
    const { nonce } = await this.gnosisTransactionsService.getDaoAsync(
      group.DAOaddress,
    );

    if (proposal.nonce < nonce) {
      throw new Error('You cannot vote for this proposal');
    }
  }

  private async waitForTransactionExecutionAsync(
    txHash: string,
    proposal: Proposal,
    trackingInterval = 5_000,
    maxTrackingTime = 60_000,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let isTransactionFound = false;
      const TX_SUCCESS_STATUS_CODE = 1;
      const { safeTxHash } = proposal;
      const transactionLinkToEthNetwork = buildTransactionLinkToEthNetwork(
        NETWORK.RINKEBY,
        txHash,
      );

      const timerId = setInterval(async () => {
        try {
          const receipt = await ethersProvider.getTransactionReceipt(txHash);

          if (receipt) {
            clearInterval(timerId);
            isTransactionFound = true;

            if (receipt.status === TX_SUCCESS_STATUS_CODE) {
              await markProposalAsExecutedAsync(proposal);
              resolve();
            } else {
              reject(
                new Error(
                  `The proposal ${safeTxHash} execution failed. See transaction details here: ${transactionLinkToEthNetwork}`,
                ),
              );
            }
          }
        } catch (err) {
          reject(
            `We couldn't track transaction ${txHash}. See transaction details here: ${transactionLinkToEthNetwork}`,
          );
        }
      }, trackingInterval);

      setTimeout(async () => {
        if (!isTransactionFound) {
          clearInterval(timerId);
          const maxTrackingSeconds = maxTrackingTime / 1000;
          reject(
            new Error(
              `We were tracking transaction ${txHash} for ${maxTrackingSeconds} seconds but haven't found it. See transaction details here: ${transactionLinkToEthNetwork}`,
            ),
          );
        }
      }, maxTrackingTime);
    });
  }
}
