const express = require("express");
const app = express();
const Model = require("./src/model.js");

app.use(express.json());
const wallet = new Model();

// route to add points
app.post("/add-points", (req, res) => {
  wallet.addPoints(req.body);
  res.end();
});

// route to check balance
app.get("/balance", (req, res) => {
  const balances = wallet.getBalances();
  res.json(balances);
});

// route to spend points
app.post("/spend-points", (req, res) => {
  const pointsSpent = wallet.spendPoints(req.body.points);
  res.json(pointsSpent);
});

// route to set up wallet just like the test case
app.get("/test/setup", (req, res) => {
  wallet.reset();

  const txs = [
    { payer: "DANNON", points: 1000, timestamp: "2020-11-02T14:00:00Z" },
    { payer: "UNILEVER", points: 200, timestamp: "2020-10-31T11:00:00Z" },
    { payer: "DANNON", points: -200, timestamp: "2020-10-31T15:00:00Z" },
    { payer: "MILLER COORS", points: 10000, timestamp: "2020-11-01T14:00:00Z" },
    { payer: "DANNON", points: 300, timestamp: "2020-10-31T10:00:00Z" },
  ];

  txs.forEach((tx) => {
    wallet.addPoints(tx);
  });

  res.end();
});

app.listen(3000);
