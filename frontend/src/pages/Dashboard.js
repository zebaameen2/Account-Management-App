import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user, updateBalance } = useAuth();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balRes, stmtRes] = await Promise.all([
          api.get('/account/balance'),
          api.get('/account/statement')
        ]);
        setBalance(balRes.data.balance);
        updateBalance(balRes.data.balance);
        setTransactions(stmtRes.data.transactions.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount);

  const totalCredits = transactions
    .filter(t => t.transaction_type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = transactions
    .filter(t => t.transaction_type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>Good day, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Here's what's happening with your account</p>
        </div>

        <div className="dashboard-grid">
          <div className="balance-card">
            <div className="label">Available Balance</div>
            <div className="amount">₹{formatAmount(balance)}</div>
            <div className="sub">Account active · Transfers enabled</div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.05s' }}>
            <div className="label">Money In</div>
            <div className="value" style={{ color: 'var(--green)' }}>₹{formatAmount(totalCredits)}</div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.1s' }}>
            <div className="label">Money Out</div>
            <div className="value" style={{ color: 'var(--red)' }}>₹{formatAmount(totalDebits)}</div>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/send" className="action-btn primary">
            ↗ Send Money
          </Link>
          <Link to="/statement" className="action-btn secondary">
            📋 Full Statement
          </Link>
        </div>

        <div className="card">
          <div className="section-title">Recent Transactions</div>

          {loading ? (
            <div className="loading-wrap">
              <span className="spinner" />
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="icon">💸</div>
              <p>No transactions yet. Send money to get started!</p>
            </div>
          ) : (
            transactions.map((tx, i) => {
              const isCredit = tx.transaction_type === 'credit';
              const otherPerson = isCredit ? tx.sender?.name : tx.receiver?.name;
              return (
                <div className="tx-row" key={tx.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className={`tx-icon ${tx.transaction_type}`}>
                    {isCredit ? '↙' : '↗'}
                  </div>
                  <div className="tx-info">
                    <div className="tx-name">
                      {isCredit ? `From ${otherPerson}` : `To ${otherPerson}`}
                    </div>
                    <div className="tx-date">{formatDate(tx.created_at)}</div>
                  </div>
                  <div className={`tx-amount ${tx.transaction_type}`}>
                    {isCredit ? '+' : '-'}₹{formatAmount(tx.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
