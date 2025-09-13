import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { User, Freezer, Order } from './models.mjs';

const databaseName = 'iceDatabase.sqlite';

// Utenti iniziali
const createdUserList = await Promise.all([
    User.create("riccardo", "riccardo@example.com", "cognome", "311111111", "password1", "customer"),
    User.create("mauro", "mauro@example.com", "cognome", "322222222", "password2", "customer"),
    User.create("giovanni", "giovanni@example.com", "cognome", "333333333", "password3", "customer"),
    User.create("luca", "luca@example.com", "cognome", "344444444", "password4", "customer"),
    User.create("admin", "admin@admin.com", "cognome", "355555555", "admin", "admin"),
]);

// Freezers iniziali
const retrievedFreezerList = [
    new Freezer({ id: 1, name: "Freezer A", n_bags: 10, n_kg: 50, n_kg_max: 100 }),
    new Freezer({ id: 2, name: "Freezer B", n_bags: 20, n_kg: 80, n_kg_max: 200 }),
    new Freezer({ id: 3, name: "Freezer C", n_bags: 15, n_kg: 60, n_kg_max: 150 }),
];

// Ordini iniziali
const createdOrderList = [
    new Order({ id: 1, quantity: 10, request_date: "2023-10-01", delivery_date: "2023-10-02", ice_type: "consumazione", status: "in attesa" }),
    new Order({ id: 2, quantity: 20, request_date: "2023-10-03", delivery_date: "2023-10-04", ice_type: "raffreddare", status: "in attesa" }),
    new Order({ id: 3, quantity: 15, request_date: "2023-10-05", delivery_date: "2023-10-06", ice_type: "raffreddare", status: "in attesa" })
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
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
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
        request_hour TEXT NOT NULL,
        delivery_date TEXT NOT NULL,
        delivery_hour TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        ice_type TEXT NOT NULL,
        status TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
    )`);

    await insertData(db);
}

async function insertData(db) {
    // Inserimento utenti
    const sqlInsertUser = await db.prepare(
        "INSERT INTO user (name, surname, phoneNumber, password, salt, email, role) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const user of createdUserList) {
        try {
            const result = await sqlInsertUser.run(user.name, user.surname, user.phoneNumber, user.password, user.salt, user.email, user.role);
            user.id = result.lastID;
        } catch (err) {
            console.error("❌ Error inserting user:", err.message);
        }
    }
    await sqlInsertUser.finalize();
    console.log("✅ Users inserted successfully");

    // Inserimento freezer
    const sqlInsertFreezer = await db.prepare("INSERT INTO freezer (name, n_bags, n_kg, n_kg_max) VALUES (?, ?, ?, ?)");
    for (const freezer of retrievedFreezerList) {
        try {
            const result = await sqlInsertFreezer.run(freezer.name, freezer.n_bags, freezer.n_kg, freezer.n_kg_max);
            freezer.id = result.lastID;
        } catch (err) {
            console.error("❌ Error inserting freezer:", err.message);
        }
    }
    await sqlInsertFreezer.finalize();
    console.log("✅ Freezers inserted successfully");

    // Inserimento ordini
    const sqlInsertOrder = await db.prepare(
        `INSERT INTO orders(quantity, request_date, request_hour, delivery_date, delivery_hour, delivery_address, ice_type, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (let i = 0; i < createdOrderList.length; i++) {
        const order = createdOrderList[i];
        const assignedUser = createdUserList[i % createdUserList.length];
        order.user_id = assignedUser.id;

        try {
            const result = await sqlInsertOrder.run( order.quantity, order.request_date, "10:00", order.delivery_date, "12:00", "Indirizzo di prova", order.ice_type, order.status, order.user_id );
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
