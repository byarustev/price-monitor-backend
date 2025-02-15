# Currency Exchange Rate Monitor

A Node.js service that monitors currency exchange rates and broadcasts changes to connected clients via WebSocket.

## Features

- Fetches currency exchange rates from exchangeratesapi.io (with fallback to mock data)
- Detects rate changes above a configurable threshold
- Broadcasts rate changes to connected clients via WebSocket
- Configurable update interval
- Docker support for easy deployment

## Architecture

This application follows a Service-Oriented Architecture (SOA) with the following layers:

```
┌─────────────────┐
│  WebSocket API  │ ← Client Connections
└────────┬────────┘
         │
┌────────┴────────┐
│     Auth        │ ← Client Authentication
└────────┬────────┘
         │
┌────────┴────────┐
│ Service Layer   │
├─────────────────┤
│ Rate Monitor    │ ← Business Logic
│ Exchange Rates  │
└────────┬────────┘
         │
┌────────┴────────┐
│  External API   │ ← Data Source
└─────────────────┘
```

### Layers

1. **Authentication Layer**
   - Verifies client access key
   - Manages client authentication state
   - Controls access to WebSocket server

2. **WebSocket API Layer**
   - Handles client connections
   - Manages real-time communication
   - Broadcasts updates to connected clients

3. **Service Layer**
   - Rate Monitor Service: Monitors and detects rate changes
   - Exchange Rates Service: Fetches and processes rate data
   - Implements core business logic

4. **External API Layer**
   - Connects to exchangeratesapi.io
   - Provides fallback to mock data
   - Handles API communication

## Application Structure

```
backend/
├── src/
│   ├── index.ts                # Application entry point
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── services/
│   │   ├── auth.ts            # Client authentication service
│   │   ├── exchangeRates.ts   # Exchange rate fetching service
│   │   ├── rateMonitor.ts     # Rate monitoring and comparison
│   │   └── webSocket.ts       # WebSocket server and client handling
│   └── utils/
│       └── logger.ts          # Logging utility
├── .env                       # Environment variables
├── package.json              
└── tsconfig.json             # TypeScript configuration
```

### Key Components

- `auth.ts`: Handles client authentication and access control
- `exchangeRates.ts`: Handles fetching rates from the API or generating mock data
- `rateMonitor.ts`: Monitors rate changes and triggers notifications
- `webSocket.ts`: Manages WebSocket connections and broadcasts updates
- `logger.ts`: Provides structured logging with Papertrail support

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3000                           # Port for the WebSocket server

# Exchange Rate API Configuration
EXCHANGE_RATE_API_KEY=your_api_key  # API key from exchangeratesapi.io
BASE_URL=http://api.exchangeratesapi.io/v1  # Base URL for the exchange rate API
USE_DEMO_DATA=false                 # Set to 'true' to use mock data instead of real API

# Rate Monitor Configuration
UPDATE_INTERVAL=20000               # Interval to check for rate updates (in milliseconds)
RATE_CHANGE_THRESHOLD=0.001         # Minimum change required to trigger an update (0.1%)

# Logger Configuration
LOG_LEVEL=info                      # Logging level (debug, info, warn, error)
PAPERTRAIL_HOST=logs.papertrailapp.com  # Papertrail host (optional)
PAPERTRAIL_PORT=12345               # Papertrail port (optional)
PAPERTRAIL_HOSTNAME=currency-monitor-backend  # Identifier in logs (optional)

# Authentication
CLIENT_ACCESS_KEY=your-secure-api-key-here # Static key for all clients. generate any random string that is 16 characters long.
```

### Environment Variables Details

#### Server Configuration
- `PORT`: The port number for the WebSocket server
  - Default: 3000
  - Required: No

#### Exchange Rate API Configuration
- `EXCHANGE_RATE_API_KEY`: Your API key from exchangeratesapi.io
  - Required: Yes (unless USE_DEMO_DATA is true)
  - Get your key at: https://exchangeratesapi.io/

- `BASE_URL`: The base URL for the exchange rate API
  - Default: http://api.exchangeratesapi.io/v1
  - Required: No

- `USE_DEMO_DATA`: Toggle between real API and mock data
  - Values: 'true' or 'false'
  - Default: 'false'
  - Required: No

#### Rate Monitor Configuration
- `UPDATE_INTERVAL`: How often to check for rate updates
  - Value in milliseconds
  - Default: 60000 (1 minute)
  - Required: No

- `RATE_CHANGE_THRESHOLD`: Minimum change required to trigger an update
  - Value as decimal (0.001 = 0.1%)
  - Default: 0.001
  - Required: No

#### Logger Configuration
- `LOG_LEVEL`: The minimum level of logs to output
  - Values: 'debug', 'info', 'warn', 'error'
  - Default: 'info'
  - Required: No

- `PAPERTRAIL_HOST`: Papertrail logging service host
  - Required: No
  - Only needed if using Papertrail logging
  - Sign up at: https://papertrailapp.com/

- `PAPERTRAIL_PORT`: Papertrail logging service port
  - Required: No
  - Only needed if using Papertrail logging

- `PAPERTRAIL_HOSTNAME`: Identifier for this service in logs
  - Default: 'currency-monitor-backend'
  - Required: No

#### Authentication
- `CLIENT_ACCESS_KEY`: Client Access Key for WebSocket authentication
  - Required: Yes
  - Example: a3f1b2c4d5e6f7g8h9i0j1k2l3m4n5o6
  - Description: Static key used by clients to access the currency monitor. Generate any random string that is 16 characters long. and will be used for all clients.

## Development Mode

For development, you can use demo data by setting:
```env
USE_DEMO_DATA=true
```
This will generate mock exchange rates instead of calling the real API.

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

2. Create a `.env` file with variables:
as shown in the Environment Variables section.

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

```typescript
// Connect with your API key
const clientKey = 'your-client-access-key-here';
const ws: WebSocket = new WebSocket(`ws://localhost:PORT?apiKey=${clientKey}`);

ws.onmessage = (event: MessageEvent) => {
    const data: WebSocketMessage = JSON.parse(event.data);
    console.log('Received:', data);
};
```

## Authentication

The service uses a Client Access Key for authentication. This is a simple API key-based 
authentication system where clients must provide the key to connect to the WebSocket server.

### Client Access Key
Currently, this is implemented as a static key that clients must include when connecting
to the WebSocket server. While this is suitable for development and testing, in a 
production environment you might want to implement a more robust authentication system.

#### How to Connect
1. Use the provided Client Access Key in your WebSocket connection
2. Include the key as a query parameter named 'apiKey'

```typescript
// Example connection with Client Access Key
const ws = new WebSocket(`ws://localhost:3000?apiKey=your-access-key-here`);
```

> **Note**: For development purposes, the Client Access Key is statically defined in the
.env file. In a production environment, you should implement proper key management
and rotation.

## Logger Configuration

The application uses Winston for logging with optional Papertrail integration.

#### Environment Variables for Logging
As shown in the Environment Variables section.

#### Log Levels

- `error`: For errors that need immediate attention
- `warn`: For warning conditions
- `info`: For general operational information
- `debug`: For detailed debugging information

#### Example Usage

```typescript
import { logger } from './utils/logger';

// Different log levels
logger.info('Server started on port 3000');
logger.warn('Rate limit approaching threshold');
logger.error('Failed to fetch exchange rates', { error: error instanceof Error ? error.message : 'Unknown error' });
logger.debug('Processing rate update', { rates: newRates });
``` 