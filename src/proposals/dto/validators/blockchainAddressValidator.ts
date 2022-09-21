/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ethers } from 'ethers';

@ValidatorConstraint({ name: 'address', async: false })
export class BlockchainAddressValidator
  implements ValidatorConstraintInterface
{
  validate(address: string, _: ValidationArguments) {
    return ethers.utils.isAddress(address);
  }

  defaultMessage(_: ValidationArguments) {
    return `Invalid blockchain address`;
  }
}
