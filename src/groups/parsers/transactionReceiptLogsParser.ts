export default class TransactionReceiptLogsParser {
  public static parseDaoAddress(txLogs): string {
    if (txLogs.length === 0) {
      throw new Error('Logs cannot be empty');
    }

    return txLogs[0].address;
  }
}
