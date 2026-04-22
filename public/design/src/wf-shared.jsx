/* Shared wireframe primitives — phone frame, status bar, bottom nav, annotations */
const { useState, useEffect, useRef } = React;

function StatusBar({ time = "9:41" }) {
  return (
    <>
      <div className="wf-notch" />
      <div className="wf-status">
        <span>{time}</span>
        <span className="wf-status-icons">
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 9h2M5 7h2M9 5h2M13 1h2" stroke="#1C1813" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5 Q 7 -2 13 5" stroke="#1C1813" strokeWidth="1.2" fill="none" strokeLinecap="round"/><path d="M4 7 Q 7 4 10 7" stroke="#1C1813" strokeWidth="1.2" fill="none" strokeLinecap="round"/><circle cx="7" cy="9" r="0.8" fill="#1C1813"/></svg>
          <svg width="22" height="10" viewBox="0 0 22 10"><rect x="0.7" y="0.7" width="18" height="8.6" rx="1.6" stroke="#1C1813" strokeWidth="1" fill="none"/><rect x="2" y="2" width="14" height="6" rx="0.6" fill="#1C1813"/><rect x="19.5" y="3.5" width="1.5" height="3" rx="0.3" fill="#1C1813"/></svg>
        </span>
      </div>
    </>
  );
}

function Phone({ children, time, noBottomIndicator }) {
  return (
    <div className="wf-phone">
      <StatusBar time={time} />
      <div className="wf-screen">{children}</div>
      {!noBottomIndicator && <div className="wf-home-indicator" />}
    </div>
  );
}

function BottomNav({ active = 0 }) {
  const items = [
    { label: "Home", icon: "home" },
    { label: "Search", icon: "search" },
    { label: "Inbox", icon: "inbox" },
    { label: "Me", icon: "me" },
  ];
  return (
    <div className="wf-bottomnav">
      {items.map((it, i) => (
        <div key={i} className={"wf-navitem" + (i === active ? " wf-navitem--on" : "")}>
          <div style={{width: 22, height: 22, display: "grid", placeItems: "center"}}>
            {it.icon === "home" && <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 8 L9 2 L16 8 V15 H11 V11 H7 V15 H2 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>}
            {it.icon === "search" && <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M12 12 L16 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
            {it.icon === "inbox" && <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 10 V15 H16 V10 L13 3 H5 L2 10 Z M2 10 H6 L7 12 H11 L12 10 H16" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>}
            {it.icon === "me" && <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M3 16 Q 9 10 15 16" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>}
          </div>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function TopBar({ left, title, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px", borderBottom: "1.3px solid var(--hairline-strong)",
      gap: 10
    }}>
      <div style={{display: "flex", alignItems: "center", gap: 10}}>{left}</div>
      {title && <div className="hand" style={{fontSize: 15, fontWeight: 700, flex: 1, textAlign: "center"}}>{title}</div>}
      <div style={{display: "flex", alignItems: "center", gap: 10}}>{right}</div>
    </div>
  );
}

function IconBtn({ kind, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, display: "grid", placeItems: "center",
      border: "none", background: "transparent", padding: 0, cursor: "pointer"
    }}>
      {kind === "menu" && <svg width="20" height="16" viewBox="0 0 20 16"><path d="M2 3 H18 M2 8 H18 M2 13 H18" stroke="#1C1813" strokeWidth="1.5" strokeLinecap="round"/></svg>}
      {kind === "back" && <svg width="20" height="20" viewBox="0 0 20 20"><path d="M13 4 L6 10 L13 16" stroke="#1C1813" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      {kind === "close" && <svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 4 L14 14 M14 4 L4 14" stroke="#1C1813" strokeWidth="1.5" strokeLinecap="round"/></svg>}
      {kind === "more" && <svg width="20" height="4" viewBox="0 0 20 4"><circle cx="2" cy="2" r="1.5" fill="#1C1813"/><circle cx="10" cy="2" r="1.5" fill="#1C1813"/><circle cx="18" cy="2" r="1.5" fill="#1C1813"/></svg>}
      {kind === "search" && <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="8" cy="8" r="5" stroke="#1C1813" strokeWidth="1.5"/><path d="M12 12 L16 16" stroke="#1C1813" strokeWidth="1.5" strokeLinecap="round"/></svg>}
      {kind === "plus" && <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 3 V15 M3 9 H15" stroke="#1C1813" strokeWidth="1.5" strokeLinecap="round"/></svg>}
      {kind === "filter" && <svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 4 H16 M5 9 H13 M8 14 H10" stroke="#1C1813" strokeWidth="1.5" strokeLinecap="round"/></svg>}
      {kind === "share" && <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3 V12 M5 7 L9 3 L13 7 M3 13 V15 H15 V13" stroke="#1C1813" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  );
}

/* Placeholder text line */
function PH({ w = 80, h = 10 }) {
  return <span className="wf-ph" style={{ width: w, height: h }} />;
}

/* Sketchy icon box w/ letter */
function IconTile({ ch = "A", bg = "var(--paper-2)", color = "var(--ink)" }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 4,
      border: "1.3px solid var(--ink)",
      background: bg, color,
      display: "grid", placeItems: "center",
      fontFamily: "var(--f-hand)",
      fontWeight: 700, fontSize: 15,
      flexShrink: 0,
    }}>{ch}</div>
  );
}

Object.assign(window, { Phone, StatusBar, BottomNav, TopBar, IconBtn, PH, IconTile });
