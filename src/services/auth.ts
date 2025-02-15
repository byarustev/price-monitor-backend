import { WebSocketClient } from '../types';
import logger from '../utils/logger';

export class AuthService {
    private static instance: AuthService;
    private readonly clientAccessKey: string;

    private constructor() {
        this.clientAccessKey = process.env.CLIENT_ACCESS_KEY || '';

        if (!this.clientAccessKey) {
            logger.error('CLIENT_ACCESS_KEY is not set in environment variables');
            throw new Error('CLIENT_ACCESS_KEY is required');
        }
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public verifyClientKey(providedKey: string): boolean {
        const isValid = providedKey === this.clientAccessKey;

        if (!isValid) {
            logger.warn('Invalid client access key provided');
        }

        return isValid;
    }

    public authenticateClient(ws: WebSocketClient, providedKey: string): boolean {
        const isAuthenticated = this.verifyClientKey(providedKey);

        if (isAuthenticated) {
            ws.isAuthenticated = true;
            logger.info('Client authenticated successfully');
        }

        return isAuthenticated;
    }
}

export default AuthService.getInstance(); 