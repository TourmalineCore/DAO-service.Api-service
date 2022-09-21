import { NETWORK } from '../consts';
import { buildLinkToGnosisTransaction } from './buildLinkToGnosisTransaction';

describe('build link to gnosis transaction', function () {
  it('should build link to rinkeby gnosis transaction', function () {
    const DAO_ADDRESS = '0x394D569c5cA6250dC5ffC79956292Cf86AADBce0';
    const SAFE_TX_HASH =
      '0xa7fc3b0c2ebf964292a1c32c79b26744304de463867ee207add6f9b504cf5d12';

    const expectedLink =
      'https://gnosis-safe.io/app/rin:0x394D569c5cA6250dC5ffC79956292Cf86AADBce0/transactions/multisig_0x394D569c5cA6250dC5ffC79956292Cf86AADBce0_0xa7fc3b0c2ebf964292a1c32c79b26744304de463867ee207add6f9b504cf5d12';

    const link = buildLinkToGnosisTransaction(
      NETWORK.RINKEBY,
      DAO_ADDRESS,
      SAFE_TX_HASH,
    );

    expect(expectedLink).toBe(link);
  });
});
