import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FindUsersDto } from './dto/findUser.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('find')
  async findByParamsAsync(@Query() req: FindUsersDto): Promise<UserDto[]> {
    try {
      const users = await this.usersService.findByParamsAsync(
        req.groupId,
        req.searchAddress,
        req.searchName,
        req.searchScope,
      );

      return UserDto.fromEntities(users);
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
