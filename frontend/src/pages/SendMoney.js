import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const SendMoney = () => {
  const { user, updateBalance } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/account/users');
        setAllUsers(data.users);
      } catch (err) {
        console.error('Failed to fetch users');
      } finally {
        setFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmailInput(val);
    setSelectedUser(null);
    setError('');
    if (val.trim()) {
      const results = allUsers.filter(u =>
        u.name.toLowerCase().includes(val.toLowerCase()) ||
        u.email.toLowerCase().includes(val.toLowerCase())
      );
      setFiltered(results);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const selectUser = (u) => {
    setSelectedUser(u);
    setEmailInput(u.email);
    setShowDropdown(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!emailInput) return setError('Please enter a recipient email.');
    if (!amount || parseFloat(amount) <= 0) return setError('Please enter a valid amount.');
    if (parseFloat(amount) > (user?.balance || 0)) return setError('Insufficient balance.');

    setLoading(true);
    try {
      const { data } = await api.post('/account/transfer', {
        receiver_email: emailInput,
        amount: parseFloat(amount)
      });
      updateBalance(data.newBalance);
      setSuccess(data.message);
      setAmount('');
      setEmailInput('');
      setSelectedUser(null);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (b) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(b);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>Send Money</h2>
          <p>Transfer funds instantly to any registered user</p>
        </div>

        <div className="card send-form-card">
          <div style={{
            background: 'linear-gradient(135deg, #1a1405, #201808)',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              YOUR BALANCE
            </span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: 'var(--gold-light)' }}>
              ₹{formatBalance(user?.balance || 0)}
            </span>
          </div>

          {error && <div className="error-msg">⚠ {error}</div>}
          {success && <div className="success-msg">✓ {success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ position: 'relative' }} ref={dropdownRef}>
              <label>Recipient</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={emailInput}
                onChange={handleEmailChange}
                onFocus={() => emailInput && setShowDropdown(true)}
                autoComplete="off"
              />
              {selectedUser && (
                <div style={{
                  marginTop: '8px', padding: '8px 12px',
                  background: 'rgba(76,175,136,0.08)',
                  border: '1px solid rgba(76,175,136,0.2)',
                  borderRadius: '8px',
                  fontSize: '13px', color: 'var(--green)',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  ✓ Sending to <strong>{selectedUser.name}</strong>
                </div>
              )}
              {showDropdown && filtered.length > 0 && (
                <div className="users-dropdown">
                  {filtered.map(u => (
                    <div key={u.id} className="user-option" onClick={() => selectUser(u)}>
                      <div className="uname">{u.name}</div>
                      <div className="uemail">{u.email}</div>
                    </div>
                  ))}
                </div>
              )}
              {showDropdown && filtered.length === 0 && !fetchingUsers && (
                <div className="users-dropdown">
                  <div style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No users found
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Amount</label>
              <div className="amount-input-wrap">
                <span className="currency">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  min="1"
                  step="0.01"
                  onChange={e => { setAmount(e.target.value); setError(''); }}
                />
              </div>
              {amount && parseFloat(amount) > 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Balance after transfer: ₹{formatBalance((user?.balance || 0) - parseFloat(amount))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !emailInput || !amount}
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Processing...' : `Send ₹${amount || '0'}`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SendMoney;
