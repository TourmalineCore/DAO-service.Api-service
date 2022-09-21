export type SafeMultisigTransactionType = TransactionType &
  Required<
    Pick<TransactionType, 'nonce' | 'contractTransactionHash' | 'sender'>
  > & {
    safe: string;
    origin?: string;
  };

export type TransactionType = {
  data?: string;
  to: string;
  value: number | bigint;
  operation: number;

  safeTxGas?: string | number;
  baseGas?: number;
  gasPrice?: string | number;
  gasToken?: string;
  refundReceiver?: string;
  nonce?: number;
  contractTransactionHash?: any;
  signature?: any;
  sender?: any;
};

export type SafeMultisigTransactionEstimateResponseType = {
  safeTxGas: string;
};

export type SafeMultisigConfirmation = {
  signature: string;
};

export type SafeInfoResponseType = {
  address: string;
  nonce: number;
  threshold: number;
  owners: string[];
  masterCopy: string;
  modules: string[];
  fallbackHandler: string;
  guard: string;
  version: string;
};

export type SafeMultisigEstimateTxResponseV2Type = {
  safeTxGas: string;
  baseGas: string;
  dataGas: string;
  operationalGas: string;
  gasPrice: string;
  lastUsedNonce: number;
  gasToken: string;
  refundReceiver: string;
};
