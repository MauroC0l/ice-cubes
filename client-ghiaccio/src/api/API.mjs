const API_BASE = 'http://localhost:3001/api';

// Login handler
export const loginHandler = (email, password, rememberMe) =>
  fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, rememberMe })
  })
  .then(async res => {
    let data;
    try { data = await res.json(); } 
    catch { throw 'Invalid server response'; }

    if (data.success) return data.user;
    else throw data.errorMsg || 'Login fallito';
  });

// Register handler
export const registerHandler = (name, surname, phoneNumber, email, password, confirmPassword) =>
  fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, surname, phoneNumber, email, password, confirmPassword })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) return data.user;
    else throw data.errorMsg || "Registrazione fallita";
  });

// Submit order
export const submitOrder = (orderData) =>
  fetch(`${API_BASE}/submit-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(orderData)
  }).then(() => { return; });

// Logout
export const handleLogout = () =>
  fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' })
    .then(() => { return; });

// Check authentication
export const checkAuth = () =>
  fetch(`${API_BASE}/user`, { method: 'GET', credentials: 'include' })
    .then(res => res.ok ? res.json() : { isAuth: false, user: {} })
    .then(data => ({ isAuth: !!data.isAuth, user: data.user || {} }));

// Fetch all orders (solo admin)
export const fetchOrders = () =>
  fetch(`${API_BASE}/orders/all`, { method: 'GET', credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.success) return data.orders;
      else throw data.message || "Failed to fetch orders";
    });

// Fetch all freezers (solo admin)
export const fetchFreezers = () =>
  fetch(`${API_BASE}/freezers`, { method: 'GET', credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.success) return data.freezers;
      else throw data.message || "Failed to fetch freezers";
    });
