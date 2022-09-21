import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { DaoService } from './dao.service';
import { DaoBalanceDto } from './dto/daoBalance.dto';

@Controller('dao')
export class DaoController {
  constructor(private readonly daoService: DaoService) {}

  @Get('getBalance/:groupId')
  async findByParamsAsync(
    @Param('groupId') groupId: number,
  ): Promise<DaoBalanceDto[]> {
    try {
      const daoBalance = await this.daoService.getDaoAssetsAsync(groupId);

      return DaoBalanceDto.fromEntities(daoBalance);
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('checkDaoBalance/:groupId')
  async checkDaoBalance(@Param('groupId') groupId: number): Promise<boolean> {
    try {
      return this.daoService.isZeroDaoBalanceAsync(groupId);
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
