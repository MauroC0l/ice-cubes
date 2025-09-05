import crypto from 'crypto';

export class User {
    constructor({ id = null, username, password_hash, salt, email, role = '' }) {
        this.id = id;
        this.username = username;
        this.password = password_hash;
        this.salt = salt;
        this.email = email;
        this.role = role;   // generic value, overridden by subclasses
    }

    // Creazione utente con hash + salt
    static async create(username, email, plainPassword, role = '') {
        const salt = crypto.randomBytes(16).toString('hex');
        const password_hash = await new Promise((resolve, reject) => {
            crypto.scrypt(plainPassword, salt, 64, (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey.toString('hex'));
            });
        });

        return new User({ username, password_hash, salt, email, role });
    }
}

export class Freezer {
    constructor({ id = null, name, n_bags, n_kg, n_kg_max }) {
        this.id = id;
        this.name = name;
        this.n_bags = n_bags;               // Number of bags
        this.n_kg = n_kg;                   // Total weight in kg
        this.n_kg_max = n_kg_max;           // Maximum weight in kg
    }
}

export class Order {
    constructor({ id = null, quantity, request_date, delivery_date, ice_type, status = 'pending', user_id = null }) {
        this.id = id;
        this.quantity = quantity;               // Quantity in kg
        this.request_date = request_date;       // Request date
        this.delivery_date = delivery_date;     // Delivery date
        this.ice_type = ice_type;               // 'cocktail', 'cooling'
        this.status = status;                   // 'pending', 'in_charge', 'completed', 'deleted'
        this.user_id = user_id;                 // Foreign key to User
    }
}
