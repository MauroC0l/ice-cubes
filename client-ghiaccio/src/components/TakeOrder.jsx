import { useState } from "react";
import MyNavbar from "./MyNavbar";
import { Button } from "react-bootstrap";

import "../css/TakeOrder.css";
import { Navigate, useNavigate } from "react-router-dom";


function TakeOrder({ handleLogoutWrapper, username, isAuth, isAdmin }) {
  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    telefono: "",
    quantita: "",
    indirizzo: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function validate() {
    let newErrors = {};

    if (!form.nome.trim()) newErrors.nome = "Il nome è obbligatorio";
    if (!form.cognome.trim()) newErrors.cognome = "Il cognome è obbligatorio";

    if (!form.telefono.trim()) {
      newErrors.telefono = "Il numero di telefono è obbligatorio";
    } else if (!/^\d{8,15}$/.test(form.telefono)) {
      newErrors.telefono = "Numero di telefono non valido (8-15 cifre)";
    }

    if (!form.quantita.trim()) {
      newErrors.quantita = "Inserisci una quantità";
    } else if (isNaN(form.quantita) || form.quantita <= 0) {
      newErrors.quantita = "La quantità deve essere un numero positivo";
    }

    if (!form.indirizzo.trim()) newErrors.indirizzo = "L’indirizzo è obbligatorio";

    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log("✅ Dati inviati:", form);
      alert("Ordine inviato con successo!");
      // qui potresti chiamare una API per inviare i dati
    }
  }

  return (
    <>
    <div className="tk-page"> 
      <MyNavbar
        handleLogoutWrapper={handleLogoutWrapper}
        isAuth={isAuth}
        role={isAdmin ? "admin" : "customer"}
      />

      
        <div className="tk-header">
          <h1>{username || "Ospite"} effettua un ordine</h1>
        </div>

        <div className="tk-order-content">
          <form className="order-form" onSubmit={handleSubmit}>
            <div className="cards-wrapper">
              <div className="tk-order-card">
                <h3 className="cards-header">Informazioni di recapito</h3>

                <div className="form-group">
                  <label>Nome:</label>
                  <input
                    type="text"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                  />
                  {errors.nome && <span className="error">{errors.nome}</span>}
                </div>

                <div className="form-group">
                  <label>Cognome:</label>
                  <input
                    type="text"
                    name="cognome"
                    value={form.cognome}
                    onChange={handleChange}
                  />
                  {errors.cognome && (
                    <span className="error">{errors.cognome}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Numero di telefono:</label>
                  <input
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                  />
                  {errors.telefono && (
                    <span className="error">{errors.telefono}</span>
                  )}
                </div>
              </div>

              <div className="tk-order-card">
                <h3 className="cards-header">Informazioni di consegna</h3>

                <div className="form-group">
                  <label>Quantità (kg):</label>
                  <input
                    type="number"
                    name="quantita"
                    value={form.quantita}
                    onChange={handleChange}
                  />
                  {errors.quantita && (
                    <span className="error">{errors.quantita}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Indirizzo di consegna:</label>
                  <input
                    type="text"
                    name="indirizzo"
                    value={form.indirizzo}
                    onChange={handleChange}
                  />
                  {errors.indirizzo && (
                    <span className="error">{errors.indirizzo}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Pulsanti centrati in basso */}
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
    </>
  );
}

export default TakeOrder;
