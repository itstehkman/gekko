let sampleConfig = require('./sample-config.js');
let fs = require('fs');
const { execSync } = require('child_process');

// Path of the config file used to generate new configs
const configFilePath = 'config2.js';
const command = "node gekko --backtest -c " + configFilePath + "  | grep -E \"simulated profit|Market\" | perl -ne 'while(/[0-9]+\.[0-9]+(?=%\\))/g){print \"$&\n\";}'";

let runDema = function(demaObject) {
	sampleConfig.DEMA = demaObject;
	let configObject = JSON.stringify(sampleConfig);
	let configFileText = "module.exports = " + configObject;
	fs.writeFileSync(configFilePath, configFileText, 'utf8', function(err) { console.log(err); });
	let result = execSync(command).toString();
	console.log(demaObject);
	console.log(' -> ' + result);
	let profit = parseFloat(result);
	return profit;
}

/* Brute forces dema parameters and returns the ones with best profit */
let getBestDemaParams = function() {
	let bestParams = {};
	let bestProfit = 0;
	for (let i = 1; i < 30; i++) {
		for (let j = i + 1; j <= 30; j++) {
			for (let thresh = 0; thresh <= 1; thresh += 0.05) { 
				let demaObject = {short: i, long: j, thresholds: {up: thresh, down:-thresh}};
				let profit = runDema(demaObject);
				if (profit > bestProfit) {
					bestProfit = profit;
					bestParams =  {short: i, long: j, threshold: thresh, increase: profit}
					console.log('current best: ' + bestProfit);	
				}
			}
		}
	}	
	return bestParams;
}

// init config

// 600 minutes
sampleConfig.tradingAdvisor.candleSize = 600;
// 600 * 1 minutes history
sampleConfig.tradingAdvisor.historySize = 1;
sampleConfig.watch = {exchange: 'bitfinex', currency: 'USD', asset: 'BTC'};
// make sure you import this daterange first
sampleConfig.backtest.daterange = {from: '2017-10-08 00:00:00', to: '2018-01-08 00:07:00'};
sampleConfig.debug = false;

best = getBestDemaParams();
console.log('---- RESULTS ----');
console.log(best);
