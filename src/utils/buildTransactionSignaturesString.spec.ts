import buildTransactionSignaturesString from './buildTransactionSignaturesString';

describe('build transaction signatures string', function () {
  it('should build signature string by single confirmation', function () {
    const TRANSACTION_CONFIRMATIONS = [
      {
        owner: '0x02cC2c7Fec33591ac1C0b605d34bE504Db632280',
        submissionDate: '2022-05-31T04:27:03.757677Z',
        transactionHash: null,
        signature:
          '0xa7353379633220fd09543941aac6eba5b1071bf24dece0b940777f68df7a20f80fc9c0efc40435c09e75174e21dae33b0e769827786191815208ea46e63933431c',
        signatureType: 'EOA',
      },
    ];

    const expectedSignatureString =
      '0xa7353379633220fd09543941aac6eba5b1071bf24dece0b940777f68df7a20f80fc9c0efc40435c09e75174e21dae33b0e769827786191815208ea46e63933431c';

    const signatureString = buildTransactionSignaturesString(
      TRANSACTION_CONFIRMATIONS,
    );

    expect(signatureString).toBe(expectedSignatureString);
  });

  it('should build signature string by several confirmations', function () {
    const TRANSACTION_CONFIRMATIONS = [
      {
        owner: '0x02cC2c7Fec33591ac1C0b605d34bE504Db632280',
        submissionDate: '2022-05-31T04:27:03.757677Z',
        transactionHash: null,
        signature:
          '0xa7353379633220fd09543941aac6eba5b1071bf24dece0b940777f68df7a20f80fc9c0efc40435c09e75174e21dae33b0e769827786191815208ea46e63933431c',
        signatureType: 'EOA',
      },
      {
        owner: '0xC5c2a86392Daedb4f21307f27a66d4d04ff6D9E6',
        submissionDate: '2022-05-31T04:48:18Z',
        transactionHash: null,
        signature:
          '0x000000000000000000000000c5c2a86392daedb4f21307f27a66d4d04ff6d9e6000000000000000000000000000000000000000000000000000000000000000001',
        signatureType: 'APPROVED_HASH',
      },
    ];

    const expectedSignatureString =
      '0xa7353379633220fd09543941aac6eba5b1071bf24dece0b940777f68df7a20f80fc9c0efc40435c09e75174e21dae33b0e769827786191815208ea46e63933431c000000000000000000000000c5c2a86392daedb4f21307f27a66d4d04ff6d9e6000000000000000000000000000000000000000000000000000000000000000001';

    const signatureString = buildTransactionSignaturesString(
      TRANSACTION_CONFIRMATIONS,
    );

    expect(signatureString).toBe(expectedSignatureString);
  });

  it('throw exception if no confirmations', function () {
    expect(() => buildTransactionSignaturesString([])).toThrowError(
      'There is no transaction confirmations',
    );
  });
});
