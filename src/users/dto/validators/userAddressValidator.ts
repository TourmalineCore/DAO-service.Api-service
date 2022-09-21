/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ethers } from 'ethers';

@ValidatorConstraint({ name: 'address', async: false })
export class UserAddressValidator implements ValidatorConstraintInterface {
  validate(address: string, _: ValidationArguments) {
    return ethers.utils.isAddress(address);
  }

  defaultMessage(_: ValidationArguments) {
    return `The field 'address' must be valid Ethereum wallet address`;
  }
}
