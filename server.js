const express = require("express");
const app = express();
const session = require("express-session");
const Model = require("./src/model.js");

app.use(express.json());
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 6000 },
  })
);

const createModelIfNeeded = (req) => {
  req.session.model = req.session.model || new Model();
};

app.post("/add-points", (req, res) => {
  createModelIfNeeded(req);

  const wallet = req.session.model;
  wallet.addPoints(req.body);
});

app.get("/balance", (req, res) => {
  createModelIfNeeded(req);

  const wallet = req.session.model;
  const balances = wallet.getBalances();
  res.json(balances);
});

app.post("/spend-points", (req, res) => {
  createModelIfNeeded(req);

  const wallet = req.session.model;
  const pointsSpent = wallet.spendPoints(req.body.points);
  const formatOut = [];
  for (const payer in pointsSpent) {
    formatOut.push({ payer: payer, points: pointsSpent[payer] });
  }

  res.json(formatOut);
});

app.listen(3000);
