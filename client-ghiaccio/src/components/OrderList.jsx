import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchUserOrders } from "../api/API.mjs"; 
import "../css/OrderList.css";

import MyNavbar from "./MyNavbar";

function OrderList({ isAdmin, handleLogoutWrapper, isAuth }) {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetchUserOrders();
        setOrders(res);
      } catch (err) {
        console.error("Errore nel caricamento degli ordini:", err);
      }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    if (!isAuth) {
      navigate("/");
    }
  }, [isAuth, navigate]);

  // Funzione per calcolare tempo rimanente
  const getTimeRemaining = (deliveryDate, deliveryHour) => {
    const [day, month, year] = deliveryDate.split("-"); // DD-MM-YYYY
    const delivery = new Date(`${year}-${month}-${day}T${deliveryHour}`);
    const now = new Date();

    const diffMs = delivery - now;
    if (diffMs <= 0) return { days: 0, hours: 0, expired: true };

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;

    return { days, hours, expired: false, totalHours: diffHours };
  };

  // Funzione per convertire la data in formato DD-MM-YYYY se non lo è già
  const formatDate = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes("-") && dateString.split("-")[0].length === 2) {
      return dateString; // già nel formato DD-MM-YYYY
    }
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return String(d.getDate()).padStart(2, "0") +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      d.getFullYear();
  };

  return (
    <>
      <MyNavbar handleLogoutWrapper={handleLogoutWrapper} isAuth={isAuth} />

      <div className="orderlist-page">
        {/* Header */}
        <div className="orderlist-header">
          <h1>I tuoi Ordini</h1>
        </div>

        {/* Cards wrapper */}
        <div className="orderlist-cards">
          {orders.length === 0 ? (
            <p className="no-orders">Nessun ordine disponibile</p>
          ) : (
            orders.map((order, index) => {
              const { days, hours, expired, totalHours } = getTimeRemaining(
                order.delivery_date,
                order.delivery_hour
              );

              return (
                <div key={order.id} className="order-card">
                  <h3>Ordine #{index + 1}</h3>

                  <div className="order-info">
                    <strong>Quantità</strong>
                    <span>{order.quantity} kg</span>
                  </div>

                  <div className="order-info">
                    <strong>Tipo ghiaccio</strong>
                    <span>{order.ice_type}</span>
                  </div>

                  <div className="order-info">
                    <strong>Richiesto il</strong>
                    <span>
                      {formatDate(order.request_date)} - {order.request_hour}
                    </span>
                  </div>

                  <div className="order-info">
                    <strong>Consegna</strong>
                    <span>
                      {formatDate(order.delivery_date)} - {order.delivery_hour}
                    </span>
                  </div>

                  <div className="order-info">
                    <strong>Indirizzo</strong>
                    <span>{order.delivery_address}</span>
                  </div>

                  {/* Tempo mancante */}
                  {!expired && (
                    <div className="order-info">
                      <strong>Tempo alla consegna</strong>
                      <span>
                        {days} giorni {hours} ore
                      </span>
                    </div>
                  )}

                  {/* Stato come pill moderna */}
                  <span
                    className={`order-status ${
                      order.status === "in attesa"
                        ? "attesa"
                        : order.status === "in consegna"
                        ? "consegna"
                        : order.status === "completato"
                        ? "completato"
                        : "cancellato"
                    }`}
                  >
                    {order.status}
                  </span>

                  {/* Pulsanti disponibili solo se >72h */}
                  {totalHours > 72 && !expired && (
                    <div className="order-actions">
                      <button
                        className="order-btn edit"
                        onClick={() => console.log("Modifica ordine", order.id)}
                      >
                        Modifica
                      </button>
                      <button
                        className="order-btn delete"
                        onClick={() => console.log("Cancella ordine", order.id)}
                      >
                        Cancella
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default OrderList;
