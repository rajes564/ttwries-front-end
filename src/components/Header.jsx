import React, { useEffect, useState } from 'react';
import { publicService } from '../services/api';

// SVG Logos inline
const GurukulamLogo = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <circle cx="50" cy="50" r="48" fill="#fff7e6"/>
    <rect x="46" y="42" width="8" height="26" fill="#1a6b2e" rx="2"/>
    <ellipse cx="50" cy="42" rx="10" ry="15" fill="#e07b1a"/>
    <ellipse cx="50" cy="42" rx="6" ry="9" fill="#FFD700"/>
    <ellipse cx="50" cy="42" rx="3" ry="5" fill="white" opacity="0.5"/>
    <rect x="38" y="68" width="24" height="4" fill="#1a6b2e" rx="2"/>
    <rect x="34" y="72" width="32" height="3" fill="#0f4a1e" rx="1"/>
    <text x="50" y="89" textAnchor="middle" fill="#1a6b2e" fontSize="5.5" fontWeight="900" fontFamily="Arial">GURUKULAM</text>
    <text x="50" y="95" textAnchor="middle" fill="#e07b1a" fontSize="4" fontWeight="700" fontFamily="Arial">TTWREIS</text>
  </svg>
);

const TelanganaEmblem = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <circle cx="50" cy="50" r="48" fill="#1a6b2e" stroke="#FFD700" strokeWidth="2"/>
    <circle cx="50" cy="50" r="40" fill="#0f4a1e"/>
    <rect x="40" y="56" width="20" height="20" fill="#FFD700" rx="1"/>
    <rect x="36" y="52" width="28" height="6" fill="#FFD700" rx="1"/>
    <rect x="36" y="34" width="5" height="22" fill="#FFD700" rx="2"/>
    <rect x="59" y="34" width="5" height="22" fill="#FFD700" rx="2"/>
    <rect x="43" y="37" width="5" height="19" fill="#FFD700" rx="2"/>
    <rect x="52" y="37" width="5" height="19" fill="#FFD700" rx="2"/>
    <ellipse cx="38.5" cy="34" rx="3.5" ry="5" fill="#e07b1a"/>
    <ellipse cx="61.5" cy="34" rx="3.5" ry="5" fill="#e07b1a"/>
    <ellipse cx="45.5" cy="37" rx="3.5" ry="5" fill="#e07b1a"/>
    <ellipse cx="54.5" cy="37" rx="3.5" ry="5" fill="#e07b1a"/>
    <text x="50" y="90" textAnchor="middle" fill="#FFD700" fontSize="6.5" fontWeight="bold" fontFamily="Arial">TELANGANA</text>
  </svg>
);

const TelanganaRising = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <circle cx="50" cy="50" r="48" fill="#e07b1a" stroke="#FFD700" strokeWidth="2"/>
    <circle cx="50" cy="53" r="18" fill="#FFD700"/>
    <line x1="50" y1="12" x2="50" y2="22" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
    <line x1="50" y1="84" x2="50" y2="94" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
    <line x1="12" y1="50" x2="22" y2="50" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
    <line x1="78" y1="50" x2="88" y2="50" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
    <line x1="24" y1="24" x2="31" y2="31" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
    <line x1="69" y1="69" x2="76" y2="76" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
    <line x1="76" y1="24" x2="69" y2="31" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
    <line x1="31" y1="69" x2="24" y2="76" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
    <text x="50" y="59" textAnchor="middle" fill="#e07b1a" fontSize="22" fontWeight="900" fontFamily="Arial">T</text>
    <text x="50" y="91" textAnchor="middle" fill="#FFD700" fontSize="6" fontWeight="bold" fontFamily="Arial">RISING</text>
  </svg>
);

const FALLBACK_NOTIFICATIONS = [
  { id: 1, text: '📢 Online Admission Registration for 2025-26 is now OPEN. Apply before 31st March 2025.', isNew: true },
  { id: 2, text: '📅 Hall Ticket download available from 10th April 2025 onwards.' },
  { id: 3, text: '📝 Entrance Examination scheduled on 20th April 2025. Check your exam center.', isNew: true },
  { id: 4, text: '🏫 Phase-1 Seat Allotment list published on 5th May 2025.' },
  { id: 5, text: '💰 Fee payment window: 6th May – 15th May 2025. Pay online to confirm seat.' },
  { id: 6, text: '📞 Helpdesk: 040-23450678 (Mon–Sat, 9AM–6PM)' },
];

export default function Header() {
  const [notifications, setNotifications] = useState(FALLBACK_NOTIFICATIONS);

  useEffect(() => {
    publicService.getNotifications()
      .then(res => { if (res.data?.length) setNotifications(res.data); })
      .catch(() => {});
  }, []);

  const doubled = [...notifications, ...notifications];

  return (
    <header>
      {/* Main header */}
      <div className="header-bg">
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '12px 16px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Left logos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.4)', flexShrink: 0 }}>
              <TelanganaEmblem />
            </div>
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '2px solid #FFD700', flexShrink: 0 }}>
              <TelanganaRising />
            </div>
          </div>

          {/* Center text */}
          <div style={{ flex: 1, textAlign: 'center', minWidth: 200 }}>
            <div style={{ fontSize: 'clamp(12px,1.8vw,17px)', fontWeight: 900, color: '#FFD700', lineHeight: 1.3 }}>
              తెలంగాణ గిరిజన సంక్షేమ గురుకుల విద్యా సంస్థ సమాఖ్య
            </div>
            <div style={{ fontSize: 'clamp(12px,1.6vw,16px)', fontWeight: 800, color: '#FFD700', marginTop: 3 }}>
              Telangana Tribal Welfare Residential Educational Institutions Society
            </div>
            <div style={{ fontSize: 'clamp(10px,1.2vw,13px)', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: 3 }}>
              Government of Telangana
            </div>
            <div style={{ marginTop: 6, display: 'inline-block', background: 'rgba(0,0,0,0.25)', borderRadius: 20, padding: '4px 16px', fontSize: 11, color: '#FFD700', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>
              🎓 Online Intermediate Admission Management System
            </div>
          </div>

          {/* Right logos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '3px solid #FFD700', background: 'white', flexShrink: 0 }}>
              <GurukulamLogo />
            </div>
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '3px solid #e07b1a', background: 'white', flexShrink: 0 }}>
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <circle cx="50" cy="50" r="48" fill="#e8f5e9"/>
                <path d="M20 42 L20 65 Q50 55 50 55 L50 32 Q35 30 20 42Z" fill="#1a6b2e"/>
                <path d="M80 42 L80 65 Q50 55 50 55 L50 32 Q65 30 80 42Z" fill="#0f4a1e"/>
                <polygon points="50,12 60,27 50,24 40,27" fill="#e07b1a"/>
                <circle cx="50" cy="12" r="5" fill="#FFD700"/>
                <line x1="26" y1="50" x2="48" y2="44" stroke="white" strokeWidth="1.5" opacity="0.7"/>
                <line x1="26" y1="56" x2="48" y2="50" stroke="white" strokeWidth="1.5" opacity="0.7"/>
                <line x1="74" y1="50" x2="52" y2="44" stroke="white" strokeWidth="1.5" opacity="0.7"/>
                <line x1="74" y1="56" x2="52" y2="50" stroke="white" strokeWidth="1.5" opacity="0.7"/>
                <text x="50" y="82" textAnchor="middle" fill="#1a6b2e" fontSize="5.5" fontWeight="900" fontFamily="Arial">TTWREIS</text>
              </svg>
            </div>
          </div>
        </div>
        {/* Gold strip */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #c8a800, #e07b1a, #c8a800)' }} />
      </div>

      {/* Notification bar */}
      <div style={{ background: 'linear-gradient(90deg, #0f4a1e, #1a6b2e)', borderBottom: '2px solid #c8a800', display: 'flex', alignItems: 'stretch', overflow: 'hidden', height: 38 }}>
        <div style={{ background: '#e07b1a', color: 'white', fontWeight: 800, fontSize: 11, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <span style={{ width: 7, height: 7, background: 'white', borderRadius: '50%', animation: 'pulse 1s infinite', display: 'inline-block' }}></span>
          NOTIFICATIONS
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <div className="notif-scroll">
            {doubled.map((n, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'white', cursor: 'pointer', padding: '0 10px' }}>
                {n.text}
                {n.isNew && <span style={{ background: '#c0392b', color: 'white', fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase' }}>NEW</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
