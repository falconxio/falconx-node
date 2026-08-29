const test = require('node:test');
const assert = require('node:assert/strict');

const FalconxClient = require('../index');

test('constructor uses the documented default API host', () => {
  const client = new FalconxClient('key', 'secret', 'passphrase');

  assert.equal(client.url, 'https://api.falconx.io/');
});

test('constructor throws an Error when credentials are incomplete', () => {
  assert.throws(
    () => new FalconxClient('key', '', 'passphrase'),
    {
      name: 'Error',
      message: 'One or more of API Key/Passphrase/Secret Key is missing',
    },
  );
});

test('network failures are normalized without dereferencing a missing response', async () => {
  const client = new FalconxClient('key', 'secret', 'passphrase');
  client.client = () => Promise.reject(new Error('network unavailable'));

  await assert.rejects(
    client.makeHTTPRequest('/pairs', 'get'),
    (error) => error.status === 0
      && error.statusText === ''
      && error.message === 'network unavailable',
  );
});
