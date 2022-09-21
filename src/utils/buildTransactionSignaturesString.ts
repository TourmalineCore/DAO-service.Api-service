export default function buildTransactionSignaturesString(
  transactionConfirmations,
): string {
  if (transactionConfirmations.length === 0) {
    throw new Error('There is no transaction confirmations');
  }

  let signatures = '';

  transactionConfirmations.sort(sortByOwnersAsc);

  for (let i = 0; i < transactionConfirmations.length; i++) {
    signatures += transactionConfirmations[i].signature.replace('0x', '');
  }

  return `0x${signatures}`;
}

const sortByOwnersAsc = (a, b) => a.owner.localeCompare(b.owner);
