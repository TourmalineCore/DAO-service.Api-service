import { IsDefined, IsNumber, IsString } from 'class-validator';

class OwnerDto {
  @IsDefined()
  @IsNumber()
  id: number;

  @IsDefined()
  @IsString()
  firstName: string;

  @IsDefined()
  @IsString()
  lastName?: string | null;

  @IsDefined()
  @IsString()
  username?: string | null;
}

export class GroupCreationDto {
  @IsDefined()
  @IsNumber()
  id: number;

  @IsDefined()
  @IsString()
  title: string;

  @IsDefined()
  owner: OwnerDto;
}
