import {
  Controller,
  Get,
  Query,
  HttpStatus,
  HttpException,
  Body,
  Post,
  HttpCode,
} from '@nestjs/common';
import { WalletConnectSessionsService } from './walletConnectSessions.service';
import IWalletConnectSession from '../models/IWalletConnectSession';
import { IQueryData } from '../interfaces/queryData.interface';
import { WalletConnectSessionCreationDto } from './dto/walletConnectSessionCreation.dto';

@Controller('walletConnectSessions')
export class WalletConnectSessionsController {
  constructor(
    private readonly walletConnectSessionsService: WalletConnectSessionsService,
  ) {}

  @Get()
  async findByUserIdAsync(
    @Query() queryData: IQueryData,
  ): Promise<IWalletConnectSession> {
    try {
      return await this.walletConnectSessionsService.findByUserIdAsync(
        +queryData.telegramUserId,
      );
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @HttpCode(200)
  async createOrUpdateAsync(
    @Body() walletConnectSessionCreationDto: WalletConnectSessionCreationDto,
    @Query() queryData: IQueryData,
  ): Promise<void> {
    try {
      return await this.walletConnectSessionsService.createOrUpdateAsync(
        +queryData.telegramUserId,
        queryData.telegramUsername,
        queryData.telegramUserFirstName,
        queryData.telegramUserLastName,
        walletConnectSessionCreationDto,
      );
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
