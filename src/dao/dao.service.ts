import { Injectable } from '@nestjs/common';
import { ETHER_NAME } from '../consts';
import DaoAsset from '../models/DaoAsset';
import { GnosisTransactionsService } from '../gnosis/gnosisTransactions.service';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class DaoService {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly gnosisTransactionsService: GnosisTransactionsService,
  ) {}

  async getDaoAssetsAsync(groupId: number): Promise<DaoAsset[]> {
    const group = await this.groupsService.findByIdAsync(groupId);

    return await this.gnosisTransactionsService.getDaoAssetsAsync(
      group.DAOaddress,
    );
  }

  async getDaoAssetAsync(
    groupId: number,
    tokenSymbol: string,
  ): Promise<DaoAsset> {
    const daoBalance = await this.getDaoAssetsAsync(groupId);
    const daoAsset = daoBalance.find(
      (asset: DaoAsset) => asset.tokenSymbol === tokenSymbol,
    );

    if (!daoAsset) {
      throw new Error(`The DAO group hasn't an asset ${tokenSymbol}`);
    }

    return daoAsset;
  }

  async isZeroDaoBalanceAsync(groupId: number): Promise<boolean> {
    const daoAssets = await this.getDaoAssetsAsync(groupId);
    const ethersBalance = parseFloat(
      daoAssets.find((asset) => asset.tokenName === ETHER_NAME).balance,
    );

    return ethersBalance === 0;
  }
}
