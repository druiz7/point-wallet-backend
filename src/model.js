class model {
  // payers data model
  /**
   * payers {
   *  "payerName": {
   *    balance: XYZ,
   *    txs: [{tx1},{tx2},{tx3},...,{txN}],
   *  },
   *  ...,
   * }
   */
  constructor() {
    this.payers = {};
  }

  // gets the points balance
  getBalances() {
    const balances = {};
    for (const payer in this.payers) {
      balances[payer] = this.payers[payer].balance;
    }
    return balances;
  }

  // adds transaction to the payer transaction list
  addPoints(tx) {
    const { payer, points, timestamp } = tx;
    if (!this.payers.hasOwnProperty(payer)) {
      this.payers[payer] = {};
      this.payers[payer].txs = [];
      this.payers[payer].balance = 0;
    }

    // get where this transaction belongs in the list (order of least recent to most recent)
    const payerTxs = this.payers[payer].txs;
    let insertIdx;
    for (insertIdx = 0; insertIdx < payerTxs.length; insertIdx++) {
      const { timestamp: curTxTimestamp } = payerTxs[insertIdx];
      if (timestamp < curTxTimestamp) break;
    }

    payerTxs.splice(insertIdx, 0, tx);
    this.payers[payer].balance += points;
  }

  // spends the points specified
  spendPoints(pointsToSpend) {
    const pointsSpent = {};
    const payersCurTxIdx = {};
    while (pointsToSpend > 0) {
      let leastRecentTx = null;
      for (const payer in this.payers) {
        // get the currently looked at payer transaction
        const curTxIdx = payersCurTxIdx[payer] || 0;
        const curTx = this.payers[payer].txs[curTxIdx];
        if (curTx === undefined) continue; // there isn't a next transaction to use

        if (
          // if there isnt a recent tx or this tx is less recent than the curr least recent set it
          (leastRecentTx = null || curTx.timestamp < leastRecentTx.timestamp)
        ) {
          leastRecentTx = curTx;
        }
      }

      if (leastRecentTx === null) break; // never found a tx

      // now leastRecentTx points to the correct tx
      const { payer, points } = leastRecentTx;
      payersCurTxIdx[payer] = (payersCurTxIdx[payer] || 0) + 1;
      pointsSpent[payer] = (pointsSpent[payer] || 0) + points;
      pointsToSpend -= points;

      // in case the points for this tx was greater than the amount left to redeem
      if (pointsToSpend < 0) {
        pointsSpent[payer] -= pointsToSpend;
      }
    }

    // there were not enough points to redeem
    if (pointsToSpend > 0) return {};

    // update data model and return points spent

    return pointsSpent;
  }
}
