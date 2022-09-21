import buildTransactionLinkToEthNetwork from './buildTransactionLinkToEthNetwork';
import { NETWORK } from '../consts';

describe('build transaction link to ethereum network', function () {
  it('should build link to rinkeby ethereum network', function () {
    const TRANSACTION_HASH =
      '0x2cd9b7f1c0e341f782758af02f85829b27123948639bf6619de91b672f5e0126';

    const expectedLink =
      'https://rinkeby.etherscan.io/tx/0x2cd9b7f1c0e341f782758af02f85829b27123948639bf6619de91b672f5e0126';
    const link = buildTransactionLinkToEthNetwork(
      NETWORK.RINKEBY,
      TRANSACTION_HASH,
    );

    expect(expectedLink).toBe(link);
  });

  it('should build link to goerli ethereum network', function () {
    const TRANSACTION_HASH =
      '0x2cd9b7f1c0e341f782758af02f85829b27123948639bf6619de91b672f5e0126';

    const expectedLink =
      'https://goerli.etherscan.io/tx/0x2cd9b7f1c0e341f782758af02f85829b27123948639bf6619de91b672f5e0126';
    const link = buildTransactionLinkToEthNetwork(
      NETWORK.GOERLI,
      TRANSACTION_HASH,
    );

    expect(expectedLink).toBe(link);
  });

  it('should build link to mainnet ethereum network', function () {
    const TRANSACTION_HASH =
      '0x85fe1bce93345ca7b04489363f29ae273e325e1c2296f480feb5749860463176';

    const expectedLink =
      'https://etherscan.io/tx/0x85fe1bce93345ca7b04489363f29ae273e325e1c2296f480feb5749860463176';
    const link = buildTransactionLinkToEthNetwork(
      NETWORK.MAINNET,
      TRANSACTION_HASH,
    );

    expect(expectedLink).toBe(link);
  });

  it('throw exception if tx hash is empty', function () {
    expect(() =>
      buildTransactionLinkToEthNetwork(NETWORK.MAINNET, ''),
    ).toThrowError('Transaction hash cannot be null, undefined or empty');
  });
});
