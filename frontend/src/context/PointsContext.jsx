import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from './AuthContext';
import { showPointsToast } from '../utils/showPointsToast';

const PointsContext = createContext();

export const PointsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [points, setPoints] = useState(0);
  const [walletBalance, setWalletBalance] = useState('0.00');
  const [inrValue, setInrValue] = useState('0.00');

  const refreshPoints = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await axios.get('/wallet');
      setPoints(data.points);
      setWalletBalance(data.walletBalance);
      setInrValue(data.inrValue);
    } catch (err) {
      console.error('Points refresh failed', err);
    }
  }, [isAuthenticated]);

  const addPoints = useCallback(async (action) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await axios.post('/points/add', { action });
      setPoints(data.points);
      setInrValue(data.inrValue);
      if (data.added > 0) {
        showPointsToast(action.replace('_', ' '), data.added);
      }
      return data.added;
    } catch (err) {
      console.error('Add points failed', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshPoints();
  }, [refreshPoints]);

  return (
    <PointsContext.Provider value={{ points, walletBalance, inrValue, refreshPoints, addPoints }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);
