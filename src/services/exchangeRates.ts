import axios from 'axios';
import { ExchangeRates } from '../types';
import logger from '../utils/logger';

export async function fetchExchangeRates(base: string = 'EUR'): Promise<ExchangeRates> {
    try {
        const response = await axios.get(`${process.env.BASE_URL}/latest`, {
            params: {
                access_key: process.env.EXCHANGE_RATE_API_KEY,
                base
            }
        });

        if (response.data.success) {
            return response.data.rates;
        }
        throw new Error('Failed to fetch exchange rates');
    } catch (error) {
        logger.error('Error fetching exchange rates:', { error: error instanceof Error ? error.message : 'Unknown error' });
        return generateMockRates();
    }
}

function generateMockRates(): ExchangeRates {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
    const rates: ExchangeRates = {};

    currencies.forEach(currency => {
        rates[currency] = 0.5 + Math.random() * 1.5;
    });

    return rates;
} 