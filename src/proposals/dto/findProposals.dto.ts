import { IsDefined, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class FindProposalsDto {
  @IsDefined()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  public readonly pageNumber: number;

  @IsDefined()
  @IsNumber()
  @Type(() => Number)
  public readonly groupId: number;
}
