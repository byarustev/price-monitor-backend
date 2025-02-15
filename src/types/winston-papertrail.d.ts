declare module 'winston-papertrail' {
    import { TransportStream, TransportStreamOptions } from 'winston';
    import Transport from 'winston-transport';
    import { Stream } from 'stream';

    interface PapertrailTransportOptions extends TransportStreamOptions {
        host: string;
        port: number;
        hostname?: string;
        program?: string;
        format?: any;
        logFormat?: any;
        colorize?: boolean;
        level?: string;
        flushOnClose?: boolean;
        handleExceptions?: boolean;
        connect_retry_count?: number;
        max_connect_retries?: number;
        attemptsBeforeDecay?: number;
        maximumAttempts?: number;
        connectionDelay?: number;
    }

    export class Papertrail extends Transport {
        constructor(options: PapertrailTransportOptions);

        // Required Transport methods
        log(info: any, callback: () => void): void;

        // Additional Papertrail specific methods
        close(): void;
        connect(callback: () => void): void;
        flush(): void;
    }
} 