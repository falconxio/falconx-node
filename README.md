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
import FalconxClient from 'falconx';

const fxClient = new FalconxClient(apiKey, secretKey, passphrase);
fxClient.getQuote('ETH', 'USD', 0.1, 'two_way').then(quote => {
    fxClient.executeQuote(quote.fx_quote_id, 'sell').then(executedQuote => {
        console.log(executedQuote);
    });
});
```

# About FalconX
FalconX is an institutional digital asset brokerage. 
