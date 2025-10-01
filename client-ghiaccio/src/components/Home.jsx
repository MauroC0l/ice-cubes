import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";

import MyNavbar from "./MyNavbar";
import AdminHome from "./AdminHome";

import "../css/Home.css";

function Home({ handleLogoutWrapper, name, isAuth, isAdmin, confirmedOrder, setConfirmedOrder }) {
  const [showMessage, setShowMessage] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // ---------- Simulazione caricamento ----------
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000); // finto delay
    return () => clearTimeout(timer);
  }, []);

  // ---------- Messaggio conferma ordine ----------
  useEffect(() => {
    if (!confirmedOrder) return;

    setShowMessage(true);
    const timer = setTimeout(() => setShowMessage(false), 3000);
    setConfirmedOrder(false);

    return () => clearTimeout(timer);
  }, [confirmedOrder, setConfirmedOrder]);

  // ---------- Navigazione ordini ----------
  const handleShowOrderList = useCallback(() => {
    if (isAuth) {
      navigate("/my-orders");
    } else {
      setShowAuthPopup(true);
    }
  }, [isAuth, navigate]);

  // ---------- Render loading ----------
  if (isLoading) {
    return (
      <div className="auth-loading-container">
        <div className="spinner" role="status" aria-label="Loading spinner" />
        Caricamento...
      </div>
    );
  }

  // ---------- Render principale ----------
  return (
    <div className="home-page">
      <MyNavbar handleLogoutWrapper={handleLogoutWrapper} isAuth={isAuth} />

      <div className="home-header">
        <h1>Benvenuto {name || "su Ice Cubes"}</h1>
        <p>
          Il tuo ruolo è <strong>{isAdmin ? "admin" : "customer"}</strong>
        </p>
      </div>

      {showMessage && (
        <div className="toast-message">Il tuo ordine è stato confermato!</div>
      )}

      {isAdmin ? (
        // ----- Componente separato per admin -----
        <AdminHome isAdmin={isAdmin} />
      ) : (
        // ----- Sezione customer -----
        <div className="home-content">
          <div className="home-card">
            <h3>Effettua un ordine</h3>
            <Button onClick={() => navigate("/make-order")} variant="primary">
              Effettua un ordine
            </Button>
          </div>

          <div className="home-card">
            <h3>Guarda i miei ordini</h3>
            <Button onClick={handleShowOrderList} variant="primary">
              Vai ai miei ordini
            </Button>
          </div>
        </div>
      )}

      {/* Modal di autenticazione */}
      <Modal
        show={showAuthPopup}
        onHide={() => setShowAuthPopup(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Accesso richiesto</Modal.Title>
        </Modal.Header>
        <Modal.Body>Devi essere loggato per accedere a questa pagina.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAuthPopup(false)}>
            Annulla
          </Button>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Accedi
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Home;
