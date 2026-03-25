import { useEffect, useState } from 'react';
import { usePoints } from '../context/PointsContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const Wallet = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { points, walletBalance, inrValue, refreshPoints } = usePoints();
  const [history, setHistory] = useState([]);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    return () => {
      document.body.classList.remove('dark');
    };
  }, [darkMode]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/wallet');
      setHistory(data.history);
    } catch (err) {
      console.error('Failed to fetch wallet history', err);
    }
  };

  const handleConvert = async () => {
    if (points < 100) return alert('Minimum 100 points required');
    setConverting(true);
    try {
      const { data } = await api.put('/wallet/convert');
      alert(data.message);
      refreshPoints();
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Error converting points');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        searchTerm=""
        onSearchChange={() => {}}
      />
      <div className="wallet-page">
        {/* Top balance card */}
        <div className="wallet-card">
          <h3>Wallet Balance</h3>
          <p className="inr-balance">INR ₹{walletBalance}</p>
          <h3>Point Balance</h3>
          <p className="points-balance">{points} ⭐ = ₹{inrValue}</p>
          <p className="estimated">Total Estimated Balance: ₹{inrValue}</p>
        </div>

        {/* Wallet Information */}
        <section>
          <h2>Wallet Information</h2>
          <div className="info-row">
            <span>Wallet Balance — ₹{walletBalance}</span>
            <button className="outline-btn red">Withdraw</button>
          </div>
          <div className="info-row">
            <span>Convert INR to Points</span>
            <button className="outline-btn red">Convert</button>
          </div>
        </section>

        {/* Points Information */}
        <section>
          <h2>Points Information</h2>
          <div className="info-row">
            <div>
              <p>Point Balance</p>
              <p>{points} ⭐ <span className="pill">₹{inrValue}</span></p>
            </div>
            <button
              className="outline-btn red"
              onClick={handleConvert}
              disabled={converting || points < 100}
            >
              {converting ? 'Converting...' : 'Convert'}
            </button>
          </div>
        </section>

        {/* Points History */}
        <section>
          <h2>All Point History</h2>
          {history.length === 0 ? <p className="muted">No history found.</p> : null}
          {history.map((item, i) => (
            <div key={i} className="history-row">
              <div>
                <p className="action-label">{item.action.replace(/_/g, ' ')}</p>
                <p className="action-date">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <span className={`points-change ${item.points > 0 ? 'green' : 'red'}`}>
                {item.points > 0 ? '+' : ''}{item.points} pts
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Wallet;
