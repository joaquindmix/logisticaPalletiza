const http = require('http');

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Node.js is running! Routing is working.');
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

/* 
// ORIGINAL CODE - COMMENTED OUT FOR DEBUGGING
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'server_error.log');

function logError(type, error) {
    const message = `[${new Date().toISOString()}] ${type}: ${error.message || error}\n${error.stack || ''}\n`;
    try {
        fs.appendFileSync(logPath, message);
    } catch (fsErr) {
        console.error("Failed to write to log file:", fsErr);
    }
}

process.on('uncaughtException', (err) => {
    logError('Uncaught Exception', err);
    process.exit(1);
});

try {
    console.log("Starting server from index.js...");
    require('./server/server.js');
} catch (err) {
    logError('Startup Error', err);
    throw err;
}
*/
