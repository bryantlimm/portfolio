// src/pages/BookkeepingInput.jsx
import React, { useState, } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/bookkeeping.css';

const CATEGORIES = [
  { value: 'food', label: 'Food & Drinks' },
  { value: 'transport', label: 'Transport' },
  { value: 'offering', label: 'Offering' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'bills', label: 'Bills & Utilities' },
  { value: 'health', label: 'Health' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];

const BookkeepingInput = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [otherCategory, setOtherCategory] = useState('');
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
//   tsp

  const navigate = useNavigate();


  const formatAmount = (val) => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\./g, '');
    setAmount(formatAmount(raw));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !category) {
      setError('Please fill in all fields.');
      return;
    }
    if (category === 'other' && !otherCategory.trim()) {
      setError('Please specify the category.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const rawAmount = parseInt(amount.replace(/\./g, ''), 10);
      const uid = auth.currentUser?.uid;
      await addDoc(collection(db, 'bookkeeping'), {
        description,
        amount: rawAmount,
        category: category === 'other' ? `other: ${otherCategory}` : category,
        type,
        date: Timestamp.now(),
        uid,
      });
      setSuccess(true);
      setDescription('');
      setAmount('');
      setCategory('');
      setOtherCategory('');
      setType('expense');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/bookkeeping-login');
  };

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topbar} className="bookkeeping-input-topbar">
        <div style={styles.topbarLeft} className="bookkeeping-input-topbar-left">
          <span style={styles.logo} className="bookkeeping-input-logo">₊ Ledger</span>
          <span style={styles.dateStamp} className="bookkeeping-input-date-stamp">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <div style={styles.topbarRight} className="bookkeeping-input-topbar-right">
          <button style={styles.navBtn} className="bookkeeping-input-nav-btn" onClick={() => navigate('/bookkeeping/data')}>
            View Data →
          </button>
          <button style={styles.signOutBtn} className="bookkeeping-input-sign-out-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main} className="bookkeeping-input-main">
        <div style={styles.formCard} className="bookkeeping-input-form-card">
          <h2 style={styles.cardTitle} className="bookkeeping-input-card-title">New Entry</h2>
          <p style={styles.cardSub}>Record a transaction for today</p>

          {success && (
            <div style={styles.successBanner}>
              ✓ Entry recorded successfully
            </div>
          )}
          {error && (
            <div style={styles.errorBanner}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={styles.form} className="bookkeeping-input-form">
            {/* Type toggle */}
            <div style={styles.field}>
              <label style={styles.label}>TYPE</label>
              <div style={styles.typeToggle} className="bookkeeping-input-type-toggle">
                <button
                  type="button"
                  style={{ ...styles.typeBtn, ...(type === 'expense' ? styles.typeBtnActive : {}) }}
                  className="bookkeeping-input-type-btn"
                  onClick={() => setType('expense')}
                >
                  − Expense
                </button>
                <button
                  type="button"
                  style={{ ...styles.typeBtn, ...(type === 'income' ? styles.typeBtnIncome : {}) }}
                  className="bookkeeping-input-type-btn"
                  onClick={() => setType('income')}
                >
                  + Income
                </button>
              </div>
            </div>

            {/* Description */}
            <div style={styles.field}>
              <label style={styles.label}>DESCRIPTION</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.input}
                className="bookkeeping-input-input"
                placeholder="e.g. McDonalds with friends"
                required
              />
            </div>

            {/* Amount */}
            <div style={styles.field}>
              <label style={styles.label}>AMOUNT (IDR)</label>
              <div style={styles.amountWrapper} className="bookkeeping-input-amount-wrapper">
                <span style={styles.currencyPrefix} className="bookkeeping-input-currency-prefix">Rp</span>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  style={styles.amountInput}
                  className="bookkeeping-input-amount-input"
                  placeholder="0"
                  required
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Category */}
            <div style={styles.field}>
              <label style={styles.label}>CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
                className="bookkeeping-input-select"
                required
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Other specify */}
            {category === 'other' && (
              <div style={styles.field}>
                <label style={styles.label}>SPECIFY</label>
                <input
                  type="text"
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  style={styles.input}
                  className="bookkeeping-input-input"
                  placeholder="Describe the category..."
                  required
                />
              </div>
            )}

            <button type="submit" style={styles.submitBtn} className="bookkeeping-input-submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Record Entry ↵'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f0e8',
    fontFamily: "'Georgia', serif",
  },
  topbar: {
    background: '#2d4a2d',
    padding: '14px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '2px solid #1a2e1a',
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  logo: {
    color: '#f5f0e8',
    fontSize: '18px',
    fontFamily: "'Courier New', monospace",
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  dateStamp: {
    color: '#a8c5a8',
    fontSize: '12px',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '0.5px',
  },
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navBtn: {
    background: 'transparent',
    border: '1px solid #a8c5a8',
    color: '#a8c5a8',
    padding: '6px 16px',
    fontFamily: "'Courier New', monospace",
    fontSize: '12px',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
    borderRadius: '1px',
  },
  signOutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#7a9a7a',
    fontFamily: "'Courier New', monospace",
    fontSize: '11px',
    cursor: 'pointer',
    letterSpacing: '0.5px',
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '48px 24px',
    display: 'grid',
    gridTemplateColumns: '1fr 200px',
    gap: '40px',
    alignItems: 'start',
  },
  formCard: {
    background: '#fffef9',
    border: '1px solid #c8b89a',
    borderRadius: '2px',
    padding: '40px',
    boxShadow: '4px 4px 0px #c8b89a',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 4px 0',
  },
  cardSub: {
    fontSize: '12px',
    color: '#999',
    margin: '0 0 28px 0',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  successBanner: {
    background: '#f0fff0',
    border: '1px solid #a8c5a8',
    color: '#2d4a2d',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '20px',
    fontFamily: "'Courier New', monospace",
  },
  errorBanner: {
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
    gap: '22px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  label: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#888',
    fontFamily: "'Courier New', monospace",
  },
  input: {
    padding: '11px 13px',
    border: '1px solid #c8b89a',
    borderRadius: '1px',
    background: '#f5f0e8',
    fontSize: '15px',
    fontFamily: "'Georgia', serif",
    color: '#1a1a1a',
    outline: 'none',
  },
  amountWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #c8b89a',
    background: '#f5f0e8',
    borderRadius: '1px',
    overflow: 'hidden',
  },
  currencyPrefix: {
    padding: '11px 13px',
    background: '#e8e0d0',
    borderRight: '1px solid #c8b89a',
    fontFamily: "'Courier New', monospace",
    fontSize: '14px',
    color: '#666',
    flexShrink: 0,
  },
  amountInput: {
    padding: '11px 13px',
    border: 'none',
    background: 'transparent',
    fontSize: '18px',
    fontFamily: "'Courier New', monospace",
    color: '#1a1a1a',
    outline: 'none',
    width: '100%',
    fontWeight: '600',
    letterSpacing: '1px',
  },
  select: {
    padding: '11px 13px',
    border: '1px solid #c8b89a',
    borderRadius: '1px',
    background: '#f5f0e8',
    fontSize: '14px',
    fontFamily: "'Georgia', serif",
    color: '#1a1a1a',
    outline: 'none',
    cursor: 'pointer',
  },
  typeToggle: {
    display: 'flex',
    gap: '0',
    border: '1px solid #c8b89a',
    borderRadius: '1px',
    overflow: 'hidden',
  },
  typeBtn: {
    flex: 1,
    padding: '10px',
    border: 'none',
    background: '#f5f0e8',
    fontFamily: "'Courier New', monospace",
    fontSize: '13px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.5px',
  },
  typeBtnActive: {
    background: '#c0392b',
    color: '#fff',
    fontWeight: 'bold',
  },
  typeBtnIncome: {
    background: '#2d4a2d',
    color: '#fff',
    fontWeight: 'bold',
  },
  submitBtn: {
    marginTop: '8px',
    padding: '14px',
    background: '#2d4a2d',
    color: '#f5f0e8',
    border: 'none',
    borderRadius: '1px',
    fontSize: '15px',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  aside: {
    paddingTop: '8px',
  },
  spendingCard: {
    background: '#fffef9',
    border: '1px solid #c8b89a',
    borderRadius: '2px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '2px 2px 0px #c8b89a',
  },
  spendingLabel: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#888',
    fontFamily: "'Courier New', monospace",
    marginBottom: '8px',
  },
  spendingAmount: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#c0392b',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '1px',
  },
  ledgerLines: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '20px',
    opacity: 0.3,
  },
  ledgerLine: {
    height: '1px',
    background: '#c8b89a',
    width: '100%',
  },
  asideNote: {
    fontSize: '11px',
    color: '#aaa',
    fontFamily: "'Courier New', monospace",
    lineHeight: '1.6',
    letterSpacing: '0.3px',
  },
};

export default BookkeepingInput;