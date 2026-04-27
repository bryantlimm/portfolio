// src/pages/BookkeepingLogin.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/bookkeeping.css';

const BookkeepingLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/bookkeeping');
    } catch (err) {
      setError('Failed to log in. Check your email/password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="bookkeeping-login-card">
        <div style={styles.header}>
          <div style={styles.ledgerIcon}>₊</div>
          <h1 style={styles.title} className="bookkeeping-login-title">Bookkeeping</h1>
          <p style={styles.subtitle} className="bookkeeping-login-subtitle">Personal Finance Ledger</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              className="bookkeeping-login-input"
              required
              placeholder="you@example.com"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              className="bookkeeping-login-input"
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" style={styles.button} className="bookkeeping-login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Open Ledger →'}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>bryantlimm.org · private</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f0e8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Georgia', serif",
  },
  card: {
    background: '#fffef9',
    border: '1px solid #c8b89a',
    borderRadius: '2px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '4px 4px 0px #c8b89a',
  },
  header: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  ledgerIcon: {
    fontSize: '32px',
    color: '#2d4a2d',
    marginBottom: '8px',
    display: 'block',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 6px 0',
    letterSpacing: '1px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontFamily: "'Courier New', monospace",
  },
  error: {
    background: '#fff0f0',
    border: '1px solid #e8b4b4',
    color: '#c0392b',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '20px',
    fontFamily: "'Courier New', monospace",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#888',
    fontFamily: "'Courier New', monospace",
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #c8b89a',
    borderRadius: '1px',
    background: '#f5f0e8',
    fontSize: '14px',
    fontFamily: "'Courier New', monospace",
    color: '#1a1a1a',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    marginTop: '8px',
    padding: '12px',
    background: '#2d4a2d',
    color: '#f5f0e8',
    border: 'none',
    borderRadius: '1px',
    fontSize: '14px',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '11px',
    color: '#bbb',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '1px',
  },
};

export default BookkeepingLogin;