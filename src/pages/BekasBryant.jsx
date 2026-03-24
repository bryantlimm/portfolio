import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

// ─── Icons (inline SVG, no emoji) ────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
const WhatsappIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const TagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l7.58-7.58a1 1 0 0 0 0-1.42Z"/><path d="M7 7h.01"/>
  </svg>
);
const ShirtIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
  </svg>
);
const ShoesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10 2.5 17"/><path d="m10 10 3.37-3.37a1.5 1.5 0 0 1 2.12 0l4.9 4.9a2 2 0 0 1 .59 1.4L21 16"/>
  </svg>
);
const LaptopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m14 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>
  </svg>
);
const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
  </svg>
);
const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
  </svg>
);
const BoxIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
  </svg>
);
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
  </svg>
);
const ImagePlaceholderIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#d1d5db" }}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",          label: "Semua",      icon: <GridIcon /> },
  { id: "clothing",    label: "Pakaian",    icon: <ShirtIcon /> },
  { id: "shoes",       label: "Sepatu",     icon: <ShoesIcon /> },
  { id: "electronics", label: "Elektronik", icon: <LaptopIcon /> },
  { id: "stationery",  label: "Alat Tulis", icon: <PencilIcon /> },
  { id: "books",       label: "Buku",       icon: <BookIcon /> },
  { id: "other",       label: "Lainnya",    icon: <BoxIcon /> },
];

function formatIDR(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  :root {
    --bg: #eef0f5;
    --blue: #2563eb;
    --blue-dark: #1d4ed8;
    --blue-light: #dbeafe;
    --blue-xlight: #eff6ff;
    --purple: #7c3aed;
    --grad: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
    --surface: #ffffff;
    --border: #e2e5ec;
    --ink: #111827;
    --ink-2: #374151;
    --ink-3: #6b7280;
    --ink-4: #9ca3af;
    --price: #16a34a;
    --radius: 10px;
    --radius-lg: 14px;
    --shadow-xs: 0 1px 3px rgba(0,0,0,0.07);
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
    --shadow-md: 0 8px 24px rgba(0,0,0,0.10);
  }

  .bb-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .bb-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }

  /* TOP SEARCH BAR */
  .bb-topbar {
    background: var(--surface);
    border-bottom: 1.5px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--shadow-xs);
  }
  .bb-topbar-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .bb-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .bb-brand-icon {
    width: 34px;
    height: 34px;
    background: var(--grad);
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }
  .bb-brand-name {
    font-size: 17px;
    font-weight: 800;
    background: var(--grad);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.3px;
    white-space: nowrap;
  }
  .bb-divider-v {
    width: 1.5px;
    height: 24px;
    background: var(--border);
    flex-shrink: 0;
  }
  .bb-search-wrap {
    flex: 1;
    position: relative;
  }
  .bb-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ink-4);
    display: flex;
    align-items: center;
    pointer-events: none;
  }
  .bb-search-input {
    width: 100%;
    padding: 9px 36px 9px 36px;
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13.5px;
    color: var(--ink);
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
  }
  .bb-search-input::placeholder { color: var(--ink-4); }
  .bb-search-input:focus {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
    background: white;
  }
  .bb-search-clear {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--ink-4);
    border: none;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
  }

  /* CATEGORY TABS */
  .bb-cats-bar {
    background: var(--surface);
    border-bottom: 1.5px solid var(--border);
  }
  .bb-cats-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .bb-cats-inner::-webkit-scrollbar { display: none; }
  .bb-cat-tab {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 11px 15px;
    border: none;
    border-bottom: 2.5px solid transparent;
    background: transparent;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-3);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    white-space: nowrap;
  }
  .bb-cat-tab:hover { color: var(--blue); }
  .bb-cat-tab.active {
    color: var(--blue);
    border-bottom-color: var(--blue);
    font-weight: 700;
  }

  /* PAGE BODY */
  .bb-body {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 20px 48px;
  }

  /* META ROW */
  .bb-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .bb-meta-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
  }
  .bb-meta-count {
    font-size: 12px;
    color: var(--ink-3);
    background: var(--surface);
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid var(--border);
  }

  /* GRID */
  .bb-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  @media (min-width: 480px) {
    .bb-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
  }
  @media (min-width: 700px) {
    .bb-grid { grid-template-columns: repeat(4, 1fr); }
  }
  @media (min-width: 960px) {
    .bb-grid { grid-template-columns: repeat(5, 1fr); }
  }

  /* PRODUCT CARD */
  .bb-card {
    background: var(--surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
    box-shadow: var(--shadow-xs);
  }
  .bb-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    border-color: #c7d7fc;
  }
  .bb-card:active { transform: scale(0.97); }
  .bb-card-img {
    aspect-ratio: 1;
    background: var(--bg);
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bb-card-img img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.35s;
  }
  .bb-card:hover .bb-card-img img { transform: scale(1.06); }
  .bb-card-badge {
    position: absolute;
    top: 7px; left: 7px;
    background: rgba(255,255,255,0.93);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 5px;
    padding: 3px 7px;
    font-size: 10px;
    font-weight: 700;
    color: var(--blue);
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .bb-card-body { padding: 10px 10px 12px; }
  .bb-card-title {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--ink-2);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 6px;
    min-height: 35px;
  }
  .bb-card-price {
    font-size: 15px;
    font-weight: 800;
    color: var(--price);
    letter-spacing: -0.3px;
  }

  /* SKELETON */
  .bb-skeleton-card {
    background: var(--surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .bb-ske {
    background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
    background-size: 200% 100%;
    animation: bb-shimmer 1.4s infinite;
  }
  .bb-ske-img { aspect-ratio: 1; }
  .bb-ske-body { padding: 10px; display: flex; flex-direction: column; gap: 7px; }
  .bb-ske-line { border-radius: 5px; height: 11px; }
  @keyframes bb-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* EMPTY */
  .bb-empty {
    grid-column: 1/-1;
    text-align: center;
    padding: 64px 24px;
  }
  .bb-empty-icon {
    width: 60px; height: 60px;
    background: var(--blue-xlight);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--blue);
    margin: 0 auto 14px;
  }
  .bb-empty h3 { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
  .bb-empty p { font-size: 13px; color: var(--ink-3); }

  /* BANNER */
  .bb-banner {
    background: var(--grad);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .bb-banner-text { color: white; }
  .bb-banner-text h2 { font-size: 15px; font-weight: 800; margin-bottom: 2px; letter-spacing: -0.2px; }
  .bb-banner-text p { font-size: 12px; opacity: 0.75; }
  .bb-banner-badge {
    background: rgba(255,255,255,0.2);
    border: 1.5px solid rgba(255,255,255,0.4);
    color: white;
    padding: 5px 13px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* MODAL */
  .bb-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(17,24,39,0.55);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: flex-end;
    animation: bb-fade 0.18s;
  }
  @media (min-width: 640px) {
    .bb-overlay { align-items: center; justify-content: center; padding: 20px; }
  }
  @keyframes bb-fade { from { opacity: 0; } to { opacity: 1; } }
  .bb-modal {
    background: var(--surface);
    width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 90vh;
    overflow-y: auto;
    animation: bb-slide-up 0.28s cubic-bezier(0.34,1.3,0.64,1);
  }
  @media (min-width: 640px) {
    .bb-modal {
      border-radius: 16px;
      max-width: 820px;
      max-height: 86vh;
      animation: bb-pop 0.22s cubic-bezier(0.34,1.2,0.64,1);
    }
  }
  @keyframes bb-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes bb-pop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .bb-modal-layout { display: grid; grid-template-columns: 1fr; }
  @media (min-width: 640px) { .bb-modal-layout { grid-template-columns: 1fr 1fr; } }
  .bb-modal-gallery {
    background: var(--bg);
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @media (min-width: 640px) { .bb-modal-gallery { border-radius: 16px 0 0 16px; } }
  .bb-modal-gallery img { width: 100%; height: 100%; object-fit: cover; }
  .bb-gallery-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.92);
    border: 1px solid var(--border);
    border-radius: 50%;
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: var(--ink-2);
    box-shadow: var(--shadow-sm);
  }
  .bb-gallery-btn.prev { left: 10px; }
  .bb-gallery-btn.next { right: 10px; }
  .bb-gallery-dots {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
  }
  .bb-gallery-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.5);
    transition: background 0.18s, transform 0.18s;
  }
  .bb-gallery-dot.active { background: white; transform: scale(1.3); }
  .bb-modal-close {
    position: absolute;
    top: 10px; right: 10px;
    background: rgba(255,255,255,0.92);
    border: 1px solid var(--border);
    border-radius: 50%;
    width: 30px; height: 30px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: var(--ink-2);
    z-index: 5;
  }
  .bb-modal-info {
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .bb-modal-cat {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    background: var(--blue-xlight);
    border: 1px solid var(--blue-light);
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    color: var(--blue);
    align-self: flex-start;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .bb-modal-title {
    font-size: clamp(18px, 2.5vw, 22px);
    font-weight: 800;
    color: var(--ink);
    line-height: 1.3;
    letter-spacing: -0.3px;
  }
  .bb-modal-price {
    font-size: 28px;
    font-weight: 800;
    color: var(--price);
    letter-spacing: -0.5px;
  }
  .bb-modal-hr { height: 1px; background: var(--border); }
  .bb-modal-desc {
    font-size: 13.5px;
    line-height: 1.7;
    color: var(--ink-3);
    white-space: pre-line;
    flex: 1;
  }
  .bb-modal-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 20px;
    background: #25D366;
    color: white;
    text-decoration: none;
    border-radius: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
    box-shadow: 0 4px 14px rgba(37,211,102,0.28);
  }
  .bb-modal-cta:hover {
    background: #1fb954;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(37,211,102,0.35);
  }
  .bb-modal-cta:active { transform: scale(0.98); }

  @media (max-width: 480px) {
    .bb-topbar-inner { padding: 10px 12px; gap: 10px; }
    .bb-body { padding: 14px 12px 40px; }
    .bb-brand-name { font-size: 15px; }
    .bb-divider-v { display: none; }
    .bb-modal-info { padding: 16px 18px; }
  }
`;

// ─── Modal ─────────────────────────────────────────────────────────────────────
function ProductModal({ product, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  if (!product) return null;

  const images = product.images || (product.image ? [product.image] : []);
  const catObj = CATEGORIES.find((c) => c.id === product.category);
  const waText = encodeURIComponent(
    `Hi, Bryant. I'd like to buy this product www.bryantlimm.org/bekasbryant/${product.id}`
  );
  const waLink = `https://wa.me/6282182686717?text=${waText}`;

  return (
    <div className="bb-overlay" onClick={onClose}>
      <div className="bb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bb-modal-layout">
          <div className="bb-modal-gallery">
            {images.length > 0 ? (
              <img src={images[imgIdx]} alt={product.title} />
            ) : (
              <ImagePlaceholderIcon />
            )}
            {images.length > 1 && (
              <>
                <button className="bb-gallery-btn prev" onClick={() => setImgIdx((p) => (p - 1 + images.length) % images.length)}>
                  <ChevronLeftIcon />
                </button>
                <button className="bb-gallery-btn next" onClick={() => setImgIdx((p) => (p + 1) % images.length)}>
                  <ChevronRightIcon />
                </button>
                <div className="bb-gallery-dots">
                  {images.map((_, i) => (
                    <div key={i} className={`bb-gallery-dot ${i === imgIdx ? "active" : ""}`} />
                  ))}
                </div>
              </>
            )}
            <button className="bb-modal-close" onClick={onClose}><XIcon size={13} /></button>
          </div>

          <div className="bb-modal-info">
            {catObj && (
              <span className="bb-modal-cat">{catObj.icon} {catObj.label}</span>
            )}
            <h2 className="bb-modal-title">{product.title}</h2>
            <p className="bb-modal-price">{formatIDR(product.price)}</p>
            <div className="bb-modal-hr" />
            {product.description && (
              <p className="bb-modal-desc">{product.description}</p>
            )}
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="bb-modal-cta">
              <WhatsappIcon />
              Chat &amp; Beli Sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────
function ProductCard({ product, onClick }) {
  const images = product.images || (product.image ? [product.image] : []);
  const catObj = CATEGORIES.find((c) => c.id === product.category);

  return (
    <div className="bb-card" onClick={() => onClick(product)}>
      <div className="bb-card-img">
        {images.length > 0 ? (
          <img src={images[0]} alt={product.title} />
        ) : (
          <ImagePlaceholderIcon />
        )}
        {catObj && (
          <span className="bb-card-badge">{catObj.icon} {catObj.label}</span>
        )}
      </div>
      <div className="bb-card-body">
        <p className="bb-card-title">{product.title}</p>
        <p className="bb-card-price">{formatIDR(product.price)}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bb-skeleton-card">
      <div className="bb-ske bb-ske-img" />
      <div className="bb-ske-body">
        <div className="bb-ske bb-ske-line" style={{ width: "88%" }} />
        <div className="bb-ske bb-ske-line" style={{ width: "62%" }} />
        <div className="bb-ske bb-ske-line" style={{ width: "48%", height: 15, marginTop: 2 }} />
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function BekasBryant() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(
          collection(db, "bekasbryant_products"),
          where("active", "==", true)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const activeCatLabel = CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "Semua";

  return (
    <div className="bb-root">
      <style>{styles}</style>

      {/* Topbar */}
      <div className="bb-topbar">
        <div className="bb-topbar-inner">
          <a className="bb-brand">
            {/* <div className="bb-brand-icon"><TagIcon /></div> */}
            <span className="bb-brand-name">BEKAS BRYANT</span>
          </a>
          <div className="bb-divider-v" />
          <div className="bb-search-wrap">
            <span className="bb-search-icon"><SearchIcon /></span>
            <input
              type="text"
              className="bb-search-input"
              placeholder="Cari produk bekas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="bb-search-clear" onClick={() => setSearch("")}>
                <XIcon size={10} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bb-cats-bar">
        <div className="bb-cats-inner">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`bb-cat-tab ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="bb-body">
        {!search && activeCategory === "all" && (
          <div className="bb-banner">
            <div className="bb-banner-text">
              <h2>Barang Preloved nya Bryant</h2>
              <p>Nego boleh tapi yg waras ya...</p>
            </div>
            <span className="bb-banner-badge">Indonesia</span>
          </div>
        )}

        {!loading && (
          <div className="bb-meta">
            <span className="bb-meta-title">{activeCatLabel}</span>
            <span className="bb-meta-count">{filtered.length} produk</span>
          </div>
        )}

        <div className="bb-grid">
          {loading ? (
            [...Array(10)].map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="bb-empty">
              <div className="bb-empty-icon"><SearchIcon /></div>
              <h3>Produk tidak ditemukan</h3>
              <p>Coba kata kunci atau kategori lain</p>
            </div>
          ) : (
            filtered.map((product) => (
              <ProductCard key={product.id} product={product} onClick={setSelectedProduct} />
            ))
          )}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}