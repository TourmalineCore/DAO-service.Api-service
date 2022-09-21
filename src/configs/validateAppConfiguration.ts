import { NETWORK } from '../consts';

const validateAppConfiguration = () => {
  const { NETWORK_NAME } = process.env;

  checkThatVariableIsDefined({ NETWORK_NAME });

  const availableNetworkNames: string[] = Object.values(NETWORK);

  if (!availableNetworkNames.includes(NETWORK_NAME)) {
    throw new Error(
      `NETWORK_NAME can have only the following values: ${availableNetworkNames.join(
        ', ',
      )}`,
    );
  }
};

const checkThatVariableIsDefined = (namedEnvVariable: object) => {
  const [[name, value]] = Object.entries(namedEnvVariable);

  if (!value) {
    throw new Error(`${name} must be defined`);
  }
};

export default validateAppConfiguration;
