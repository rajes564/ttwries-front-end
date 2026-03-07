import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'



// Telangana Govt emblem SVG (left-1)
function TelanganaEmblem({ size = 56 }) {
  return (
         <img src="images/tgtwrei.jpg" alt="tLogo" />
  )
}
function TelanganaCM({ size = 56 }) {
  return (
         <img src="images/cm-card2.png" alt="tLogo" />
  )
}
function TelanganaRaising({ size = 56 }) {
  return (
         <img src="images/Telangana Rising cure-pure-rare.png" alt="tLogo" />
  )
}

// Rising Sun emblem SVG (left-2)
function RisingSunEmblem({ size = 56 }) {
  return (
       <img src="images/Telangana-LOGO.png" alt="tLogo" />
  )
}

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header style={{
      background: 'linear-gradient(180deg, #46166b 0%, #5a1e80 35%, #46166b 70%, #2d0b47 100%)',
    }}>
      {/* ── Top accent strip: gold gradient ──────────────────────────────── */}
      <div style={{ height: '5px', background: 'linear-gradient(90deg,#ffd84d,#f7c81a,#ffd84d,#f7c81a,#ffd84d)' }}/>

      {/* ── Main header row ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">

          {/* ── LEFT: Two govt emblems ─────────────────────────────────────── */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Emblem 1 — Telangana Govt */}
            <div className="w-10 h-10 sm:w-20 sm:h-20 rounded-full  shadow-md overflow-hidden flex items-center justify-center">
              <TelanganaEmblem size={40} />
            </div>
            {/* Emblem 2 — Rising Sun */}
            <div className="w-10 h-10 sm:w-20 sm:h-20 rounded-full  shadow-md overflow-hidden flex items-center justify-center">
              <RisingSunEmblem size={40} />
            </div>
          </div>

          {/* ── CENTRE: Organisation name ─────────────────────────────────── */}
          <div className="flex-1 text-center min-w-0 px-1 sm:px-2">
            {/* Telugu name */}
            <p className="font-black leading-tight"
               style={{ color:'#ffd84d', fontSize:'clamp(7px,2vw,12px)', textShadow:'0 1px 3px rgba(0,0,0,0.4)' }}>
              తెలంగాణ గిరిజన సంక్షేమ గురుకుల విద్యా సంస్థ సమాఖ్య
            </p>

            {/* English full name — wraps gracefully */}
            <p className="font-black leading-snug text-white"
               style={{ fontSize:'clamp(9px,3vw,19px)', textShadow:'0 1px 4px rgba(0,0,0,0.5)' }}>
              Telangana Tribal Welfare
              <span className="hidden sm:inline"> Residential Educational Institutions Society</span>
              <span className="sm:hidden"> Residential Edu. Inst. Society</span>
            </p>

            {/* Subtitle */}
            <p className="font-semibold leading-tight"
               style={{ color:'#e8c8f8', fontSize:'clamp(7px,1.6vw,11px)', opacity:0.92 }}>
              Government of Telangana — Tribal Welfare Department
            </p>

            {/* Banner pill */}
            <div className="inline-block mt-1 rounded-full border font-bold"
                 style={{
                   background: 'linear-gradient(90deg,#ffd84d,#f7c81a)',
                   color: '#2d0b47',
                   fontSize: 'clamp(6.5px,1.3vw,10px)',
                   padding: '5px 10px',
                 }}>
              🎓 Online Intermediate Admission Management System 2026-27
            </div>
          </div>

          {/* ── RIGHT: TGTWREIS Logo ──────────────────────────────────────── */}
          {/* <div className="flex-shrink-0">
            <div className="w-10 h-10 sm:w-20 sm:h-20 rounded-full shadow-md overflow-hidden flex items-center justify-center"
                 >
              <img
                src="images/cm-card2.png"
                alt="TG CM"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  // Fallback SVG if image not loaded
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
         
             
            </div>
          </div> */}

             <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Emblem 1 — Telangana Govt */}
            <div className="w-10 h-10 sm:w-20 sm:h-20 rounded-full  shadow-md overflow-hidden flex items-center justify-center">
              <TelanganaCM size={40} />
            </div>
            {/* Emblem 2 — Rising Sun */}
            <div className="w-10 h-10 sm:w-20 sm:h-20 rounded-full  shadow-md overflow-hidden flex items-center justify-center">
              <TelanganaRaising size={40} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Logged-in user bar ────────────────────────────────────────────── */}
      {user && (
        <div className="border-t px-3 py-1.5 flex items-center justify-between max-w-7xl mx-auto"
             style={{ borderColor:'rgba(255,216,77,0.25)', background:'rgba(0,0,0,0.2)' }}>
          <span className="text-xs font-bold truncate max-w-[65%]"
                style={{ color:'#ffd84d' }}>
            👤 {user.name}&nbsp;
            <span className="font-black px-2 py-0.5 rounded text-xs"
                  style={{ background:'#ffd84d', color:'#2d0b47' }}>
              {user.role}
            </span>
          </span>
          <button onClick={() => { logout(); window.location.href = '/' }}
            className="text-xs font-bold px-3 py-1 rounded-lg text-white flex-shrink-0"
            style={{ background:'#c0392b' }}>
            🚪 Logout
          </button>
        </div>
      )}

      {/* ── Bottom accent strip ───────────────────────────────────────────── */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg,#c0392b,#ffd84d,#c0392b,#ffd84d,#c0392b)' }}/>
    </header>
  )
}