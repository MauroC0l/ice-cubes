
import MyNavbar from "./MyNavbar";
import { Button } from "react-bootstrap";

function TakeOrder({handleLogoutWrapper, username, isAuth, isAdmin }) {

    return <>
        <MyNavbar
            handleLogoutWrapper={handleLogoutWrapper}
            isAuth={isAuth}
            role={isAdmin ? 'admin' : 'customer'}
        />

        <div className="home-header">
            <h1>{username || 'Ospite'} effettua un ordine </h1>
        </div>


        <div className="home-order-content">

            <form className="order-form">

                <div className="cards-wrapper">
                    <div className="home-order-card">
                        <div>
                            <h3 className="cards-header">Informazioni di recapito </h3>
                        </div>

                        <div className="form-group">
                            <label>Nome: </label>
                            <input type="text" required />
                        </div>
                        <div className="form-group">
                            <label>Cognome: </label>
                            <input type="text" required />
                        </div>
                        <div className="form-group">
                            <label>Numero di telefono: </label>
                            <input type="number" min="1" required />
                        </div>
                    </div>

                    <div className="home-order-card">
                        <div>
                            <h3 className="cards-header">Informazioni di consegna</h3>
                        </div>

                        <div className="form-group">
                            <label>Quantità (kg):</label>
                            <input type="number" min="1" required />
                        </div>
                        <div className="form-group">
                            <label>Indirizzo di consegna:</label>
                            <input type="text" required />
                        </div>
                    </div>
                </div>

                {/* Pulsanti centrati in basso di order-form */}
                <div className="order-buttons">
                    <Button type="submit" variant="primary">Effettua ordine</Button>
                </div>

            </form>

        </div>
    </>
}

export default TakeOrder;
