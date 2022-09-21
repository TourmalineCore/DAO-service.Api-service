import {
  Proposal,
  PROPOSAL_STATUSES,
  PROPOSAL_TYPES,
} from '../models/Proposal';

export async function createNewProposalAsync(
  creatorId: number,
  groupId: number,
  type: PROPOSAL_TYPES,
  descriprion: string,
  address: string,
  threshold: number,
  safeTxHash: string,
  nonce: number,
  userId?: number | null,
  transferTo?: string | null,
  amountOfFunds?: string | null,
  tokenSymbol?: string | null,
): Promise<Proposal> {
  return await Proposal.create({
    creatorId,
    groupId,
    type,
    descriprion,
    address,
    threshold,
    safeTxHash,
    status: PROPOSAL_STATUSES.VOTING,
    dateCreated: +new Date(),
    nonce,
    transferTo,
    amountOfFunds,
    tokenSymbol,
    userId,
  });
}

export async function markProposalAsExecutedAsync(
  proposal: Proposal,
): Promise<void> {
  proposal.status = PROPOSAL_STATUSES.EXECUTED;
  await proposal.save();
}
