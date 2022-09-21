export const ETHER_NAME = 'Ether';
export const ETHER_SYMBOL = 'ETH';

export const USER_NAME_LENGTH_FOR_SEARCH = 3;
export const DEFAULT_SEARCH_SCOPE = 'all';

export enum NETWORK {
  MAINNET = 'mainnet',
  RINKEBY = 'rinkeby',
  GOERLI = 'goerli',
}

export const CONTRACT_ADDRESSES = {
  [NETWORK.MAINNET]: {
    nindao: '',
    erc20: '',
  },
  [NETWORK.RINKEBY]: {
    nindao: '0xC74194c5d2C4F435fB26D34457Fe7709E35D2642',
    erc20: '0xC606e5D95F5066421AdD3F315c9D3fc5385E76f5',
  },
  [NETWORK.GOERLI]: {
    nindao: '0xA86E2634D2C3932e1548E1d2ba727c769cdB4BA4',
    erc20: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
  },
};

export const NETWORK_NAMES_IN_GNOSIS_URL = {
  [NETWORK.RINKEBY]: 'rin',
};
