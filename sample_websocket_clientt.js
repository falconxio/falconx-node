// process.env.DEBUG="*"
var env = "prod"


apiKey = '***'
passphrase = '***'
secretKey = '***'

const socketio = require('socket.io-client'); // socket.io-client@2.5.0 
const CryptoJS = require('crypto-js'); // crypto-js@4.1.1 
let url = {
    prod: "https://ws.falconx.io",
    stage: "https://ws-stage.falconx.io"
}[env]

class FXClient{
    constructor(namespace, apiKey, passphrase, secretKey, onConnectCallback){
        this.url = url;
        this.namespace = namespace;
        this.onConnectCallback = onConnectCallback;
        this.apiKey = apiKey;
        this.passphrase = passphrase;
        this.secretKey = secretKey;
        this.connection = null;
    }

    createHeaders() {
        const timestamp = new Date().getTime()/1000;
        const message = timestamp + 'GET' + '/socket.io/';
        const hmacKey = CryptoJS.enc.Base64.parse(this.secretKey);
        const signature = CryptoJS.HmacSHA256(message, hmacKey);
        const signatureB64 = signature.toString(CryptoJS.enc.Base64);
        return {
            'FX-ACCESS-SIGN': signatureB64,
            'FX-ACCESS-TIMESTAMP': timestamp,
            'FX-ACCESS-KEY': this.apiKey,
            'FX-ACCESS-PASSPHRASE': this.passphrase,
            'Content-Type': 'application/json',
            'Sec-Webscoket-Key': 'application/json'
        }
    }

    getConnectionParameters(){
        return {
            extraHeaders: this.createHeaders(),
            transports: ['websocket'],
        }
    }

    onConnect(){
        console.log(`Connected to ${this.namespace} namespace`);
        if (this.onConnectCallback){
            this.onConnectCallback(this);
        }
    }

    onDisconnect(){
        console.log(`Disconnected to ${this.namespace} namespace`);
        console.log('Retrying connection..')
        this.connect();
    }

    onConnectError(msg){
        console.log(`Connection error. Message received:`, msg)
    }

    onError(msg){
        console.log(`Error. Message received:`, msg)
    }

    connect(){
        if (this.connection){
        }
        this.connection = socketio.connect(`${this.url}/${this.namespace}`, this.getConnectionParameters());
        this.connection.on('connect', this.onConnect.bind(this));
        this.connection.on('disconnect', this.onDisconnect.bind(this));
        this.connection.on('connect_error', this.onConnectError.bind(this));
        this.connection.on('error', this.onError.bind(this));
    }

    addListener(event, callback){
        if (!this.connection){
            throw "connection is not initialised yet"
        }
        this.connection.on(event, callback)
    }

    emit(event, message){
        if (!this.connection){
            throw "connection is not initialised yet"
        }
        this.connection.emit(event, message);
    }
}

var fxStreamingClient = new FXClient('streaming', apiKey, passphrase, secretKey, (client) => {
    // onConnectCallback will get called everytime a connection is made.
    const subscription_request = {
        token_pair: {
            base_token: "BTC",
            quote_token: "USD"
        },
        quantity: [1],
        client_request_id: 'myid',
    }
    
    client.emit('subscribe', subscription_request);
   
    client.addListener('stream', price => {
        console.log(price)
    });
        
    client.addListener('response', msg => {
        subscription_res_time = new Date().getTime()
    });
    client.addListener('subscription_success', msg => {
        subscription_res_time = new Date().getTime()
    });
});

fxStreamingClient.connect();
