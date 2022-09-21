import { ETHER_NAME, ETHER_SYMBOL } from '../consts';
import DaoAsset from '../models/DaoAsset';

export default function parseDaoAssets(daoAssets): DaoAsset[] {
  return daoAssets.map((daoAsset) => {
    const token = daoAsset.token;

    const tokenName = token ? token.name : ETHER_NAME;
    const tokenSymbol = token ? token.symbol : ETHER_SYMBOL;
    const tokenAddress = daoAsset.tokenAddress ? daoAsset.tokenAddress : null;

    return new DaoAsset(tokenName, tokenSymbol, daoAsset.balance, tokenAddress);
  });
}
