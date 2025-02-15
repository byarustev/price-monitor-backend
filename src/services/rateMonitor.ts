import { EventEmitter } from 'events';
import { fetchExchangeRates } from './exchangeRates';
import { ExchangeRates, RateChange } from '../types';
import logger from '../utils/logger';

export class RateMonitor extends EventEmitter {
    private currentRates: ExchangeRates;
    private previousRates: ExchangeRates;
    private updateInterval: number;
    private threshold: number;
    private intervalId: NodeJS.Timeout | null;

    constructor() {
        super();
        this.currentRates = {};
        this.previousRates = {};
        this.updateInterval = parseInt(process.env.UPDATE_INTERVAL || '60000');
        this.threshold = parseFloat(process.env.RATE_CHANGE_THRESHOLD || '0.001');
        this.intervalId = null;
    }

    getCurrentRates(): ExchangeRates {
        return this.currentRates;
    }

    async updateRates(): Promise<void> {
        try {
            const newRates = await fetchExchangeRates();
            logger.debug('Fetched new rates', { rates: newRates });

            if (Object.keys(this.previousRates).length > 0) {
                Object.entries(newRates).forEach(([currency, newRate]) => {
                    const oldRate = this.previousRates[currency];
                    if (oldRate && oldRate !== newRate) {
                        const changePercent = Math.abs((newRate - oldRate) / oldRate);

                        if (changePercent > this.threshold) {
                            const change: RateChange = {
                                currency,
                                oldRate,
                                newRate,
                                changePercent: changePercent * 100,
                                timestamp: new Date().toISOString()
                            };

                            logger.info('Rate change detected', change);
                            this.emit('rateChange', change);
                        }
                    }
                });
            }

            this.previousRates = this.currentRates;
            this.currentRates = newRates;
        } catch (error) {
            logger.error('Error checking rates:', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    startMonitoring(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.updateRates();
        this.intervalId = setInterval(() => {
            this.updateRates();
        }, this.updateInterval);
    }

    stopMonitoring(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
} 