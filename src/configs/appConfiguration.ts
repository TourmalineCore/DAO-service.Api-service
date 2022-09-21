import { NETWORK } from '../consts';

export class AppConfiguration {
  public readonly NETWORK: NETWORK;

  constructor(network: NETWORK) {
    this.NETWORK = network;
  }
}
