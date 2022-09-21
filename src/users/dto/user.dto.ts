import { User } from '../../models/user';

export class UserDto {
  public readonly id: number;
  public readonly address: string;
  public readonly username: string;

  constructor(user: User) {
    this.id = user.id;
    this.address = user.address;
    this.username = user.normalizedUsername;
  }

  static fromEntities(users: User[]) {
    return users.map((user) => new UserDto(user));
  }
}
