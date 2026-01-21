const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'logistica.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database.');
        initializeSchemas();
    }
});

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

        // Seed some demo client and products
        db.get("SELECT count(*) as count FROM clients", [], (err, row) => {
            if (row.count <= 1) { // Only admin exists
                 const hash = bcrypt.hashSync('client123', 10);
                 db.run("INSERT INTO clients (name, email, password, role) VALUES (?, ?, ?, ?)", 
                    ['Cliente Demo', 'cliente@demo.com', hash, 'client']);

                 db.run("INSERT INTO products (sku, name, description, weight) VALUES (?, ?, ?, ?)", 
                    ['PRD001', 'Impresora Laser', 'Impresora de alta velocidad', 15.5]);
                 db.run("INSERT INTO products (sku, name, description, weight) VALUES (?, ?, ?, ?)", 
                    ['PRD002', 'Caja Bobinas', 'Bobinas de papel industrial', 500.0]);
            }
        });
    });
}

module.exports = db;
