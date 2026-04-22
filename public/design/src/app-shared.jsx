/* Shared UI primitives for Notion × iOS26 prototype */

/* ── Minimal i18n ─────────────────── */
const I18N = {
  "한국어": {
    "홈": "홈", "검색": "검색", "새로": "새로", "인박스": "인박스", "나": "나",
    "안녕하세요": "안녕하세요",
    "데이터베이스": "데이터베이스", "오늘": "오늘", "최근": "최근",
    "무엇이든 검색, 명령 실행": "무엇이든 검색, 명령 실행",
    "설정": "설정", "프로필": "프로필", "인박스": "인박스", "캘린더": "캘린더",
    "새로고침": "새로고침", "다크 모드": "다크 모드",
  },
  "English": {
    "홈": "Home", "검색": "Search", "새로": "New", "인박스": "Inbox", "나": "Me",
    "안녕하세요": "Hi",
    "데이터베이스": "Databases", "오늘": "Today", "최근": "Recent",
    "무엇이든 검색, 명령 실행": "Search anything, run commands",
    "설정": "Settings", "프로필": "Profile", "캘린더": "Calendar",
    "새로고침": "Refresh", "다크 모드": "Dark Mode",
  },
};
function t(k) {
  if (typeof window === "undefined") return k;
  const lang = localStorage.getItem("nm-lang") || "한국어";
  return (I18N[lang] && I18N[lang][k]) || k;
}
window.t = t;

const { useState, useEffect, useRef, useMemo } = React;

/* ── Icons (SF Symbol style, stroke 1.8) ─────────────── */
function Icon({ name, size = 22, color = "currentColor", strokeWidth = 1.8 }) {
  const s = { width: size, height: size, display: "inline-block", flexShrink: 0 };
  const p = { stroke: color, strokeWidth, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "home":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M3 10 L11 3 L19 10 V18 a1 1 0 0 1 -1 1 H13 V13 H9 V19 H4 a1 1 0 0 1 -1 -1 Z"/></svg>;
    case "search":  return <svg style={s} viewBox="0 0 22 22"><circle {...p} cx="10" cy="10" r="6"/><path {...p} d="M15 15 L19 19"/></svg>;
    case "calendar":return <svg style={s} viewBox="0 0 22 22"><rect {...p} x="3" y="5" width="16" height="14" rx="2.5"/><path {...p} d="M3 9 H19 M7 3 V6 M15 3 V6"/></svg>;
    case "inbox":   return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M3 13 V17 a2 2 0 0 0 2 2 H17 a2 2 0 0 0 2 -2 V13 M3 13 L5 5 a2 2 0 0 1 2 -1.5 H15 a2 2 0 0 1 2 1.5 L19 13 M3 13 H7 L8.5 15 H13.5 L15 13 H19"/></svg>;
    case "person":  return <svg style={s} viewBox="0 0 22 22"><circle {...p} cx="11" cy="8" r="3.5"/><path {...p} d="M4 19 Q 11 13 18 19"/></svg>;
    case "plus":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M11 4 V18 M4 11 H18"/></svg>;
    case "close":   return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M5 5 L17 17 M17 5 L5 17"/></svg>;
    case "back":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M13 5 L6 11 L13 17"/></svg>;
    case "more":    return <svg style={s} viewBox="0 0 22 22"><circle cx="5" cy="11" r="1.6" fill={color}/><circle cx="11" cy="11" r="1.6" fill={color}/><circle cx="17" cy="11" r="1.6" fill={color}/></svg>;
    case "filter":  return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M3 6 H19 M6 11 H16 M9 16 H13"/></svg>;
    case "share":   return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M11 3 V14 M7 7 L11 3 L15 7 M4 14 V18 a1 1 0 0 0 1 1 H17 a1 1 0 0 0 1 -1 V14"/></svg>;
    case "chev-r":  return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M8 5 L14 11 L8 17"/></svg>;
    case "chev-d":  return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M5 8 L11 14 L17 8"/></svg>;
    case "chev-u":  return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M5 14 L11 8 L17 14"/></svg>;
    case "chev-l":  return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M14 5 L8 11 L14 17"/></svg>;
    case "check":   return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M4 11 L9 16 L18 6"/></svg>;
    case "menu":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M3 6 H19 M3 11 H19 M3 16 H19"/></svg>;
    case "clock":   return <svg style={s} viewBox="0 0 22 22"><circle {...p} cx="11" cy="11" r="7.5"/><path {...p} d="M11 6 V11 L14.5 13"/></svg>;
    case "location":return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M11 20 Q 4 13 4 9 a7 7 0 0 1 14 0 Q 18 13 11 20 Z"/><circle {...p} cx="11" cy="9" r="2.5"/></svg>;
    case "bell":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M5 16 H17 V14 L16 13 V9 a5 5 0 0 0 -10 0 V13 L5 14 Z M9 19 a2 2 0 0 0 4 0"/></svg>;
    case "tag":     return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M11 3 H18 V10 L10 18 L3 11 Z"/><circle {...p} cx="14" cy="7" r="1.2"/></svg>;
    case "archive": return <svg style={s} viewBox="0 0 22 22"><rect {...p} x="3" y="4" width="16" height="4" rx="1"/><path {...p} d="M4 8 V17 a1 1 0 0 0 1 1 H17 a1 1 0 0 0 1 -1 V8 M9 12 H13"/></svg>;
    case "sparkle": return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M11 3 L12.5 8.5 L18 10 L12.5 11.5 L11 17 L9.5 11.5 L4 10 L9.5 8.5 Z"/></svg>;
    case "database":return <svg style={s} viewBox="0 0 22 22"><ellipse {...p} cx="11" cy="5.5" rx="7" ry="2.5"/><path {...p} d="M4 5.5 V11 Q 4 13.5 11 13.5 Q 18 13.5 18 11 V5.5 M4 11 V16.5 Q 4 19 11 19 Q 18 19 18 16.5 V11"/></svg>;
    case "grid":    return <svg style={s} viewBox="0 0 22 22"><rect {...p} x="3" y="3" width="7" height="7" rx="1.2"/><rect {...p} x="12" y="3" width="7" height="7" rx="1.2"/><rect {...p} x="3" y="12" width="7" height="7" rx="1.2"/><rect {...p} x="12" y="12" width="7" height="7" rx="1.2"/></svg>;
    case "list":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M7 6 H19 M7 11 H19 M7 16 H19"/><circle cx="4" cy="6" r="1.2" fill={color}/><circle cx="4" cy="11" r="1.2" fill={color}/><circle cx="4" cy="16" r="1.2" fill={color}/></svg>;
    case "settings":return <svg style={s} viewBox="0 0 22 22"><circle {...p} cx="11" cy="11" r="3"/><path {...p} d="M11 2 V4 M11 18 V20 M20 11 H18 M4 11 H2 M17.4 4.6 L16 6 M6 16 L4.6 17.4 M17.4 17.4 L16 16 M6 6 L4.6 4.6"/></svg>;
    case "lock":    return <svg style={s} viewBox="0 0 22 22"><rect {...p} x="4" y="10" width="14" height="9" rx="2"/><path {...p} d="M7 10 V7 a4 4 0 0 1 8 0 V10"/></svg>;
    case "sync":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M4 11 a7 7 0 0 1 12 -5 L18 4 V8 H14 M18 11 a7 7 0 0 1 -12 5 L4 18 V14 H8"/></svg>;
    case "moon":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M18.5 14.5 A8 8 0 0 1 7.5 3.5 a8 8 0 1 0 11 11 Z"/></svg>;
    case "sun":     return <svg style={s} viewBox="0 0 22 22"><circle {...p} cx="11" cy="11" r="4"/><path {...p} d="M11 2 V4 M11 18 V20 M20 11 H18 M4 11 H2 M17.4 4.6 L16 6 M6 16 L4.6 17.4 M17.4 17.4 L16 16 M6 6 L4.6 4.6"/></svg>;
    case "pencil":  return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M3 19 L5 13 L15 3 L19 7 L9 17 Z M13 5 L17 9 M3 19 H9"/></svg>;
    case "ellipsis": return <svg style={s} viewBox="0 0 22 22"><circle cx="5" cy="11" r="1.6" fill={color}/><circle cx="11" cy="11" r="1.6" fill={color}/><circle cx="17" cy="11" r="1.6" fill={color}/></svg>;
    default: return null;
  }
}

/* ── iOS status bar, home indicator ──────────────────── */
function StatusBar() {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 54,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "17px 30px 0", zIndex: 50, pointerEvents: "none",
      fontSize: 16, fontWeight: 600, color: "var(--n-text-strong)",
      fontVariantNumeric: "tabular-nums", letterSpacing: -0.2,
    }}>
      <span>9:41</span>
      {/* Dynamic Island */}
      <div style={{position: "absolute", left: "50%", top: 11, transform: "translateX(-50%)", width: 110, height: 32, borderRadius: 20, background: "#000"}}/>
      <div style={{display: "flex", alignItems: "center", gap: 6}}>
        <svg width="17" height="11" viewBox="0 0 17 11"><path d="M0.5 9 h2 v1.5 h-2 z M4 7 h2 v3.5 h-2 z M7.5 5 h2 v5.5 h-2 z M11 2.5 h2 v8 h-2 z" fill="currentColor"/></svg>
        <svg width="25" height="11" viewBox="0 0 25 11"><rect x="0.5" y="0.5" width="21" height="10" rx="2.5" fill="none" stroke="currentColor" strokeOpacity="0.4"/><rect x="2" y="2" width="18" height="7" rx="1.4" fill="currentColor"/><rect x="22.2" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>
      </div>
    </div>
  );
}
function HomeIndicator() {
  return (
    <div style={{position: "absolute", bottom: 7, left: "50%", transform: "translateX(-50%)", width: 134, height: 5, borderRadius: 3, background: "var(--n-text-strong)", opacity: 0.85, zIndex: 60}}/>
  );
}

/* ── Phone frame (desktop: 402×874 bezel, mobile: fullscreen) ───────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 500px)").matches;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 500px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

function Phone({ children, dark, style }) {
  const isMobile = useIsMobile();
  const frame = isMobile
    ? {
        width: "100vw", height: "100vh", borderRadius: 0,
        overflow: "hidden", position: "relative",
        background: "var(--n-bg-grouped)", boxShadow: "none",
        ...style,
      }
    : {
        width: 402, height: 874, borderRadius: 56,
        overflow: "hidden", position: "relative",
        background: "var(--n-bg-grouped)",
        boxShadow: "0 40px 80px rgba(0,0,0,0.15), 0 0 0 10px #1a1a1a, 0 0 0 11px rgba(0,0,0,0.3)",
        ...style,
      };
  return (
    <div className="phone" style={frame} data-is-mobile={isMobile ? "1" : "0"}>
      {!isMobile && <StatusBar/>}
      <div style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0, display: "flex", flexDirection: "column"}}>
        {children}
      </div>
      {!isMobile && <HomeIndicator/>}
    </div>
  );
}

/* ── iOS 26 large-title nav bar (scroll-aware-ready) ─── */
function NavBar({ title, large = true, left, right, subtitle, onScrollCollapse = false }) {
  return (
    <div style={{
      paddingTop: 54,
      background: onScrollCollapse ? "transparent" : "var(--n-bg-grouped)",
    }}>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", minHeight: 44}}>
        <div style={{display: "flex", alignItems: "center", gap: 4}}>{left}</div>
        {!large && <div className="t-headline" style={{position: "absolute", left: 0, right: 0, textAlign: "center", pointerEvents: "none"}}><span style={{pointerEvents: "auto"}}>{title}</span></div>}
        <div style={{display: "flex", alignItems: "center", gap: 4}}>{right}</div>
      </div>
      {large && (
        <div style={{padding: "4px 20px 10px"}}>
          {subtitle && <div className="t-footnote" style={{marginBottom: 2}}>{subtitle}</div>}
          <div className="t-large-title">{title}</div>
        </div>
      )}
    </div>
  );
}

/* ── Round icon button (for nav) ─────────────────────── */
function NavIconBtn({ icon, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 18,
      background: "var(--n-surface-hover)",
      border: "none", cursor: "pointer",
      display: "grid", placeItems: "center",
      color: "var(--n-text-strong)",
      position: "relative",
    }}>
      <Icon name={icon} size={18}/>
      {badge && <span style={{position: "absolute", top: 2, right: 2, width: 8, height: 8, borderRadius: 4, background: "#E0322C", border: "1.5px solid var(--n-bg-grouped)"}}/>}
    </button>
  );
}

/* ── Liquid-glass bottom tab bar ─────────────────────── */
function TabBar({ active = 0, onChange }) {
  const items = [
    { icon: "home", label: t("홈") },
    { icon: "search", label: t("검색") },
    { icon: "plus", label: t("새로") },
    { icon: "inbox", label: t("인박스") },
    { icon: "person", label: t("나") },
  ];
  return (
    <div className="tabbar glass">
      {items.map((it, i) => (
        <div key={i} className={"tab-item" + (active === i ? " on" : "")} onClick={() => onChange && onChange(i)}>
          <Icon name={it.icon} size={22}/>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Toggle switch (iOS) ─────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange && onChange(!on)} style={{
      width: 51, height: 31, borderRadius: 16,
      background: on ? "#34C759" : "var(--n-surface-press)",
      border: "none", cursor: "pointer", position: "relative",
      transition: "background var(--d-fast)",
    }}>
      <span style={{
        position: "absolute", top: 2, left: on ? 22 : 2,
        width: 27, height: 27, borderRadius: "50%",
        background: "#FFFFFF",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.3)",
        transition: "left var(--d-fast) var(--e-out)",
      }}/>
    </button>
  );
}

/* ── Spacer for scroll content above tab bar ─────────── */
function TabSpacer() { return <div style={{height: 100}}/>; }

/* ── Avatar ──────────────────────────────────────────── */
function Avatar({ name, size = 24, color }) {
  const colors = ["#E69C6E", "#8FA37E", "#6A8CAB", "#B57CAE", "#A8925A"];
  const bg = color || colors[(name || "A").charCodeAt(0) % colors.length];
  return (
    <div className="avatar" style={{width: size, height: size, background: bg, color: "#fff", fontSize: size * 0.42, borderColor: "transparent"}}>
      {(name || "?").slice(0,1).toUpperCase()}
    </div>
  );
}

Object.assign(window, {
  Icon, StatusBar, HomeIndicator, Phone, NavBar, NavIconBtn, TabBar, Toggle, TabSpacer, Avatar,
});
