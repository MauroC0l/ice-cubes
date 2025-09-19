import { useState, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card, InputGroup } from 'react-bootstrap';
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import MyFont from './MyFont';
import '../css/Register.css';
import { registerHandler } from '../api/API.mjs';

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ✅ Soluzione 2: componente wrapper con forwardRef
const TooltipWrapper = forwardRef(({ children, ...props }, ref) => (
  <span ref={ref} {...props} className="d-block">
    {children}
  </span>
));

function Register({ makeAuth, setUser, logo }) {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Il nome è obbligatorio";
    if (!form.surname.trim()) newErrors.surname = "Il cognome è obbligatorio";
    if (!form.phoneNumber.trim()) newErrors.phoneNumber = "Il numero di telefono è obbligatorio";
    if (!/^3\d{9}$/.test(form.phoneNumber)) newErrors.phoneNumber = "Il numero di telefono non è valido";
    if (!form.email.trim() || !isValidEmail(form.email)) newErrors.email = "Email non valida";
    if (!form.password) newErrors.password = "Password obbligatoria";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Le password non corrispondono";
    return newErrors;
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const user = await registerHandler(
        form.name,
        form.surname,
        form.phoneNumber,
        form.email,
        form.password,
        form.confirmPassword
      );
      makeAuth(true);
      setUser(user);
      navigate("/");
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.message || "Registration failed";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  // Tooltip con forwardRef
  const withTooltip = (condition, message, children) =>
    condition ? (
      <Tippy content={message} placement="top" arrow trigger="mouseenter focus">
        <TooltipWrapper>{children}</TooltipWrapper>
      </Tippy>
    ) : (
      children
    );

  return (
    <div className="register-page">
      <Container className="register-container">
        <Card className="register-card">
          <Card.Body>
            <div className="text-center mb-4">
              <img src={logo} alt="Ice Cube Logo" className="register-logo" />
              <MyFont>
                <h1 className="register-title">Crea un nuovo account</h1>
              </MyFont>
            </div>

            <Form onSubmit={handleRegister} noValidate>
              <Form.Group controlId="register-name" className="mb-3">
                {withTooltip(
                  errors.name,
                  errors.name,
                  <Form.Control
                    type="text"
                    size="lg"
                    placeholder="Nome"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                    required
                  />
                )}
              </Form.Group>

              <Form.Group controlId="register-surname" className="mb-3">
                {withTooltip(
                  errors.surname,
                  errors.surname,
                  <Form.Control
                    type="text"
                    size="lg"
                    placeholder="Cognome"
                    name="surname"
                    value={form.surname}
                    onChange={handleChange}
                    isInvalid={!!errors.surname}
                    required
                  />
                )}
              </Form.Group>

              <Form.Group controlId="register-email" className="mb-3">
                {withTooltip(
                  errors.email,
                  errors.email,
                  <Form.Control
                    type="text"
                    size="lg"
                    placeholder="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    required
                  />
                )}
              </Form.Group>

              <Form.Group controlId="register-phoneNumber" className="mb-3">
                {withTooltip(
                  errors.phoneNumber,
                  errors.phoneNumber,
                  <Form.Control
                    type="text"
                    size="lg"
                    placeholder="Numero di telefono"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    isInvalid={!!errors.phoneNumber}
                    required
                  />
                )}
              </Form.Group>

              <Form.Group controlId="register-password" className="mb-3">
                {withTooltip(
                  errors.password,
                  errors.password,
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      size="lg"
                      placeholder="Password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      required
                    />
                    <Button
                      variant="outline-light"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(prev => !prev)}
                      type="button"
                    >
                      {showPassword ? 'Nascondi' : 'Mostra'}
                    </Button>
                  </InputGroup>
                )}
              </Form.Group>

              <Form.Group controlId="register-confirm-password" className="mb-3">
                {withTooltip(
                  errors.confirmPassword,
                  errors.confirmPassword,
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      size="lg"
                      placeholder="Reinserisci la password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!errors.confirmPassword}
                      required
                    />
                    <Button
                      variant="outline-light"
                      className="toggle-password-btn"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      type="button"
                    >
                      {showConfirmPassword ? 'Nascondi' : 'Mostra'}
                    </Button>
                  </InputGroup>
                )}
              </Form.Group>

              {errors.general && (
                <div className="text-danger mb-3">
                  <MyFont>{errors.general}</MyFont>
                </div>
              )}

              <div className="d-grid mb-3">
                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                  {loading ? '...' : 'Registrati'}
                </Button>
              </div>
            </Form>

            {/* ✅ Footer aggiornato */}
            <div className="register-footer">
              <span>Sei già iscritto? </span>
              <Button
                variant="link"
                className="p-0 register-link"
                onClick={() => navigate("/login")}
              >
                Accedi
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Register;
