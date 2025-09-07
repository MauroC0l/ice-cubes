import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";

import MyNavbar from "./MyNavbar";
import "../css/TakeOrder.css";

import { submitOrder } from "../api/API.mjs";

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

    if (!isAuth) {
      if (!form.nome.trim()) newErrors.nome = "Il nome è obbligatorio";
      if (!form.cognome.trim()) newErrors.cognome = "Il cognome è obbligatorio";

      if (!form.telefono.trim()) {
        newErrors.telefono = "Il numero di telefono è obbligatorio";
      } else if (!/^\d{8,15}$/.test(form.telefono)) {
        newErrors.telefono = "Numero di telefono non valido (8-15 cifre)";
      } else if (!/^3/.test(form.telefono)) {
        newErrors.telefono = "Il numero di telefono deve iniziare con 3";
      }
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
      submitOrder(form)
        .then(() => {
          alert("Ordine inviato con successo!");
          navigate("/");
        })
        .catch((err) => alert("Errore invio ordine: " + err));
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
        <h1>{name ? `Ciao ${name}, effettua un ordine` : "Ospite, effettua un ordine"}</h1>
      </div>

      {!isAuth ? (
        <div className="tk-order-content">
          <Form className="order-form" onSubmit={handleSubmit}>
            <div className="cards-wrapper">
              {/* Card informazioni recapito */}
              <div className="tk-order-card">
                <h3 className="cards-header">Informazioni di recapito</h3>

                <Form.Group className="form-group">
                  <Form.Label>Nome:</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    isInvalid={!!errors.nome}
                    placeholder="Nome"
                  />
                  <Form.Control.Feedback type="invalid">{errors.nome}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="form-group">
                  <Form.Label>Cognome:</Form.Label>
                  <Form.Control
                    type="text"
                    name="cognome"
                    value={form.cognome}
                    onChange={handleChange}
                    isInvalid={!!errors.cognome}
                    placeholder="Cognome"
                  />
                  <Form.Control.Feedback type="invalid">{errors.cognome}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="form-group">
                  <Form.Label>Numero di telefono:</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    isInvalid={!!errors.telefono}
                    placeholder="Telefono"
                  />
                  <Form.Control.Feedback type="invalid">{errors.telefono}</Form.Control.Feedback>
                </Form.Group>
              </div>

              {/* Card informazioni consegna */}
              <div className="tk-order-card">
                <h3 className="cards-header">Informazioni di consegna</h3>

                <Form.Group className="form-group">
                  <Form.Label>Quantità (kg):</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantita"
                    value={form.quantita}
                    onChange={handleChange}
                    isInvalid={!!errors.quantita}
                    placeholder="Quantità"
                  />
                  <Form.Control.Feedback type="invalid">{errors.quantita}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="form-group">
                  <Form.Label>Indirizzo di consegna:</Form.Label>
                  <Form.Control
                    type="text"
                    name="indirizzo"
                    value={form.indirizzo}
                    onChange={handleChange}
                    isInvalid={!!errors.indirizzo}
                    placeholder="Indirizzo"
                  />
                  <Form.Control.Feedback type="invalid">{errors.indirizzo}</Form.Control.Feedback>
                </Form.Group>
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
          </Form>
        </div>
      ) : (
        <div className="tk-order-content">
          <Form className="order-form" onSubmit={handleSubmit}>
            <div className="cards-wrapper">
              {/* Card informazioni consegna */}
              <div className="tk-order-card">
                <h3 className="cards-header">Informazioni di consegna</h3>

                <Form.Group className="form-group">
                  <Form.Label>Quantità (kg):</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantita"
                    value={form.quantita}
                    onChange={handleChange}
                    isInvalid={!!errors.quantita}
                    placeholder="Quantità"
                  />
                  <Form.Control.Feedback type="invalid">{errors.quantita}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="form-group">
                  <Form.Label>Indirizzo di consegna:</Form.Label>
                  <Form.Control
                    type="text"
                    name="indirizzo"
                    value={form.indirizzo}
                    onChange={handleChange}
                    isInvalid={!!errors.indirizzo}
                    placeholder="Indirizzo"
                  />
                  <Form.Control.Feedback type="invalid">{errors.indirizzo}</Form.Control.Feedback>
                </Form.Group>
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
          </Form>
        </div>
      )}
    </div>
  );
}

export default TakeOrder;
