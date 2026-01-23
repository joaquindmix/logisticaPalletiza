const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

// Connect to SQLite database using Better-SQLite3
const dbPath = path.resolve(__dirname, 'logistica.db');
const actualDb = new Database(dbPath, { verbose: console.log });
console.log('Connected to SQLite database (Better-SQLite3 Adapter).');

// Create a wrapper to mimic sqlite3 API for existing routes
const db = {
    // Mimic db.serialize (just execute callback immediately as better-sqlite3 is sync)
    serialize: (callback) => {
        if (callback) callback();
    },

    // Mimic db.run(sql, params, callback)
    run: function (sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        params = params || [];
        try {
            const stmt = actualDb.prepare(sql);
            const info = stmt.run(...params);
            // sqlite3 passes 'this' with lastID and changes to the callback
            if (callback) {
                callback.call({ lastID: info.lastInsertRowid, changes: info.changes }, null);
            }
        } catch (err) {
            if (callback) callback(err);
            else console.error('DB Run Error:', err);
        }
        return this;
    },

    // Mimic db.get(sql, params, callback)
    get: function (sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        params = params || [];
        try {
            const stmt = actualDb.prepare(sql);
            const row = stmt.get(...params);
            if (callback) callback(null, row);
        } catch (err) {
            if (callback) callback(err);
            else console.error('DB Get Error:', err);
        }
        return this;
    },

    // Mimic db.all(sql, params, callback)
    all: function (sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        params = params || [];
        try {
            const stmt = actualDb.prepare(sql);
            const rows = stmt.all(...params);
            if (callback) callback(null, rows);
        } catch (err) {
            if (callback) callback(err);
            else console.error('DB All Error:', err);
        }
        return this;
    },

    // Expose close
    close: (callback) => {
        try {
            actualDb.close();
            if (callback) callback(null);
        } catch (err) {
            if (callback) callback(err);
        }
    }
};

// Initialize Schemas (using the wrapper to ensure it works)
function initializeSchemas() {
    db.serialize(() => {
        // Clients/Users Table
        db.run(`CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'client'
        )`);

        // Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            weight REAL
        )`);

        // Inventory Table
        db.run(`CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            client_id INTEGER,
            quantity INTEGER NOT NULL,
            location TEXT,
            pallet_type TEXT,
            date_entry DATE DEFAULT CURRENT_DATE,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (client_id) REFERENCES clients(id)
        )`);

        // Seed Admin User if not exists
        db.get("SELECT * FROM clients WHERE email = ?", ['admin@logistica.com'], (err, row) => {
            if (!row) {
                const hash = bcrypt.hashSync('admin123', 10);
                db.run("INSERT INTO clients (name, email, password, role) VALUES (?, ?, ?, ?)",
                    ['Admin', 'admin@logistica.com', hash, 'admin']);
                console.log("Admin user created.");
            }
        });

        // MIGRATION: Check and add 'cuit' column if not exists
        db.all("PRAGMA table_info(clients)", [], (err, columns) => {
            if (columns) {
                const hasCuit = columns.some(col => col.name === 'cuit');
                if (!hasCuit) {
                    console.log("Migrating: Adding 'cuit' column to clients table...");
                    db.run("ALTER TABLE clients ADD COLUMN cuit TEXT");
                }
            }
        });

        // Seed some demo client and products
        db.get("SELECT count(*) as count FROM clients", [], (err, row) => {
            if (row && row.count <= 1) { // Only admin exists
                const hash = bcrypt.hashSync('client123', 10);
                // Note: Seed data won't have CUIT initially unless we update this line too, but it's fine for existing db.
                // We'll insert without CUIT for now or add a dummy one if we want.
                db.run("INSERT INTO clients (name, email, password, role, cuit) VALUES (?, ?, ?, ?, ?)",
                    ['Cliente Demo', 'cliente@demo.com', hash, 'client', '20-12345678-9']);

                db.run("INSERT INTO products (sku, name, description, weight) VALUES (?, ?, ?, ?)",
                    ['PRD001', 'Impresora Laser', 'Impresora de alta velocidad', 15.5]);
                db.run("INSERT INTO products (sku, name, description, weight) VALUES (?, ?, ?, ?)",
                    ['PRD002', 'Caja Bobinas', 'Bobinas de papel industrial', 500.0]);
            }
        });
    });
}

// Initialize immediately
initializeSchemas();

module.exports = db;
