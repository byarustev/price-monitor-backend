import { WebSocketClient } from '../types';
import logger from '../utils/logger';

export function authenticateConnection(ws: WebSocketClient, apiKey: string): boolean {
    // Log the authentication attempt (but not the full API key)
    logger.debug('Auth attempt', {
        providedKeyLength: apiKey?.length,
        expectedKeyLength: process.env.API_KEY?.length
    });

    const isValid = apiKey === process.env.API_KEY;

    if (isValid) {
        ws.isAuthenticated = true;
        logger.info('Client authenticated successfully');
    } else {
        logger.warn('Authentication failed: Invalid API key');
    }

    return isValid;
} 