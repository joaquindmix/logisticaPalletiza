const db = require('./server/db');
const bcrypt = require('bcrypt');

console.log("Checking DB connection...");
setTimeout(() => {
    console.log("Attempting insert...");
    const hash = bcrypt.hashSync('123', 10);
    try {
        db.run("INSERT INTO clients (name, email, password, role, cuit) VALUES (?, ?, ?, 'client', ?)",
            ['Debug Client', 'debug@test.com', hash, '20-999999-9'], (result) => {
                // Determine if result is error or this context.
                // My wrapper: if error, callback(err). if success, callback.call({lastID...}, null).
                // Wait, callback signature in db.js:
                // if (callback) callback.call({ ... }, null);
                // if (callback) callback(err);
                // The first arg is 'err'? No, if success my wrapper passes 'null' as first arg?
                // Let's check db.js wrapper again.
                // "if (callback) { callback.call({ ... }, null); }"
                // "if (callback) callback(err);"
                // If success, it calls with `null` as first arg (implied? No, it passes `null` explicitly).

                if (result) {
                    console.error("INSERT FAILED Callback:", result);
                } else {
                    console.log("INSERT SUCCESS");
                }
            });
    } catch (e) {
        console.error("INSERT THREW:", e);
    }
}, 1000);
