require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { fetchExchangeRates } = require('./services/exchangeRates');
const { RateMonitor } = require('./services/rateMonitor');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = process.env.PORT || 3000;
const monitor = new RateMonitor();

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send current rates to new client
    ws.send(JSON.stringify({
        type: 'rates',
        data: monitor.getCurrentRates()
    }));

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Broadcast to all connected clients
function broadcast(data) {
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
    console.log(`Server is running on port ${port}`);
    monitor.startMonitoring();
}); 