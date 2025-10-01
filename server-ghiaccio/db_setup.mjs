import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { User, Freezer, Order, IceBag } from './models.mjs';

const databaseName = 'iceDatabase.sqlite';

// Utenti iniziali
const createdUserList = await Promise.all([
    User.create("riccardo", "riccardo@example.com", "cognome", "311111111", "password1", "customer"),
    User.create("admin", "admin@admin.com", "cognome", "355555555", "admin", "admin"),
]);

// Freezers iniziali
const retrievedFreezerList = [
    new Freezer({ name: "Freezer 1", n_bags: 4, n_kg: 12, n_kg_max: 30, listIceBags: [] }),
];

// Ordini iniziali
const createdOrderList = [
    new Order({ quantity: 6, request_date: "2023-10-01", delivery_date: "2023-10-03", delivery_address: "Indirizzo di prova 1", ice_type: "consumazione", status: "in attesa", user_id: 1  }),
    new Order({ quantity: 9, request_date: "2023-10-02", delivery_date: "2023-10-04", delivery_address: "Indirizzo di prova 2", ice_type: "raffreddare", status: "in consegna", user_id: 1  }),
    new Order({ quantity: 3, request_date: "2023-10-03", delivery_date: "2023-10-05", delivery_address: "Indirizzo di prova 3", ice_type: "consumazione", status: "completato", user_id: 1  }),
    new Order({ quantity: 12, request_date: "2023-10-04", delivery_date: "2023-10-06", delivery_address: "Indirizzo di prova 4", ice_type: "raffreddare", status: "cancellato", user_id: 1 }),
    new Order({ quantity: 15, request_date: "2023-10-05", delivery_date: "2023-10-07", delivery_address: "Indirizzo di prova 5", ice_type: "consumazione", status: "in attesa", user_id: 1 }),
];


const createBagList = [
    new IceBag({ id: 1, weight: 3, type: "consumazione", freezer_id: 1 }),
    new IceBag({ id: 2, weight: 3, type: "consumazione", freezer_id: 1 }),
    new IceBag({ id: 3, weight: 3, type: "raffreddare", freezer_id: 2 }),
    new IceBag({ id: 4, weight: 3, type: "raffreddare", freezer_id: 2 }),
    new IceBag({ id: 5, weight: 3, type: "consumazione", freezer_id: 3 }),
    new IceBag({ id: 6, weight: 3, type: "raffreddare", freezer_id: 3 }),
    new IceBag({ id: 7, weight: 3, type: "consumazione", freezer_id: 3 }),
    new IceBag({ id: 8, weight: 3, type: "raffreddare", freezer_id: 1 }),
    new IceBag({ id: 9, weight: 3, type: "consumazione", freezer_id: 2 }),
    new IceBag({ id: 10, weight: 3, type: "raffreddare", freezer_id: 1 }),
    new IceBag({ id: 11, weight: 3, type: "consumazione", freezer_id: 2 }),
]

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

    await db.run(`CREATE TABLE IF NOT EXISTS ice_bag (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        weight INTEGER NOT NULL,
        type TEXT NOT NULL,
        freezer_id INTEGER NOT NULL,
        FOREIGN KEY(freezer_id) REFERENCES freezer(id) ON DELETE CASCADE
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

    // Inserimento sacchi di ghiaccio
    const sqlInsertBag = await db.prepare(
        `INSERT INTO ice_bag(weight, type, freezer_id) VALUES (?, ?, ?)`
    );

    for (const bag of createBagList) {
        try {
            const result = await sqlInsertBag.run(bag.weight, bag.type, bag.freezer_id);
            bag.id = result.lastID;
        } catch (err) {
            console.error("❌ Error inserting ice bag:", err.message);
        }
    }
    await sqlInsertBag.finalize();
    console.log("✅ Ice bags inserted successfully");
}

setupDatabase()
    .then(() => console.log("✅ Setup completed successfully"))
    .catch(err => console.error("❌ Error during database setup:", err));
