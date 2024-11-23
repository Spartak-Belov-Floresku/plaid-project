const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': 'yours',
      'PLAID-SECRET': 'yours',
    },
  },
});

const clientPlaid = new PlaidApi(configuration);

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/hello", (req, res) => {
    res.json({message: "hello " + req.body.name});
});

app.post('/auth', async function ( request, response, next,) {
    const accessToken = request.body.access_token;
    const plaidRequest = {access_token: accessToken };
    try {
        const plaidResponse = await clientPlaid.authGet(plaidRequest);
        console.log(plaidResponse)
        response.json(plaidResponse.data);
    } catch (error) {
        console.log("Error: " + error)
        response.status(500).send("failer");
    }
});

app.post('/create_link_token', async function (request, response) {
    // // Get the client_user_id by searching for the current user
    // const user = await User.find(...);
    // const clientUserId = user.id;
    const plaidRequest = {
      user: {
        // This should correspond to a unique id for the current user.
        client_user_id: "user",
      },
      client_name: 'Plaid Test App',
      products: ['auth'],
      language: 'en',
      redirect_uri: 'http://localhost:3000/',
      country_codes: ['US'],
    };
    try {
        const plaidResponse = await clientPlaid.linkTokenCreate(plaidRequest);
        response.json(plaidResponse.data);
    } catch (error) {
        console.log("Error: " + error)
        response.status(500).send("failer");
    }
});

app.post('/exchange_public_token', async function ( request, response, next,) {
    const publicToken = request.body.public_token;
    try {
        const plaidResponse = await clientPlaid.itemPublicTokenExchange({
            public_token: publicToken,
        });

        // These values should be saved to a persistent database and
        // associated with the currently signed-in user
        const accessToken = plaidResponse.data.access_token;
        // const itemID = response.data.item_id;

        response.json({accessToken});
    } catch (error) {
        console.log("Error: " + error)
        response.status(500).send("failer");
    }
});

app.listen(8000, () => {
    console.log('Server has started at 8000!')
});