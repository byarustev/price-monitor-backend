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