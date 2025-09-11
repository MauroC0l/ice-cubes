import { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import { FaCalendarAlt, FaUser, FaPhone, FaBoxOpen, FaMapMarkerAlt } from "react-icons/fa";

import MyNavbar from "./MyNavbar";
import "../css/TakeOrder.css";
import { submitOrder } from "../api/API.mjs";

function TakeOrder({ handleLogoutWrapper, user, isAuth, isAdmin, setConfirmedOrder }) {
  const [form, setForm] = useState({
    nome: user?.name || "",
    cognome: user?.surname || "",
    telefono: user?.phoneNumber || "",
    quantita: "",
    indirizzo: "",
    data: "",
  });

  const [errors, setErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setForm((prev) => ({ ...prev, data: date ? date.toISOString().split("T")[0] : "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!isAuth) {
      if (!form.nome.trim()) newErrors.nome = "Il nome è obbligatorio";
      if (!form.cognome.trim()) newErrors.cognome = "Il cognome è obbligatorio";
      if (!form.telefono.trim()) newErrors.telefono = "Il numero di telefono è obbligatorio";
      else if (!/^\d{10}$/.test(form.telefono)) newErrors.telefono = "Numero di telefono non valido";
      else if (!/^3/.test(form.telefono)) newErrors.telefono = "Il numero deve iniziare con 3";
    }
    if (!form.quantita.trim()) newErrors.quantita = "Inserisci una quantità";
    else if (isNaN(form.quantita) || Number(form.quantita) <= 0) newErrors.quantita = "La quantità deve essere un numero positivo";
    if (!form.indirizzo.trim()) newErrors.indirizzo = "L’indirizzo è obbligatorio";
    if (!form.data.trim()) newErrors.data = "La data è obbligatoria";
    return newErrors;
  };

  const handleTrySubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) setShowSummary(true);
  };

  const handleSubmitOrder = async () => {
    try {
      await submitOrder(form);
      setShowSummary(false);
      setShowToast(true);
      setConfirmedOrder(true);
      setTimeout(() => setShowToast(false), 1000);
      navigate("/");
    } catch (err) {
      alert("Errore invio ordine: " + err);
    }
  };

  const CustomDateInput = forwardRef(({ value, onClick, placeholder, hasError }, ref) => (
    <button
      type="button"
      className={`btn btn-outline-primary calendar-btn d-flex align-items-center ${hasError ? "is-invalid" : ""}`}
      onClick={onClick}
      ref={ref}
    >
      <FaCalendarAlt style={{ fontSize: "1.25rem", marginRight: "4px" }} />
      <span>{value || placeholder}</span>
    </button>
  ));

  const renderInputWithTooltip = (name, type, placeholder) => {
    const hasError = !!errors[name];

    return hasError ? (
      <Tippy
        content={errors[name]}
        placement="top"
        arrow={true}
        trigger="mouseenter focus"
      >
        <div>
          <Form.Control
            type={type}
            name={name}
            value={form[name]}
            onChange={handleChange}
            isInvalid={hasError}
            placeholder={placeholder}
          />
        </div>
      </Tippy>
    ) : (
      <Form.Control
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
      />
    );
  };


  const renderDatePickerWithTooltip = () => {
    const hasError = !!errors.data;

    return (
      <Tippy
        content={hasError ? errors.data : ""}
        placement="top"
        arrow={true}
        trigger={hasError ? "mouseenter focus" : "manual"} // tooltip attivo solo se c'è errore
      >
        <div>
          <DatePicker
            selected={form.data ? new Date(form.data) : null}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleziona una data"
            minDate={new Date()}
            customInput={<CustomDateInput placeholder="Seleziona una data" hasError={hasError} />}
          />
        </div>
      </Tippy>
    );
  };



  const renderFormFields = () => (
    <div className="cards-wrapper row">
      {!isAuth && (
        <div className="tk-order-card card-summary col">
          <h3 className="cards-header">Informazioni di recapito</h3>
          <Form.Group className="form-group">
            <Form.Label>Nome: <FaUser className="icon" /></Form.Label>
            {renderInputWithTooltip("nome", "text", "Nome")}
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label>Cognome: <FaUser className="icon" /></Form.Label>
            {renderInputWithTooltip("cognome", "text", "Cognome")}
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label>Telefono: <FaPhone className="icon" /></Form.Label>
            {renderInputWithTooltip("telefono", "text", "Telefono")}
          </Form.Group>
        </div>
      )}
      <div className="tk-order-card card-summary col">
        <h3 className="cards-header">Informazioni di consegna</h3>
        <Form.Group className="form-group">
          <Form.Label>Quantità (kg): <FaBoxOpen className="icon" /></Form.Label>
          {renderInputWithTooltip("quantita", "number", "Quantità")}
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>Indirizzo: <FaMapMarkerAlt className="icon" /></Form.Label>
          {renderInputWithTooltip("indirizzo", "text", "Indirizzo")}
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>Data di consegna: <FaCalendarAlt className="icon" /></Form.Label>
          {renderDatePickerWithTooltip()}
        </Form.Group>
      </div>
    </div>
  );

  const renderSummary = () => {
    const summaryData = isAuth
      ? [
        { icon: FaUser, label: "Nome", value: user.name },
        { icon: FaUser, label: "Cognome", value: user.surname },
        { icon: FaPhone, label: "Telefono", value: user.phone },
        { icon: FaBoxOpen, label: "Quantità", value: form.quantita + " kg" },
        { icon: FaMapMarkerAlt, label: "Indirizzo", value: form.indirizzo },
        { icon: FaCalendarAlt, label: "Data", value: form.data },
      ]
      : [
        { icon: FaUser, label: "Nome", value: form.nome },
        { icon: FaUser, label: "Cognome", value: form.cognome },
        { icon: FaPhone, label: "Telefono", value: form.telefono },
        { icon: FaBoxOpen, label: "Quantità", value: form.quantita + " kg" },
        { icon: FaMapMarkerAlt, label: "Indirizzo", value: form.indirizzo },
        { icon: FaCalendarAlt, label: "Data", value: form.data },
      ];

    return (
      <div className="tk-page">
        <MyNavbar handleLogoutWrapper={handleLogoutWrapper} isAuth={isAuth} role={isAdmin ? "admin" : "customer"} />
        <div className="tk-header">
          <h1>Riepilogo ordine</h1>
        </div>
        <div className="tk-order-summary card-summary">
          {summaryData.map((item, idx) => (
            <div className="summary-row" key={idx}>
              <item.icon className="icon" /> <span>{item.label}:</span> <strong>{item.value}</strong>
            </div>
          ))}
          <div className="order-buttons">
            <Button variant="primary" onClick={handleSubmitOrder}>Conferma</Button>
            <Button variant="secondary" onClick={() => setShowSummary(false)}>Modifica</Button>
            <Button variant="danger" onClick={() => navigate("/")}>Annulla</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showToast && <div className="order-confirm-toast">Il tuo ordine è stato confermato!</div>}
      {!showSummary ? (
        <div className="tk-page">
          <MyNavbar handleLogoutWrapper={handleLogoutWrapper} isAuth={isAuth} role={isAdmin ? "admin" : "customer"} />
          <div className="tk-header">
            <h1>{user?.name ? `Ciao ${user.name}, effettua un ordine` : "Ospite, effettua un ordine"}</h1>
          </div>
          <div className="tk-order-content">
            <Form className="order-form" onSubmit={handleTrySubmit}>
              {renderFormFields()}
              <div className="order-buttons">
                <Button type="submit" variant="primary">Effettua ordine</Button>
                <Button variant="secondary" onClick={() => navigate("/")}>Annulla ordine</Button>
              </div>
            </Form>
          </div>
        </div>
      ) : renderSummary()}
    </>
  );
}

export default TakeOrder;
