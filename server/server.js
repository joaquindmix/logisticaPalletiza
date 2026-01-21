const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const SECRET_KEY = 'super_secret_key_mvp'; // In production use ENV

app.use(cors());
app.use(express.json());

// Middleware to verify Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Auth Routes ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM clients WHERE email = ?", [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: "User not found" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, role: user.role, name: user.name });
    });
});

// --- Admin Routes --- (Protected & Admin only check could be added)

// Get All Inventory (Admin View)
app.get('/api/admin/inventory', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const query = `
        SELECT i.*, p.name as product_name, p.sku, c.name as client_name 
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        JOIN clients c ON i.client_id = c.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add Inventory (Inbound)
app.post('/api/admin/inventory', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const { product_id, client_id, quantity, location, pallet_type } = req.body;
    const query = `INSERT INTO inventory (product_id, client_id, quantity, location, pallet_type) VALUES (?, ?, ?, ?, ?)`;

    db.run(query, [product_id, client_id, quantity, location, pallet_type], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Inventory added" });
    });
});

// Create Client
app.post('/api/admin/clients', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);

    db.run("INSERT INTO clients (name, email, password, role) VALUES (?, ?, ?, 'client')",
        [name, email, hash], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: "Client created" });
        });
});

// Create Product
app.post('/api/admin/products', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { sku, name, description, weight } = req.body;

    db.run("INSERT INTO products (sku, name, description, weight) VALUES (?, ?, ?, ?)",
        [sku, name, description, weight], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: "Product created" });
        });
});

// Update Inventory (Move/Outbound)
app.put('/api/admin/inventory/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { quantity, location, pallet_type } = req.body;
    const id = req.params.id;

    // Check if deleting (quantity 0 or explicit delete?)
    // If quantity is 0, we might remove it, or just set to 0. 
    // Implementing Update logic.

    let query = `UPDATE inventory SET quantity = ?, location = ?, pallet_type = ? WHERE id = ?`;
    let params = [quantity, location, pallet_type, id];

    if (quantity <= 0) {
        query = `DELETE FROM inventory WHERE id = ?`;
        params = [id];
    }

    db.run(query, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Inventory updated" });
    });
});

app.get('/api/admin/resources', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const data = {};
    db.all("SELECT id, name FROM clients WHERE role = 'client'", [], (err, clients) => {
        if (err) return res.status(500).json({ error: err.message });
        data.clients = clients;

        db.all("SELECT id, name, sku FROM products", [], (err, products) => {
            if (err) return res.status(500).json({ error: err.message });
            data.products = products;
            res.json(data);
        });
    });
});


// --- Client Routes ---

// Get My Inventory
app.get('/api/client/inventory', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const query = `
        SELECT i.*, p.name as product_name, p.sku 
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        WHERE i.client_id = ?
    `;
    db.all(query, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
