// src/pages/BookkeepingData.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import '../styles/bookkeeping.css';

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
  food: '#e8734a',
  transport: '#4a7de8',
  offering: '#9b59b6',
  shopping: '#e8a84a',
  bills: '#e84a4a',
  health: '#4ae87a',
  entertainment: '#4ae8d8',
  other: '#888',
};

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const BookkeepingData = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('transactions'); // 'transactions' | 'summary' | 'charts'
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const expenses = entries.filter(e => e.type === 'expense');
  const incomes = entries.filter(e => e.type === 'income');
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomes.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  // Category breakdown
  const categoryTotals = expenses.reduce((acc, e) => {
    const cat = e.category?.split(':')[0].trim() || 'other';
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {});

  // Monthly breakdown
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
    const rows = entries.map(e => ({
      Date: e.date.toDate().toLocaleDateString('id-ID'),
      Time: e.date.toDate().toLocaleTimeString('id-ID'),
      Type: e.type === 'income' ? 'Income' : 'Expense',
      Description: e.description,
      Category: CATEGORY_LABELS[e.category] || e.category,
      'Amount (IDR)': e.amount,
    }));

    // Add summary rows
    rows.push({});
    rows.push({ Description: 'TOTAL INCOME', 'Amount (IDR)': totalIncome });
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
    <div style={styles.page}>
      {/* Topbar */}
      <div style={styles.topbar} className="bookkeeping-data-topbar">
        <div style={styles.topbarLeft}>
          <span style={styles.logo}>₊ Ledger</span>
        </div>
        <div style={styles.topbarRight} className="bookkeeping-data-topbar-right">
          <button style={styles.navBtn} className="bookkeeping-data-nav-btn" onClick={() => navigate('/bookkeeping')}>
            ← New Entry
          </button>
          <button style={styles.signOutBtn} className="bookkeeping-data-sign-out-btn" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>

      <div style={styles.main} className="bookkeeping-data-main">
        {/* Date range + export */}
        <div style={styles.filterBar} className="bookkeeping-data-filter-bar">
          <div style={styles.filterLeft} className="bookkeeping-data-filter-left">
            <div style={styles.dateGroup} className="bookkeeping-data-date-group">
              <label style={styles.label}>FROM</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.dateInput} className="bookkeeping-data-date-input" />
            </div>
            <span style={styles.dateSep} className="bookkeeping-data-date-sep">—</span>
            <div style={styles.dateGroup} className="bookkeeping-data-date-group">
              <label style={styles.label}>TO</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.dateInput} className="bookkeeping-data-date-input" />
            </div>
            <button style={styles.refreshBtn} className="bookkeeping-data-refresh-btn" onClick={fetchData}>Refresh</button>
          </div>
          <button style={styles.exportBtn} className="bookkeeping-data-export-btn" onClick={handleExport} disabled={entries.length === 0}>
            ↓ Export XLSX
          </button>
        </div>

        {/* Summary cards */}
        <div style={styles.summaryCards} className="bookkeeping-data-summary-cards">
          <div style={{ ...styles.summaryCard, borderTop: '3px solid #2d4a2d' }} className="bookkeeping-data-summary-card">
            <div style={styles.summaryLabel} className="bookkeeping-data-summary-label">TOTAL INCOME</div>
            <div style={{ ...styles.summaryAmount, color: '#2d4a2d' }} className="bookkeeping-data-summary-amount">{fmt(totalIncome)}</div>
          </div>
          <div style={{ ...styles.summaryCard, borderTop: '3px solid #c0392b' }} className="bookkeeping-data-summary-card">
            <div style={styles.summaryLabel} className="bookkeeping-data-summary-label">TOTAL EXPENSE</div>
            <div style={{ ...styles.summaryAmount, color: '#c0392b' }} className="bookkeeping-data-summary-amount">{fmt(totalExpense)}</div>
          </div>
          <div style={{ ...styles.summaryCard, borderTop: `3px solid ${balance >= 0 ? '#2d4a2d' : '#c0392b'}` }} className="bookkeeping-data-summary-card">
            <div style={styles.summaryLabel} className="bookkeeping-data-summary-label">NET BALANCE</div>
            <div style={{ ...styles.summaryAmount, color: balance >= 0 ? '#2d4a2d' : '#c0392b' }} className="bookkeeping-data-summary-amount">{fmt(balance)}</div>
          </div>
          <div style={{ ...styles.summaryCard, borderTop: '3px solid #c8b89a' }} className="bookkeeping-data-summary-card">
            <div style={styles.summaryLabel} className="bookkeeping-data-summary-label">ENTRIES</div>
            <div style={{ ...styles.summaryAmount, color: '#1a1a1a' }} className="bookkeeping-data-summary-amount">{entries.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs} className="bookkeeping-data-tabs">
          {['transactions', 'summary', 'charts'].map(t => (
            <button
              key={t}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
              className="bookkeeping-data-tab"
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {loading ? (
          <div style={styles.loading}>Loading entries...</div>
        ) : (

          <>
            {/* TRANSACTIONS */}
            {tab === 'transactions' && (
              <div style={styles.tableCard} className="bookkeeping-data-table-card">
                {entries.length === 0 ? (
                  <div style={styles.empty}>No entries for this period.</div>
                ) : (
                  <table style={styles.table} className="bookkeeping-data-table">
                    <thead>
                      <tr>
                        {['Date', 'Type', 'Description', 'Category', 'Amount'].map(h => (
                          <th key={h} style={styles.th} className="bookkeeping-data-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e, i) => {
                        const d = e.date.toDate();
                        const cat = e.category?.split(':')[0].trim();
                        return (
                          <tr key={e.id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                            <td style={styles.td} className="bookkeeping-data-td">
                              <div style={styles.dateCell}>
                                {d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                              </div>
                              <div style={styles.timeCell}>{d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td style={styles.td} className="bookkeeping-data-td">
                              <span style={{ ...styles.typePill, background: e.type === 'income' ? '#e8f5e9' : '#fdecea', color: e.type === 'income' ? '#2d4a2d' : '#c0392b' }} className="bookkeeping-data-type-pill">
                                {e.type === 'income' ? '+ Income' : '− Expense'}
                              </span>
                            </td>
                            <td style={{ ...styles.td, maxWidth: '220px' }} className="bookkeeping-data-td">{e.description}</td>
                            <td style={styles.td} className="bookkeeping-data-td">
                              <span style={{ ...styles.catPill, background: CATEGORY_COLORS[cat] + '22', color: CATEGORY_COLORS[cat] || '#888' }}>
                                {CATEGORY_LABELS[cat] || e.category}
                              </span>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right', fontFamily: "'Courier New', monospace", fontWeight: '600', color: e.type === 'income' ? '#2d4a2d' : '#c0392b' }} className="bookkeeping-data-td">
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

            {/* MONTHLY SUMMARY */}
            {tab === 'summary' && (
              <div style={styles.tableCard} className="bookkeeping-data-table-card">
                {Object.keys(monthlyData).length === 0 ? (
                  <div style={styles.empty}>No data for this period.</div>
                ) : (
                  <table style={styles.table} className="bookkeeping-data-table">
                    <thead>
                      <tr>
                        {['Month', 'Income', 'Expense', 'Net'].map(h => (
                          <th key={h} style={styles.th} className="bookkeeping-data-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(monthlyData).sort(([a], [b]) => b.localeCompare(a)).map(([key, m], i) => {
                        const net = m.income - m.expense;
                        return (
                          <tr key={key} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                            <td style={{ ...styles.td, fontWeight: '600' }} className="bookkeeping-data-td">{m.label}</td>
                            <td style={{ ...styles.td, color: '#2d4a2d', fontFamily: "'Courier New', monospace" }} className="bookkeeping-data-td">{fmt(m.income)}</td>
                            <td style={{ ...styles.td, color: '#c0392b', fontFamily: "'Courier New', monospace" }} className="bookkeeping-data-td">{fmt(m.expense)}</td>
                            <td style={{ ...styles.td, fontFamily: "'Courier New', monospace", fontWeight: '700', color: net >= 0 ? '#2d4a2d' : '#c0392b' }} className="bookkeeping-data-td">{fmt(net)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* CHARTS */}
            {tab === 'charts' && (
              <div style={styles.chartsGrid} className="bookkeeping-data-charts-grid">
                {/* Category breakdown */}
                <div style={styles.chartCard} className="bookkeeping-data-chart-card">
                  <h3 style={styles.chartTitle} className="bookkeeping-data-chart-title">Expenses by Category</h3>
                  {Object.keys(categoryTotals).length === 0 ? (
                    <div style={styles.empty}>No expense data.</div>
                  ) : (
                    <div style={styles.barChart}>
                      {Object.entries(categoryTotals)
                        .sort(([, a], [, b]) => b - a)
                        .map(([cat, amt]) => (
                          <div key={cat} style={styles.barRow} className="bookkeeping-data-bar-row">
                            <div style={styles.barLabel} className="bookkeeping-data-bar-label">{CATEGORY_LABELS[cat] || cat}</div>
                            <div style={styles.barTrack}>
                              <div style={{
                                ...styles.barFill,
                                width: `${(amt / maxCatAmount) * 100}%`,
                                background: CATEGORY_COLORS[cat] || '#888',
                              }} />
                            </div>
                            <div style={styles.barAmount} className="bookkeeping-data-bar-amount">{fmt(amt)}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Monthly income vs expense */}
                <div style={styles.chartCard} className="bookkeeping-data-chart-card">
                  <h3 style={styles.chartTitle} className="bookkeeping-data-chart-title">Monthly Income vs Expense</h3>
                  {Object.keys(monthlyData).length === 0 ? (
                    <div style={styles.empty}>No data.</div>
                  ) : (
                    <div style={styles.barChart}>
                      {Object.entries(monthlyData)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([key, m]) => (
                          <div key={key} style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', marginBottom: '6px', letterSpacing: '1px' }}>
                              {m.label.toUpperCase()}
                            </div>
                            <div style={styles.barRow} className="bookkeeping-data-bar-row">
                              <div style={{ ...styles.barLabel, color: '#2d4a2d', width: '60px' }} className="bookkeeping-data-bar-label">Income</div>
                              <div style={styles.barTrack}>
                                <div style={{ ...styles.barFill, width: `${(m.income / maxMonthlyAmount) * 100}%`, background: '#2d4a2d' }} />
                              </div>
                              <div style={styles.barAmount} className="bookkeeping-data-bar-amount">{fmt(m.income)}</div>
                            </div>
                            <div style={styles.barRow} className="bookkeeping-data-bar-row">
                              <div style={{ ...styles.barLabel, color: '#c0392b', width: '60px' }} className="bookkeeping-data-bar-label">Expense</div>
                              <div style={styles.barTrack}>
                                <div style={{ ...styles.barFill, width: `${(m.expense / maxMonthlyAmount) * 100}%`, background: '#c0392b' }} />
                              </div>
                              <div style={styles.barAmount} className="bookkeeping-data-bar-amount">{fmt(m.expense)}</div>
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
  },
  topbarLeft: { display: 'flex', alignItems: 'center' },
  logo: {
    color: '#f5f0e8',
    fontSize: '18px',
    fontFamily: "'Courier New', monospace",
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  navBtn: {
    background: 'transparent',
    border: '1px solid #a8c5a8',
    color: '#a8c5a8',
    padding: '6px 16px',
    fontFamily: "'Courier New', monospace",
    fontSize: '12px',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    borderRadius: '1px',
  },
  signOutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#7a9a7a',
    fontFamily: "'Courier New', monospace",
    fontSize: '11px',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '36px 24px',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  filterLeft: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
  },
  dateGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#888',
    fontFamily: "'Courier New', monospace",
  },
  dateInput: {
    padding: '8px 10px',
    border: '1px solid #c8b89a',
    background: '#fffef9',
    fontFamily: "'Courier New', monospace",
    fontSize: '13px',
    color: '#1a1a1a',
    outline: 'none',
    borderRadius: '1px',
  },
  dateSep: {
    color: '#888',
    fontSize: '18px',
    paddingBottom: '6px',
  },
  refreshBtn: {
    padding: '8px 16px',
    background: '#e8e0d0',
    border: '1px solid #c8b89a',
    fontFamily: "'Courier New', monospace",
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius: '1px',
    color: '#555',
  },
  exportBtn: {
    padding: '10px 22px',
    background: '#2d4a2d',
    color: '#f5f0e8',
    border: 'none',
    fontFamily: "'Courier New', monospace",
    fontSize: '13px',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    borderRadius: '1px',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '28px',
  },
  summaryCard: {
    background: '#fffef9',
    border: '1px solid #c8b89a',
    padding: '18px 20px',
    borderRadius: '2px',
  },
  summaryLabel: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#888',
    fontFamily: "'Courier New', monospace",
    marginBottom: '8px',
  },
  summaryAmount: {
    fontSize: '18px',
    fontFamily: "'Courier New', monospace",
    fontWeight: '700',
  },
  tabs: {
    display: 'flex',
    gap: '0',
    marginBottom: '0',
    borderBottom: '2px solid #c8b89a',
  },
  tab: {
    padding: '10px 24px',
    background: 'transparent',
    border: 'none',
    fontFamily: "'Courier New', monospace",
    fontSize: '13px',
    color: '#888',
    cursor: 'pointer',
    letterSpacing: '1px',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
  },
  tabActive: {
    color: '#2d4a2d',
    borderBottom: '2px solid #2d4a2d',
    fontWeight: '700',
  },
  tableCard: {
    background: '#fffef9',
    border: '1px solid #c8b89a',
    borderTop: 'none',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px 16px',
    background: '#f0e8d8',
    textAlign: 'left',
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#666',
    fontFamily: "'Courier New', monospace",
    borderBottom: '1px solid #c8b89a',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#1a1a1a',
    borderBottom: '1px solid #ece4d4',
    verticalAlign: 'middle',
  },
  trEven: { background: '#fffef9' },
  trOdd: { background: '#faf6ee' },
  dateCell: { fontSize: '13px', fontFamily: 'monospace' },
  timeCell: { fontSize: '10px', color: '#aaa', fontFamily: 'monospace', marginTop: '2px' },
  typePill: {
    display: 'inline-block',
    padding: '3px 9px',
    borderRadius: '2px',
    fontSize: '11px',
    fontFamily: 'monospace',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  catPill: {
    display: 'inline-block',
    padding: '3px 9px',
    borderRadius: '2px',
    fontSize: '12px',
    fontWeight: '500',
  },
  loading: {
    padding: '60px',
    textAlign: 'center',
    color: '#888',
    fontFamily: 'monospace',
    letterSpacing: '1px',
  },
  empty: {
    padding: '60px',
    textAlign: 'center',
    color: '#bbb',
    fontFamily: 'monospace',
    letterSpacing: '1px',
    fontSize: '13px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    paddingTop: '20px',
  },
  chartCard: {
    background: '#fffef9',
    border: '1px solid #c8b89a',
    padding: '24px',
    borderRadius: '2px',
  },
  chartTitle: {
    fontSize: '13px',
    letterSpacing: '1px',
    color: '#555',
    fontFamily: "'Courier New', monospace",
    textTransform: 'uppercase',
    marginBottom: '20px',
    fontWeight: '700',
    margin: '0 0 20px 0',
  },
  barChart: { display: 'flex', flexDirection: 'column', gap: '12px' },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  barLabel: {
    fontSize: '12px',
    color: '#555',
    width: '130px',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  barTrack: {
    flex: 1,
    height: '10px',
    background: '#ece4d4',
    borderRadius: '1px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '1px',
    transition: 'width 0.5s ease',
  },
  barAmount: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#555',
    width: '110px',
    textAlign: 'right',
    flexShrink: 0,
  },
};

export default BookkeepingData;