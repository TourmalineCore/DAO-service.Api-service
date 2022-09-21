import { NETWORK } from '../consts';
import { AppConfiguration } from './appConfiguration';
import validateAppConfiguration from './validateAppConfiguration';

export class AppConfigurationBuilder {
  static build(): AppConfiguration {
    const { NETWORK_NAME } = process.env;

    validateAppConfiguration();

    return new AppConfiguration(NETWORK[NETWORK_NAME.toUpperCase()]);
  }
}
