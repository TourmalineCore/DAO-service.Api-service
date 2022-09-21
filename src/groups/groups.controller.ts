import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { InitDaoDto } from './dto/initDao.dto';
import { GroupListItemDto } from './dto/groupListItem.dto';
import { GroupsService } from './groups.service';
import { GroupCreationDto } from './dto/groupCreation.dto';
import { FindGroupsResponseDto } from './dto/findGroupsResponse.dto';
import { getRegisteredUsersCountInGroupAsync } from '../queries/usersRegistrationQueries';
import { UpdateGroupDto } from './dto/updateGroup.dto';
import { IQueryData } from '../interfaces/queryData.interface';
import { getGroupUsersAsync } from '../queries/groupQueries';
import { GnosisTransactionsService } from '../gnosis/gnosisTransactions.service';
import { findGroupProposalsCountByNonceAsync as getGroupProposalsCountByNonceAsync } from '../queries/proposalQueries';
import { GroupDto } from './dto/group.dto';

@Controller('groups')
export class GroupsController {
  constructor(
    private readonly groupService: GroupsService,
    private readonly gnosisTransactionsService: GnosisTransactionsService,
  ) {}

  @Get()
  async findByParamsAsync(
    @Query() req: IQueryData,
  ): Promise<FindGroupsResponseDto> {
    try {
      const pendingGroups = await this.groupService.findPendingGroupsAsync(
        +req.telegramUserId,
      );

      const daoGroups = await this.groupService.findDaoGroupsAsync(
        +req.telegramUserId,
      );

      const pendingGroupsDtos = await Promise.all(
        pendingGroups.map(
          async (group) =>
            new GroupListItemDto(
              group,
              await getRegisteredUsersCountInGroupAsync(group.id),
            ),
        ),
      );

      const daoGroupsDtos = await Promise.all(
        daoGroups.map(
          async (group) =>
            new GroupListItemDto(group, await group.getUsersCount()),
        ),
      );

      return new FindGroupsResponseDto(pendingGroupsDtos, daoGroupsDtos);
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':groupId')
  async findByIdAsync(
    @Param('groupId') groupId: number,
  ): Promise<GroupDto | null> {
    const group = await this.groupService.findByIdAsync(groupId);

    if (!group) {
      return null;
    }

    if (!group.isDao) {
      return new GroupDto(group);
    }

    const { nonce } = await this.gnosisTransactionsService.getDaoAsync(
      group.DAOaddress,
    );

    const groupUsers = await getGroupUsersAsync(group.id);
    const groupAssets = await this.gnosisTransactionsService.getDaoAssetsAsync(
      group.DAOaddress,
    );
    const groupProposalsCount = await getGroupProposalsCountByNonceAsync(
      group.id,
      nonce,
    );

    return new GroupDto(group, groupProposalsCount, groupAssets, groupUsers);
  }

  @Post('initDao')
  async createDaoAsync(
    @Body() initDaoDto: InitDaoDto,
    @Query() queryData: IQueryData,
  ): Promise<string> {
    try {
      const { groupId, owners, threshold } = initDaoDto;

      return await this.groupService.initDaoAsync(
        groupId,
        owners,
        threshold,
        +queryData.telegramUserId,
      );
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('create')
  async createGroupAsync(
    @Body() groupCreationDto: GroupCreationDto,
  ): Promise<number> {
    try {
      const { id, title, owner } = groupCreationDto;

      const group = await this.groupService.findByIdAsync(id);

      if (group) {
        throw new HttpException(
          'Group already exist',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return this.groupService.createGroupAsync(
        id,
        title,
        owner.id,
        owner.username,
        owner.firstName,
        owner.lastName,
      );
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':groupId')
  async updateAsync(
    @Param('groupId') groupId: number,
    @Body() updateGroupDto: UpdateGroupDto,
    @Query() queryData: IQueryData,
  ): Promise<void> {
    try {
      if (!updateGroupDto.state) return;

      await this.groupService.updateGroupAsync(
        groupId,
        updateGroupDto.state,
        +queryData.telegramUserId,
      );
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
