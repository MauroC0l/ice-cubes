import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Dropdown } from "react-bootstrap";

import { fetchUserOrders, deleteUserOrder } from "../api/API.mjs";
import "../css/OrderList.css";

import MyNavbar from "./MyNavbar";

function OrderList({ handleLogoutWrapper, isAuth }) {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Ordinamento e filtri
  const [sortKey, setSortKey] = useState("date");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterIceType, setFilterIceType] = useState("all");
  const [sortReverse, setSortReverse] = useState(false);

  // Caricamento ordini
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
    const [day, month, year] = deliveryDate.split("-");
    const delivery = new Date(`${year}-${month}-${day}T${deliveryHour}`);
    const now = new Date();
    const diffMs = delivery - now;
    if (diffMs <= 0) return { days: 0, hours: 0, expired: true };
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    return { days, hours, expired: false, totalHours: diffHours };
  };

  // Funzione per convertire la data in formato DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes("-") && dateString.split("-")[0].length === 2) {
      return dateString;
    }
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return (
      String(d.getDate()).padStart(2, "0") +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      d.getFullYear()
    );
  };

  // Modifica ordine
  const handleModifyOrder = (order) => {
    navigate("/make-order", { state: { order } });
  };

  // Mostra pop-up per cancellazione
  const handleShowConfirm = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmPopup(true);
  };

  // Conferma cancellazione
  const handleConfirmDelete = () => {
    if (!selectedOrderId) return;
    deleteUserOrder(selectedOrderId)
      .then(() => {
        setOrders(orders.filter((order) => order.id !== selectedOrderId));
        setShowConfirmPopup(false);
        setSelectedOrderId(null);
      })
      .catch((err) => {
        console.error("Errore nella cancellazione dell'ordine:", err);
      });
  };

  // Applica filtro e ordinamento
  let filteredAndSortedOrders = [...orders]
    .filter(
      (order) =>
        (filterStatus === "all" || order.status === filterStatus) &&
        (filterIceType === "all" || order.ice_type === filterIceType)
    )
    .sort((a, b) => {
      let result = 0;
      if (sortKey === "date") result = new Date(a.delivery_date) - new Date(b.delivery_date);
      if (sortKey === "quantity") result = a.quantity - b.quantity;
      if (sortKey === "ice_type") result = a.ice_type.localeCompare(b.ice_type);
      if (sortKey === "address") result = a.delivery_address.localeCompare(b.delivery_address);
      if (sortKey === "status") result = a.status.localeCompare(b.status);
      if (sortKey === "time") {
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
                {sortKey === "date"
                  ? "Data"
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
                <Dropdown.Item onClick={() => setSortKey("date")}>Data</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey("quantity")}>Quantità</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey("ice_type")}>Tipo di ghiaccio</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey("address")}>Indirizzo</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey("time")}>Tempo di consegna</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortKey("status")}>Stato</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Pulsante inverti ordine con freccia */}
            <Button
              className="invert-btn"
              onClick={() => setSortReverse(!sortReverse)}
            >
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
        </aside>

        {/* Main content */}
        <div className="orderlist-content">
          {/* Header */}
          <div className="orderlist-header">
            <h1>I tuoi Ordini</h1>
            <p className="orderlist-info">
              <strong>Attenzione:</strong> Gli ordini si possono modificare o
              cancellare solo entro 72h prima della consegna.
            </p>
          </div>

          {/* Cards wrapper */}
          <div className="orderlist-cards">
            {filteredAndSortedOrders.length === 0 ? (
              <p className="no-orders">Nessun ordine disponibile</p>
            ) : (
              filteredAndSortedOrders.map((order, index) => {
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

                    {!expired && (
                      <div className="order-info">
                        <strong>Tempo alla consegna</strong>
                        <span>
                          {days} giorni {hours} ore
                        </span>
                      </div>
                    )}

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

                    {totalHours > 72 && !expired && (
                      <div className="order-actions">
                        <Button  className="order-btn edit" onClick={() => handleModifyOrder(order)} >
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
      <Modal
        show={showConfirmPopup}
        onHide={() => setShowConfirmPopup(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cancella ordine</Modal.Title>
        </Modal.Header>
        <Modal.Body>Sei sicuro di voler cancellare questo ordine?</Modal.Body>
        <Modal.Footer>
          <Button
            className="order-btn edit"
            onClick={() => setShowConfirmPopup(false)}
          >
            Annulla
          </Button>
          <Button className="order-btn delete" onClick={handleConfirmDelete}>
            Conferma
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default OrderList;
