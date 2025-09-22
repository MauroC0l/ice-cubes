import { useState, useEffect, forwardRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Spinner } from "react-bootstrap";
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
  FaClock,
} from "react-icons/fa";

import MyNavbar from "./MyNavbar";
import "../css/TakeOrder.css";
import { userSubmitOrder, userUpdateOrder } from "../api/API.mjs";
import { setHours, setMinutes } from "date-fns";
import { it } from "date-fns/locale";

function TakeOrder({ handleLogoutWrapper, user, isAuth, isAdmin, setConfirmedOrder }) {
  const location = useLocation();
  const navigate = useNavigate();

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
  const [showTipologiaError, setShowTipologiaError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // stato caricamento globale

  // Popola il form se viene passato un ordine (modifica)
  useEffect(() => {
    const order = location.state?.order;
    if (!order) return;

    let formattedDate = "";
    if (order.delivery_date) {
      let parsedDate;
      if (order.delivery_date.includes("-")) {
        const parts = order.delivery_date.split("-");
        parsedDate = parts[0].length === 4
          ? new Date(order.delivery_date) // YYYY-MM-DD
          : new Date(parts[2], parts[1] - 1, parts[0]); // DD-MM-YYYY
      } else if (order.delivery_date.includes("/")) {
        const parts = order.delivery_date.split("/");
        parsedDate = new Date(parts[2], parts[1] - 1, parts[0]);
      }
      formattedDate = formatDate(parsedDate);
    }

    setForm(prev => ({
      nome: order.nome || user?.name || prev.nome,
      cognome: order.cognome || user?.surname || prev.cognome,
      telefono: order.telefono || user?.phoneNumber || prev.telefono,
      quantita: order.quantity ? String(order.quantity) : prev.quantita,
      tipologia: order.ice_type || prev.tipologia,
      indirizzo: order.delivery_address || prev.indirizzo,
      data: formattedDate || prev.data,
      orario: order.delivery_hour || prev.orario,
    }));
  }, [location.state, user]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((date) => {
    setForm(prev => ({
      ...prev,
      data: date ? formatDate(date) : "",
    }));
  }, []);

  const handleTimeChange = useCallback((date) => {
    setForm(prev => ({
      ...prev,
      orario: date ? date.toTimeString().slice(0, 5) : "",
    }));
  }, []);

  const validate = useCallback(() => {
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

    if (!String(form.quantita).trim()) {
      newErrors.quantita = "La quantità è obbligatoria";
    } else if (isNaN(form.quantita) || Number(form.quantita) <= 0) {
      newErrors.quantita = "La quantità deve essere un numero positivo";
    }

    if (!form.tipologia.trim()) newErrors.tipologia = "Seleziona una tipologia";

    if (!String(form.indirizzo).trim()) newErrors.indirizzo = "L’indirizzo è obbligatorio";

    if (!form.data.trim()) newErrors.data = "La data è obbligatoria";

    if (!form.orario.trim()) newErrors.orario = "L’orario è obbligatorio";

    if (form.data && form.orario) {
      try {
        const [day, month, year] = form.data.split("-").map(Number);
        const [hour, minute] = form.orario.split(":").map(Number);

        const selectedDate = new Date(year, month - 1, day, hour, minute);
        const now = new Date();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const chosenDay = new Date(year, month - 1, day);
        chosenDay.setHours(0, 0, 0, 0);

        if (chosenDay.getTime() === today.getTime() && selectedDate.getTime() <= now.getTime()) {
          newErrors.data = "La data e l’orario devono essere futuri";
        }
      } catch (e) {
        newErrors.data = "Data o orario non validi";
      }
    }

    return newErrors;
  }, [form, isAuth]);

  const handleSubmitOrder = useCallback(async (e) => {
    if (e) e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    setShowTipologiaError(!form.tipologia);

    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      const finalForm = { ...form };
      if (form.data) {
        const parts = form.data.split("-");
        const normalizedDate = new Date(parts[2], parts[1] - 1, parts[0]);
        finalForm.data = formatDate(normalizedDate);
      }

      if (!location.state?.order) {
        await userSubmitOrder(finalForm);
      } else {
        await userUpdateOrder(finalForm, location.state.order.id);
      }

      setConfirmedOrder(true);
      navigate("/");
    } catch (err) {
      alert("Errore invio ordine: " + err);
    } finally {
      setIsLoading(false);
    }
  }, [form, validate, location.state, navigate, setConfirmedOrder]);

  const formatDate = useCallback((dateObj) => {
    if (!(dateObj instanceof Date) || isNaN(dateObj)) return "";
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

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

  const CustomTimeInput = forwardRef(({ value, onClick, placeholder, hasError }, ref) => (
    <button
      type="button"
      className={`calendar-btn btn btn-outline-primary d-flex align-items-center ${hasError ? "is-invalid" : ""}`}
      onClick={onClick}
      ref={ref}
    >
      <FaClock className="me-1" />
      <span>{value || placeholder}</span>
    </button>
  ));

  const withTooltip = useCallback((condition, message, children, key) => {
    return condition ? (
      <Tippy key={key} content={message} placement="top" arrow trigger="mouseenter focus">
        <div>{children}</div>
      </Tippy>
    ) : (
      <div key={key}>{children}</div>
    );
  }, []);

  const renderInputWithTooltip = useCallback((name, type, placeholder, key) => {
    return withTooltip(
      errors[name],
      errors[name],
      <Form.Control
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        isInvalid={!!errors[name]}
        placeholder={placeholder}
      />,
      key
    );
  }, [errors, form, handleChange, withTooltip]);

  const renderDatePickerWithTooltip = () => {
    return withTooltip(
      errors.data,
      errors.data,
      <DatePicker
        selected={form.data ? new Date(form.data.split("-").reverse().join("-")) : null}
        onChange={handleDateChange}
        dateFormat="dd/MM/yyyy"
        placeholderText="Seleziona una data"
        minDate={new Date()}
        customInput={<CustomDateInput hasError={!!errors.data} />}
        portalTarget={document.body}
        popperPlacement="top"
      />,
      "date-picker"
    );
  };

  const renderTimePickerWithTooltip = () => {
    const allowedTimes = useMemo(() => {
      const times = [];
      for (let h = 8; h <= 23; h++) {
        for (let m = 0; m < 60; m += 30) {
          times.push(setHours(setMinutes(new Date(1970, 0, 1), m), h));
        }
      }
      return times;
    }, []);

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
        dateFormat="HH:mm"
        locale={it}
        placeholderText="Seleziona un orario"
        calendarClassName="react-datepicker datepicker-orario"
        customInput={<CustomTimeInput hasError={!!errors.orario} />}
        portalTarget={document.body}
        popperPlacement="top"
      />,
      "time-picker"
    );
  };

  const renderTipologiaButtons = useMemo(() => {
    const options = [
      { key: "consumazioni", label: "Per consumazioni" },
      { key: "raffreddare", label: "Per raffreddare" },
    ];
    const hasError = !!errors.tipologia && showTipologiaError;

    return (
      <div className="d-flex gap-2 mb-2">
        {options.map(opt => {
          const button = (
            <div
              className={`tipologia-btn ${form.tipologia === opt.key ? "selected" : ""} ${hasError ? "is-invalid" : ""}`}
              onClick={() =>
                setForm(prev => ({
                  ...prev,
                  tipologia: prev.tipologia === opt.key ? "" : opt.key,
                }))
              }
            >
              {opt.label}
            </div>
          );
          return withTooltip(hasError, errors.tipologia, button, opt.key);
        })}
      </div>
    );
  }, [form.tipologia, errors.tipologia, showTipologiaError, withTooltip]);

  if (isLoading) {
    return (
      <div className="auth-loading-container">
        <div className="spinner" role="status" aria-label="Loading spinner" />
        Caricamento...
      </div>
    );
  }

  return (
    <div className="tk-page">
      <MyNavbar handleLogoutWrapper={handleLogoutWrapper} isAuth={isAuth} role={isAdmin ? "admin" : "customer"} />
      <div className="tk-header">
        <h1>{user?.name ? `Ciao ${user.name}, effettua un ordine` : "Ospite, effettua un ordine"}</h1>
      </div>

      <Form className="tk-order-summary card-summary" onSubmit={handleSubmitOrder}>
        {!isAuth && (
          <>
            {["nome", "cognome", "telefono"].map(field => (
              <Form.Group className="summary-row" key={field}>
                {field === "telefono" ? <FaPhone className="icon" /> : <FaUser className="icon" />}
                <span>{field.charAt(0).toUpperCase() + field.slice(1)}:</span>
                {renderInputWithTooltip(field, "text", field, field)}
              </Form.Group>
            ))}
          </>
        )}

        <Form.Group className="summary-row">
          <FaBoxOpen className="icon" />
          <span>Quantità (kg):</span>
          {renderInputWithTooltip("quantita", "text", "quantità", "quantita")}
        </Form.Group>

        <Form.Group className="summary-row">
          <FaBoxOpen className="icon" />
          <span>Tipologia:</span>
          {renderTipologiaButtons}
        </Form.Group>

        <Form.Group className="summary-row">
          <FaMapMarkerAlt className="icon" />
          <span>Indirizzo:</span>
          {renderInputWithTooltip("indirizzo", "text", "indirizzo", "indirizzo")}
        </Form.Group>

        <Form.Group className="summary-row">
          <FaCalendarAlt className="icon" />
          <span>Data di consegna:</span>
          {renderDatePickerWithTooltip()}
        </Form.Group>

        <Form.Group className="summary-row">
          <FaClock className="icon" />
          <span>Orario di consegna:</span>
          {renderTimePickerWithTooltip()}
        </Form.Group>

        <div className="order-buttons d-flex gap-2 mt-3">
          <Button type="submit" variant="primary"> Conferma </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/")}> Annulla </Button>
        </div>
      </Form>
    </div>
  );
}

export default TakeOrder;
