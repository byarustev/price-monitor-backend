import { WebSocket } from 'ws';

export interface ExchangeRates {
    [currency: string]: number;
}

export interface RateChange {
    currency: string;
    oldRate: number;
    newRate: number;
    changePercent: number;
    timestamp?: string;
}

export interface WebSocketMessage {
    type: 'rates' | 'rateChange';
    data: ExchangeRates | RateChange;
}

export interface User {
    id: string;
    email: string;
}

export interface WebSocketClient extends WebSocket {
    user?: User;
    isAuthenticated?: boolean;
} 