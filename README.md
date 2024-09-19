# Overview
This is the official NodeJS client for the FalconX API.

API Documentation: http://docs.falconx.io

# Installation
```sh
npm i -S falconx-node
```

OR

```sh
yarn add falconx-node
```

# Quickstart

```javascript
import FalconxClient from 'falconx-node';

const fxClient = new FalconxClient(apiKey, secretKey, passphrase);
fxClient.getQuote('ETH', 'USD', 0.1, 'two_way').then(quote => {
    fxClient.executeQuote(quote.fx_quote_id, 'sell').then(executedQuote => {
        console.log(executedQuote);
    });
});
```

## Latest Update

All the trading requests will default to the new faster endpoint.
The v3 flasg introduced earlier has been removed and should not be passed in the request (see sample below)


```javascript
import FalconxClient from 'falconx-node';

const fxClient = new FalconxClient(apiKey, secretKey, passphrase);

options = {
    client_order_id: '<some client order id>'
}

fxClient.placeOrder('ETH', 'USD', 0.1, 'sell', 'market', options).then(response => {
     console.log(response);
});
```


# About FalconX
FalconX is an institutional digital asset brokerage. 
