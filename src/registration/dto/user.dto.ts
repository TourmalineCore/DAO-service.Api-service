import { User } from '../../models/user';

export class UserDto {
  userId: number;
  username: string;
  address: string;

  constructor(uersEntity: User) {
    this.userId = uersEntity.id;
    this.username = uersEntity.username;
    this.address = uersEntity.address;
  }

  static fromEntities(userEntities: User[]) {
    return userEntities.map((userEntity) => new UserDto(userEntity));
  }
}
