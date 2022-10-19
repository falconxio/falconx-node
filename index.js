const axios = require('axios');
const CryptoJS = require('crypto-js');

/**
 * @typedef TokenPair
 * @property {String} base_token
 * @property {String} quote_token
 */

/**
 * @typedef TokenTradeSizeLimits
 * @property {Number} max
 * @property {Number} min
 */

/**
 * @typedef Token
 * @property {String} token
 * @property {Number} value
 */

/**
 * @typedef RateLimits
 * @property {Number|null} per_hour
 * @property {Number|null} per_minute
 * @property {Number|null} per_second
 */

/**
 * @typedef FxQuote
 * @property {String} status
 * @property {String} fx_quote_id
 * @property {Number} buy_price
 * @property {Number} sell_price
 * @property {TokenPair} token_pair
 * @property {Token} quantity_requested
 * @property {String} side_requested
 * @property {String} t_quote
 * @property {String} t_expiry
 * @property {String} is_filled
 * @property {String} side_executed
 * @property {String} price_executed
 * @property {String} t_execute
 * @property {String} client_order_id
 */

/**
 * @typedef FxError
 * @property {Number} status
 * @property {String} statusText
 * @property {String} message
 */

/**
 * @typedef FxLimitOrderOpts
 * @property {String} timeInForce - The time in force value
 * @property {Number} limitPrice - Price to execute the limit order at
 * @property {String} slippageBps - Only required for FOK orders
 */

/**
 * @typedef FxLimitOrder
 * @property {String} status
 * @property {String} fx_quote_id
 * @property {Number} buy_price
 * @property {Number} sell_price
 * @property {TokenPair} token_pair
 * @property {Token} quantity_requested
 * @property {String} side_requested
 * @property {String} t_quote
 * @property {String} t_expiry
 * @property {String} is_filled
 * @property {String} side_executed
 * @property {String} price_executed
 * @property {String} t_execute
 * @property {String} client_order_id
 * @property {String} platform
 * @property {Number} gross_fee_bps
 * @property {Number} gross_fee_usd
 * @property {Number} rebate_bps
 * @property {Number} rebate_usd
 * @property {Number} fee_bps
 * @property {Number} fee_usd
 * @property {String} trader_email
 * @property {String} order_type
 * @property {String} time_in_force
 * @property {Number} limit_price
 * @property {Number} slippage_bps
 * @property {String} error
 */

/**
 * @typedef FxTokenBalance
 * @property {String} token
 * @property {String} platform
 * @property {Number} balance
 */

/**
 * @typedef FxTransfer
 * @property {String} type
 * @property {String} platform
 * @property {String} token
 * @property {Number} quantity
 * @property {String} t_create
 */

/**
 * @typedef FxTotalBalances
 * @property {String} token
 * @property {Number} total_balance
 */

/**
 * @typedef FxTradeSizes
 * @property {String} platform
 * @property {TokenPair} token_pair
 * @property {TokenTradeSizeLimits} trade_size_limits_in_quote_token
 */

/**
 * @typedef FxRateLimits
 * @property {RateLimits} num_quotes_limit
 */

/**
 * @typedef FxWithdrawalRequest
 * @property {String} message
 * @property {String} status
 */

/**
 * @typedef Fx30DayTrailingVolume
 * @property {String} end_date
 * @property {String} start_date
 * @property {Number} usd_volume
 */

/**
 * @typedef FxLimit
 * @property {Number} remaining
 * @property {Number} total
 * @property {Number} used
 */

/**
 * @typedef FxNetGrossLimit
 * @property {FxLimit} gross_limits
 * @property {FxLimit} net_limits
 */

/**
 * @typedef DerivativeTrade
 * @property {String} trade_id
 * @property {String} status
 * @property {String} market
 * @property {String} trader
 * @property {String} product
 * @property {Number} quantity
 * @property {String} side
 * @property {String} type
 * @property {String} trade_date
 * @property {String} effective_date
 * @property {String} fixing_expiry_time
 * @property {String} premium
 * @property {String} counterparty_margin
 * @property {String} trade_notional
 * @property {String} strike_price
 * @property {String} daily_mark
 * @property {String} delta
 * @property {String} vega
 */

/**
 * @typedef DerivativeMargin
 * @property {String} token
 * @property {Number} total_margin
 */

/**
 * @typedef DerivativeTradesResponse
 * @property {DerivativeTrade[]} response
 * @property {String} status
 */

/**
 * @typedef DerivativeMarginsResponse
 * @property {DerivativeMargin[]} response
 * @property {String} status
 */

class FalconxClient {
  /**
     * Client for querying the FalconX API using http REST
     *
     * @constructor
     * @param {String} apiKey
     * @param {String} secretKey
     * @param {String} passphrase
     * @param {String} url - URL of FalconX REST API
     */
  constructor(apiKey, secretKey, passphrase, url = 'https://api.falconx.io/v1/') {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.passphrase = passphrase;
    this.url = url;
    this.client = axios.create({ baseURL: url, headers: { 'Content-Type': 'application/json' } });

    if (!apiKey || !secretKey || !passphrase) {
      throw Promise.reject(new Error('One or more of API Key/Passphrase/Secret Key is missing'));
    }

    this.client.interceptors.request.use(
      (config) => {
        const timestamp = new Date().getTime() / 1000;
        const pathUrl = `/v1${config.url}`;
        let baseMessage = timestamp + config.method.toUpperCase() + pathUrl;
        if (config.method === 'post' || Object.keys(config.data || {}).length > 0) {
          baseMessage += JSON.stringify(config.data);
        } else {
          // eslint-disable-next-line no-param-reassign
          config.data = undefined;
        }
        const message = baseMessage;
        const hmacKey = CryptoJS.enc.Base64.parse(this.secretKey);
        const signature = CryptoJS.HmacSHA256(message, hmacKey);
        const signatureB64 = signature.toString(CryptoJS.enc.Base64);

        return {
          ...config,
          headers: {
            ...config.headers,
            'FX-ACCESS-SIGN': signatureB64,
            'FX-ACCESS-TIMESTAMP': timestamp,
            'FX-ACCESS-KEY': this.apiKey,
            'FX-ACCESS-PASSPHRASE': this.passphrase,
          },
        };
      },
      (error) => {
        Promise.reject(error);
      },
    );
  }

  /* eslint-disable prefer-promise-reject-errors */
  makeHTTPRequest(url, method, params = null) {
    return this.client({
      url,
      method,
      data: params,
    })
      .then(({ data }) => data)
      .catch((error) => Promise.reject({
        status: error.response.status,
        statusText: error.response.statusText,
        message: error.response.data.message,
      }));
  }
  /* eslint-enable prefer-promise-reject-errors */

  /**
     * Get a list of trading pairs you are eligible to trade
     * @async
     * @returns {Promise<TokenPair[]|FxError>} - An array of token pairs or error
     * @example [
     *      {'base_token': 'BTC', 'quote_token': 'USD'},
     *      {'base_token': 'ETH', 'quote_token': 'USD'}
     * ]
     */
  getTradingPairs() {
    return this.makeHTTPRequest('/pairs', 'get');
  }

  /**
     * Get a two_way, buy or sell quote for a token pair.
     * @async
     * @param {String} base - base token e.g. BTC, ETH
     * @param {String} quote - quote token e.g. USD, BTC
     * @param {Number} quantity
     * @param {String} side - 'two_way', 'buy', 'sell'
     * @param {String} clientOrderId
     * @returns {Promise<FxQuote|FxError>} - A valid executeable or an error
     * @example {
            "status": "success",
            "fx_quote_id": "00c884b056f949338788dfb59e495377",
            "buy_price": 12650,
            "sell_price": null,
            "token_pair": {
                "base_token": "BTC",
                "quote_token": "USD"
            },
            "quantity_requested": {
                "token": "BTC",
                "value": "10"
            },
            "side_requested": "buy",
            "t_quote": "2019-06-27T11:59:21.875725+00:00",
            "t_expiry": "2019-06-27T11:59:22.875725+00:00",
            "is_filled": false,
            "side_executed": null,
            "price_executed": null,
            "t_execute": null,
            "client_order_id": "d6f3e1fa-e148-4009-9c07-a87f9ae78d1a"
        }
     */
  getQuote(base, quote, quantity, side, clientOrderId = null) {
    const params = {
      token_pair: {
        base_token: base,
        quote_token: quote,
      },
      quantity: {
        token: base,
        value: quantity,
      },
      side,
      client_order_id: clientOrderId,
    };
    return this.makeHTTPRequest('/quotes', 'post', params);
  }

  /**
     * Place a market or limit order with FalconX
     * @async
     * @param {String} base - base token e.g. BTC, ETH
     * @param {String} quote - quote token e.g. USD, BTC
     * @param {Number} quantity
     * @param {String} side - 'buy', 'sell'
     * @param {String} orderType - 'market', 'limit'
     * @param {FxLimitOrderOpts} opts - Optional Parameters
     * @example {
     *      'timeInForce': 'fok', [only required for limit orders]
     *      'limitPrice': 2.809,  [only required for limit orders]
     *      'slippageBps': 3.2    [only required for fok limit orders]
     * }
     * @returns {Promise<FxLimitOrder|FxError>}
     * @example {
            "status": "success",
            "fx_quote_id": "00c884b056f949338788dfb59e495377",
            "buy_price": 8545.12,
            "sell_price": null,
            "platform": "api",
            "token_pair": {
                "base_token": "BTC",
                "quote_token": "USD"
            },
            "quantity_requested": {
                "token": "BTC",
                "value": "10"
            },
            "side_requested": "buy",
            "t_quote": "2019-06-27T11:59:21.875725+00:00",
            "t_expiry": "2019-06-27T11:59:22.875725+00:00",
            "is_filled": true,
            "gross_fee_bps": 8,
            "gross_fee_usd": 101.20,
            "rebate_bps": 3,
            "rebate_usd": 37.95,
            "fee_bps": 5,
            "fee_usd": 63.25,
            "side_executed": "buy",
            "trader_email": "trader@company.com",
            "order_type": "limit",
            "time_in_force": "fok",
            "limit_price": 8547.11,
            "slippage_bps": 2,
            "error": null,
            "client_order_id": "d6f3e1fa-e148-4009-9c07-a87f9ae78d1a"
        }
     */
  placeOrder(base, quote, quantity, side, orderType, opts) {
    const params = {
      token_pair: {
        base_token: base,
        quote_token: quote,
      },
      quantity: {
        token: base,
        value: quantity.toString(),
      },
      side,
      order_type: orderType,
      time_in_force: opts.timeInForce,
      limit_price: opts.limitPrice,
      slippage_bps: opts.slippageBps,
      client_order_id: opts.clientOrderId,
    };
    return this.makeHTTPRequest('/order', 'post', params);
  }

  /**
     * Execute the quote.
     * @async
     * @param {String} fxQuoteId - the quote id received via get_quote
     * @param {String} side - must be either buy or sell
     * @returns {Promise<FxQuote|FxError>} - same as object received from get_quote
     * @example {
            'buy_price': 294.0,
            'error': None,
            'fx_quote_id': 'fad0ac687b1e439a92a0bafd92441e48',
            'is_filled': True,
            'price_executed': 294.0,
            'quantity_requested': {'token': 'ETH', 'value': '0.10000'},
            'sell_price': 293.94,
            'side_executed': 'buy',
            'side_requested': 'two_way',
            'status': 'success',
            't_execute': '2019-07-03T21:45:10.358335+00:00',
            't_expiry': '2019-07-03T21:45:17.198692+00:00',
            't_quote': '2019-07-03T21:45:07.198688+00:00',
            'token_pair': {'base_token': 'ETH', 'quote_token': 'USD'}
        }
     */
  executeQuote(fxQuoteId, side) {
    const params = {
      fx_quote_id: fxQuoteId,
      side,
    };
    return this.makeHTTPRequest('/quotes/execute', 'post', params);
  }

  /**
     * Check the status of a quote already requested.
     * @async
     * @param {String} fxQuoteId - the quote id received via get_quote
     * @returns {Promise<FxQuote|FxError>}
     * @example : {
            "status": "success",
            "fx_quote_id": "00c884b056f949338788dfb59e495377",
            "buy_price": 12650,
            "sell_price": null,
            "platform": "api",
            "token_pair": {
            "base_token": "BTC",
            "quote_token": "USD"
            },
            "quantity_requested": {
            "token": "BTC",
            "value": "10"
            },
            "side_requested": "buy",
            "t_quote": "2019-06-27T11:59:21.875725+00:00",
            "t_expiry": "2019-06-27T11:59:22.875725+00:00",

            "is_filled": false,
            "side_executed": null,
            "price_executed": null,
            "t_execute": null,
            "trader_email": "trader1@company.com"
        }
     */
  getQuoteStatus(fxQuoteId) {
    return this.makeHTTPRequest(`/quotes/${fxQuoteId}`, 'get');
  }

  /**
     * Get a historical record of executed quotes in the time range.
     * @async
     * @param {String} tStart - time in ISO8601 format (e.g. '2019-07-02T22:06:24.342342+00:00')
     * @param {String} tEnd - time in ISO8601 format (e.g. '2019-07-03T22:06:24.234213+00:00'
     * @param {String?} platform - possible values -> ('browser', 'api', 'margin')
     * @returns {Promise<FxQuote[]|FxError>}
     * @example : [{'buy_price': 293.1, 'error': None, 'fx_quote_id': 'e2e1758f1a094a2a85825b592e9fc0d9',
        'is_filled': True, 'price_executed': 293.1, 'platform': 'browser', 'quantity_requested': {'token': 'ETH', 'value': '0.10000'},
        'sell_price': 293.03, 'side_executed': 'buy', 'side_requested': 'two_way', 'status': 'success',
        't_execute': '2019-07-03T14:02:56.539710+00:00', 't_expiry': '2019-07-03T14:03:02.038093+00:00',
        't_quote': '2019-07-03T14:02:52.038087+00:00',
        'token_pair': {'base_token': 'ETH', 'quote_token': 'USD'}, 'trader_email': 'trader1@company.com'},

        {'buy_price': 293.1, 'error': None, 'fx_quote_id': 'fc17a0d884444a0db5a7d9568c6c3f70',
        'is_filled': True, 'price_executed': 293.03, 'platform': 'api', 'quantity_requested': {'token': 'ETH', 'value': '0.10000'},
        'sell_price': 293.03, 'side_executed': 'sell', 'side_requested': 'two_way', 'status': 'success',
        't_execute': '2019-07-03T14:02:46.480337+00:00', 't_expiry': '2019-07-03T14:02:50.454222+00:00',
        't_quote': '2019-07-03T14:02:40.454217+00:00', 'token_pair': {'base_token': 'ETH', 'quote_token': 'USD'},
        'trader_email': 'trader2@company.com'}]
     */
  getExecutedQuotes(tStart, tEnd, platform = null) {
    const params = { t_start: tStart, t_end: tEnd, platform };
    return this.makeHTTPRequest('/quotes', 'get', params);
  }

  /**
     * Get account balances.
     * @async
     * @param {String?} platform - possible values -> ('browser', 'api', 'margin')
     * @returns {Promise<FxTokenBalance[]|FxError>}
     * @example : [
            {'balance': 0.0, 'token': 'BTC', 'platform': 'browser'},
            {'balance': -1.3772005993291505, 'token': 'ETH', 'platform': 'api'},
            {'balance': 187.624207, 'token': 'USD', 'platform': 'api'}
        ]
     */
  getBalances(platform = null) {
    return this.makeHTTPRequest('/balances', 'get', { platform });
  }

  /**
     * Get a historical record of deposits/withdrawals between the given time range.
     * @async
     * @param {String?} tStart - time in ISO8601 format (e.g. '2019-07-02T22:06:24.342342+00:00')
     * @param {String?} tEnd - time in ISO8601 format (e.g. '2019-07-03T22:06:24.234213+00:00'
     * @param {String?} platform - possible values -> ('browser', 'api', 'margin')
     * @returns {Promise<FxTransfer[]|FxError>}
     * @example : [
            {
                "type": "deposit",
                "platform": "api",
                "token": "BTC",
                "quantity": 1.0,
                "t_create": "2019-06-20T01:01:01+00:00"
            },

            {
                "type": "withdrawal",
                "platform": "midas",
                "token": "BTC",
                "quantity": 1.0,
                "t_create": "2019-06-22T01:01:01+00:00"
            }
        ]
     */
  getTransfers(tStart = null, tEnd = null, platform = null) {
    const params = { t_start: tStart, t_end: tEnd, platform };
    return this.makeHTTPRequest('/transfers', 'get', params);
  }

  getTradeVolume(tStart, tEnd) {
    const params = { t_start: tStart, t_end: tEnd };
    return this.makeHTTPRequest('/get_trade_volume', 'get', params);
  }

  /**
     * Get USD trailing volume for the last 30 days
     * @async
     * @returns {Promise<Fx30DayTrailingVolume|FxError>}
     * @example : {
            end_date: '2020-07-27T17:22:42.202198',
            start_date: '2020-06-27T17:22:42.202198',
            usd_volume: 19941.405434647015
        }
     */
  get30DayTrailingVolume() {
    return this.makeHTTPRequest('/get_30_day_trailing_volume', 'get');
  }

  /**
     * Get the current trade limits for each platform
     * @async
     * @param {String} platform - Can be browser, api, margin
     * @returns {Promise<FxNetGrossLimit|FxError>}
     * @example : {
            gross_limits: {
                remaining: 5469.694069321,
                total: 10000,
                used: 4530.305930679
            },
            net_limits: {
                remaining: 4556.667753705194,
                total: 5000,
                used: 443.33224629480617
            }
        }
     */
  getTradeLimits(platform) {
    return this.makeHTTPRequest(`/get_trade_limits/${platform}`, 'get');
  }

  /**
     * Response for submitting a withdrawal request
     * @async
     * @returns {Promise<FxWithdrawalRequest|FxError>}
     * @example : {
            message: 'Withdrawal request submitted successfully',
            status: 'success'
        }
     */
  submitWithdrawalRequest(token, amount, platform) {
    const params = { token, amount, platform };
    return this.makeHTTPRequest('/withdraw', 'post', params);
  }

  /**
     * Get number of quotes permissible in unit time - hour/minute/second
     * @async
     * @returns {Promise<FxRateLimits|FxError>}
     * @example : {
            num_quotes_limit: { per_hour: null, per_minute: 24, per_second: null }
        }
     */
  getRateLimits() {
    return this.makeHTTPRequest('/rate_limit', 'get');
  }

  /**
     * Get trade sizes for token pairs on browser/api
     * @async
     * @returns {Promise<FxTradeSizes[]|FxError>}
     * @example : [
            {
                platform: 'browser',
                token_pair: { base_token: 'BTC', quote_token: 'USD' },
                trade_size_limits_in_quote_token: { max: 50, min: 1 }
            },
            {
                platform: 'api',
                token_pair: { base_token: 'ETH', quote_token: 'USD' },
                trade_size_limits_in_quote_token: { max: 50, min: 1 }
            },
        ]
     */
  getTradeSizes() {
    return this.makeHTTPRequest('/trade_sizes', 'get');
  }

  /**
     * Get derivative trade information with current mtm data.
     * @param {String} trade_status {'open'|'closed'|'settled'|'defaulted'}
     * @param {String} product_type {'ndf'|'call_option'|'put_option'|'irs'|'option'}
     * @param {String} market_list: comma separated 'BTC-USD,ETH-USD'
     * @returns {Promise<DerivativeTradeReponse|FxError>}
     * @example {
        'status': 'success',
        'response': [{
          trade_id: '12a29e52cfe745c4a4ee556f372ebce2',
          status: 'open',
          market: 'ETH - USD',
          trader: 'will@client.com',
          product: 'OPTION',
          quantity: 500,
          side: 'Sell',
          type: 'Put',
          trade_date: '09/08/2022 1:56 PM ET',
          effective_date: '09/12/2022',
          maturity_date: '11/18/2022',
          fixing_expiry_time: '4pm NYC',
          premium: '100,000.00 USD',
          counterparty_margin: '15.00001% USD',
          trade_notional: '800,000.00 USD',
          strike_price: '2,000.00 USD',
          daily_mark: '-2.00 USD',
          delta: '-262.00',
          vega: '-272.00 USD',
        }]
      }
  */
  getDerivatives(trade_status, product_type, market_list) {
    const params = { trade_status, product_type, market_list };
    return this.makeHTTPRequest('/derivatives', 'get', params);
  }

  /**
     * Get total derivative margin balances per token.
     * @returns {Promise<DerivativeMarginsResponse|FxError>}
     * @example {
        'status': 'success',
        'response': [
          {
            token: 'BTC',
            total_margin: 10.3
          }, {
            token: 'ETH'
            total_margin: 32.1
          }
        ]
      }
  */
  getDerivativeMargins() {
    return this.makeHTTPRequest('/derivatives/margins', 'get', {});
  }

  /**
     * Get total USD balance for each token.
     * @async
     * @returns {Promise<FxTotalBalances[]|FxError>}
     * @example : [
            { token: 'ALGO', total_balance: 1350000 },
            { token: 'BCH', total_balance: 3396.1 },
            { token: 'BNB', total_balance: 3000 },
            { token: 'BTC', total_balance: 63.24596788904755 }
        ]
     */
  getTotalBalances() {
    return this.makeHTTPRequest('/balances/total', 'get');
  }
}

module.exports = FalconxClient;
