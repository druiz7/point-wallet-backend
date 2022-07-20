# point-wallet-backend

A simple express.js backend that stores points that can be redeemed in the order that they are earned.

## API Routes:

The routes to interact with the application are as follows:

/add-points: route that accepts a json from a POST request and adds it to the model.

/balance: route that will return the balances of all the payer's points.

/spend-points: route that accepts a json from a POST request and uses those points as specified. It will return a json of the points used per payer.

/test/setup: route that pre-sets up the data model to the assignment's test case

## Testing:

To start the app, run

`npm run devStart`

The application can be tested using bash with curl commands.

For example, typing the following command will set up the model to the assignment's test case:

`curl -X GET localhost:3000/test/setup`

After that, points can be spent following this command:

`curl -X POST localhost:3000/spend-points -H 'Content-Type: application/json' -d '{"points": 5000}'`

This will return a json that displays how many of a payers's points have been spent.

To get the model's balances, run this command in the terminal:

`curl -X GET localhost:3000/balance`

Transactions can be added to the model manually by sending a POST requst like this:

`curl -X POST localhost:3000/add-points -H 'Content-Type: application/json' -d '{"payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" }'`
