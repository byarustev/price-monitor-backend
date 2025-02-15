import winston from 'winston';
import * as Transport from 'winston-transport';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

interface PapertrailTransport extends Transport {
    new(options: {
        host: string;
        port: number;
        hostname: string;
        level: string;
        handleExceptions: boolean;
    }): Transport;
}

// Custom format for logs
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

// Create the logger
const logger = createLogger({
    format: combine(
        timestamp(),
        colorize(),
        logFormat
    ),
    transports: [
        new transports.Console({
            level: process.env.LOG_LEVEL || 'info'
        })
    ]
});

// Add Papertrail transport if configured
if (process.env.PAPERTRAIL_HOST && process.env.PAPERTRAIL_PORT) {
    const Papertrail = require('winston-papertrail').Papertrail as PapertrailTransport;

    logger.add(new Papertrail({
        host: process.env.PAPERTRAIL_HOST,
        port: parseInt(process.env.PAPERTRAIL_PORT, 10),
        hostname: process.env.PAPERTRAIL_HOSTNAME || 'currency-monitor-backend',
        level: process.env.LOG_LEVEL || 'info',
        handleExceptions: true
    }));
}

// Handle uncaught exceptions
logger.exceptions.handle(
    new transports.Console({
        format: combine(
            timestamp(),
            colorize(),
            logFormat
        )
    })
);

export default logger; 