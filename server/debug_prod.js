const db = require('./db');

console.log("Checking DB connection for Products...");
setTimeout(() => {
    console.log("Attempting product insert...");
    try {
        db.run("INSERT INTO products (sku, name, description, weight) VALUES (?, ?, ?, ?)",
            ['DEBUG-SKU', 'Debug Product', 'Description', 10.5], function (err) {
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
