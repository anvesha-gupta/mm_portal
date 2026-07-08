import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

const BALANCE_KEY = 'mm_points_balance';
const ORDERS_KEY = 'mm_points_orders';
const DEFAULT_BALANCE = 750;

const PointsContext = createContext<PointsContextValue | null>(null);

export function PointsProvider({ children }: { children: ReactNode }) {
  const [balance, setBalanceState] = useState<number>(() => {
    const stored = sessionStorage.getItem(BALANCE_KEY);
    return stored !== null ? Number(stored) : DEFAULT_BALANCE;
  });

  const [orders, setOrders] = useState<PendingOrder[]>(() => {
    const stored = sessionStorage.getItem(ORDERS_KEY);
    try { return stored ? JSON.parse(stored) : []; } catch { return []; }
  });

  useEffect(() => {
    sessionStorage.setItem(BALANCE_KEY, String(balance));
  }, [balance]);

  useEffect(() => {
    sessionStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const setBalance = (value: number) => setBalanceState(value);

  const addOrder = (order: PendingOrder) => {
    setOrders((prev) => [...prev, order]);
  };

  const resetPoints = () => {
    setBalanceState(DEFAULT_BALANCE);
    setOrders([]);
    sessionStorage.removeItem(BALANCE_KEY);
    sessionStorage.removeItem(ORDERS_KEY);
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
