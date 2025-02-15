import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocket } from 'ws';
import { WebSocketService } from './services/webSocket';
import { RateMonitor } from './services/rateMonitor';
import { WebSocketMessage, WebSocketClient } from './types';
import authService from './services/auth';
import logger from './utils/logger';

const app = express();
const server = http.createServer(app);

// Initialize WebSocket with server configuration
const wss = new WebSocketService(server, {
    // Add verification at connection level
    verifyClient: (info, callback) => {
        try {
            const url = new URL(info.req.url!, `http://${info.req.headers.host}`);
            const clientKey = url.searchParams.get('apiKey');

            logger.debug('Verifying client connection:', {
                hasKey: !!clientKey,
                url: info.req.url
            });

            if (!clientKey || !authService.verifyClientKey(clientKey)) {
                logger.warn('Connection rejected: Invalid or missing client access key');
                callback(false, 401, 'Unauthorized');
                return;
            }

            callback(true);
        } catch (error) {
            logger.error('Error in verifyClient:', { error: error instanceof Error ? error.message : 'Unknown error' });
            callback(false, 400, 'Bad Request');
        }
    }
});

const PORT = process.env.PORT || 3000;
const monitor = new RateMonitor();

// WebSocket connection handling
wss.on('connection', (ws: WebSocketClient) => {
    logger.info('New client connected');

    // Send current rates to new client
    const message: WebSocketMessage = {
        type: 'rates',
        data: monitor.getCurrentRates()
    };
    ws.send(JSON.stringify(message));

    ws.on('close', () => {
        logger.info('Client disconnected');
    });
});

// Broadcast to all connected clients
function broadcast(data: WebSocketMessage): void {
    wss.broadcast(data);
}

// Setup rate change listener
monitor.on('rateChange', (change) => {
    broadcast({
        type: 'rateChange',
        data: change
    });
});

// Start the server
server.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
    monitor.startMonitoring();
});

export { server, wss }; 