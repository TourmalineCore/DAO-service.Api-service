import DaoAsset from '../../models/DaoAsset';

export class DaoBalanceDto {
  public readonly tokenSymbol: string;
  public readonly balance: string;

  constructor(daoAsset: DaoAsset) {
    this.balance = daoAsset.balance;
    this.tokenSymbol = daoAsset.tokenSymbol;
  }

  static fromEntities(daoAssets: DaoAsset[]) {
    return daoAssets.map((daoAsset) => new DaoBalanceDto(daoAsset));
  }
}
