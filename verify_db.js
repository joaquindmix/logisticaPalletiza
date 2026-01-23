const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/logistica.db');
const db = new Database(dbPath);

const columns = db.prepare("PRAGMA table_info(clients)").all();
console.log("Columns in clients table:", columns.map(c => c.name));

const hasCuit = columns.some(c => c.name === 'cuit');
console.log("Has CUIT column:", hasCuit);

if (hasCuit) {
    const clients = db.prepare("SELECT * FROM clients").all();
    console.log("Clients:", clients);
}
