# Currency Exchange Rate Monitor

A Node.js service that monitors currency exchange rates and broadcasts changes to connected clients via WebSocket.

## Features

- Fetches currency exchange rates from exchangeratesapi.io (with fallback to mock data)
- Detects rate changes above a configurable threshold
- Broadcasts rate changes to connected clients via WebSocket
- Configurable update interval

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
EXCHANGE_RATE_API_KEY=your_api_key_here
PORT=3000
UPDATE_INTERVAL=60000
RATE_CHANGE_THRESHOLD=0.001
```

- Get your API key from [exchangeratesapi.io](https://exchangeratesapi.io/)
- `UPDATE_INTERVAL` is in milliseconds (default: 60000 = 1 minute)
- `RATE_CHANGE_THRESHOLD` is the minimum rate change to trigger an event (default: 0.001 = 0.1%)

## Running the Service

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## WebSocket Events

The service emits the following events:

1. On connection: Current rates
```json
{
    "type": "rates",
    "data": {
        "USD": 1.1,
        "GBP": 0.86,
        // ... other currencies
    }
}
```

2. On rate change:
```json
{
    "type": "rateChange",
    "data": {
        "currency": "USD",
        "oldRate": 1.1,
        "newRate": 1.12,
        "changePercent": 1.82
    }
}
```

## WebSocket Client Example

```javascript
const ws = new WebSocket('ws://localhost:PORT');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};
``` 