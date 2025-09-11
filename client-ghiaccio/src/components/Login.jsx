import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import InputGroup from 'react-bootstrap/InputGroup';

import '../css/Login.css';
import ServerDownDisplay from './ServerDownDisplay';
import MyFont from './MyFont';
import { loginHandler } from '../api/API.mjs';

function Login({ makeAuth, setUser, logo, serverStatus, setServerStatus, setIsAdmin }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = event.target.elements['sign-in-email-address'].value;
    const password = event.target.elements['sign-in-password'].value;

    setLoading(true);
    setError('');

    try { 
      const user = await loginHandler(email, password, rememberMe);
      makeAuth(true);
      console.log("LOGIN: ",user);
      setUser(user);
      setIsAdmin(user?.role === 'admin');
      setServerStatus(true);
      navigate("/");
    } catch (err) {
      let msg = 'Utete non trovato';
      if (typeof err === 'string') msg = err;
      else if (Array.isArray(err)) msg = err[0];
      else if (err && typeof err === 'object') msg = err.message || JSON.stringify(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!serverStatus) return <ServerDownDisplay />;

  return (
    <div className="login-page">
      <Container className="login-container">
        <Card className="login-card">
          <Card.Body>
            <div className="text-center mb-4">
              <img src={logo} alt="Ice Cube Logo" className="login-logo" />
              <MyFont>
                <h1 className="login-title">Inserisci le tue credenziali</h1>
              </MyFont>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="sign-in-email-address" className="mb-3">
                <Form.Control
                  type="text"
                  size="lg"
                  placeholder="Email"
                  autoComplete="username"
                />
              </Form.Group>

              <Form.Group controlId="sign-in-password" className="mb-3">
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    size="lg"
                    placeholder="Password"
                    autoComplete="current-password"
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
              </Form.Group>

              <Form.Group className="d-flex justify-content-start mb-3" controlId="remember-me">
                <Form.Check
                  label="Resta collegato"
                  checked={rememberMe}                                
                  onChange={(e) => setRememberMe(e.target.checked)}   
                />
              </Form.Group>

              {error && (
                <div className="text-danger mb-3">
                  <MyFont>{error}</MyFont>
                </div>
              )}

              <div className="d-grid mb-3">
                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                  {loading ? '...' : 'Accedi'}
                </Button>

                <Button
                  variant="outline-secondary"
                  size="lg"
                  className="mt-2"
                  disabled={loading}
                  onClick={() => navigate("/")}
                >
                  Accedi come ospite
                </Button>

                <Button
                  variant="outline-info"
                  size="lg"
                  className="mt-2"
                  disabled={loading}
                  onClick={() => navigate("/register")}
                >
                  Registrati
                </Button>
              </div>

              <p className="login-footer">
                <MyFont>&copy; 2024–2025 Ice Cubes</MyFont>
              </p>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Login;
