import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import * as winston from 'winston';
import * as TransportStream from 'winston-transport';

class OutputChannelTransport extends TransportStream {
    outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        super();
        this.outputChannel = outputChannel;
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        this.outputChannel.appendLine(`[${info.label}] ${info.level}: ${info.message}`);

        if (callback) {
            callback();
        }
    }
}

const fileLoggerFormat = winston.format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

let fileLogger;
let consoleLogger;
let isInitialised: Boolean = false;

export function initLogging(outputChannel: vscode.OutputChannel, filename?: string) {

    if (isInitialised) {
        warn('Logger already initialised');
        return;
    }

    const format = winston.format.combine(
        winston.format.label({ label: 'nisaba' }),
        winston.format.timestamp(),
        fileLoggerFormat
    );

    if (filename === undefined) {
        // When no `filename` is passed in, default to `~/.nisaba/nisaba.log`
        filename = path.join(os.homedir(), '.nisaba', 'nisaba.log')
    }

    fileLogger = winston.createLogger({
        level: 'debug',
        format: format,
        defaultMeta: { service: 'user-service' },
        transports: [
            new winston.transports.File({
                filename: filename,
                maxsize: 20000000,
            }),
        ],
    });

    consoleLogger = winston.createLogger({
        level: 'info',
        format: format,
        defaultMeta: { service: 'user-service' },
        transports: [
            new OutputChannelTransport(outputChannel),
        ],
    });

    isInitialised = true;
}

export function log(level:string, message:string, logger?: string) {
    if (isInitialised) {
        if (logger === undefined || logger == "file")
            fileLogger.log(level, message);
        if (logger === undefined || logger == "console")
            consoleLogger.log(level, message);
    }
}

// Helper functions
export function debug(message:string, logger?: string) {
    log('debug', message, logger)
}

export function info(message:string, logger?: string) {
    log('info', message, logger)
}

export function warn(message:string, logger?: string) {
    log('warn', message, logger)
}

export function error(message:string, logger?: string) {
    log('error', message, logger)
}
