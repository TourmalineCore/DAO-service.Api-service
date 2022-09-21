import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { UserRegistrationEntryDto } from './dto/userRegistrationEntry.dto';
import { UserDto } from './dto/user.dto';
import { GroupsService } from '../groups/groups.service';

@Controller('registration')
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly groupsService: GroupsService,
  ) {}

  @Post()
  async registerUserAsync(
    @Body() userRegistrationEntryDto: UserRegistrationEntryDto,
  ): Promise<void> {
    try {
      await this.registrationService.registerUserAsync(
        userRegistrationEntryDto.userId,
        userRegistrationEntryDto.groupId,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getRegisteredUsersInGroupAsync(
    @Query('groupId') groupId: number,
  ): Promise<UserDto[]> {
    try {
      const group = await this.groupsService.findByIdAsync(groupId);

      if (!group) {
        throw new HttpException(
          'Group not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const registeredUsers =
        await this.registrationService.findRegistredUsersInGroupAsync(groupId);

      return UserDto.fromEntities(registeredUsers);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
