import { WebSocket, WebSocketServer, ServerOptions } from 'ws';
import { WebSocketMessage, WebSocketClient } from '../types';
import logger from '../utils/logger';
import { EventEmitter } from 'events';

export class WebSocketService extends EventEmitter {
    private wss: WebSocketServer;
    private clients: Set<WebSocketClient> = new Set();

    constructor(server: any, options: ServerOptions = {}) {
        super();
        this.wss = new WebSocketServer({
            server,
            ...options
        });
        this.setupWebSocket();
    }

    private setupWebSocket(): void {
        this.wss.on('connection', (ws: WebSocketClient, request) => {
            // At this point, the connection is already authenticated
            // due to verifyClient in server.ts
            this.clients.add(ws);
            ws.isAuthenticated = true;

            logger.info('Client authenticated and connected', {
                totalClients: this.clients.size
            });

            // Emit the connection event
            this.emit('connection', ws);

            ws.on('close', () => {
                this.clients.delete(ws);
                logger.info('Client disconnected', {
                    remainingClients: this.clients.size
                });
            });

            // Send initial rates to the newly connected client
            ws.on('error', (error) => {
                logger.error('WebSocket error:', { error: error.message });
                this.clients.delete(ws);
            });
        });

        this.wss.on('error', (error) => {
            logger.error('WebSocket server error:', { error: error.message });
        });
    }

    public broadcast(message: WebSocketMessage): void {
        const authenticatedClients = Array.from(this.clients).filter(client => client.isAuthenticated);
        logger.debug('Broadcasting to clients:', {
            total: this.clients.size,
            authenticated: authenticatedClients.length
        });

        authenticatedClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
} 