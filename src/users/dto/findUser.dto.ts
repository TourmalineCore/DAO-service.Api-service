import { Type } from 'class-transformer';
import { IsDefined, IsEnum, IsOptional } from 'class-validator';
import { SearchScope } from '../../models/searchScope';

export class FindUsersDto {
  @IsOptional()
  public readonly searchAddress?: string;

  @IsOptional()
  @Type(() => String)
  public readonly searchName?: string;

  @IsDefined()
  @Type(() => Number)
  public readonly groupId: number;

  @IsOptional()
  @IsEnum(SearchScope)
  public readonly searchScope?: string;
}
