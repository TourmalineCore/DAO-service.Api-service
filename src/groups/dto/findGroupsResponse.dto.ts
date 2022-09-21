import { GroupListItemDto } from './groupListItem.dto';

export class FindGroupsResponseDto {
  public readonly pending: GroupListItemDto[];
  public readonly daos: GroupListItemDto[];

  constructor(
    pendingGroupsDtos: GroupListItemDto[],
    daoGroupsDtos: GroupListItemDto[],
  ) {
    this.pending = pendingGroupsDtos;
    this.daos = daoGroupsDtos;
  }
}
