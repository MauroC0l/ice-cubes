import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Dropdown, Form } from "react-bootstrap";

import { fetchUserOrders, deleteUserOrder } from "../api/API.mjs";
import "../css/OrderList.css";

import MyNavbar from "./MyNavbar";

function OrderList({ handleLogoutWrapper, isAuth }) {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Ordinamento e filtri
  const [sortKey, setSortKey] = useState("request_date");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterIceType, setFilterIceType] = useState("all");
  const [sortReverse, setSortReverse] = useState(false);

  // Nuovo: mostra o nasconde gli ordini cancellati
  const [hideCancelled, setHideCancelled] = useState(true);

  // Funzione per caricare gli ordini
  const loadOrders = async () => {
    try {
      const res = await fetchUserOrders();
      setOrders(res);
    } catch (err) {
      console.error("Errore nel caricamento degli ordini:", err);
    }
  };

  // Carica ordini al caricamento della pagina
  useEffect(() => {
    if (!isAuth) return navigate("/");
    loadOrders();
  }, [isAuth, navigate]);

  // Calcolo tempo rimanente
  const getTimeRemaining = (deliveryDate, deliveryHour) => {
    const [day, month, year] = deliveryDate.split("-");
    const delivery = new Date(`${year}-${month}-${day}T${deliveryHour}`);
    const now = new Date();
    const diffMs = delivery - now;
    if (diffMs <= 0) return { days: 0, hours: 0, expired: true, totalHours: 0 };
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    return { days, hours, expired: false, totalHours: diffHours };
  };

  // Formatta data in DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Modifica ordine
  const handleModifyOrder = (order) => {
    navigate("/make-order", { state: { order } });
  };

  // Mostra popup di conferma cancellazione
  const handleShowConfirm = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmPopup(true);
  };

  // Conferma cancellazione
  const handleConfirmDelete = async () => {
    if (!selectedOrderId) return;
    try {
      await deleteUserOrder(selectedOrderId);
      setShowConfirmPopup(false);
      setSelectedOrderId(null);
      await loadOrders(); // ricarica la lista aggiornata
    } catch (err) {
      console.error("Errore nella cancellazione dell'ordine:", err);
    }
  };

  // Applica filtro e ordinamento
  const filteredAndSortedOrders = [...orders]
    .filter(
      (order) =>
        (filterStatus === "all" || order.status === filterStatus) &&
        (filterIceType === "all" || order.ice_type === filterIceType) &&
        (!hideCancelled || order.status !== "cancellato")
    )
    .sort((a, b) => {
      let result = 0;

      if (sortKey === "request_date") {
        // Riconosce sia YYYY-MM-DD che DD-MM-YYYY
        const parseDate = (dateStr, hourStr) => {
          const parts = dateStr.split("-");
          let year, month, day;

          if (parts[0].length === 4) {
            // formato YYYY-MM-DD
            [year, month, day] = parts;
          } else {
            // formato DD-MM-YYYY
            [day, month, year] = parts;
          }

          const [hour, min] = hourStr.split(":");
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min));
        };

        const dateA = parseDate(a.request_date, a.request_hour);
        const dateB = parseDate(b.request_date, b.request_hour);

        result = dateB - dateA; // più recenti prima

      } else if (sortKey === "quantity") {
        result = a.quantity - b.quantity;
      } else if (sortKey === "ice_type") {
        result = a.ice_type.localeCompare(b.ice_type);
      } else if (sortKey === "address") {
        result = a.delivery_address.localeCompare(b.delivery_address);
      } else if (sortKey === "status") {
        result = a.status.localeCompare(b.status);
      } else if (sortKey === "time") {
        const tA = getTimeRemaining(a.delivery_date, a.delivery_hour);
        const tB = getTimeRemaining(b.delivery_date, b.delivery_hour);
        result = tA.totalHours - tB.totalHours;
      }

      return sortReverse ? -result : result;
    });

  return (
    <>
      <MyNavbar handleLogoutWrapper={handleLogoutWrapper} isAuth={isAuth} />

      <div className="orderlist-page">
        {/* Sidebar */}
        <aside className="orderlist-sidebar">
          <h3>Ordina per</h3>
          <div className="sort-container">
            <Dropdown className="custom-dropdown">
              <Dropdown.Toggle className="dropdown-toggle">
                {sortKey === "request_date"
                  ? "Recenti"
                  : sortKey === "quantity"
                    ? "Quantità"
                    : sortKey === "ice_type"
                      ? "Tipo di ghiaccio"
                      : sortKey === "address"
                        ? "Indirizzo"
                        : sortKey === "time"
                          ? "Tempo di consegna"
                          : "Stato"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSortKey("request_date")}>Recenti</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey("quantity")}>Quantità</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey("ice_type")}>Tipo di ghiaccio</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey("address")}>Indirizzo</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey("time")}>Tempo di consegna</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey("status")}>Stato</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Pulsante inverti ordine */}
            <Button className="invert-btn" onClick={() => setSortReverse(!sortReverse)}>
              {sortReverse ? "↓" : "↑"}
            </Button>
          </div>

          <h3>Filtra per stato</h3>
          <Dropdown className="custom-dropdown">
            <Dropdown.Toggle className="dropdown-toggle">
              {filterStatus === "all"
                ? "Tutti"
                : filterStatus === "in attesa"
                  ? "In attesa"
                  : filterStatus === "in consegna"
                    ? "In consegna"
                    : filterStatus === "completato"
                      ? "Completato"
                      : "Cancellato"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterStatus("all")}>Tutti</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterStatus("in attesa")}>In attesa</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterStatus("in consegna")}>In consegna</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterStatus("completato")}>Completato</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterStatus("cancellato")}>Cancellato</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <h3>Filtra per tipo ghiaccio</h3>
          <Dropdown className="custom-dropdown">
            <Dropdown.Toggle className="dropdown-toggle">
              {filterIceType === "all" ? "Tutti" : filterIceType}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterIceType("all")}>Tutti</Dropdown.Item>
              {Array.from(new Set(orders.map((o) => o.ice_type))).map((type) => (
                <Dropdown.Item key={type} onClick={() => setFilterIceType(type)}>
                  {type}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* Mostra/Nascondi ordini cancellati */}
          <Form.Check
            type="checkbox"
            label="Mostra gli ordini cancellati"
            checked={!hideCancelled}
            onChange={() => setHideCancelled(!hideCancelled)}
            className="mt-3"
          />
        </aside>

        {/* Main content */}
        <div className="orderlist-content">
          <div className="orderlist-header">
            <h1>I tuoi Ordini</h1>
            <p className="orderlist-info">
              <strong>Attenzione:</strong> Gli ordini si possono modificare o
              cancellare solo entro 72h prima della consegna.
            </p>
          </div>

          <div className="orderlist-cards">
            {filteredAndSortedOrders.length === 0 ? (
              <p className="no-orders">Nessun ordine disponibile</p>
            ) : (
              filteredAndSortedOrders.map((order) => {
                const { days, hours, expired, totalHours } = getTimeRemaining(
                  order.delivery_date,
                  order.delivery_hour
                );

                return (
                  <div key={order.id} className="order-card">
                    <h3>Ordine #{order.id}</h3>

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

                    {!expired && (
                      <div className="order-info">
                        <strong>Tempo alla consegna</strong>
                        <span>
                          {days} giorni {hours} ore
                        </span>
                      </div>
                    )}

                    <span
                      className={`order-status ${order.status === "in attesa"
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

                    {totalHours > 72 && !expired && order.status === "in attesa" && (
                      <div className="order-actions">
                        <Button className="order-btn edit" onClick={() => handleModifyOrder(order)}>
                          Modifica
                        </Button>
                        <Button className="order-btn delete" onClick={() => handleShowConfirm(order.id)}>
                          Cancella
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal di conferma cancellazione */}
      <Modal show={showConfirmPopup} onHide={() => setShowConfirmPopup(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancella ordine</Modal.Title>
        </Modal.Header>
        <Modal.Body>Sei sicuro di voler cancellare questo ordine?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmPopup(false)}>
            Annulla
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Conferma
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default OrderList;
