const winston = require('winston');
const { Papertrail } = require('winston-papertrail');

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// Custom format for logs
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

// Create Papertrail transport if credentials are provided
const getPapertrailTransport = () => {
    if (process.env.PAPERTRAIL_HOST && process.env.PAPERTRAIL_PORT) {
        return new Papertrail({
            host: process.env.PAPERTRAIL_HOST,
            port: parseInt(process.env.PAPERTRAIL_PORT),
            hostname: process.env.PAPERTRAIL_HOSTNAME || 'currency-monitor',
            program: process.env.NODE_ENV || 'development',
            format: format.simple()
        });
    }
    return null;
};

// Configure transports
const configureTransports = () => {
    const transportsList = [
        // Console transport for development
        new transports.Console({
            level: process.env.LOG_LEVEL || 'info',
            format: combine(
                colorize({ all: true }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            )
        })
    ];

    // Add Papertrail transport if configured
    const papertrailTransport = getPapertrailTransport();
    if (papertrailTransport) {
        transportsList.push(papertrailTransport);
    }

    return transportsList;
};

// Create the logger
const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: configureTransports(),
    exitOnError: false
});

module.exports = logger; 