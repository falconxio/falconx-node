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

## New Order Endpoint
A new faster endpoint is now available to place orders.
The same can be used as mentioned in the below sample.
Optional argument 'v3'. 
If the argument is not passed, the old order (v1/order) endpoint is used.

```javascript
import FalconxClient from 'falconx-node';

const fxClient = new FalconxClient(apiKey, secretKey, passphrase);

options = {
    client_order_id: '<some client order id>'
}

fxClient.placeOrder('ETH', 'USD', 0.1, 'sell', 'market', options, v3=true).then(response => {
     console.log(response);
});
```


# About FalconX
FalconX is an institutional digital asset brokerage. 
