const fs = require('fs');
const path = require('path');

// Defined logger to capture startup errors
const logPath = path.join(__dirname, 'server_error.log');

function logError(type, error) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ${type}: ${error.message || error}\n${error.stack || ''}\n`;
    console.error(message); // Log to console too
    try {
        fs.appendFileSync(logPath, message);
    } catch (fsErr) {
        console.error("Failed to write to log file:", fsErr);
    }
}

// Global handlers for uncaught issues
process.on('uncaughtException', (err) => {
    logError('Uncaught Exception', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logError('Unhandled Rejection', reason);
});

try {
    console.log("Starting production server...");
    // Require the actual server implementation
    require('./server/server.js');
} catch (err) {
    logError('Startup Error', err);
    throw err;
}
