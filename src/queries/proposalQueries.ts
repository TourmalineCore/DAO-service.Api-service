import { Proposal } from '../models/Proposal';
import { Op } from 'sequelize';

const PROPOSALS_PAGINATION_STEP = 5;

export async function findProposalsByParamsAsync(
  pageNumber: number,
  groupId: number,
  minNonce: number,
): Promise<Proposal[]> {
  return await Proposal.findAll({
    where: {
      groupId,
      nonce: {
        [Op.gte]: minNonce,
      },
    },
    limit: PROPOSALS_PAGINATION_STEP,
    offset: (pageNumber - 1) * PROPOSALS_PAGINATION_STEP,
    order: [['id', 'ASC']],
  });
}

export async function findProposalByIdAsync(
  proposalId: number,
): Promise<Proposal> {
  return await Proposal.findByPk(proposalId);
}

export async function findGroupProposalsCountByNonceAsync(
  groupId: number,
  nonce: number,
): Promise<number> {
  return await Proposal.count({ where: { groupId, nonce } });
}
