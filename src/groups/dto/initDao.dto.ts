import {
  IsNumber,
  IsString,
  ArrayMinSize,
  Min,
  IsDefined,
} from 'class-validator';

export class InitDaoDto {
  @IsDefined()
  @IsNumber()
  public readonly groupId: number;

  @IsDefined()
  @IsString({ each: true })
  @ArrayMinSize(1)
  public readonly owners: string[];

  @IsDefined()
  @IsNumber()
  @Min(1)
  public readonly threshold: number;
}
