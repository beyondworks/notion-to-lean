'use client';

import {
  User,
  Database,
  Link2,
  Bell,
  Palette,
  Shield,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const CONNECTIONS = [
  { name: 'Notion Workspace', desc: 'Beyondworks Main', connected: true, icon: Database },
  { name: 'Google Calendar', desc: 'yoogeon@gmail.com', connected: true, icon: Link2 },
  { name: 'Slack Integration', desc: 'Not configured', connected: false, icon: Link2 },
];

const SETTINGS = [
  { icon: Bell, label: 'Notifications', desc: 'Push, email preferences', color: 'rgba(0,103,137,0.08)', iconColor: 'var(--tertiary)' },
  { icon: Palette, label: 'Appearance', desc: 'Theme, display options', color: 'rgba(97,94,87,0.08)', iconColor: 'var(--primary)' },
  { icon: Shield, label: 'Privacy & Security', desc: 'API keys, permissions', color: 'rgba(158,66,44,0.08)', iconColor: 'var(--error)' },
];

export default function FinancePage() {
  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <span className="top-bar-title">Profile</span>
        </div>
      </header>

      {/* Profile card */}
      <section style={{ padding: 'calc(80px + var(--safe-t)) 20px 0' }} className="anim-in">
        <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--r-pill)',
            background: 'var(--surface-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--ink-outline-variant)',
          }}>
            <User style={{ width: 28, height: 28, color: 'var(--ink-variant)' }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Yoogeon Kim</div>
            <div style={{ fontSize: 13, color: 'var(--ink-variant)', marginTop: 2 }}>yoogeon@beyondworks.io</div>
          </div>
        </div>
      </section>

      {/* Connected databases */}
      <section style={{ marginTop: 28 }} className="anim-in anim-in-d1">
        <div className="section-label">Connected Services</div>
        <div className="settings-group">
          {CONNECTIONS.map((conn) => (
            <div key={conn.name} className="settings-row">
              <div className="settings-row-icon" style={{ background: 'rgba(0,103,137,0.08)', color: 'var(--tertiary)' }}>
                <conn.icon />
              </div>
              <div className="settings-row-content">
                <div className="settings-row-title">{conn.name}</div>
                <div className="settings-row-desc">{conn.desc}</div>
              </div>
              <div className={`status-dot ${conn.connected ? 'connected' : 'disconnected'}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Settings */}
      <section style={{ marginTop: 28 }} className="anim-in anim-in-d2">
        <div className="section-label">Settings</div>
        <div className="settings-group">
          {SETTINGS.map((setting) => (
            <div key={setting.label} className="settings-row" style={{ cursor: 'pointer' }}>
              <div className="settings-row-icon" style={{ background: setting.color, color: setting.iconColor }}>
                <setting.icon />
              </div>
              <div className="settings-row-content">
                <div className="settings-row-title">{setting.label}</div>
                <div className="settings-row-desc">{setting.desc}</div>
              </div>
              <ChevronRight style={{ width: 18, height: 18, color: 'var(--ink-outline-variant)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </section>

      {/* API Status */}
      <section style={{ marginTop: 28 }} className="anim-in anim-in-d3">
        <div className="section-label">API Status</div>
        <div className="card" style={{ margin: '0 20px', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>Notion API</span>
            <span className="pill" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: 10 }}>Healthy</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-variant)' }}>Requests</div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', marginTop: 2 }}>1,247</div>
              <div style={{ fontSize: 11, color: 'var(--ink-outline)' }}>this month</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-variant)' }}>Latency</div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', marginTop: 2 }}>142<span style={{ fontSize: 12, fontWeight: 600 }}>ms</span></div>
              <div style={{ fontSize: 11, color: 'var(--ink-outline)' }}>avg response</div>
            </div>
          </div>
        </div>
      </section>

      {/* Logout */}
      <section style={{ marginTop: 28, padding: '0 20px' }} className="anim-in anim-in-d4">
        <button style={{
          width: '100%', padding: '14px', borderRadius: 'var(--r-xl)',
          background: 'rgba(158, 66, 44, 0.06)', border: '1px solid rgba(158, 66, 44, 0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 14, fontWeight: 600, color: 'var(--error)', cursor: 'pointer',
          transition: 'background 0.15s',
        }}>
          <LogOut style={{ width: 18, height: 18 }} />
          Sign Out
        </button>
      </section>
    </div>
  );
}
