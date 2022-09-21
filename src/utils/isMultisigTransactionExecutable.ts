export default function isMultisigTransactionExecutable(
  multisigTransaction,
  threshold: number,
  nonce: number,
): boolean {
  if (threshold < 1) {
    throw new Error('Threshold cannot be less than 1');
  }

  if (nonce < 0) {
    throw new Error('Nonce cannot be less than 0');
  }

  return (
    multisigTransaction.confirmations.length >= threshold &&
    multisigTransaction.nonce === nonce
  );
}
