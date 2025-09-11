import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import MyNavbar from "./MyNavbar";
import { fetchFreezers, fetchOrders } from "../api/API.mjs";
import "../css/Home.css";

function Home({ handleLogoutWrapper, name, isAuth, isAdmin, confirmedOrder, setConfirmedOrder }) {
  const [freezers, setFreezers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  // Caricamento dati per admin
  useEffect(() => {
    const loadData = async () => {
      try {
        if (isAdmin) {
          const [fetchedFreezers, fetchedOrders] = await Promise.all([
            fetchFreezers(),
            fetchOrders()
          ]);
          setFreezers(fetchedFreezers);
          setOrders(fetchedOrders);
        }
      } catch (err) {
        console.error("Errore caricamento dati:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAdmin]);

  // Mostra messaggio di conferma ordine
  useEffect(() => {
    if (confirmedOrder) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 1000);
      setConfirmedOrder(false);
      return () => clearTimeout(timer);
    }
  }, [confirmedOrder, setConfirmedOrder]);

  // Riepilogo ghiaccio disponibile
  const iceSummary = freezers.reduce(
    (acc, f) => {
      acc.total_kg += f.n_kg;
      acc.total_bags += f.n_bags;
      acc.total_capacity += f.n_kg_max;
      return acc;
    },
    { total_kg: 0, total_bags: 0, total_capacity: 0 }
  );

  if (loading) return <div className="home-page">Loading...</div>;

  return (
    <div className="home-page">
      <MyNavbar handleLogoutWrapper={handleLogoutWrapper} isAuth={isAuth} role={isAdmin ? "admin" : "customer"} />

      <div className="home-header">
        <h1>Benvenuto {name || "su Ice Cubes"}</h1>
        <p>Il tuo ruolo è <strong>{isAdmin ? "admin" : "customer"}</strong></p>
      </div>

      {showMessage && (
        <div className="toast-message">
          Il tuo ordine è stato confermato!
        </div>
      )}

      {isAdmin ? (
        <div className="home-content">
          <div className="home-card">
            <h3>📦 Ordini</h3>
            <p>Totali: {orders.length}</p>
            <p>In attesa: {orders.filter(o => o.status === "pending").length}</p>
            <p>In carico: {orders.filter(o => o.status === "in_charge").length}</p>
            <p>Conclusi: {orders.filter(o => o.status === "completed").length}</p>
            <p>Cancellati: {orders.filter(o => o.status === "deleted").length}</p>
          </div>
          <div className="home-card">
            <h3>❄️ Ghiaccio</h3>
            <p>Disponibile: {iceSummary.total_kg}/{iceSummary.total_capacity} kg</p>
            <p>Sacchi: {iceSummary.total_bags}</p>
          </div>
        </div>
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
            <Button onClick={() => navigate("/my-orders")} variant="primary">
              Vai ai miei ordini
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
