import { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import {
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaBoxOpen,
  FaMapMarkerAlt,
} from "react-icons/fa";

import MyNavbar from "./MyNavbar";
import "../css/TakeOrder.css";
import { submitOrder } from "../api/API.mjs";
import { setHours, setMinutes } from "date-fns";
import { it } from "date-fns/locale";   

function TakeOrder({ handleLogoutWrapper, user, isAuth, isAdmin, setConfirmedOrder }) {
  const [form, setForm] = useState({
    nome: user?.name || "",
    cognome: user?.surname || "",
    telefono: user?.phoneNumber || "",
    quantita: "",
    tipologia: "",
    indirizzo: "",
    data: "",
    orario: "",
  });

  const [errors, setErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showTipologiaError, setShowTipologiaError] = useState(false);

  const navigate = useNavigate();

  // Gestione input generici
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Gestione data
  const handleDateChange = (date) =>
    setForm((prev) => ({
      ...prev,
      data: date ? date.toISOString().split("T")[0] : "",
    }));

  // Gestione orario
  const handleTimeChange = (date) =>
    setForm((prev) => ({
      ...prev,
      orario: date ? date.toTimeString().slice(0, 5) : "",
    }));

  // Validazione manuale
  const validate = () => {
    const newErrors = {};

    if (!isAuth) {
      if (!form.nome.trim()) newErrors.nome = "Il nome è obbligatorio";
      if (!form.cognome.trim()) newErrors.cognome = "Il cognome è obbligatorio";
      if (!form.telefono.trim()) {
        newErrors.telefono = "Il numero di telefono è obbligatorio";
      } else if (!/^\d{10}$/.test(form.telefono)) {
        newErrors.telefono = "Numero di telefono non valido";
      } else if (!/^3/.test(form.telefono)) {
        newErrors.telefono = "Il numero deve iniziare con 3";
      }
    }

    if (!form.quantita.trim())
      newErrors.quantita = "Inserisci una quantità";
    else if (isNaN(form.quantita) || Number(form.quantita) <= 0)
      newErrors.quantita = "La quantità deve essere un numero positivo";

    if (!form.tipologia.trim())
      newErrors.tipologia = "Seleziona una tipologia";

    if (!form.indirizzo.trim())
      newErrors.indirizzo = "L’indirizzo è obbligatorio";

    if (!form.data.trim())
      newErrors.data = "La data è obbligatoria";

    if (!form.orario.trim())
      newErrors.orario = "L’orario è obbligatorio";

    return newErrors;
  };

  // Tentativo invio form
  const handleTrySubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setShowTipologiaError(!form.tipologia);

    if (Object.keys(validationErrors).length === 0) setShowSummary(true);
  };

  // Invio ordine
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

  // Input custom DatePicker
  const CustomDateInput = forwardRef(({ value, onClick, placeholder, hasError }, ref) => (
    <button
      type="button"
      className={`calendar-btn btn btn-outline-primary d-flex align-items-center ${hasError ? "is-invalid" : ""}`}
      onClick={onClick}
      ref={ref}
    >
      <FaCalendarAlt className="me-1" />
      <span>{value || placeholder}</span>
    </button>
  ));

  // Wrapper tooltip
  const withTooltip = (condition, message, children) =>
    condition ? (
      <Tippy content={message} placement="top" arrow trigger="mouseenter focus">
        <div>{children}</div>
      </Tippy>
    ) : (
      children
    );

  // Input con tooltip
  const renderInputWithTooltip = (name, type, placeholder) =>
    withTooltip(
      errors[name],
      errors[name],
      <Form.Control
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        isInvalid={!!errors[name]}
        placeholder={placeholder}
      />
    );

  // DatePicker
  const renderDatePickerWithTooltip = () =>
    withTooltip(
      errors.data,
      errors.data,
      <DatePicker
        selected={form.data ? new Date(form.data) : null}
        onChange={handleDateChange}
        dateFormat="dd/MM/yyyy"
        placeholderText="Seleziona una data"
        minDate={new Date()}
        customInput={<CustomDateInput hasError={!!errors.data} />}
      />
    );

  // TimePicker

  const renderTimePickerWithTooltip = () => {
  const allowedTimes = [];
  for (let h = 8; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      allowedTimes.push(setHours(setMinutes(new Date(1970, 0, 1), m), h));
    }
  }

  return withTooltip(
    errors.orario,
    errors.orario,
    <DatePicker
      selected={form.orario ? new Date(`1970-01-01T${form.orario}:00`) : null}
      onChange={handleTimeChange}
      showTimeSelect
      showTimeSelectOnly
      includeTimes={allowedTimes}
      timeCaption="Orario"
      dateFormat="HH:mm"       // 👈 forza 24h
      locale={it}              // 👈 usa localizzazione italiana
      placeholderText="Seleziona un orario"
      className={`form-control ${errors.orario ? "is-invalid" : ""}`}
      calendarClassName="react-datepicker datepicker-orario"
    />
  );
};




  // Bottoni tipologia
  const renderTipologiaButtons = () => {
    const options = [
      { key: "consumazioni", label: "Per consumazioni" },
      { key: "raffreddare", label: "Per raffreddare" },
    ];

    const hasError = !!errors.tipologia && showTipologiaError;

    return (
      <div className="d-flex gap-2 mb-2">
        {options.map((opt) => {
          const button = (
            <div
              key={opt.key}
              className={`tipologia-btn ${form.tipologia === opt.key ? "selected" : ""} ${hasError ? "is-invalid" : ""}`}
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  tipologia: prev.tipologia === opt.key ? "" : opt.key,
                }))
              }
            >
              {opt.label}
            </div>
          );

          return withTooltip(hasError, errors.tipologia, button);
        })}
      </div>
    );
  };

  // Campi form
  const renderFormFields = () => (
    <div className="cards-wrapper row">
      {!isAuth && (
        <div className="tk-order-card card-summary col">
          <h3 className="cards-header">Informazioni di recapito</h3>
          {["nome", "cognome", "telefono"].map((field, i) => (
            <Form.Group className="form-group" key={i}>
              <Form.Label>
                {field.charAt(0).toUpperCase() + field.slice(1)}:{" "}
                {field === "telefono" ? <FaPhone className="icon" /> : <FaUser className="icon" />}
              </Form.Label>
              {renderInputWithTooltip(field, "text", field)}
            </Form.Group>
          ))}
        </div>
      )}

      <div className="tk-order-card card-summary col">
        <h3 className="cards-header">Informazioni di consegna</h3>

        <Form.Group className="form-group">
          <Form.Label>
            Quantità (kg): <FaBoxOpen className="icon" />
          </Form.Label>
          {renderInputWithTooltip("quantita", "number", "quantità")}
        </Form.Group>

        <Form.Group className="form-group">
          <Form.Label>
            Tipologia: <FaBoxOpen className="icon" />
          </Form.Label>
          {renderTipologiaButtons()}
        </Form.Group>

        <Form.Group className="form-group">
          <Form.Label>
            Indirizzo: <FaMapMarkerAlt className="icon" />
          </Form.Label>
          {renderInputWithTooltip("indirizzo", "text", "indirizzo")}
        </Form.Group>

        <Form.Group className="form-group">
          <div className="row g-2">
            <div className="col">
              <Form.Label>
                Data di consegna: <FaCalendarAlt className="icon" />
              </Form.Label>
              {renderDatePickerWithTooltip()}
            </div>
            <div className="col">
              <Form.Label>Orario di consegna:</Form.Label>
              {renderTimePickerWithTooltip()}
            </div>
          </div>
        </Form.Group>
      </div>
    </div>
  );

  // Riepilogo ordine
  const renderSummary = () => {
    const summaryData = [
      { icon: FaUser, label: "Nome", value: form.nome || user?.name },
      { icon: FaUser, label: "Cognome", value: form.cognome || user?.surname },
      { icon: FaPhone, label: "Telefono", value: form.telefono || user?.phoneNumber },
      { icon: FaBoxOpen, label: "Quantità", value: form.quantita + " kg" },
      { icon: FaBoxOpen, label: "Tipologia", value: form.tipologia === "consumazioni" ? "Per consumazioni" : "Per raffreddare" },
      { icon: FaMapMarkerAlt, label: "Indirizzo", value: form.indirizzo },
      { icon: FaCalendarAlt, label: "Data", value: form.data },
      { icon: FaCalendarAlt, label: "Orario", value: form.orario },
    ];

    return (
      <div className="tk-page">
        <MyNavbar handleLogoutWrapper={handleLogoutWrapper} isAuth={isAuth} role={isAdmin ? "admin" : "customer"} />
        <div className="tk-summary-header">
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
      ) : (
        renderSummary()
      )}
    </>
  );
}

export default TakeOrder;
