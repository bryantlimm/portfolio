// src/pages/BookkeepingData.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const CATEGORY_LABELS = {
  food: 'Food & Drinks',
  transport: 'Transport',
  offering: 'Offering',
  shopping: 'Shopping',
  bills: 'Bills & Utilities',
  health: 'Health',
  entertainment: 'Entertainment',
  other: 'Other',
};

const CATEGORY_COLORS = {
  food: '#f97316',
  transport: '#3b82f6',
  offering: '#a855f7',
  shopping: '#f59e0b',
  bills: '#ef4444',
  health: '#22c55e',
  entertainment: '#06b6d4',
  other: '#94a3b8',
};

const CATEGORY_BG = {
  food: '#fff7ed',
  transport: '#eff6ff',
  offering: '#faf5ff',
  shopping: '#fffbeb',
  bills: '#fef2f2',
  health: '#f0fdf4',
  entertainment: '#ecfeff',
  other: '#f8fafc',
};

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const BookkeepingData = () => {
  const [entries, setEntries] = useState([]);
  const [overallBalance, setOverallBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('transactions');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const start = Timestamp.fromDate(new Date(startDate + 'T00:00:00'));
      const end = Timestamp.fromDate(new Date(endDate + 'T23:59:59'));
      const q = query(
        collection(db, 'bookkeeping'),
        where('date', '>=', start),
        where('date', '<=', end),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })));

      // all time balance
      const allSnap = await getDocs(collection(db, 'bookkeeping'));
      const allEntries = allSnap.docs.map(d => d.data());
      const allIncome = allEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
      const allExpense = allEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
      setOverallBalance(allIncome - allExpense);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const expenses = entries.filter(e => e.type === 'expense');
  const incomes = entries.filter(e => e.type === 'income');
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomes.reduce((s, e) => s + e.amount, 0);
  // const periodBalance = totalIncome - totalExpense;

  const categoryTotals = expenses.reduce((acc, e) => {
    const cat = e.category?.split(':')[0].trim() || 'other';
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {});

  const monthlyData = entries.reduce((acc, e) => {
    const d = e.date.toDate();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = { label, income: 0, expense: 0 };
    if (e.type === 'income') acc[key].income += e.amount;
    else acc[key].expense += e.amount;
    return acc;
  }, {});

  const handleExport = () => {
    const rows = entries.filter(e => e.type === 'expense').map(e => ({
      Date: e.date.toDate().toLocaleDateString('id-ID'),
      Time: e.date.toDate().toLocaleTimeString('id-ID'),
      Type: e.type === 'income' ? 'Income' : 'Expense',
      Description: e.description,
      Category: CATEGORY_LABELS[e.category] || e.category,
      'Amount (IDR)': e.amount,
    }));
    rows.push({}, { Description: 'TOTAL INCOME', 'Amount (IDR)': totalIncome });
    rows.push({ Description: 'TOTAL EXPENSE', 'Amount (IDR)': totalExpense });
    rows.push({ Description: 'NET BALANCE (All Time)', 'Amount (IDR)': overallBalance });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 35 }, { wch: 20 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookkeeping');
    XLSX.writeFile(wb, `bookkeeping_${startDate}_to_${endDate}.xlsx`);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/bookkeeping-login');
  };

  const maxCatAmount = Math.max(...Object.values(categoryTotals), 1);
  const maxMonthlyAmount = Math.max(...Object.values(monthlyData).map(m => Math.max(m.income, m.expense)), 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #f1f5f9;
          --surface: #ffffff;
          --surface2: #f8fafc;
          --border: #e2e8f0;
          --border2: #cbd5e1;
          --text: #0f172a;
          --text2: #475569;
          --text3: #94a3b8;
          --blue: #2563eb;
          --blue-dim: rgba(37,99,235,0.08);
          --red: #dc2626;
          --red-dim: rgba(220,38,38,0.08);
          --green: #16a34a;
          --green-dim: rgba(22,163,74,0.08);
          --yellow: #d97706;
          --font: 'DM Sans', sans-serif;
          --mono: 'DM Mono', monospace;
          --radius: 14px;
          --radius-sm: 8px;
        }

        body { background: var(--bg); }

        .bd-page {
          min-height: 100vh;
          background: var(--bg);
          font-family: var(--font);
          color: var(--text);
          -webkit-font-smoothing: antialiased;
        }

        /* ── Topbar ── */
        .bd-topbar {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 0 16px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .bd-logo {
          font-size: 16px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bd-logo-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--blue);
          box-shadow: 0 0 8px var(--blue);
        }

        .bd-topbar-right { display: flex; align-items: center; gap: 8px; }

        .bd-nav-btn {
          height: 34px;
          padding: 0 14px;
          background: var(--blue-dim);
          border: 1px solid rgba(79,140,255,0.25);
          color: var(--blue);
          font-family: var(--font);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.18s;
          white-space: nowrap;
        }

        .bd-nav-btn:hover { background: var(--blue); color: #fff; }

        .bd-signout-btn {
          height: 34px;
          padding: 0 12px;
          background: transparent;
          border: 1px solid var(--border2);
          color: var(--text3);
          font-family: var(--font);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.18s;
        }

        .bd-signout-btn:hover { border-color: var(--red); color: var(--red); }

        /* ── Main ── */
        .bd-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px 16px 60px;
        }

        /* ── Summary cards ── */
        .bd-summary-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }

        .bd-summary-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 14px 16px;
          position: relative;
          overflow: hidden;
        }

        .bd-summary-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 2px 2px 0 0;
        }

        .bd-summary-card.card-income::before { background: var(--blue); }
        .bd-summary-card.card-expense::before { background: var(--red); }
        .bd-summary-card.card-balance::before { background: var(--green); }
        .bd-summary-card.card-entries::before { background: var(--text3); }

        .bd-summary-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text3);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .bd-summary-amount {
          font-family: var(--mono);
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }

        .bd-summary-sub {
          font-size: 10px;
          color: var(--text3);
          margin-top: 4px;
        }

        /* ── Filter bar ── */
        .bd-filter-bar {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .bd-date-group { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 130px; }

        .bd-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text3);
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .bd-date-input {
          height: 38px;
          padding: 0 12px;
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: var(--radius-sm);
          font-family: var(--mono);
          font-size: 13px;
          color: var(--text);
          outline: none;
          width: 100%;
          transition: border-color 0.18s;
          color-scheme: light;
        }

        .bd-date-input:focus { border-color: var(--blue); }

        .bd-filter-actions { display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0; }

        .bd-refresh-btn {
          height: 38px;
          padding: 0 14px;
          background: var(--surface2);
          border: 1px solid var(--border2);
          color: var(--text2);
          font-family: var(--font);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.18s;
          white-space: nowrap;
        }

        .bd-refresh-btn:hover { border-color: var(--blue); color: var(--blue); }

        .bd-export-btn {
          height: 38px;
          padding: 0 18px;
          background: var(--blue);
          color: #fff;
          border: none;
          font-family: var(--font);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.18s;
          white-space: nowrap;
        }

        .bd-export-btn:hover:not(:disabled) { background: #6fa3ff; }
        .bd-export-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        /* ── Tabs ── */
        .bd-tabs {
          display: flex;
          gap: 2px;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 3px;
          border-radius: var(--radius-sm);
          margin-bottom: 14px;
        }

        .bd-tab {
          flex: 1;
          height: 32px;
          background: transparent;
          border: none;
          font-family: var(--font);
          font-size: 13px;
          font-weight: 600;
          color: var(--text3);
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.18s;
          text-align: center;
        }

        .bd-tab.active {
          background: var(--surface2);
          color: var(--text);
          border: 1px solid var(--border2);
        }

        /* ── Table card ── */
        .bd-table-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        /* Desktop table */
        .bd-table-wrap { overflow-x: auto; }

        .bd-table { width: 100%; border-collapse: collapse; min-width: 500px; }

        .bd-table th {
          padding: 12px 14px;
          background: var(--surface2);
          text-align: left;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.7px;
          color: var(--text3);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }

        .bd-table td {
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }

        .bd-table tr:last-child td { border-bottom: none; }
        .bd-table tr:hover td { background: var(--surface2); }

        .bd-date-cell { font-size: 13px; font-weight: 600; color: var(--text); }
        .bd-time-cell { font-size: 11px; color: var(--text3); margin-top: 2px; font-family: var(--mono); }

        .bd-type-pill {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }

        .bd-cat-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Mobile card list */
        .bd-card-list { display: none; }

        .bd-entry-card {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .bd-entry-card:last-child { border-bottom: none; }

        .bd-entry-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .bd-entry-body { flex: 1; min-width: 0; }

        .bd-entry-desc {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 3px;
        }

        .bd-entry-meta {
          font-size: 11px;
          color: var(--text3);
          font-family: var(--mono);
        }

        .bd-entry-right { text-align: right; flex-shrink: 0; }

        .bd-entry-amount {
          font-family: var(--mono);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        /* Charts */
        .bd-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .bd-chart-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 18px;
        }

        .bd-chart-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text2);
          letter-spacing: 0.4px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .bd-bar-chart { display: flex; flex-direction: column; gap: 12px; }

        .bd-bar-row { display: flex; align-items: center; gap: 8px; }

        .bd-bar-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text2);
          width: 100px;
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bd-bar-track {
          flex: 1;
          height: 6px;
          background: var(--surface2);
          border-radius: 99px;
          overflow: hidden;
        }

        .bd-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.5s cubic-bezier(0.16,1,0.3,1);
        }

        .bd-bar-amount {
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 500;
          color: var(--text3);
          width: 100px;
          text-align: right;
          flex-shrink: 0;
        }

        .bd-month-group { margin-bottom: 14px; }
        .bd-month-group:last-child { margin-bottom: 0; }

        .bd-month-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text3);
          letter-spacing: 0.6px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .bd-loading {
          padding: 52px;
          text-align: center;
          color: var(--text3);
          font-size: 14px;
        }

        .bd-empty {
          padding: 48px 20px;
          text-align: center;
          color: var(--text3);
          font-size: 14px;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .bd-summary-cards { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .bd-summary-amount { font-size: 13px; }
          .bd-charts-grid { grid-template-columns: 1fr; }
          .bd-bar-amount { width: 80px; font-size: 10px; }
          .bd-bar-label { width: 80px; font-size: 11px; }

          /* Hide desktop table, show mobile cards */
          .bd-table-wrap { display: none; }
          .bd-card-list { display: block; }

          .bd-filter-bar { gap: 8px; }
          .bd-filter-actions { width: 100%; }
          .bd-refresh-btn { flex: 1; text-align: center; }
          .bd-export-btn { flex: 1; text-align: center; }

          .bd-main { padding: 14px 12px 60px; }
          .bd-topbar { padding: 0 12px; }
        }

        @media (max-width: 400px) {
          .bd-summary-amount { font-size: 12px; }
          .bd-logo { font-size: 14px; }
          .bd-nav-btn { padding: 0 10px; font-size: 12px; }
          .bd-signout-btn { padding: 0 8px; font-size: 12px; }
        }
      `}</style>

      <div className="bd-page">
        {/* Topbar */}
        <div className="bd-topbar">
          <div className="bd-logo">
            <span className="bd-logo-dot" />
            Hemat woi
          </div>
          <div className="bd-topbar-right">
            <button className="bd-nav-btn" onClick={() => navigate('/bookkeeping')}>← New Entry</button>
            <button className="bd-signout-btn" onClick={handleSignOut}>Sign out</button>
          </div>
        </div>

        <div className="bd-main">
          {/* Summary cards */}
          <div className="bd-summary-cards">
            <div className="bd-summary-card card-income">
              <div className="bd-summary-label">Income</div>
              <div className="bd-summary-amount" style={{ color: 'var(--blue)' }}>{fmt(totalIncome)}</div>
              <div className="bd-summary-sub">This period</div>
            </div>
            <div className="bd-summary-card card-expense">
              <div className="bd-summary-label">Expense</div>
              <div className="bd-summary-amount" style={{ color: 'var(--red)' }}>{fmt(totalExpense)}</div>
              <div className="bd-summary-sub">This period</div>
            </div>
            <div className="bd-summary-card card-balance">
              <div className="bd-summary-label">Net Balance</div>
              <div className="bd-summary-amount" style={{ color: overallBalance >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {fmt(overallBalance)}
              </div>
              <div className="bd-summary-sub">All time</div>
            </div>
            <div className="bd-summary-card card-entries">
              <div className="bd-summary-label">Entries</div>
              <div className="bd-summary-amount" style={{ color: 'var(--text)' }}>{entries.length}</div>
              <div className="bd-summary-sub">This period</div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="bd-filter-bar">
            <div className="bd-date-group">
              <label className="bd-label">From</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bd-date-input" />
            </div>
            <div className="bd-date-group">
              <label className="bd-label">To</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bd-date-input" />
            </div>
            <div className="bd-filter-actions">
              <button className="bd-refresh-btn" onClick={fetchData}>↻ Refresh</button>
              <button className="bd-export-btn" onClick={handleExport} disabled={entries.length === 0}>
                ↓ Export
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bd-tabs">
            {['transactions', 'summary', 'charts'].map(t => (
              <button
                key={t}
                className={`bd-tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="bd-loading">Loading entries…</div>
          ) : (
            <>
              {/* Transactions */}
              {tab === 'transactions' && (
                <div className="bd-table-card">
                  {entries.length === 0 ? (
                    <div className="bd-empty">No entries for this period.</div>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className="bd-table-wrap">
                        <table className="bd-table">
                          <thead>
                            <tr>
                              {['Date', 'Type', 'Description', 'Category', 'Amount'].map(h => (
                                <th key={h}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((e) => {
                              const d = e.date.toDate();
                              const cat = e.category?.split(':')[0].trim();
                              return (
                                <tr key={e.id}>
                                  <td>
                                    <div className="bd-date-cell">
                                      {d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                    </div>
                                    <div className="bd-time-cell">
                                      {d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </td>
                                  <td>
                                    <span className="bd-type-pill" style={{
                                      background: e.type === 'income' ? 'var(--blue-dim)' : 'var(--red-dim)',
                                      color: e.type === 'income' ? 'var(--blue)' : 'var(--red)',
                                    }}>
                                      {e.type === 'income' ? '+ Income' : '− Expense'}
                                    </span>
                                  </td>
                                  <td style={{ maxWidth: '200px', color: 'var(--text2)' }}>{e.description}</td>
                                  <td>
                                    <span className="bd-cat-pill" style={{
                                      background: 'var(--surface2)',
                                      color: CATEGORY_COLORS[cat] || 'var(--text3)',
                                    }}>
                                      {CATEGORY_LABELS[cat] || e.category}
                                    </span>
                                  </td>
                                  <td style={{
                                    textAlign: 'right',
                                    fontFamily: 'var(--mono)',
                                    fontWeight: '500',
                                    color: e.type === 'income' ? 'var(--blue)' : 'var(--red)',
                                  }}>
                                    {e.type === 'income' ? '+' : '−'} {Number(e.amount).toLocaleString('id-ID')}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile card list */}
                      <div className="bd-card-list">
                        {entries.map((e) => {
                          const d = e.date.toDate();
                          const cat = e.category?.split(':')[0].trim();
                          return (
                            <div key={e.id} className="bd-entry-card">
                              <div className="bd-entry-body">
                                <div className="bd-entry-desc">{e.description}</div>
                                <div className="bd-entry-meta">
                                  {d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  {' · '}
                                  {CATEGORY_LABELS[cat] || e.category}
                                </div>
                              </div>
                              <div className="bd-entry-right">
                                <div className="bd-entry-amount" style={{
                                  color: e.type === 'income' ? 'var(--blue)' : 'var(--red)',
                                }}>
                                  {e.type === 'income' ? '+' : '−'}{Number(e.amount).toLocaleString('id-ID')}
                                </div>
                                <span className="bd-type-pill" style={{
                                  background: e.type === 'income' ? 'var(--blue-dim)' : 'var(--red-dim)',
                                  color: e.type === 'income' ? 'var(--blue)' : 'var(--red)',
                                  fontSize: '10px',
                                }}>
                                  {e.type === 'income' ? 'Income' : 'Expense'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Summary */}
              {tab === 'summary' && (
                <div className="bd-table-card">
                  {Object.keys(monthlyData).length === 0 ? (
                    <div className="bd-empty">No data for this period.</div>
                  ) : (
                    <div className="bd-table-wrap">
                      <table className="bd-table">
                        <thead>
                          <tr>
                            {['Month', 'Income', 'Expense', 'Net'].map(h => <th key={h}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(monthlyData).sort(([a], [b]) => b.localeCompare(a)).map(([key, m]) => {
                            const net = m.income - m.expense;
                            return (
                              <tr key={key}>
                                <td style={{ fontWeight: '700' }}>{m.label}</td>
                                <td style={{ color: 'var(--blue)', fontFamily: 'var(--mono)', fontWeight: '500' }}>{fmt(m.income)}</td>
                                <td style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontWeight: '500' }}>{fmt(m.expense)}</td>
                                <td style={{ fontFamily: 'var(--mono)', fontWeight: '700', color: net >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(net)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Charts */}
              {tab === 'charts' && (
                <div className="bd-charts-grid">
                  <div className="bd-chart-card">
                    <h3 className="bd-chart-title">By Category</h3>
                    {Object.keys(categoryTotals).length === 0 ? (
                      <div className="bd-empty" style={{ padding: '20px' }}>No expense data.</div>
                    ) : (
                      <div className="bd-bar-chart">
                        {Object.entries(categoryTotals).sort(([, a], [, b]) => b - a).map(([cat, amt]) => (
                          <div key={cat} className="bd-bar-row">
                            <div className="bd-bar-label">
                              {CATEGORY_LABELS[cat] || cat}
                            </div>
                            <div className="bd-bar-track">
                              <div
                                className="bd-bar-fill"
                                style={{
                                  width: `${(amt / maxCatAmount) * 100}%`,
                                  background: CATEGORY_COLORS[cat] || '#94a3b8',
                                }}
                              />
                            </div>
                            <div className="bd-bar-amount">{fmt(amt)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bd-chart-card">
                    <h3 className="bd-chart-title">Income vs Expense</h3>
                    {Object.keys(monthlyData).length === 0 ? (
                      <div className="bd-empty" style={{ padding: '20px' }}>No data.</div>
                    ) : (
                      <div>
                        {Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b)).map(([key, m]) => (
                          <div key={key} className="bd-month-group">
                            <div className="bd-month-label">{m.label}</div>
                            <div className="bd-bar-row" style={{ marginBottom: '6px' }}>
                              <div className="bd-bar-label" style={{ color: 'var(--green)' }}>Income</div>
                              <div className="bd-bar-track">
                                <div className="bd-bar-fill" style={{ width: `${(m.income / maxMonthlyAmount) * 100}%`, background: 'var(--green)' }} />
                              </div>
                              <div className="bd-bar-amount">{fmt(m.income)}</div>
                            </div>
                            <div className="bd-bar-row">
                              <div className="bd-bar-label" style={{ color: 'var(--red)' }}>Expense</div>
                              <div className="bd-bar-track">
                                <div className="bd-bar-fill" style={{ width: `${(m.expense / maxMonthlyAmount) * 100}%`, background: 'var(--red)' }} />
                              </div>
                              <div className="bd-bar-amount">{fmt(m.expense)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BookkeepingData;