const EventEmitter = require('events');
const { fetchExchangeRates } = require('./exchangeRates');

class RateMonitor extends EventEmitter {
    constructor() {
        super();
        this.currentRates = {};
        this.updateInterval = parseInt(process.env.UPDATE_INTERVAL) || 20000; // Default 1 minute
        this.threshold = parseFloat(process.env.RATE_CHANGE_THRESHOLD) || 0.001; // Default 0.1%
        this.previousRates = {};
        this.intervalId = null;  // Add this to track the interval
    }

    getCurrentRates() {
        return this.currentRates;
    }

    async updateRates() {
        try {
            const newRates = await fetchExchangeRates();

            // Compare with previous rates and log changes
            if (this.previousRates) {
                for (const [currency, newRate] of Object.entries(newRates)) {
                    const oldRate = this.previousRates[currency];
                    if (oldRate && oldRate !== newRate) {
                        const changePercent = Math.abs((newRate - oldRate) / oldRate);

                        // Only log if change exceeds threshold
                        if (changePercent > this.threshold) {
                            console.log({
                                event: 'PRICE_CHANGE',
                                currency,
                                oldPrice: oldRate,
                                newPrice: newRate,
                                percentageChange: (changePercent * 100).toFixed(2) + '%',
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                }
            }

            this.previousRates = newRates;

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
        } catch (error) {
            console.error('Error checking rates:', error);
        }
    }

    startMonitoring() {
        // Clear any existing interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        // Initial update
        this.updateRates();

        // Set up periodic updates
        this.intervalId = setInterval(() => {
            this.updateRates();
        }, this.updateInterval);
    }

    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

module.exports = {
    RateMonitor
}; 