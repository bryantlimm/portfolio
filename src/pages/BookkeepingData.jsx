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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const expenses = entries.filter(e => e.type === 'expense');
  const incomes = entries.filter(e => e.type === 'income');
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomes.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

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
    rows.push({ Description: 'NET BALANCE', 'Amount (IDR)': balance });
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .bd-page {
          min-height: 100vh;
          background: #f1f5f9;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .bd-topbar {
          background: #fff;
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

        .bd-logo {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .bd-logo span { color: #2563eb; }

        .bd-topbar-right { display: flex; align-items: center; gap: 10px; }

        .bd-nav-btn {
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
        }

        .bd-nav-btn:hover { background: #2563eb; color: white; border-color: #2563eb; }

        .bd-signout-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 10px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .bd-signout-btn:hover { background: #f1f5f9; color: #64748b; }

        .bd-main {
          max-width: 960px;
          margin: 0 auto;
          padding: 24px 16px 48px;
        }

        /* Filter bar */
        .bd-filter-bar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .bd-filter-left {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .bd-date-group { display: flex; flex-direction: column; gap: 5px; }

        .bd-label {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .bd-date-input {
          padding: 9px 13px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          background: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
        }

        .bd-date-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

        .bd-date-sep { color: #cbd5e1; font-size: 16px; padding-bottom: 8px; }

        .bd-refresh-btn {
          padding: 9px 16px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 10px;
          color: #64748b;
          transition: all 0.2s;
        }

        .bd-refresh-btn:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }

        .bd-export-btn {
          padding: 10px 20px;
          background: #2563eb;
          color: #fff;
          border: none;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s;
          box-shadow: 0 3px 10px rgba(37,99,235,0.25);
          white-space: nowrap;
        }

        .bd-export-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 5px 14px rgba(37,99,235,0.3); }
        .bd-export-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Summary cards */
        .bd-summary-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .bd-summary-card {
          background: #fff;
          border-radius: 16px;
          padding: 16px 18px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.05);
        }

        .bd-summary-label {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .bd-summary-amount {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        /* Tabs */
        .bd-tabs {
          display: flex;
          gap: 4px;
          background: #e8edf2;
          padding: 4px;
          border-radius: 14px;
          margin-bottom: 16px;
          width: fit-content;
        }

        .bd-tab {
          padding: 9px 20px;
          background: transparent;
          border: none;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s;
          letter-spacing: 0.2px;
        }

        .bd-tab.active {
          background: #fff;
          color: #2563eb;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        /* Table card */
        .bd-table-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
          overflow-x: auto;
        }

        .bd-table { width: 100%; border-collapse: collapse; min-width: 520px; }

        .bd-table th {
          padding: 13px 16px;
          background: #f8fafc;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          color: #94a3b8;
          text-transform: uppercase;
          border-bottom: 1px solid #f1f5f9;
        }

        .bd-table td {
          padding: 13px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
          border-bottom: 1px solid #f8fafc;
          vertical-align: middle;
        }

        .bd-table tr:last-child td { border-bottom: none; }
        .bd-table tr:hover td { background: #fafcff; }

        .bd-date-cell { font-size: 13px; font-weight: 600; }
        .bd-time-cell { font-size: 11px; color: #94a3b8; margin-top: 2px; }

        .bd-type-pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }

        .bd-cat-pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Charts */
        .bd-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .bd-chart-card {
          background: #fff;
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
        }

        .bd-chart-title {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 18px;
          letter-spacing: -0.2px;
        }

        .bd-bar-chart { display: flex; flex-direction: column; gap: 12px; }

        .bd-bar-row { display: flex; align-items: center; gap: 10px; }

        .bd-bar-label {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          width: 120px;
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bd-bar-track {
          flex: 1;
          height: 8px;
          background: #f1f5f9;
          border-radius: 99px;
          overflow: hidden;
        }

        .bd-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.6s cubic-bezier(0.16,1,0.3,1);
        }

        .bd-bar-amount {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          width: 110px;
          text-align: right;
          flex-shrink: 0;
        }

        .bd-month-group { margin-bottom: 16px; }

        .bd-month-label {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .bd-loading, .bd-empty {
          padding: 52px;
          text-align: center;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .bd-summary-cards { grid-template-columns: repeat(2, 1fr); }
          .bd-charts-grid { grid-template-columns: 1fr; }
          .bd-topbar { padding: 12px 16px; }
          .bd-main { padding: 16px 12px 40px; }
          .bd-tabs { width: 100%; }
          .bd-tab { flex: 1; text-align: center; padding: 9px 12px; }
          .bd-filter-left { gap: 8px; }
          .bd-date-sep { display: none; }
        }

        @media (max-width: 480px) {
          .bd-summary-cards { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .bd-summary-amount { font-size: 14px; }
          .bd-filter-bar { flex-direction: column; align-items: stretch; }
          .bd-export-btn { width: 100%; text-align: center; }
          .bd-logo { font-size: 15px; }
        }
      `}</style>

      <div className="bd-page">
        <div className="bd-topbar">
          <div className="bd-logo">Hemat woi</div>
          <div className="bd-topbar-right">
            <button className="bd-nav-btn" onClick={() => navigate('/bookkeeping')}>← New Entry</button>
            <button className="bd-signout-btn" onClick={handleSignOut}>Sign out</button>
          </div>
        </div>

        <div className="bd-main">
          {/* Summary cards */}
          <div className="bd-summary-cards">
            <div className="bd-summary-card" style={{ borderTop: '3px solid #2563eb' }}>
              <div className="bd-summary-label">Total Income</div>
              <div className="bd-summary-amount" style={{ color: '#2563eb' }}>{fmt(totalIncome)}</div>
            </div>
            <div className="bd-summary-card" style={{ borderTop: '3px solid #ef4444' }}>
              <div className="bd-summary-label">Total Expense</div>
              <div className="bd-summary-amount" style={{ color: '#dc2626' }}>{fmt(totalExpense)}</div>
            </div>
            <div className="bd-summary-card" style={{ borderTop: `3px solid ${balance >= 0 ? '#2563eb' : '#ef4444'}` }}>
              <div className="bd-summary-label">Net Balance</div>
              <div className="bd-summary-amount" style={{ color: balance >= 0 ? '#2563eb' : '#dc2626' }}>{fmt(balance)}</div>
            </div>
            <div className="bd-summary-card" style={{ borderTop: '3px solid #64748b' }}>
              <div className="bd-summary-label">Entries</div>
              <div className="bd-summary-amount" style={{ color: '#0f172a' }}>{entries.length}</div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="bd-filter-bar">
            <div className="bd-filter-left">
              <div className="bd-date-group">
                <label className="bd-label">From</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bd-date-input" />
              </div>
              <span className="bd-date-sep">—</span>
              <div className="bd-date-group">
                <label className="bd-label">To</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bd-date-input" />
              </div>
              <button className="bd-refresh-btn" onClick={fetchData}>↻ Refresh</button>
            </div>
            <button className="bd-export-btn" onClick={handleExport} disabled={entries.length === 0}>
              ↓ Export XLSX
            </button>
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
                                <span
                                  className="bd-type-pill"
                                  style={{
                                    background: e.type === 'income' ? '#f0fdf4' : '#fef2f2',
                                    color: e.type === 'income' ? '#16a34a' : '#dc2626',
                                  }}
                                >
                                  {e.type === 'income' ? '+ Income' : '− Expense'}
                                </span>
                              </td>
                              <td style={{ maxWidth: '200px' }}>{e.description}</td>
                              <td>
                                <span
                                  className="bd-cat-pill"
                                  style={{
                                    background: CATEGORY_BG[cat] || '#f8fafc',
                                    color: CATEGORY_COLORS[cat] || '#94a3b8',
                                  }}
                                >
                                  {CATEGORY_LABELS[cat] || e.category}
                                </span>
                              </td>
                              <td style={{
                                textAlign: 'right',
                                fontWeight: '700',
                                color: e.type === 'income' ? '#16a34a' : '#dc2626',
                                fontVariantNumeric: 'tabular-nums',
                              }}>
                                {e.type === 'income' ? '+' : '−'} {Number(e.amount).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Summary */}
              {tab === 'summary' && (
                <div className="bd-table-card">
                  {Object.keys(monthlyData).length === 0 ? (
                    <div className="bd-empty">No data for this period.</div>
                  ) : (
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
                              <td style={{ color: '#2563eb', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>{fmt(m.income)}</td>
                              <td style={{ color: '#dc2626', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>{fmt(m.expense)}</td>
                              <td style={{ fontWeight: '800', color: net >= 0 ? '#16a34a' : '#dc2626', fontVariantNumeric: 'tabular-nums' }}>{fmt(net)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Charts */}
              {tab === 'charts' && (
                <div className="bd-charts-grid">
                  <div className="bd-chart-card">
                    <h3 className="bd-chart-title">Expenses by Category</h3>
                    {Object.keys(categoryTotals).length === 0 ? (
                      <div className="bd-empty" style={{ padding: '24px' }}>No expense data.</div>
                    ) : (
                      <div className="bd-bar-chart">
                        {Object.entries(categoryTotals).sort(([, a], [, b]) => b - a).map(([cat, amt]) => (
                          <div key={cat} className="bd-bar-row">
                            <div className="bd-bar-label">{CATEGORY_LABELS[cat] || cat}</div>
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
                    <h3 className="bd-chart-title">Monthly Income vs Expense</h3>
                    {Object.keys(monthlyData).length === 0 ? (
                      <div className="bd-empty" style={{ padding: '24px' }}>No data.</div>
                    ) : (
                      <div>
                        {Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b)).map(([key, m]) => (
                          <div key={key} className="bd-month-group">
                            <div className="bd-month-label">{m.label}</div>
                            <div className="bd-bar-row" style={{ marginBottom: '6px' }}>
                              <div className="bd-bar-label" style={{ color: '#16a34a' }}>Income</div>
                              <div className="bd-bar-track">
                                <div className="bd-bar-fill" style={{ width: `${(m.income / maxMonthlyAmount) * 100}%`, background: '#22c55e' }} />
                              </div>
                              <div className="bd-bar-amount">{fmt(m.income)}</div>
                            </div>
                            <div className="bd-bar-row">
                              <div className="bd-bar-label" style={{ color: '#dc2626' }}>Expense</div>
                              <div className="bd-bar-track">
                                <div className="bd-bar-fill" style={{ width: `${(m.expense / maxMonthlyAmount) * 100}%`, background: '#ef4444' }} />
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