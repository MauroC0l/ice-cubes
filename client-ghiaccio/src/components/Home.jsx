import { useState, useEffect } from 'react';
import MyNavbar from './MyNavbar';
import { fetchFreezers, fetchOrders } from '../api/API.mjs';
import '../css/Home.css';

function Home({ handleLogoutWrapper, username, isAuth, isAdmin }) {
  const [freezers, setFreezers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isAdmin) {
          const [fetchedFreezers, fetchedOrders] = await Promise.all([
            fetchFreezers(),
            fetchOrders()
          ]);
          setFreezers(fetchedFreezers);
          setOrders(fetchedOrders);
        }
      } catch (err) {
        console.error("Errore caricamento dati:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin]);

  function getAllIce() {
    return freezers.reduce((acc, f) => {
      acc.total_kg += f.n_kg;
      acc.total_bags += f.n_bags;
      acc.total_capacity += f.n_kg_max;
      return acc;
    }, { total_kg: 0, total_bags: 0, total_capacity: 0 });
  }

  if (loading) return <div className="home-page">Loading...</div>;

  return (
    <div className="home-page">
      <MyNavbar
        handleLogoutWrapper={handleLogoutWrapper}
        isAuth={isAuth}
        role={isAdmin ? 'admin' : 'customer'}
      />

      <div className="home-header">
        <h1>Welcome {username || 'to the Home Page'}</h1>
        <p>Il tuo ruolo è <strong>{isAdmin ? 'admin' : 'customer'}</strong></p>
      </div>

      {isAdmin ? (
        <div className="home-content">
          {/* Card ordini */}
          <div className="home-card">
            <h3>📦 Ordini</h3>
            <p>Totali: {orders.length}</p>
            <p>In attesa: {orders.filter(o => o.status === 'pending').length}</p>
            <p>In carico: {orders.filter(o => o.status === 'in_charge').length}</p>
            <p>Conclusi: {orders.filter(o => o.status === 'completed').length}</p>
            <p>Cancellati: {orders.filter(o => o.status === 'deleted').length}</p>
          </div>

          {/* Card ghiaccio */}
          <div className="home-card">
            <h3>❄️ Ghiaccio</h3>
            <p>
              Disponibile: {getAllIce().total_kg}/{getAllIce().total_capacity} kg
            </p>
            <p>Sacchi: {getAllIce().total_bags}</p>
          </div>
        </div>
      ) : (
        <div className="home-card">
          <h3>Utente standard</h3>
          <p>I dati amministrativi non sono disponibili.</p>
        </div>
      )}
    </div>
  );
}

export default Home;
