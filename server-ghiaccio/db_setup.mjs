import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { User, Freezer, Order } from './models.mjs';

const databaseName = 'iceDatabase.sqlite';

// Utenti iniziali
const createdUserList = await Promise.all([
    User.create("franky", "franky@example.com", "password1", "customer"),
    User.create("mauro", "mauro@example.com", "password2", "customer"),
    User.create("giovanni", "giovanni@example.com", "password3", "customer"),
    User.create("luca", "luca@example.com", "password4", "customer"),
    User.create("admin", "admin@admin.com", "admin", "admin"),
]);

// Freezers iniziali
const retrievedFreezerList = [
    new Freezer({ id: 1, name: "Freezer A", n_bags: 10, n_kg: 50, n_kg_max: 100 }),
    new Freezer({ id: 2, name: "Freezer B", n_bags: 20, n_kg: 80, n_kg_max: 200 }),
    new Freezer({ id: 3, name: "Freezer C", n_bags: 15, n_kg: 60, n_kg_max: 150 }),
];

// Ordini iniziali
const createdOrderList = [
    new Order({ id: 1, quantity: 10, request_date: "2023-10-01", delivery_date: "2023-10-02", ice_type: "cocktail", status: "pending" }),
    new Order({ id: 2, quantity: 20, request_date: "2023-10-03", delivery_date: "2023-10-04", ice_type: "cooling", status: "pending" }),
    new Order({ id: 3, quantity: 15, request_date: "2023-10-05", delivery_date: "2023-10-06", ice_type: "cocktail", status: "pending" })
];

async function setupDatabase() {
    const db = await open({
        filename: databaseName,
        driver: sqlite3.Database
    });

    console.log("✅ Database connected");

    // Creazione tabelle
    await db.run(`CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS freezer (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        n_bags INTEGER NOT NULL,
        n_kg INTEGER NOT NULL,
        n_kg_max INTEGER NOT NULL
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quantity INTEGER NOT NULL,
        request_date TEXT NOT NULL,
        delivery_date TEXT NOT NULL,
        ice_type TEXT NOT NULL,
        status TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
    )`);

    await insertData(db);
}

// Inserimento dati iniziali
async function insertData(db) {
    const sqlInsertUser = await db.prepare("INSERT INTO user (username, password, salt, email, role) VALUES (?, ?, ?, ?, ?)");

    for (const user of createdUserList) {
        try {
            const result = await sqlInsertUser.run(user.username, user.password, user.salt, user.email, user.role);
            user.id = result.lastID;  // aggiorno ID generato dal DB
        } catch (err) {
            console.error("❌ Error inserting user:", err.message);
        }
    }
    console.log("✅ Users inserted successfully");
    await sqlInsertUser.finalize();

    const sqlInsertFreezer = await db.prepare("INSERT INTO freezer (name, n_bags, n_kg, n_kg_max) VALUES (?, ?, ?, ?)");
    for (const freezer of retrievedFreezerList) {
        try {
            const result = await sqlInsertFreezer.run(freezer.name, freezer.n_bags, freezer.n_kg, freezer.n_kg_max);
            freezer.id = result.lastID;
        } catch (err) {
            console.error("❌ Error inserting freezer:", err.message);
        }
    }
    console.log("✅ Freezers inserted successfully");
    await sqlInsertFreezer.finalize();

    const sqlInsertOrder = await db.prepare(
        "INSERT INTO orders (quantity, request_date, delivery_date, ice_type, status, user_id) VALUES (?, ?, ?, ?, ?, ?)"
    );

    for (let i = 0; i < createdOrderList.length; i++) {
        const order = createdOrderList[i];
        const assignedUser = createdUserList[i % createdUserList.length];
        order.user_id = assignedUser.id; // assegno user_id all'ordine

        try {
            const result = await sqlInsertOrder.run(
                order.quantity,
                order.request_date,
                order.delivery_date,
                order.ice_type,
                order.status,
                order.user_id
            );
            order.id = result.lastID;
        } catch (err) {
            console.error("❌ Error inserting order:", err.message);
        }
    }
    await sqlInsertOrder.finalize();
    console.log("✅ Orders inserted successfully!");
}

setupDatabase()
    .then(() => console.log("✅ Setup completed successfully"))
    .catch(err => console.error("❌ Error during database setup:", err));
