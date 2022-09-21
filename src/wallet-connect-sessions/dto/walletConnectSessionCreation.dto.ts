import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsDefined,
  IsPositive,
  ValidateNested,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import IWalletConnectSession from '../../models/IWalletConnectSession';

class IClientMetaDto {
  @IsDefined()
  @IsString()
  description: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsDefined()
  @IsString({ each: true })
  icons: string[];

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class WalletConnectSessionCreationDto implements IWalletConnectSession {
  @IsDefined()
  @IsBoolean()
  connected: boolean;

  @IsDefined()
  @IsString({ each: true })
  @ArrayMinSize(1)
  accounts: string[];

  @IsDefined()
  @IsNumber()
  @IsPositive()
  chainId: number;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  bridge: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => IClientMetaDto)
  clientMeta: IClientMetaDto | null;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  peerId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => IClientMetaDto)
  peerMeta: IClientMetaDto | null;

  @IsDefined()
  @IsNumber()
  @IsPositive()
  handshakeId: number;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  handshakeTopic: string;
}
