const db = require('./db');
const bcrypt = require('bcrypt');

console.log("Checking DB connection...");
setTimeout(() => {
    console.log("Attempting insert...");
    const hash = bcrypt.hashSync('123', 10);
    try {
        db.run("INSERT INTO clients (name, email, password, role, cuit) VALUES (?, ?, ?, 'client', ?)",
            ['Debug Client', 'debug@test.com', hash, '20-999999-9'], function (err) {
                // Note: 'this' context in callback has changes/lastID
                if (err) {
                    console.error("INSERT FAILED Callback:", err);
                } else {
                    console.log("INSERT SUCCESS. LastID:", this.lastID);
                }
            });
    } catch (e) {
        console.error("INSERT THREW:", e);
    }
}, 1000);
