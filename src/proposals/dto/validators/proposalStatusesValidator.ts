/* eslint-disable @typescript-eslint/no-unused-vars */
import { PROPOSAL_STATUSES } from '../../../models/Proposal';

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'status', async: false })
export class ProposalStatusesValidator implements ValidatorConstraintInterface {
  private readonly availableProposalStatuses: string[] =
    Object.values(PROPOSAL_STATUSES);

  validate(status: string, _: ValidationArguments) {
    return this.availableProposalStatuses.includes(status);
  }

  defaultMessage(_: ValidationArguments) {
    return `The field 'status' can have only the following values: ${this.availableProposalStatuses.join(
      ', ',
    )}`;
  }
}
