// App.jsx
import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import PageNotFound from "./components/PageNotFound.jsx";
import ServerDownDisplay from "./components/ServerDownDisplay.jsx";
import TakeOrder from "./components/TakeOrder.jsx"

import { checkAuth, handleLogout } from "./api/API.mjs";

function App() {
  const logo = "/images/logo.png";

  const [isAuth, setIsAuth] = useState(false); // state to track authentication
  const [loading, setLoading] = useState(true); // loading state while checking auth
  const [serverStatus, setServerStatus] = useState(true); // server status

  const [user, setUser] = useState(null); // store user data
  const [isAdmin, setIsAdmin] = useState(false); // store if user is admin

  const makeAuth = (value) => setIsAuth(value); // function to set auth state

  // Wrapper per logout
  const handleLogoutWrapper = async () => {
    try {
      await handleLogout();
      setIsAuth(false);  // reset authentication state
      setUser(null);     // clear user data
      setIsAdmin(false); // reset admin state
    } catch (err) {
      console.error("Errore durante il logout", err);
    }
  };

  // Controllo autenticazione all'avvio
  useEffect(() => {
    checkAuth()
      .then(({ isAuth, user }) => {
        setIsAuth(isAuth);
        setUser(user);
        setServerStatus(true);
      })
      .catch(err => {
        console.error(err);
        setServerStatus(false); // server not reachable
      })
      .finally(() => setLoading(false)); // stop loading spinner
  }, []);

  // show loading spinner while checking authentication
  if (loading) return (
    <div className="auth-loading-container">
      <div className="spinner" aria-label="Loading spinner" role="status" />
      Accesso in corso..
    </div>
  );

  return (
    <>
      {serverStatus ? (
        <Routes>
          {/* Home page: default route */}
          <Route
            path="/"
            element={
              <Home
                isAdmin={isAdmin}
                handleLogoutWrapper={handleLogoutWrapper}
                name={user?.name}
                isAuth={isAuth}
              />
            }
          />

          {/* Login page: only accessible if not authenticated */}
          <Route
            path="/login"
            element={
              isAuth ? (
                <Navigate to="/" replace />
              ) : (
                <Login
                  setIsAdmin={setIsAdmin}
                  logo={logo}
                  makeAuth={makeAuth}
                  setUser={setUser}
                  serverStatus={serverStatus}
                  setServerStatus={setServerStatus}
                />
              )
            }
          />

          {/* Register page */}
          <Route
            path="/register"
            element={
              isAuth ? (
                <Navigate to="/" replace />
              ) : (
                <Register
                  logo={logo}
                  makeAuth={makeAuth}
                  setUser={setUser}
                />
              )
            }
          />

          {/* Redirect from /make-order to /make-orders */}
          <Route path='/make-order' element={ <TakeOrder 
            isAdmin={isAdmin}
            name={user?.name}
            handleLogoutWrapper={handleLogoutWrapper}
            isAuth={isAuth}
          /> } />

          {/* Catch-all route for 404 Not Found */}
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
      ) : (
        // Server down fallback
        <ServerDownDisplay />
      )}
    </>
  );
}

export default App;
