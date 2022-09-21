import { Type } from 'class-transformer';
import { IsDefined, IsNumber } from 'class-validator';

export class UserRegistrationEntryDto {
  @IsDefined()
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @IsDefined()
  @IsNumber()
  @Type(() => Number)
  groupId: number;
}
