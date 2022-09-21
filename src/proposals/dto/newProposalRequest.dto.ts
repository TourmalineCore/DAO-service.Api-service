import {
  IsNumber,
  IsDefined,
  IsOptional,
  Validate,
  IsString,
} from 'class-validator';
import { ProposalTypes } from './proposalTypes';
import { BlockchainAddressValidator } from './validators/blockchainAddressValidator';

export class NewProposalRequestDto {
  @IsDefined()
  public readonly type: ProposalTypes;

  @IsDefined()
  @IsNumber()
  public readonly groupId: number;

  @IsOptional()
  @IsString()
  @Validate(BlockchainAddressValidator)
  public readonly address?: string | null;

  @IsOptional()
  @IsString()
  public readonly description?: string | null;

  @IsOptional()
  @IsString()
  public readonly transferTo?: string | null;

  @IsOptional()
  @IsString()
  public readonly amountOfFunds?: string | null;

  @IsOptional()
  @IsNumber()
  public readonly threshold?: number | null;

  @IsOptional()
  @IsString()
  public readonly tokenSymbol?: string | null;
}
