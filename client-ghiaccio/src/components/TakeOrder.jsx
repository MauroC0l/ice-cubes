import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";

import MyNavbar from "./MyNavbar";
import "../css/TakeOrder.css";

function TakeOrder({ handleLogoutWrapper, name, isAuth, isAdmin }) {
  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    telefono: "",
    quantita: "",
    indirizzo: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.nome.trim()) newErrors.nome = "Il nome è obbligatorio";
    if (!form.cognome.trim()) newErrors.cognome = "Il cognome è obbligatorio";

    if (!form.telefono.trim()) {
      newErrors.telefono = "Il numero di telefono è obbligatorio";
    } else if (!/^\d{8,15}$/.test(form.telefono)) {
      newErrors.telefono = "Numero di telefono non valido (8-15 cifre)";
    } else if (!/^3/.test(form.telefono)) {
      newErrors.telefono = "Il numero di telefono deve iniziare con 3";
    }

    if (!form.quantita.trim()) {
      newErrors.quantita = "Inserisci una quantità";
    } else if (isNaN(form.quantita) || form.quantita <= 0) {
      newErrors.quantita = "La quantità deve essere un numero positivo";
    }

    if (!form.indirizzo.trim()) newErrors.indirizzo = "L’indirizzo è obbligatorio";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log("✅ Dati inviati:", form);
      alert("Ordine inviato con successo!");
      // Qui puoi chiamare una API per inviare i dati
    }
  };

  return (
    <div className="tk-page">
      <MyNavbar
        handleLogoutWrapper={handleLogoutWrapper}
        isAuth={isAuth}
        role={isAdmin ? "admin" : "customer"}
      />

      <div className="tk-header">
        <h1>{name || "Ospite"} effettua un ordine</h1>
      </div>

      <div className="tk-order-content">
        <form className="order-form" onSubmit={handleSubmit}>
          <div className="cards-wrapper">
            {/* Card informazioni recapito */}
            <div className="tk-order-card">
              <h3 className="cards-header">Informazioni di recapito</h3>

              <div className="form-group">
                <label>Nome:</label>
                <Form.Control
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  isInvalid={!!errors.nome}
                  placeholder="Inserisci il nome"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nome}
                </Form.Control.Feedback>
              </div>

              <div className="form-group">
                <label>Cognome:</label>
                <Form.Control
                  type="text"
                  name="cognome"
                  value={form.cognome}
                  onChange={handleChange}
                  isInvalid={!!errors.cognome}
                  placeholder="Inserisci il cognome"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.cognome}
                </Form.Control.Feedback>
              </div>

              <div className="form-group">
                <label>Numero di telefono:</label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  isInvalid={!!errors.telefono}
                  placeholder="Inserisci numero di telefono"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.telefono}
                </Form.Control.Feedback>
              </div>
            </div>

            {/* Card informazioni consegna */}
            <div className="tk-order-card">
              <h3 className="cards-header">Informazioni di consegna</h3>

              <div className="form-group">
                <label>Quantità (kg):</label>
                <Form.Control
                  type="number"
                  name="quantita"
                  value={form.quantita}
                  onChange={handleChange}
                  isInvalid={!!errors.quantita}
                  placeholder="Inserisci quantità"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.quantita}
                </Form.Control.Feedback>
              </div>

              <div className="form-group">
                <label>Indirizzo di consegna:</label>
                <Form.Control
                  type="text"
                  name="indirizzo"
                  value={form.indirizzo}
                  onChange={handleChange}
                  isInvalid={!!errors.indirizzo}
                  placeholder="Inserisci indirizzo"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.indirizzo}
                </Form.Control.Feedback>
              </div>
            </div>
          </div>

          {/* Pulsanti */}
          <div className="order-buttons">
            <Button type="submit" variant="primary">
              Effettua ordine
            </Button>
            <Button variant="secondary" onClick={() => navigate("/")}>
              Annulla ordine
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TakeOrder;
