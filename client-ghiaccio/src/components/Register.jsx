// Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card, InputGroup } from 'react-bootstrap';

import MyFont from './MyFont';
import '../css/Login.css';
import { registerHandler } from '../api/API.mjs';

function isValidEmail(email) {
            // Regex base per email: qualcosa@qualcosa.qualcosa
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

function Register({ makeAuth, setUser, logo }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    const username = event.target.elements['register-username'].value;
    const email = event.target.elements['register-email'].value;
    const password = event.target.elements['register-password'].value;

    setError('');

    // Validazione
    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri");
      return;
    }
    if (!isValidEmail(email)){
        setError("Inserisci un'email valid ");
        return;
    }

    setLoading(true);

    try {
      const user = await registerHandler(username, email, password);
      makeAuth(true);
      setUser(user);
      navigate("/"); // se la registrazione va a buon fine riporta alla home
    } catch (err) {
      let msg = typeof err === "string" ? err : err?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container className="login-container" style={{ maxWidth: '420px' }}>
        <Card className="login-card">
          <Card.Body>
            <div className="text-center mb-4">
              <img src={logo} alt="Ice Cube Logo" className="login-logo" />
              <MyFont>
                <h1 className="login-title">Crea un nuovo account</h1>
              </MyFont>
            </div>

            {/* Disabilita validazione HTML5 */}
            <Form onSubmit={handleRegister} noValidate>
              {/* Username */}
              <Form.Group controlId="register-username" className="mb-3">
                <Form.Control
                  type="text"
                  size="lg"
                  placeholder="Username"
                  required
                />
              </Form.Group>

              {/* Email */}
              <Form.Group controlId="register-email" className="mb-3">
                <Form.Control
                  type="text" // cambiato da "email" a "text" per bloccare la validazione automatica
                  size="lg"
                  placeholder="Email"
                  required
                />
              </Form.Group>

              {/* Password */}
              <Form.Group controlId="register-password" className="mb-3">
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    size="lg"
                    placeholder="Password"
                    required
                  />
                  <Button
                    variant="outline-light"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(prev => !prev)}
                    type="button"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputGroup>
              </Form.Group>

              {/* Error display */}
              {error && (
                <div className="text-danger mb-3">
                  <MyFont>{error}</MyFont>
                </div>
              )}

              {/* Submit button */}
              <div className="d-grid mb-3">
                <Button type="submit" variant="success" size="lg" disabled={loading}>
                  {loading ? '...' : 'Registrati'}
                </Button>

                <Button
                  variant="outline-secondary"
                  size="lg"
                  className="mt-2"
                  onClick={() => navigate("/login")}
                  disabled={loading}
                >
                  Torna al login
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Register;
