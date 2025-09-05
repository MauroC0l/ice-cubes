import Container from 'react-bootstrap/Container';
import '../css/ServerDownDisplay.css';
import MyFont from './MyFont.jsx'; 

function ServerDownDisplay() {
  return (
    <Container fluid className="server-down-container">
      <div className="server-down-box">
        <img
          className="server-down-image"
          src="images/ghiaccio2.png"
          alt="Ice illustration"
        />
        <h2 className="server-down-title">
            <MyFont> Server Temporarily Unavailable </MyFont>
        </h2>
        <p className="server-down-text">
          <MyFont> Sorry for the inconvenience! We are working to get things back up and running as soon as possible. </MyFont>
        </p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    </Container>
  );
}

export default ServerDownDisplay;
