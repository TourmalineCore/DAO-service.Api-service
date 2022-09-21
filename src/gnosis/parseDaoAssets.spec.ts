import { isEqual } from 'lodash';
import DaoAsset from '../models/DaoAsset';
import parseDaoAssets from './parseDaoAssets';

describe('parse dao assets', function () {
  it('should parse several assets', function () {
    const DAO_BALANCE_RESPONSE = [
      {
        tokenAddress: null,
        token: null,
        balance: '30000000000000000',
      },
      {
        tokenAddress: '0xC606e5D95F5066421AdD3F315c9D3fc5385E76f5',
        token: {
          name: 'Test_token',
          symbol: 'TST',
          decimals: 18,
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0xC606e5D95F5066421AdD3F315c9D3fc5385E76f5.png',
        },
        balance: '1000000000000000000',
      },
    ];

    const expectedAssets = [
      new DaoAsset('Ether', 'ETH', '30000000000000000', null),
      new DaoAsset(
        'Test_token',
        'TST',
        '1000000000000000000',
        '0xC606e5D95F5066421AdD3F315c9D3fc5385E76f5',
      ),
    ];

    const daoAssets = parseDaoAssets(DAO_BALANCE_RESPONSE);
    expect(isEqual(expectedAssets, daoAssets)).toBe(true);
  });

  it('should parse ether asset', function () {
    const DAO_BALANCE_RESPONSE = [
      {
        tokenAddress: null,
        token: null,
        balance: '0',
      },
    ];

    const expectedAssets = [new DaoAsset('Ether', 'ETH', '0', null)];

    const daoAssets = parseDaoAssets(DAO_BALANCE_RESPONSE);
    expect(isEqual(expectedAssets, daoAssets)).toBe(true);
  });
});
