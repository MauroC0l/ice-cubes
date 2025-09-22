import sqlite3 from 'sqlite3';

// Funzione per aprire il DB
function openDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./iceDatabase.sqlite', (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}

// Funzione per chiudere il DB
function closeDb(db) {
  db.close((err) => { if (err) console.error("Error closing database:", err.message); });
}

// ===== Users =====
export const getUserByEmail = (email) =>
  openDb().then(db => new Promise((resolve, reject) => {
    db.get('SELECT * FROM user WHERE email = ?', [email], (err, row) => {
      closeDb(db);
      if (err) return reject(err);
      resolve(row || null);
    });
  }));

export const getUserById = (id) =>
  openDb().then(db => new Promise((resolve, reject) => {
    db.get('SELECT * FROM user WHERE id = ?', [id], (err, row) => {
      closeDb(db);
      if (err) return reject(err);
      resolve(row || null);
    });
  }));

export const addUser = (user) =>
  openDb().then(db => new Promise((resolve, reject) => {
    const sql = 'INSERT INTO user(name, surname, email, phoneNumber, password, salt, role) VALUES(?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [user.name, user.surname, user.email, user.phoneNumber, user.password, user.salt, user.role], function (err) {
      closeDb(db);
      if (err) return reject(err);
      resolve(this.lastID);
    });
  }));

export const getUserByNameAndSurname = (name, surname) =>
  openDb().then(db => new Promise((resolve, reject) => {
    db.get('SELECT * FROM user WHERE name = ? AND surname = ?', [name, surname], (err, row) => {
      closeDb(db);
      if (err) return reject(err);
      resolve(row || null);
    });
  }));

export const getUserByPhoneNumber = (phoneNumber) =>
  openDb().then(db => new Promise((resolve, reject) => {
    db.get('SELECT * FROM user WHERE phoneNumber = ?', [phoneNumber], (err, row) => {
      closeDb(db);
      if (err) return reject(err);
      resolve(row || null);
    });
  }));

// ===== Freezers =====
export const getAllFreezers = () =>
  openDb().then(db => new Promise((resolve, reject) => {
    db.all('SELECT * FROM freezer', (err, rows) => {
      closeDb(db);
      if (err) return reject(err);
      resolve(rows);
    });
  }));

export const getFreezerById = (id) =>
  openDb().then(db => new Promise((resolve, reject) => {
    db.get('SELECT * FROM freezer WHERE id = ?', [id], (err, row) => {
      closeDb(db);
      if (err) return reject(err);
      resolve(row || null);
    });
  }));

export const addFreezer = (freezer) =>
  openDb().then(db => new Promise((resolve, reject) => {
    const sql = 'INSERT INTO freezer(name, n_bags, n_kg, n_kg_max) VALUES(?, ?, ?, ?)';
    db.run(sql, [freezer.name, freezer.n_bags, freezer.n_kg, freezer.n_kg_max], function (err) {
      closeDb(db);
      if (err) return reject(err);
      resolve(this.lastID);
    });
  }));

export const deleteFreezer = (id) =>
  openDb().then(db => new Promise((resolve, reject) => {
    db.run('DELETE FROM freezer WHERE id = ?', [id], function (err) {
      closeDb(db);
      if (err) return reject(err);
      resolve(this.changes);
    });
  }));

// ===== Orders =====
export const getAllOrders = async () => {
  const rows = await openDb().then(db => new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders', (err, rows) => {
      closeDb(db);
      if (err) return reject(err);
      resolve(rows);
    });
  }));
  return rows; // semplice array, non mapping inutile
};

export const getOrderById = (id) =>
  openDb().then(db => new Promise((resolve, reject) => {
    db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
      closeDb(db);
      if (err) return reject(err);
      resolve(row || null);
    });
  }));

export const getOrdersByUserId = (userId) =>
  openDb().then(db => new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders WHERE user_id = ?', [userId], (err, rows) => {
      closeDb(db);
      if (err) return reject(err);
      resolve(rows);
    });
  }));

export const updateOrder = (order, orderId) =>
  openDb().then(db => new Promise((resolve, reject) => {
    const sql = 'UPDATE orders SET quantity = ?, request_date = ?, request_hour = ?, delivery_date = ?, delivery_hour = ?, delivery_address = ?, ice_type = ?, status = ? WHERE id = ?';
    db.run(sql, [order.quantity, order.request_date, order.request_hour, order.delivery_date, order.delivery_hour, order.delivery_address, order.ice_type, order.status, orderId], function (err) {
      closeDb(db);
      if (err) return reject(err);
      resolve(this.changes);
    });
  }));

export const submitOrder = (order) =>
  openDb().then(db => new Promise((resolve, reject) => {
    const sql = 'INSERT INTO orders(quantity, request_date, request_hour, delivery_date, delivery_hour, delivery_address, ice_type, status, user_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [order.quantity, order.request_date, order.request_hour, order.delivery_date, order.delivery_hour, order.delivery_address, order.ice_type, order.status, order.user_id], function (err) {
      closeDb(db);
      if (err) return reject(err);
      resolve(this.lastID);
    });
  }));

export const deleteOrder = (id) =>
  openDb().then(db => new Promise((resolve, reject) => {
    db.run('DELETE FROM orders WHERE id = ?', [id], function (err) {
      closeDb(db);
      if (err) return reject(err);
      resolve(this.changes);
    });
  }));
