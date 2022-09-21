import { IsOptional, IsString } from 'class-validator';
import { GROUP_STATE } from '../../models/Group';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  public state?: GROUP_STATE;
}
