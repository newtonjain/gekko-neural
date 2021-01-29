// helpers
var helper = require('../helper.js')
var _ = require('lodash');
var log = require('../core/log.js');

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function() {
  //new
  this.stopLoss = helper.trailingStopLoss();
  //
  this.name = 'Tether';
  this.requiredHistory = this.tradingAdvisor.historySize;

  this.boughtAtPrice = undefined

  const fee = this.settings.fee * 2
  this.delta = (this.settings.profit + fee) / 2 / 100

  // define the indicators we need
  this.addIndicator('sma', 'SMA', this.settings.smaLength);
}

// what happens on every new candle?
method.update = function(candle) {
  // nothing!
}

// for debugging purposes: log the last calculated
// EMAs and diff.
method.log = function() {
}

method.check = function(candle) {
  //new
  const currentPrice = candle.close;
	if(this.stopLoss.isTriggered(currentPrice)) {
		this.advice('short');
	    this.stopLoss.destroy();
	} else {
	    this.stopLoss.update(currentPrice);
  }
  //
  const average = this.indicators.sma.result;
  const price = candle.close;
  const somePercentage = this.settings.percentage


  if(!this.boughtAtPrice && (average - price) / average > this.delta) {
    log.debug('Average price is:', average);
    log.debug('Buying at price:', price);
    this.boughtAtPrice = price;
    this.advice('long')
    //new
    this.stopLoss.create(somePercentage, currentPrice);
    //
  } else if(this.boughtAtPrice && (price - average) / average > this.delta) {
    log.debug('Average price is:', average);
    log.debug('Selling at price:', price);
    log.debug('Estimated profit:', price - this.boughtAtPrice);
    this.boughtAtPrice = undefined;
    //new
    this.stopLoss.destroy();
    //
    this.advice('short');
  } else this.advice();
}

module.exports = method;

