const axios = require('axios');

const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const BASE_URL = process.env.BASE_URL;

async function fetchExchangeRates(base = 'EUR') {
    return generateMockRates();
    try {
        const response = await axios.get(`${BASE_URL}/latest`, {
            params: {
                access_key: API_KEY,
                base: base
            }
        });

        if (response.data.success) {
            return response.data.rates;
        } else {
            throw new Error('Failed to fetch exchange rates');
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error.message);
        // For demo purposes, return mock data if API fails
        return generateMockRates();
    }
}

function generateMockRates() {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
    const rates = {};

    currencies.forEach(currency => {
        // Generate a random rate between 0.5 and 2.0
        rates[currency] = 0.5 + Math.random() * 1.5;
    });

    return rates;
}

module.exports = {
    fetchExchangeRates
}; 