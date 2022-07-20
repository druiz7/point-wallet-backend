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

    const pointsSpent = {}; // this array will contain the amounts of points spent per payer
    while (pointsToSpend > 0) {
      // spends points from transactions until all points are spent,
      // this means that it will run until sum(pointsSpent[payer]) === original value of poinsToSpend
      const [leastRecentTx] = this.txQueue; // gets first tx
      const { payer, points } = leastRecentTx;
      pointsSpent[payer] = pointsSpent[payer] || 0; // assigns it a defualt value, if needed

      // undo spending points in case if pointsSpent new value is negative
      if (pointsSpent[payer] > 0) pointsToSpend += pointsSpent[payer];

      const payerPointsSpent = Math.min(
        pointsSpent[payer] + points,
        this.payers[payer].balance
      );

      // if this is a negative transaction, or
      // if this whole transaction will be used since the sum of points is
      //  still less than the points needed to be spent
      if (points < 0 || pointsToSpend >= payerPointsSpent) {
        this.txQueue.shift();
        pointsSpent[payer] = payerPointsSpent;

        // deduct points spent for this payer if it is positive
        if (pointsSpent[payer] > 0) {
          pointsToSpend -= pointsSpent[payer];
        }
      } else {
        // partial points from this transaction will be used since
        //  it is greater than the remaining points needed to be spent
        leastRecentTx.points -= pointsToSpend - pointsSpent[payer];
        pointsSpent[payer] += pointsToSpend - pointsSpent[payer];
        pointsToSpend = 0;
      }
    }

    const formatOut = [];
    for (const payer in pointsSpent) {
      const points = pointsSpent[payer];
      if (points > 0) {
        formatOut.push({ payer: payer, points: -points });
        this.payers[payer].balance -= points;
      }
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
