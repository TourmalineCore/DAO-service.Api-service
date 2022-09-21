import { User } from '../../models/user';
import { Proposal, PROPOSAL_TYPES } from '../../models/Proposal';

export class ProposalDto {
  public readonly id: number;
  public readonly dateCreated: number;
  public readonly creator: UserDto;
  public readonly gnosisUrl: string;
  public readonly type: PROPOSAL_TYPES;
  public readonly groupTitle: string;
  public readonly user?: UserDto | null;
  public readonly address?: string | null;
  public readonly descriprion?: string | null;
  public readonly amountOfFunds?: string | null;
  public readonly tokenSymbol?: string | null;
  public readonly newThreshold?: number | null;
  public readonly confirmedBy: UserDto[];
  public readonly nonce: number;
  public readonly confirmedByUser: boolean;
  public readonly canBeExecuted: boolean;

  constructor(
    proposal: Proposal,
    user: User,
    proposalCreator: User,
    gnosisLinkToProposal: string,
    groupTitle: string,
    groupThreshold: number,
    confirmedAddresses: string[],
    confirmedUsers: User[],
    proposalUser?: User | null,
  ) {
    this.id = proposal.id;
    this.dateCreated = +proposal.dateCreated;
    this.creator = new UserDto(proposalCreator);
    this.gnosisUrl = gnosisLinkToProposal;
    this.type = proposal.type;
    this.groupTitle = groupTitle;
    this.user = proposalUser ? new UserDto(proposalUser) : null;
    this.address = proposal.address;
    this.descriprion = proposal.descriprion;
    this.amountOfFunds = proposal.amountOfFunds;
    this.tokenSymbol = proposal.tokenSymbol;
    this.newThreshold = proposal.threshold;
    this.nonce = proposal.nonce;
    this.confirmedByUser = confirmedAddresses.includes(user.address);
    this.canBeExecuted = confirmedAddresses.length === groupThreshold;
    this.confirmedBy = confirmedAddresses.map((confirmedAddress) => {
      const confirmedUser = confirmedUsers.find(
        (confirmedUser) => confirmedUser.address === confirmedAddress,
      );

      return new ConfirmedUserDto(confirmedAddress, confirmedUser);
    });
  }
}

class UserDto {
  public readonly username: string;

  constructor(user: User) {
    this.username = user.normalizedUsername;
  }
}

class ConfirmedUserDto {
  public readonly address: string;
  public readonly username: string | null;

  constructor(address: string, user: User | null) {
    this.address = address;

    if (user) {
      this.username = user.normalizedUsername;
    }
  }
}
