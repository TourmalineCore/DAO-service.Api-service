import DaoAsset from '../../models/DaoAsset';
import { User } from '../../models/user';
import { Group } from '../../models/Group';

export class GroupDto {
  public readonly title: string;
  public readonly DAOaddress: string | null;
  public readonly numberOfProposals: number | null;
  public readonly DAObalance: DaoAssetDto[] | null;
  public readonly users: UserDto[] | null;

  constructor(
    group: Group,
    proposalsCount?: number | null,
    daoAssets?: DaoAsset[] | null,
    users?: User[] | null,
  ) {
    this.title = group.title;
    this.DAOaddress = group.DAOaddress ? group.DAOaddress : null;
    this.numberOfProposals = proposalsCount ? proposalsCount : null;
    this.DAObalance = daoAssets ? DaoAssetDto.fromEntities(daoAssets) : null;
    this.users = users ? UserDto.fromEntities(users) : null;
  }
}

class DaoAssetDto {
  public readonly tokenSymbol: string;
  public readonly balance: string;
  public readonly balanceInEthers: string;

  constructor(daoAsset: DaoAsset) {
    this.balance = daoAsset.balance;
    this.tokenSymbol = daoAsset.tokenSymbol;
    this.balanceInEthers = daoAsset.balanceInEthers;
  }

  static fromEntities(daoAssets: DaoAsset[]) {
    return daoAssets.map((daoAsset) => new DaoAssetDto(daoAsset));
  }
}

class UserDto {
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
