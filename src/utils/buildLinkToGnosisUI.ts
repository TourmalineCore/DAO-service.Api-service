import { NETWORK, NETWORK_NAMES_IN_GNOSIS_URL } from '../consts';

export function buildLinkToGnosisUI(
  network: NETWORK,
  daoAddress: string,
): string {
  return `https://gnosis-safe.io/app/${NETWORK_NAMES_IN_GNOSIS_URL[network]}:${daoAddress}/home`;
}
