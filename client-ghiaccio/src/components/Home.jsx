import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Spinner } from "react-bootstrap";

import MyNavbar from "./MyNavbar";
import { fetchFreezers, fetchOrders } from "../api/API.mjs";

import "../css/Home.css";

function Home({ handleLogoutWrapper, name, isAuth, isAdmin, confirmedOrder, setConfirmedOrder }) {
  const [freezers, setFreezers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const navigate = useNavigate();

  // ---------- Caricamento dati admin ----------
  useEffect(() => {
    const loadData = async () => {
      if (!isAdmin) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const startTime = Date.now();
      const minLoadingTime = 700; // ms minimi per far vedere lo spinner

      try {
        const [fetchedFreezers, fetchedOrders] = await Promise.all([
          fetchFreezers(),
          fetchOrders(),
        ]);

        setFreezers(fetchedFreezers);
        setOrders(fetchedOrders);

        const elapsed = Date.now() - startTime;
        if (elapsed < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
        }
      } catch (err) {
        console.error("Errore caricamento dati:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAdmin]);

  // ---------- Messaggio conferma ordine ----------
  useEffect(() => {
    if (!confirmedOrder) return;

    setShowMessage(true);
    const timer = setTimeout(() => setShowMessage(false), 1000);
    setConfirmedOrder(false);

    return () => clearTimeout(timer);
  }, [confirmedOrder, setConfirmedOrder]);

  // ---------- Riepilogo ghiaccio disponibile ----------
  const iceSummary = useMemo(() => {
    return freezers.reduce(
      (acc, f) => {
        acc.total_kg += f.n_kg;
        acc.total_bags += f.n_bags;
        acc.total_capacity += f.n_kg_max;
        return acc;
      },
      { total_kg: 0, total_bags: 0, total_capacity: 0 }
    );
  }, [freezers]);

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

  // ---------- Componente separato per admin ----------
  const AdminHome = ({ orders, iceSummary }) => (
    <div className="home-content">
      <div className="home-card">
        <h3>📦 Ordini</h3>
        <p>Totali: {orders.length}</p>
        <p>In attesa: {orders.filter(o => o.status === "in attesa").length}</p>
        <p>In carico: {orders.filter(o => o.status === "in consegna").length}</p>
        <p>Conclusi: {orders.filter(o => o.status === "completato").length}</p>
        <p>Cancellati: {orders.filter(o => o.status === "cancellato").length}</p>
      </div>

      <div className="home-card">
        <h3>❄️ Ghiaccio</h3>
        <p>Disponibile: {iceSummary.total_kg}/{iceSummary.total_capacity} kg</p>
        <p>Sacchi: {iceSummary.total_bags}</p>
      </div>
    </div>
  );

  return (
    <div className="home-page">
      <MyNavbar handleLogoutWrapper={handleLogoutWrapper} isAuth={isAuth} />

      <div className="home-header">
        <h1>Benvenuto {name || "su Ice Cubes"}</h1>
        <p>Il tuo ruolo è <strong>{isAdmin ? "admin" : "customer"}</strong></p>
      </div>

      {showMessage && (
        <div className="toast-message">Il tuo ordine è stato confermato!</div>
      )}

      {isAdmin ? (
        <AdminHome orders={orders} iceSummary={iceSummary} />
      ) : (
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
      <Modal show={showAuthPopup} onHide={() => setShowAuthPopup(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Accesso richiesto</Modal.Title>
        </Modal.Header>
        <Modal.Body>Devi essere loggato per accedere a questa pagina.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAuthPopup(false)}>Annulla</Button>
          <Button variant="primary" onClick={() => navigate("/login")}>Accedi</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Home;