import "../css/AdminHome.css";
import { Button } from "react-bootstrap";
import { useState, useEffect, useMemo } from "react";

import { fetchFreezers, fetchOrders } from "../api/API.mjs";

function AdminHome({ isAdmin }) {
  // ---------- Hooks: dichiarati sempre nello stesso ordine ----------
  const [freezers, setFreezers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ---------- Riepilogo ghiaccio disponibile (useMemo chiamato sempre) ----------
  const iceSummary = useMemo(() => {
    const summary = freezers.reduce(
      (acc, f) => {
        acc.total_kg += Number(f.n_kg || 0);
        acc.total_bags += Number(f.n_bags || 0);
        acc.total_capacity += Number(f.n_kg_max || 0);
        return acc;
      },
      { total_kg: 0, total_bags: 0, total_capacity: 0 }
    );

    summary.usage_percent =
      summary.total_capacity > 0
        ? Math.round((summary.total_kg / summary.total_capacity) * 100)
        : 0;

    return summary;
  }, [freezers]);

  // ---------- Caricamento dati admin ----------
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!isAdmin) {
        // se non admin, non fare fetch ma segnalo caricamento finito
        if (mounted) setIsLoading(false);
        return;
      }

      if (mounted) setIsLoading(true);
      const startTime = Date.now();
      const minLoadingTime = 700; // ms minimi per far vedere lo spinner

      try {
        const [fetchedFreezers, fetchedOrders] = await Promise.all([
          fetchFreezers(),
          fetchOrders(),
        ]);
        if (!mounted) return;

        setFreezers(Array.isArray(fetchedFreezers) ? fetchedFreezers : []);
        setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
      } catch (err) {
        console.error("Errore caricamento dati:", err);
      } finally {
        // Garantisce che lo spinner resti visibile almeno "minLoadingTime"
        const elapsed = Date.now() - startTime;
        const wait = elapsed < minLoadingTime ? minLoadingTime - elapsed : 0;
        setTimeout(() => {
          if (mounted) setIsLoading(false);
        }, wait);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  // ---------- Render loading ----------
  if (isLoading) {
    return (
      <div className="auth-loading-container">
        <div className="spinner" role="status" aria-label="Loading spinner" />
        Caricamento...
      </div>
    );
  }

  return (
    <div className="adminHome-content">
      {/* ---------- Card riepilogo ordini ---------- */}
      <div className="adminHome-card">
        <h3>📦 Riassunto ordini</h3>
        <div className="card-stats">
          <p>
            <span>Totali:</span> {orders.length}
          </p>
          <p>
            <span>In attesa:</span>{" "}
            {orders.filter((o) => o.status === "in attesa").length}
          </p>
          <p>
            <span>In consegna:</span>{" "}
            {orders.filter((o) => o.status === "in consegna").length}
          </p>
          <p>
            <span>Completati:</span>{" "}
            {orders.filter((o) => o.status === "completato").length}
          </p>
          <p>
            <span>Cancellati:</span>{" "}
            {orders.filter((o) => o.status === "cancellato").length}
          </p>
        </div>
        <Button className="orders-btn">Visualizza ordini</Button>
      </div>

      {/* ---------- Card riepilogo ghiaccio ---------- */}
      <div className="adminHome-card">
        <h3>❄️ Ghiaccio</h3>
        <div className="card-stats">
          <p>
            <span>Capacità totale:</span> {iceSummary.total_capacity} kg
          </p>
          <p>
            <span>Disponibile:</span> {iceSummary.total_kg} kg (
            {iceSummary.usage_percent}%)
          </p>
          <p>
            <span>Sacchi totali:</span> {iceSummary.total_bags}
          </p>
        </div>

        <div className="card-stats">
          <p> 
            <span>Consumazione:</span>{" "} {
                //tutte le bag di tipo "consumazione" nel freezer
                freezers.length > 0
                  ? freezers.reduce((acc, f) => acc + (f.n_bags || 0), 0)
                  : 0
            }
          </p>
          <p>
            <span>Raffreddare:</span> {
                //tutte le bag di tipo "raffreddare" nel freezer
                freezers.length > 0
                  ? freezers.reduce((acc, f) => acc + (f.n_bags_raffreddare || 0), 0)
                  : 0
            }
          </p>
        </div>

        <Button className="orders-btn">Visualizza frigoriferi</Button>
      </div>
    </div>
  );
}

export default AdminHome;
