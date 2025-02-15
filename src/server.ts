import 'dotenv/config';
import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { RateMonitor } from './services/rateMonitor';
import { WebSocketMessage } from './types';
import logger from './utils/logger';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = process.env.PORT || 3000;
const monitor = new RateMonitor();

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
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
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Setup rate change listener
monitor.on('rateChange', (change) => {
    broadcast({
        type: 'rateChange',
        data: change
    });
});

// Start the server
server.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
    monitor.startMonitoring();
}); 