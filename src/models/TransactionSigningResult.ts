export class TransactionSigningResult {
  public readonly signature: string | null;
  public readonly isSigned: boolean;

  constructor(isSigned: boolean, signature: string = null) {
    this.isSigned = isSigned;
    this.signature = signature;
  }
}
