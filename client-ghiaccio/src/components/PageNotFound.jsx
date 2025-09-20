import MyFont from "./MyFont";
import { useNavigate } from "react-router-dom";
import '../css/PageNotFound.css'; // crea questo file

function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="pagenotfound-container">
      <div className="pagenotfound-box">
        <MyFont className="pagenotfound-title">
          ERRORE 404
        </MyFont>

        <MyFont className="pagenotfound-subtitle">
          Pagina Non Trovata
        </MyFont>

        <MyFont className="pagenotfound-text">
          Oops, la pagina che stavi cercando non esiste.
        </MyFont>

        <img
          src="/images/ice404.png"
          alt="Page Not Found"
          className="pagenotfound-image"
        />

        <button className="pagenotfound-btn" onClick={() => navigate("/")}>
          Torna alla Home
        </button>
      </div>
    </div>
  );
}

export default PageNotFound;
