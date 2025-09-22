import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Dropdown, Form, Spinner } from "react-bootstrap";

import { userFetchOrders, userDeleteOrder } from "../api/API.mjs";
import "../css/OrderList.css";

import MyNavbar from "./MyNavbar";

function OrderList({ handleLogoutWrapper, isAuth }) {
  const navigate = useNavigate();

  // ---------- Stati principali ----------
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Conferma cancellazione
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Ordinamento e filtri
  const [sortKey, setSortKey] = useState("request_date");
  const [sortReverse, setSortReverse] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterIceType, setFilterIceType] = useState("all");
  const [hideCancelled, setHideCancelled] = useState(true);

  // ---------- Funzioni ----------
  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await userFetchOrders();
      setOrders(res);
    } catch (err) {
      console.error("Errore nel caricamento degli ordini:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuth) {
      navigate("/");
    } else {
      loadOrders();
    }
  }, [isAuth, navigate, loadOrders]);

  const getTimeRemaining = (deliveryDate, deliveryHour) => {
    const [day, month, year] = deliveryDate.split("-");
    const delivery = new Date(`${year}-${month}-${day}T${deliveryHour}`);
    const now = new Date();
    const diffMs = delivery - now;
    if (diffMs <= 0) return { days: 0, hours: 0, expired: true, totalHours: 0 };
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return {
      days: Math.floor(diffHours / 24),
      hours: diffHours % 24,
      expired: false,
      totalHours: diffHours,
    };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString("it-IT");
  };

  const parseDateTime = (dateStr, timeStr) => {
    const [part1, part2, part3] = dateStr.split("-");
    let year, month, day;
    if (part1.length === 4) [year, month, day] = [part1, part2, part3];
    else[day, month, year] = [part1, part2, part3];
    const [hour, min] = timeStr.split(":");
    return new Date(+year, +month - 1, +day, +hour, +min);
  };

  const handleModifyOrder = (order) => {
    navigate("/make-order", { state: { order } });
  };

  const handleShowConfirm = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmPopup(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrderId) return;
    try {
      await userDeleteOrder(selectedOrderId);
      setShowConfirmPopup(false);
      setSelectedOrderId(null);
      await loadOrders();
    } catch (err) {
      console.error("Errore nella cancellazione dell'ordine:", err);
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    return [...orders]
      .filter(
        (order) =>
          (filterStatus === "all" || order.status === filterStatus) &&
          (filterIceType === "all" || order.ice_type === filterIceType) &&
          (!hideCancelled || order.status !== "cancellato")
      )
      .sort((a, b) => {
        let result = 0;
        switch (sortKey) {
          case "request_date":
            result = parseDateTime(b.request_date, b.request_hour) - parseDateTime(a.request_date, a.request_hour);
            break;
          case "quantity":
            result = a.quantity - b.quantity;
            break;
          case "ice_type":
            result = a.ice_type.localeCompare(b.ice_type);
            break;
          case "address":
            result = a.delivery_address.localeCompare(b.delivery_address);
            break;
          case "status":
            result = a.status.localeCompare(b.status);
            break;
          case "time":
            result = getTimeRemaining(a.delivery_date, a.delivery_hour).totalHours -
              getTimeRemaining(b.delivery_date, b.delivery_hour).totalHours;
            break;
          default:
            break;
        }
        return sortReverse ? -result : result;
      });
  }, [orders, filterStatus, filterIceType, hideCancelled, sortKey, sortReverse]);

  // ---------- Render ----------
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
                {{
                  request_date: "Recenti",
                  quantity: "Quantità",
                  ice_type: "Tipo di ghiaccio",
                  address: "Indirizzo",
                  time: "Tempo di consegna",
                  status: "Stato",
                }[sortKey]}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {["request_date", "quantity", "ice_type", "address", "time", "status"].map((key) => (
                  <Dropdown.Item key={key} onClick={() => setSortKey(key)}>
                    {{
                      request_date: "Recenti",
                      quantity: "Quantità",
                      ice_type: "Tipo di ghiaccio",
                      address: "Indirizzo",
                      time: "Tempo di consegna",
                      status: "Stato",
                    }[key]}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Button className="invert-btn" onClick={() => setSortReverse(prev => !prev)}>
              {sortReverse ? "↓" : "↑"}
            </Button>
          </div>

          <h3>Filtra per stato</h3>
          <Dropdown className="custom-dropdown">
            <Dropdown.Toggle className="dropdown-toggle">
              {filterStatus === "all" ? "Tutti" : filterStatus}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {["all", "in attesa", "in consegna", "completato", "cancellato"].map((status) => (
                <Dropdown.Item key={status} onClick={() => setFilterStatus(status)}>
                  {status === "all" ? "Tutti" : status}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <h3>Filtra per tipo ghiaccio</h3>
          <Dropdown className="custom-dropdown">
            <Dropdown.Toggle className="dropdown-toggle">
              {filterIceType === "all" ? "Tutti" : filterIceType}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterIceType("all")}>Tutti</Dropdown.Item>
              {Array.from(new Set(orders.map(o => o.ice_type))).map((type) => (
                <Dropdown.Item key={type} onClick={() => setFilterIceType(type)}>
                  {type}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Form.Check
            type="checkbox"
            label="Mostra gli ordini cancellati"
            checked={!hideCancelled}
            onChange={() => setHideCancelled(prev => !prev)}
            className="mt-3"
          />
        </aside>

        {/* Main content */}
        <div className="orderlist-content">
          <div className="orderlist-header">
            <h1>I tuoi Ordini</h1>
            <p className="orderlist-info">
              <strong>Attenzione:</strong> Gli ordini si possono modificare o cancellare solo entro 72h prima della consegna.
            </p>
          </div>

          {isLoading ? (
            <div className="no-orders">
              <div className="auth-loading-container">
                <div className="spinner" role="status" aria-label="Loading spinner" />
                Caricamento...
              </div>
            </div>
          ) : filteredAndSortedOrders.length === 0 ? (
            <p className="no-orders">Nessun ordine disponibile</p>
          ) : (
            <div className="orderlist-cards">
              {filteredAndSortedOrders.map(order => {
                const { days, hours, expired, totalHours } = getTimeRemaining(order.delivery_date, order.delivery_hour);

                return (
                  <div key={order.id} className="order-card">
                    <h3>Ordine #{order.id}</h3>
                    <div className="order-info"><strong>Quantità</strong><span>{order.quantity} kg</span></div>
                    <div className="order-info"><strong>Tipo ghiaccio</strong><span>{order.ice_type}</span></div>
                    <div className="order-info"><strong>Richiesto il</strong><span>{formatDate(order.request_date)} - {order.request_hour}</span></div>
                    <div className="order-info"><strong>Consegna</strong><span>{formatDate(order.delivery_date)} - {order.delivery_hour}</span></div>
                    <div className="order-info"><strong>Indirizzo</strong><span>{order.delivery_address}</span></div>

                    {!expired && (
                      <div className="order-info">
                        <strong>Tempo alla consegna</strong><span>{days} giorni {hours} ore</span>
                      </div>
                    )}

                    <span className={`order-status ${order.status === "in attesa" ? "attesa" :
                      order.status === "in consegna" ? "consegna" :
                        order.status === "completato" ? "completato" : "cancellato"
                      }`}>
                      {order.status}
                    </span>

                    {totalHours > 72 && !expired && order.status === "in attesa" && (
                      <div className="order-actions">
                        <Button className="order-btn edit" onClick={() => handleModifyOrder(order)}>Modifica</Button>
                        <Button className="order-btn delete" onClick={() => handleShowConfirm(order.id)}>Cancella</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal conferma cancellazione */}
      <Modal show={showConfirmPopup} onHide={() => setShowConfirmPopup(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancella ordine</Modal.Title>
        </Modal.Header>
        <Modal.Body>Sei sicuro di voler cancellare questo ordine?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmPopup(false)}>Annulla</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Conferma</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default OrderList;
