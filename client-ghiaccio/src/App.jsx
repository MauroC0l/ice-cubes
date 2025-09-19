// App.jsx
import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import PageNotFound from "./components/PageNotFound.jsx";
import ServerDownDisplay from "./components/ServerDownDisplay.jsx";
import TakeOrder from "./components/TakeOrder.jsx";
import OrderList from "./components/OrderList.jsx";

import { checkAuth, handleLogout } from "./api/API.mjs";

function App() {
  const logo = "/images/logo.png";
  const navigate = useNavigate();

  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(false);

  const makeAuth = (value) => setIsAuth(value);

  // Logout wrapper
  const handleLogoutWrapper = async () => {
    try {
      await handleLogout();
      navigate("/", { replace: true });
      setIsAuth(false);
      setUser(null);
      setIsAdmin(false);
    } catch (err) {
      console.error("Errore durante il logout", err);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth()
      .then(({ isAuth, user }) => {
        setIsAuth(isAuth);
        setUser(user);
        setServerStatus(true);
      })
      .catch(err => {
        console.error(err);
        setServerStatus(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="auth-loading-container">
      <div className="spinner" role="status" aria-label="Loading spinner" />
      Accesso in corso...
    </div>
  );

  if (!serverStatus) return <ServerDownDisplay />;

  const currentUser = user ? {
    name: user.name,
    surname: user.surname,
    phoneNumber: user.phoneNumber,
    email: user.email
  } : null;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            isAdmin={isAdmin}
            handleLogoutWrapper={handleLogoutWrapper}
            name={user?.name}
            isAuth={isAuth}
            confirmedOrder={confirmedOrder}
            setConfirmedOrder={setConfirmedOrder}
          />
        }
      />

      <Route
        path="/login"
        element={
          isAuth
            ? <Navigate to="/" replace />
            : <Login
                setIsAdmin={setIsAdmin}
                logo={logo}
                makeAuth={makeAuth}
                setUser={setUser}
                serverStatus={serverStatus}
                setServerStatus={setServerStatus}
              />
        }
      />

      <Route
        path="/register"
        element={
          isAuth
            ? <Navigate to="/" replace />
            : <Register
                logo={logo}
                makeAuth={makeAuth}
                setUser={setUser}
              />
        }
      />

      <Route
        path="/make-order"
        element={
          <TakeOrder
            isAdmin={isAdmin}
            isAuth={isAuth}
            handleLogoutWrapper={handleLogoutWrapper}
            setConfirmedOrder={setConfirmedOrder}
            user={currentUser}
          />
        }
      />

      <Route
        path="/my-orders"
        element={
          <OrderList
            isAuth={isAuth}
            isAdmin={isAdmin}
            handleLogoutWrapper={handleLogoutWrapper}
          />
        }
      />

      <Route
        path="*"
        element={
          <PageNotFound
            handleLogoutWrapper={handleLogoutWrapper}
            isAuth={isAuth}
          />
        }
      />
    </Routes>
  );
}

export default App;
