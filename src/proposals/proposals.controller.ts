import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { NewProposalRequestDto } from './dto/newProposalRequest.dto';
import { ProposalsService } from './proposals.service';
import { FindProposalsDto } from './dto/findProposals.dto';
import { ProposalDto } from './dto/proposal.dto';
import { IQueryData } from '../interfaces/queryData.interface';
import { findGroupByIdAsync } from '../queries/groupQueries';
import { GnosisTransactionsService } from '../gnosis/gnosisTransactions.service';
import {
  findUserByAddressAsync,
  findUserByIdAsync,
  findUsersByAddressesAsync,
  findUsersByIdsAsync,
} from '../queries/userQueries';
import { ProposalsResponseDto } from './dto/proposalsResponse.dto';
import { buildLinkToGnosisTransaction } from '../utils/buildLinkToGnosisTransaction';
import { NETWORK } from '../consts';

@Controller('proposals')
export class ProposalsController {
  constructor(
    private readonly proposalsService: ProposalsService,
    private readonly gnosisTransactionsService: GnosisTransactionsService,
  ) {}

  @Post('create')
  async createAsync(
    @Body() createProposalDto: NewProposalRequestDto,
    @Query() queryData: IQueryData,
  ): Promise<number> {
    try {
      const proposal = await this.proposalsService.createProposalAsync(
        createProposalDto,
        +queryData.telegramUserId,
      );
      return proposal.id;
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findByParamsAsync(
    @Query() req: FindProposalsDto,
    @Query() queryData: IQueryData,
  ): Promise<ProposalsResponseDto> {
    try {
      const group = await findGroupByIdAsync(req.groupId);

      if (!group) {
        throw new HttpException(
          'Group not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const { nonce, threshold } =
        await this.gnosisTransactionsService.getDaoAsync(group.DAOaddress);

      const multisigTransactions =
        await this.gnosisTransactionsService.findMultisigTransactionsWithNonceMoreOrEqualAsync(
          group.DAOaddress,
          nonce,
        );

      const proposals = await this.proposalsService.findByParamsAsync(
        req.pageNumber,
        req.groupId,
        nonce,
      );

      const proposalUsers = await findUsersByIdsAsync(
        proposals.map((proposal) => proposal.userId),
      );

      const user = await findUserByIdAsync(+queryData.telegramUserId);

      return new ProposalsResponseDto(
        group.title,
        threshold,
        proposals,
        multisigTransactions,
        proposalUsers,
        user,
      );
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('vote')
  async voteForProposalAsync(
    @Query('proposalId') proposalId: number,
    @Query() queryData: IQueryData,
  ): Promise<void> {
    try {
      await this.proposalsService.voteForProposalAsync(
        proposalId,
        +queryData.telegramUserId,
      );
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('execute')
  @HttpCode(201)
  async executeProposalAsync(
    @Query('proposalId') proposalId: number,
    @Query() queryData: IQueryData,
  ): Promise<void> {
    try {
      await this.proposalsService.executeProposalAsync(
        proposalId,
        +queryData.telegramUserId,
      );
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':proposalId')
  async getByIdAsync(
    @Param('proposalId') proposalId: number,
    @Query() queryData: IQueryData,
  ): Promise<ProposalDto> {
    try {
      const proposal = await this.proposalsService.findByIdAsync(proposalId);

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      const user = await findUserByIdAsync(+queryData.telegramUserId);
      const group = await proposal.getGroup();
      const proposalCreator = await proposal.getUser();
      const gnosisLinkToProposal = buildLinkToGnosisTransaction(
        NETWORK.RINKEBY,
        group.DAOaddress,
        proposal.safeTxHash,
      );

      const { threshold } = await this.gnosisTransactionsService.getDaoAsync(
        group.DAOaddress,
      );
      const multisigTransaction =
        await this.gnosisTransactionsService.findMultisigTransactionBySafeTxHashAsync(
          group.DAOaddress,
          proposal.safeTxHash,
        );

      const confirmedAddresses = multisigTransaction.confirmations.map(
        (confirmation) => confirmation.owner,
      );

      const confirmedUsers = await findUsersByAddressesAsync(
        confirmedAddresses,
      );

      return new ProposalDto(
        proposal,
        user,
        proposalCreator,
        gnosisLinkToProposal,
        group.title,
        threshold,
        confirmedAddresses,
        confirmedUsers,
        proposal.address
          ? await findUserByAddressAsync(proposal.address)
          : null,
      );
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
