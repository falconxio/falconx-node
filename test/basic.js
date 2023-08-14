
const should        = require("should")
const FalconxClient = require("../")


/**
 * 
 * Test Configuration
 * 
 * The tests run based on test/config.json file (which is ignored by git). 
 * 
 *    Run `npm run test:setup` to setup then edit the generated test/config.json file
 * 
 * The file should look like the following...
 * 
 *    {
 *      "FALCONX_API_KEY": "...",
 *      "FALCONX_PASSPHRASE": "...",
 *      "FALCONX_SECRET_KEY": "...",
 *      "FALCONX_HOST": "https://api.falconx.io/"
 *    }
 * 
 */

let config;
try{
  config = require("./config.json")
}catch(e){
  if(e.code === "MODULE_NOT_FOUND"){
    console.log("  No test config file found.")
    console.log("  Run `npm run test:setup` then edit the generated test/config.json file\n")
    process.exit(1)
  }else{
    throw e
  }
}


/**
 * 
 * Ensure Client exists
 * 
 */

describe("Client", function(){
  it("should exist", function(){
    should.exist(FalconxClient)
  })

  it("should accept config", function(){
    const fxClient = new FalconxClient(
      config.FALCONX_API_KEY, 
      config.FALCONX_SECRET_KEY, 
      config.FALCONX_PASSPHRASE,
      config.FALCONX_HOST
    )
    should.exist(fxClient)
    fxClient.apiKey.should.eql(config.FALCONX_API_KEY)
    fxClient.secretKey.should.eql(config.FALCONX_SECRET_KEY)
    fxClient.passphrase.should.eql(config.FALCONX_PASSPHRASE)
    fxClient.HOST.should.eql(config.FALCONX_HOST)
  })
})


/**
 * 
 * Ensure all methods are present
 * 
 */

describe("Methods", function(){

  let fxClient;
  before(function(){
    fxClient = new FalconxClient(
      config.FALCONX_API_KEY, 
      config.FALCONX_SECRET_KEY, 
      config.FALCONX_PASSPHRASE,
      config.FALCONX_HOST
    )
  })

  it("should have getTradingPairs()", function(){
    should.exist(fxClient.getTradingPairs)
    fxClient.getTradingPairs.should.be.a.Function()
  })

  it("should have getQuote()", function(){
    should.exist(fxClient.getQuote)
    fxClient.getQuote.should.be.a.Function()
  })

  it("should have placeOrder()", function(){
    should.exist(fxClient.placeOrder)
    fxClient.placeOrder.should.be.a.Function()
  })

  it("should have executeQuote()", function(){
    should.exist(fxClient.executeQuote)
    fxClient.executeQuote.should.be.a.Function()
  })

  it("should have getQuoteStatus()", function(){
    should.exist(fxClient.getQuoteStatus)
    fxClient.getQuoteStatus.should.be.a.Function()
  })

  it("should have getQuoteByUuid()", function(){
    should.exist(fxClient.getQuoteByUuid)
    fxClient.getQuoteByUuid.should.be.a.Function()
  })

  it("should have getExecutedQuotes()", function(){
    should.exist(fxClient.getExecutedQuotes)
    fxClient.getExecutedQuotes.should.be.a.Function()
  })

  it("should have getBalances()", function(){
    should.exist(fxClient.getBalances)
    fxClient.getBalances.should.be.a.Function()
  })

  it("should have getTransfers()", function(){
    should.exist(fxClient.getTransfers)
    fxClient.getTransfers.should.be.a.Function()
  })

  it("should have getTradeVolume()", function(){
    should.exist(fxClient.getTradeVolume)
    fxClient.getTradeVolume.should.be.a.Function()
  })

  it("should have get30DayTrailingVolume()", function(){
    should.exist(fxClient.get30DayTrailingVolume)
    fxClient.get30DayTrailingVolume.should.be.a.Function()
  })

  it("should have getTradeLimits()", function(){
    should.exist(fxClient.getTradeLimits)
    fxClient.getTradeLimits.should.be.a.Function()
  })

  it("should have submitWithdrawalRequest()", function(){
    should.exist(fxClient.submitWithdrawalRequest)
    fxClient.submitWithdrawalRequest.should.be.a.Function()
  })

  it("should have getRateLimits()", function(){
    should.exist(fxClient.getRateLimits)
    fxClient.getRateLimits.should.be.a.Function()
  })

  it("should have getTradeSizes()", function(){
    should.exist(fxClient.getTradeSizes)
    fxClient.getTradeSizes.should.be.a.Function()
  })

  it("should have getDerivatives()", function(){
    should.exist(fxClient.getDerivatives)
    fxClient.getDerivatives.should.be.a.Function()
  })

  it("should have getDerivativeMargins()", function(){
    should.exist(fxClient.getDerivativeMargins)
    fxClient.getDerivativeMargins.should.be.a.Function()
  })

  it("should have getTotalBalances()", function(){
    should.exist(fxClient.getTotalBalances)
    fxClient.getTotalBalances.should.be.a.Function()
  })

})




