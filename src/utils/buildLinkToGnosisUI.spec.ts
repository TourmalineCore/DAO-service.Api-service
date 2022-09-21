import { NETWORK } from '../consts';
import { buildLinkToGnosisUI } from './buildLinkToGnosisUI';

describe('build link to gnosis UI', function () {
  it('should build link to rinkeby ethereum network', function () {
    const expectedLink = `https://gnosis-safe.io/app/rin:0x394D569c5cA6250dC5ffC79956292Cf86AADBce0/home`;
    const link = buildLinkToGnosisUI(
      NETWORK.RINKEBY,
      `0x394D569c5cA6250dC5ffC79956292Cf86AADBce0`,
    );

    expect(expectedLink).toBe(link);
  });
});
