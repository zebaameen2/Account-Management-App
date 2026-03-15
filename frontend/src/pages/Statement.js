import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const Statement = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchStatement = async () => {
      try {
        const { data } = await api.get('/account/statement');
        setTransactions(data.transactions);
      } catch (err) {
        console.error('Failed to fetch statement');
      } finally {
        setLoading(false);
      }
    };
    fetchStatement();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatAmount = (n) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.transaction_type === filter);

  const totalIn = transactions
    .filter(t => t.transaction_type === 'credit')
    .reduce((s, t) => s + t.amount, 0);

  const totalOut = transactions
    .filter(t => t.transaction_type === 'debit')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>Account Statement</h2>
          <p>Your complete transaction history</p>
        </div>

        {/* Summary Row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Transactions', value: transactions.length, color: 'var(--text-primary)' },
            { label: 'Total Received', value: `₹${formatAmount(totalIn)}`, color: 'var(--green)' },
            { label: 'Total Sent', value: `₹${formatAmount(totalOut)}`, color: 'var(--red)' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ flex: '1', minWidth: '150px', animationDelay: `${i * 0.05}s` }}>
              <div className="label">{s.label}</div>
              <div className="value" style={{ fontSize: '22px', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="card">
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['all', 'credit', 'debit'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '20px',
                  border: '1px solid',
                  fontSize: '13px',
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                  fontWeight: filter === f ? '600' : '400',
                  background: filter === f
                    ? f === 'credit' ? 'var(--green-bg)'
                      : f === 'debit' ? 'var(--red-bg)'
                      : 'rgba(201,168,76,0.1)'
                    : 'transparent',
                  borderColor: filter === f
                    ? f === 'credit' ? 'rgba(76,175,136,0.3)'
                      : f === 'debit' ? 'rgba(224,92,92,0.3)'
                      : 'rgba(201,168,76,0.3)'
                    : 'var(--border)',
                  color: filter === f
                    ? f === 'credit' ? 'var(--green)'
                      : f === 'debit' ? 'var(--red)'
                      : 'var(--gold)'
                    : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {f === 'all' ? 'All' : f === 'credit' ? '↙ Received' : '↗ Sent'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-wrap">
              <span className="spinner" /> Loading statement...
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <p>No transactions found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="statement-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx, i) => {
                    const isCredit = tx.transaction_type === 'credit';
                    return (
                      <tr key={tx.id} style={{ animationDelay: `${i * 0.03}s` }}>
                        <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatDate(tx.created_at)}
                        </td>
                        <td>
                          <span className={`badge ${tx.transaction_type}`}>
                            {isCredit ? '↙ Credit' : '↗ Debit'}
                          </span>
                        </td>
                        <td className={`amount-cell ${tx.transaction_type}`}>
                          {isCredit ? '+' : '-'}₹{formatAmount(tx.amount)}
                        </td>
                        <td style={{ color: 'var(--text-primary)' }}>
                          {tx.sender?.id === user?.id ? 'You' : tx.sender?.name || '—'}
                        </td>
                        <td style={{ color: 'var(--text-primary)' }}>
                          {tx.receiver?.id === user?.id ? 'You' : tx.receiver?.name || '—'}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                          {tx.balance_after != null ? `₹${formatAmount(tx.balance_after)}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Statement;
