const EventEmitter = require('events');
const { fetchExchangeRates } = require('./exchangeRates');

class RateMonitor extends EventEmitter {
    constructor() {
        super();
        this.currentRates = {};
        this.updateInterval = parseInt(process.env.UPDATE_INTERVAL) || 60000; // Default 1 minute
        this.threshold = parseFloat(process.env.RATE_CHANGE_THRESHOLD) || 0.001; // Default 0.1%
    }

    getCurrentRates() {
        return this.currentRates;
    }

    async updateRates() {
        const newRates = await fetchExchangeRates();

        // Check for significant changes
        Object.entries(newRates).forEach(([currency, rate]) => {
            const previousRate = this.currentRates[currency];

            if (previousRate) {
                const changePercent = Math.abs((rate - previousRate) / previousRate);

                if (changePercent > this.threshold) {
                    this.emit('rateChange', {
                        currency,
                        oldRate: previousRate,
                        newRate: rate,
                        changePercent: changePercent * 100
                    });
                }
            }
        });

        this.currentRates = newRates;
    }

    startMonitoring() {
        // Initial update
        this.updateRates();

        // Set up periodic updates
        setInterval(() => {
            this.updateRates();
        }, this.updateInterval);
    }
}

module.exports = {
    RateMonitor
}; 