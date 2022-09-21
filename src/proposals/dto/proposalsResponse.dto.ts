import { User } from '../../models/user';
import { Proposal, PROPOSAL_TYPES } from '../../models/Proposal';
import { isNil } from 'lodash';

export class ProposalsResponseDto {
  public readonly groupTitle: string;
  public readonly threshold: number;
  public readonly proposals: ProposalListItemDto[];

  constructor(
    groupTitle: string,
    threshold: number,
    proposals: Proposal[],
    multisigTransactions,
    proposalUsers: User[],
    user: User,
  ) {
    this.groupTitle = groupTitle;
    this.threshold = threshold;
    this.proposals = ProposalListItemDto.mapFrom(
      proposals,
      threshold,
      multisigTransactions,
      proposalUsers,
      user,
    );
  }
}

class ProposalListItemDto {
  public readonly id: number;
  public readonly nonce: number;
  public readonly type: PROPOSAL_TYPES;
  public readonly confirmations: number;
  public readonly dateCreated: number;
  public readonly user?: UserDto | null;
  public readonly address?: string | null;
  public readonly amountOfFunds?: string | null;
  public readonly tokenSymbol?: string | null;
  public readonly confirmedByUser: boolean;
  public readonly canBeExecuted: boolean;

  constructor(
    id: number,
    nonce: number,
    type: PROPOSAL_TYPES,
    confirmations: number,
    dateCreated: number,
    confirmedByUser: boolean,
    canBeExecuted: boolean,
    user?: UserDto | null,
    description?: string | null,
    address?: string | null,
    amountOfFunds?: string | null,
    tokenSymbol?: string | null,
  ) {
    this.id = id;
    this.nonce = nonce;
    this.type = type;
    this.confirmations = confirmations;
    this.dateCreated = dateCreated;
    this.confirmedByUser = confirmedByUser;
    this.canBeExecuted = canBeExecuted;
    this.user = user;
    this.address = address;
    this.amountOfFunds = amountOfFunds;
    this.tokenSymbol = tokenSymbol;
  }

  static mapFrom(
    proposals: Proposal[],
    threshold: number,
    multisigTransactions,
    proposalUsers: User[],
    user: User,
  ): ProposalListItemDto[] {
    return proposals
      .map((proposal) => {
        const multisigTransaction = multisigTransactions.find(
          (tx) => tx.safeTxHash === proposal.safeTxHash,
        );

        if (!multisigTransaction) {
          return;
        }

        let proposalUser = null;

        if (proposal.userId) {
          proposalUser = proposalUsers.find(
            (proposalUser) => proposal.userId === proposalUser.id,
          );
        }

        const confirmedByUser = multisigTransaction.confirmations
          .map((confirmation) => confirmation.owner)
          .includes(user.address);

        const canBeExecuted =
          threshold === multisigTransaction.confirmations.length;

        return new ProposalListItemDto(
          proposal.id,
          proposal.nonce,
          proposal.type,
          multisigTransaction.confirmations.length,
          +proposal.dateCreated,
          confirmedByUser,
          canBeExecuted,
          proposalUser ? new UserDto(proposalUser) : proposalUser,
          proposal.address,
          proposal.amountOfFunds,
          proposal.tokenSymbol,
        );
      })
      .filter((proposal) => !isNil(proposal));
  }
}

class UserDto {
  public readonly username: string;

  constructor(user: User) {
    this.username = user.normalizedUsername;
  }
}
