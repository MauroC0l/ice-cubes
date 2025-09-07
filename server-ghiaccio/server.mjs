import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import crypto from 'crypto';
import * as dao from './dao.mjs';
import { body, validationResult } from 'express-validator';

const app = express();

// ==================== MIDDLEWARE ====================
app.use(morgan('dev')); 
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// ==================== PASSPORT ====================
function hashPassword(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString('hex'));
    });
  });
}

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await dao.getUserByEmail(email);
    if (!user) return done(null, false, { message: 'Utente non trovato' });

    const hashedPassword = await hashPassword(password, user.salt);
    if (hashedPassword !== user.password) return done(null, false, { message: 'Credenziali non valide' });

    return done(null, user);
  } catch (err) { return done(err); }
}));

passport.serializeUser((user, done) => { done(null, { id: user.id, role: user.role }); });
passport.deserializeUser(async (obj, done) => {
  try {
    const user = await dao.getUserById(obj.id);
    done(null, user || false);
  } catch (err) { done(err); }
});

// ==================== HELPERS ====================
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ success: false, message: 'User not authenticated' });
}

function isAdmin(req, res, next) {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'User not authorized' });
}

// ==================== API ROUTES ====================
app.listen(3001, () => console.log('Server in ascolto su http://localhost:3001'));

// -------------------- LOGIN --------------------
app.post('/api/login', [
  body('email').trim().isEmail().withMessage('Devi inserire una email valida'),
  body('password').trim().isLength({ min: 1 }).withMessage('Devi inserire una password')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json({ success: false, isValidationError: true, errorMsg: errors.array().map(e => e.msg) });

  const { rememberMe } = req.body;

  passport.authenticate('local', (err, user, info) => {
    if (err) return res.json({ success: false, errorMsg: 'Internal server error' });
    if (!user) return res.json({ success: false, errorMsg: info?.message || 'credentials' });

    req.login(user, (err) => {
      if (err) return res.json({ success: false, errorMsg: 'Login failed' });

      if (rememberMe) req.session.cookie.maxAge = 10 * 60 * 1000;
      else { delete req.session.cookie.expires; delete req.session.cookie.maxAge; }

      return res.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
    });
  })(req, res, next);
});

// -------------------- REGISTER --------------------
app.post('/api/register', [
  body('name').trim().isLength({ min: 1 }).withMessage('Il nome è obbligatorio'),
  body('surname').trim().isLength({ min: 1 }).withMessage('Il cognome è obbligatorio'),
  body('phoneNumber').trim().isLength({ min: 1 }).withMessage('Il numero di telefono è obbligatorio'),
  body('phoneNumber').trim().matches(/^3\d{9}$/).withMessage('Il numero di telefono non è valido'),
  body('email').trim().isEmail().withMessage('Email non valida'),
  body('password').trim().isLength({ min: 1 }).withMessage('Password obbligatoria'),
  body('confirmPassword').trim().custom((value, { req }) => value === req.body.password).withMessage('Le password non corrispondono')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json({ success: false, isValidationError: true, errorMsg: errors.array().map(e => e.msg) });

  try {
    const { name, surname, email, password, phoneNumber } = req.body;

    console.log("\n\n credenziali ricevute: ", surname);

    // Controlli duplicati
    if (await dao.getUserByEmail(email)) return res.json({ success: false, errorMsg: 'Email già registrata' });
    if (await dao.getUserByNameAndSurname(name, surname)) return res.json({ success: false, errorMsg: 'Nome e cognome già in uso' });
    if (await dao.getUserByPhoneNumber(phoneNumber)) return res.json({ success: false, errorMsg: 'Numero di telefono già in uso' });

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await hashPassword(password, salt);

    // Corretto: inseriamo surname e phoneNumber
    const newUserId = await dao.addUser({ 
      name, 
      surname, 
      email, 
      phoneNumber, 
      password: hashedPassword, 
      salt, 
      role: 'customer' 
    });

    const newUser = await dao.getUserById(newUserId);

    req.login(newUser, (err) => {
      if (err) return res.json({ success: false, errorMsg: 'Errore login dopo registrazione' });
      return res.json({ success: true, user: { name: newUser.name, email: newUser.email, role: newUser.role } });
    });
    
  } catch (err) {
    console.error("Registration error:", err);
    return res.json({ success: false, errorMsg: 'Errore interno durante la registrazione' });
  }
});

// -------------------- SUBMIT ORDER --------------------
app.post('/api/submit-order', isAuthenticated, async (req, res) => {
  try {
    const { quantity, request_date, delivery_date, ice_type } = req.body;
    const order = { quantity, request_date, delivery_date, ice_type, status: 'pending', user_id: req.user.id };
    await dao.submitOrder(order);
    return res.json({ success: true });
  } catch (err) {
    console.error('Error submitting order:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// -------------------- LOGOUT --------------------
app.post('/api/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.json({ success: false, message: 'Logout fallito' });
    req.session.destroy(errDestroy => {
      if (errDestroy) console.error('Error destroying session:', errDestroy);
      res.clearCookie('connect.sid');
      return res.json({ success: true });
    });
  });
});

// -------------------- GET CURRENT USER --------------------
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) return res.json({ isAuth: true, user: { name: req.user.name, email: req.user.email, role: req.user.role } });
  return res.json({ isAuth: false });
});

// ==================== ORDINI E FREEZERS (solo admin) ====================
app.get('/api/orders/all', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const orders = await dao.getAllOrders();
    res.json({ success: true, orders });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

app.get('/api/freezers', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const freezers = await dao.getAllFreezers();
    res.json({ success: true, freezers });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: 'Internal server error' }); }
});
