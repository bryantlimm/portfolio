// src/pages/BookkeepingInput.jsx
import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .bk-page {
          min-height: 100vh;
          background: #f1f5f9;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .bk-topbar {
          background: #ffffff;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 8px rgba(0,0,0,0.05);
        }

        .bk-logo {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .bk-logo span {
          color: #2563eb;
        }

        .bk-topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bk-nav-btn {
          background: #eff6ff;
          border: 1.5px solid #bfdbfe;
          color: #2563eb;
          padding: 8px 16px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .bk-nav-btn:hover {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .bk-signout-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .bk-signout-btn:hover {
          background: #f1f5f9;
          color: #64748b;
        }

        .bk-main {
          max-width: 520px;
          margin: 0 auto;
          padding: 28px 16px 48px;
        }

        .bk-date-tag {
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
          margin-bottom: 20px;
          letter-spacing: 0.3px;
        }

        .bk-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 28px 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid #e2e8f0;
        }

        .bk-card-title {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }

        .bk-card-sub {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .bk-success {
          background: #eff6ff;
          border: 1.5px solid #bfdbfe;
          color: #1d4ed8;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bk-error {
          background: #fef2f2;
          border: 1.5px solid #fca5a5;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .bk-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .bk-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .bk-label {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .bk-type-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .bk-type-btn {
          padding: 12px;
          border: 2px solid #e2e8f0;
          background: #f8fafc;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s;
          color: #94a3b8;
        }

        .bk-type-btn.expense-active {
          background: #fef2f2;
          border-color: #ef4444;
          color: #dc2626;
        }

        .bk-type-btn.income-active {
          background: #eff6ff;
          border-color: #2563eb;
          color: #2563eb;
        }

        .bk-input {
          padding: 13px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          font-size: 15px;
          font-family: inherit;
          font-weight: 500;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
          width: 100%;
        }

        .bk-input:focus {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        .bk-input::placeholder { color: #cbd5e1; }

        .bk-amount-wrap {
          display: flex;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          background: #f8fafc;
          transition: all 0.2s;
        }

        .bk-amount-wrap:focus-within {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        .bk-currency {
          padding: 13px 14px;
          background: #f1f5f9;
          border-right: 2px solid #e2e8f0;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          color: #64748b;
          flex-shrink: 0;
        }

        .bk-amount-input {
          padding: 13px 14px;
          border: none;
          background: transparent;
          font-size: 20px;
          font-family: inherit;
          font-weight: 700;
          color: #0f172a;
          outline: none;
          width: 100%;
          letter-spacing: 0.5px;
        }

        .bk-amount-input::placeholder { color: #cbd5e1; font-weight: 400; font-size: 16px; }

        .bk-select {
          padding: 13px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          font-size: 14px;
          font-family: inherit;
          font-weight: 500;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
        }

        .bk-select:focus {
          border-color: #2563eb;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        .bk-submit {
          margin-top: 6px;
          padding: 16px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-family: inherit;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
        }

        .bk-submit:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(37,99,235,0.35);
        }

        .bk-submit:active {
          transform: translateY(0);
        }

        .bk-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .bk-topbar { padding: 12px 16px; }
          .bk-logo { font-size: 15px; }
          .bk-card { padding: 22px 18px; }
          .bk-main { padding: 20px 12px 40px; }
        }
      `}</style>

      <div className="bk-page">
        <div className="bk-topbar">
          <div className="bk-logo">Hemat woi</div>
          <div className="bk-topbar-right">
            <button className="bk-nav-btn" onClick={() => navigate('/bookkeeping/data')}>
              View Data →
            </button>
            <button className="bk-signout-btn" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>

        <div className="bk-main">
          <div className="bk-date-tag">
            {new Date().toLocaleDateString('en-EN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <div className="bk-card">
            <h2 className="bk-card-title">New Entry</h2>
            <p className="bk-card-sub">Record a transaction for today</p>

            {success && (
              <div className="bk-success">
                ✓ Entry recorded successfully!
              </div>
            )}
            {error && (
              <div className="bk-error">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="bk-form">
              <div className="bk-field">
                <label className="bk-label">Type</label>
                <div className="bk-type-toggle">
                  <button
                    type="button"
                    className={`bk-type-btn ${type === 'expense' ? 'expense-active' : ''}`}
                    onClick={() => setType('expense')}
                  >
                    − Expense
                  </button>
                  <button
                    type="button"
                    className={`bk-type-btn ${type === 'income' ? 'income-active' : ''}`}
                    onClick={() => setType('income')}
                  >
                    + Income
                  </button>
                </div>
              </div>

              <div className="bk-field">
                <label className="bk-label">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bk-input"
                  placeholder="e.g. McDonalds with friends"
                  required
                />
              </div>

              <div className="bk-field">
                <label className="bk-label">Amount (IDR)</label>
                <div className="bk-amount-wrap">
                  <span className="bk-currency">Rp</span>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    className="bk-amount-input"
                    placeholder="0"
                    required
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="bk-field">
                <label className="bk-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bk-select"
                  required
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {category === 'other' && (
                <div className="bk-field">
                  <label className="bk-label">Specify Category</label>
                  <input
                    type="text"
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                    className="bk-input"
                    placeholder="Describe the category..."
                    required
                  />
                </div>
              )}

              <button type="submit" className="bk-submit" disabled={loading}>
                {loading ? 'Saving...' : 'Record Entry ↵'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookkeepingInput;