import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useAuth from '../auth/useAuth';
import api from '../services/api';

export interface PendingOrder {
  name: string;
  emoji: string;
}

interface PointsContextValue {
  balance: number;
  setBalance: (balance: number) => void;
  orders: PendingOrder[];
  addOrder: (order: PendingOrder) => void;
  resetPoints: () => void;
}

const DEFAULT_BALANCE = 750;

const PointsContext = createContext<PointsContextValue | null>(null);

// Key by email — always "role@motiveminds.local", stable across logout/login
const balanceKey = (userKey: string) => `mm_points_balance_${userKey}`;
const ordersKey  = (userKey: string) => `mm_points_orders_${userKey}`;

const loadBalance = (userKey: string): number => {
  const stored = localStorage.getItem(balanceKey(userKey));
  return stored !== null ? Number(stored) : DEFAULT_BALANCE;
};

const loadOrders = (userKey: string): PendingOrder[] => {
  try {
    const stored = localStorage.getItem(ordersKey(userKey));
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export function PointsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.email ?? 'guest';

  const [balance, setBalanceState] = useState<number>(() => loadBalance(userId));
  const [orders, setOrders] = useState<PendingOrder[]>(() => loadOrders(userId));

  // Reload per-user data whenever the logged-in account changes
  useEffect(() => {
    setOrders(loadOrders(userId));
    if (!user) {
      setBalanceState(DEFAULT_BALANCE);
      return;
    }
    // Try to load from backend; fall back to localStorage if DB is unavailable.
    // Do NOT write to localStorage here on userId change — that would overwrite
    // the saved balance with the stale in-memory value before the async load completes.
    api.get('/api/user_points/me')
      .then(res => {
        const dbBalance = res.data.balance;
        setBalanceState(dbBalance);
        localStorage.setItem(balanceKey(userId), String(dbBalance));
      })
      .catch(() => {
        // DB unavailable — read what's in localStorage (safe: not yet overwritten)
        setBalanceState(loadBalance(userId));
      });
  }, [userId]);

  // Persist orders whenever they change (no race condition: setOrders is synchronous)
  useEffect(() => {
    localStorage.setItem(ordersKey(userId), JSON.stringify(orders));
  }, [orders, userId]);

  // setBalance also writes to localStorage immediately so deductions are never lost
  const setBalance = (value: number) => {
    setBalanceState(value);
    localStorage.setItem(balanceKey(userId), String(value));
  };

  const addOrder = (order: PendingOrder) => setOrders(prev => [...prev, order]);

  const resetPoints = () => {
    setBalanceState(DEFAULT_BALANCE);
    setOrders([]);
    localStorage.removeItem(balanceKey(userId));
    localStorage.removeItem(ordersKey(userId));
  };

  return (
    <PointsContext.Provider value={{ balance, setBalance, orders, addOrder, resetPoints }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const ctx = useContext(PointsContext);
  if (!ctx) throw new Error('usePoints must be used within PointsProvider');
  return ctx;
}
