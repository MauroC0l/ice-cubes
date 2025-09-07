import MyFont from './MyFont';
import '../css/MyNavbar.css';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Button, Nav }
  from "react-bootstrap";

function MyNavbar({ handleLogoutWrapper, isAuth }) {
  const navigate = useNavigate();

  return (<> {/* Navbar fissata in alto, riutilizzabile su tutte le pagine */}
    <Navbar expand="lg" className="custom-navbar">
      <Container fluid className="position-relative d-flex justify-content-between align-items-center"> {/* Home button on the left */}
        <Nav className="me-auto">
          <Button variant="outline-light" onClick={() => navigate("/")}>Home</Button>
        </Nav> {/* Centered brand title */}
        <Navbar.Brand className="brand-centered d-flex align-items-center">
          <img src="images/logo.png" alt="Logo" style={{ width: '40px', marginRight: '10px' }} />
          <div style={{ textAlign: 'center' }}>
            <MyFont style={{ fontSize: '27px', color: 'white' }}>ICE CUBES</MyFont>
          </div>
        </Navbar.Brand> {/* Right side: Login/Logout button dinamico */}
        <Navbar.Text className="d-flex align-items-center gap-2">
          {isAuth ? (
            <Button variant="outline-light" onClick={handleLogoutWrapper}> Logout </Button>
          ) : (
            <Button variant="outline-light" onClick={() => navigate("/login")}> Login </Button>
          )}
        </Navbar.Text>
      </Container>
    </Navbar>
  </>);
} export default MyNavbar;