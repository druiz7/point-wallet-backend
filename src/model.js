class Model {
  // payer-tx data model
  /**
   * payers {
   *  "payerName": {
   *    balance: XYZ,
   *  },
   *  ...,
   * }
   *
   * txQueue: [{tx1},{tx2},{tx3},...,{txN}]
   */
  constructor() {
    this.reset();
  }

  // resets the model
  reset() {
    this.payers = {};
    this.txQueue = [];
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
      this.payers[payer].balance = 0;
    }

    // get where this transaction belongs in the list (order of least recent to most recent)
    let insertIdx;
    for (insertIdx = 0; insertIdx < this.txQueue.length; insertIdx++) {
      const { timestamp: curTxTimestamp } = this.txQueue[insertIdx];
      if (timestamp < curTxTimestamp) break;
    }

    this.txQueue.splice(insertIdx, 0, tx);
    this.payers[payer].balance += points;
  }

  // spends the points specified
  spendPoints(pointsToSpend) {
    if (!this.#hasPoints(pointsToSpend)) return {}; // there are not enough points to spend

    const pointsSpent = {};
    while (pointsToSpend > 0) {
      // spends points from transactions until all points are spent
      const [leastRecentTx] = this.txQueue; // gets first tx
      const { payer, points } = leastRecentTx;

      if (pointsToSpend >= points) {
        // all points from that transaction are spent
        this.txQueue.shift();
        pointsSpent[payer] = (pointsSpent[payer] || 0) + points;
        pointsToSpend -= points;
      } else {
        // some of the points from that transaction are spent
        leastRecentTx.points -= pointsToSpend;
        pointsSpent[payer] = (pointsSpent[payer] || 0) + pointsToSpend;
        pointsToSpend = 0;
      }
    }

    const formatOut = [];
    for (const payer in pointsSpent) {
      const points = -pointsSpent[payer];
      formatOut.push({ payer, points });
      this.payers[payer].balance -= pointsSpent[payer];
    }

    return formatOut;
  }

  // checks if the payers have enough points to spend
  #hasPoints(pointsToSpend) {
    let sum = 0;
    for (const payer in this.payers) {
      sum += this.payers[payer].balance;
      if (sum >= pointsToSpend) break;
    }

    return sum >= pointsToSpend;
  }
}

module.exports = Model;
