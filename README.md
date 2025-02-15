# Currency Exchange Rate Monitor

A Node.js service that monitors currency exchange rates and broadcasts changes to connected clients via WebSocket.

## Features

- Fetches currency exchange rates from exchangeratesapi.io (with fallback to mock data)
- Detects rate changes above a configurable threshold
- Broadcasts rate changes to connected clients via WebSocket
- Configurable update interval
- Docker support for easy deployment

## Running with Docker

### Quick Start

1. Build the Docker image:
```bash
docker build -t currency-monitor .
```

2. Run the container:
```bash
docker run -p 3000:3000 --env-file .env currency-monitor
```

### Using Docker Compose

Create a `docker-compose.yml` file:
```yaml
version: '3.8'
services:
  currency-monitor:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

## Manual Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```env
# Your API key from exchangeratesapi.io
EXCHANGE_RATE_API_KEY=your_api_key_here

# Server port for WebSocket and HTTP connections
PORT=3000

# How often to check for rate updates (in milliseconds)
UPDATE_INTERVAL=60000

# Minimum rate change to trigger an event (0.001 = 0.1%)
RATE_CHANGE_THRESHOLD=0.001

# API base URL
BASE_URL=http://api.exchangeratesapi.io/v1
```

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| EXCHANGE_RATE_API_KEY | Your API key from exchangeratesapi.io | - | Yes |
| PORT | Server port number | 3000 | No |
| UPDATE_INTERVAL | Time between rate checks (ms) | 60000 | No |
| RATE_CHANGE_THRESHOLD | Minimum change to trigger event | 0.001 | No |
| BASE_URL | Exchange rates API base URL | http://api.exchangeratesapi.io/v1 | No |

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

### Logger Configuration

The application uses Winston for logging with optional Papertrail integration.

#### Environment Variables for Logging

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| LOG_LEVEL | Logging level (debug, info, warn, error) | info | No |
| PAPERTRAIL_HOST | Papertrail host | - | No |
| PAPERTRAIL_PORT | Papertrail port | - | No |
| PAPERTRAIL_HOSTNAME | Host identifier in logs | currency-monitor | No |

#### Log Levels

- `error`: For errors that need immediate attention
- `warn`: For warning conditions
- `info`: For general operational information
- `debug`: For detailed debugging information

#### Example Usage

```javascript
const logger = require('./utils/logger');

// Different log levels
logger.info('Server started on port 3000');
logger.warn('Rate limit approaching threshold');
logger.error('Failed to fetch exchange rates', { error: err.message });
logger.debug('Processing rate update', { rates: newRates });
``` 