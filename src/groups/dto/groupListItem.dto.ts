import { Group } from '../../models/Group';

export class GroupListItemDto {
  public readonly id: number;
  public readonly name: string;
  public readonly usersCount: number;
  public readonly createdAt: Date;
  public readonly userPreviews: UserPreviewDto[];

  constructor(group: Group, usersCount: number) {
    this.id = group.id;
    this.name = group.title;
    this.usersCount = usersCount;
    this.createdAt = group.createdAt;
    this.userPreviews = [
      new UserPreviewDto(undefined),
      new UserPreviewDto(undefined),
    ];
  }
}

class UserPreviewDto {
  public readonly avatar: string;

  constructor(avatar: string) {
    this.avatar = avatar;
  }
}
