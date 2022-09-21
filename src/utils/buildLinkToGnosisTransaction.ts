import { NETWORK, NETWORK_NAMES_IN_GNOSIS_URL } from '../consts';

export function buildLinkToGnosisTransaction(
  network: NETWORK,
  daoAddress: string,
  safeTxHash: string,
): string {
  return `https://gnosis-safe.io/app/${NETWORK_NAMES_IN_GNOSIS_URL[network]}:${daoAddress}/transactions/multisig_${daoAddress}_${safeTxHash}`;
}
