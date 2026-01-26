const db = require('./db');

console.log("Checking DB Connection...");

// 1. Create dummy product
console.log("Creating dummy product...");
const sku = 'DEBUG-' + Date.now();
db.run("INSERT INTO products (sku, name, description, weight) VALUES (?, ?, ?, ?)",
    [sku, 'Debug Item', 'Desc', 10], function (err) {
        if (err) {
            console.error("Create failed:", err);
            return;
        }
        const id = this.lastID;
        console.log("Created product ID:", id);

        // 2. Try Update
        console.log("Attempting Update...");
        db.run("UPDATE products SET sku = ?, name = ?, description = ?, weight = ? WHERE id = ?",
            [sku, 'Debug Item Updated', 'Desc Updated', 20, id], function (err) {
                if (err) {
                    console.error("UPDATE FAILED:", err);
                } else {
                    console.log("UPDATE SUCCESS. Changes:", this.changes);
                }
            });
    });
