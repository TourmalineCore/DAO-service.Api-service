import { NETWORK } from '../consts';

export default function buildTransactionLinkToEthNetwork(
  network: NETWORK,
  txHash: string,
) {
  const ETHERSCAN_NETWORK_NAME =
    network === NETWORK.MAINNET ? 'etherscan' : `${network}.etherscan`;

  if (!txHash) {
    throw new Error('Transaction hash cannot be null, undefined or empty');
  }

  return `https://${ETHERSCAN_NETWORK_NAME}.io/tx/${txHash}`;
}
