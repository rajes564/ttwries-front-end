import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="shadow-lg" style={{background:'linear-gradient(135deg,#2e2c96 0%,#2e2c96 45%,#565594  70%, #565594 100%)'}}>
      {/* Gold strip top */}
     

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left Logos */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Telangana Emblem */}
          <div className="w-[6rem] h-[6rem] rounded-full bg-white border-2  flex items-center justify-center overflow-hidden shadow-lg">
            <img src="/images/tgtwrei.jpg" alt="TTWREIS" />
          </div>
          {/* Rising Telangana */}
          <div className="w-[6rem] h-[6rem] rounded-full   flex items-center justify-center overflow-hidden shadow-lg">
           <img src="/images/Telangana-LOGO.png" alt="telangana LOGO" />
          </div>
        </div>

        {/* Center */}
        <div className="flex-1 text-center px-2">
          <div className="text-yellow-300 font-black leading-tight" style={{fontSize:'clamp(10px,1.8vw,18px)',textShadow:'1px 1px 4px rgba(0,0,0,0.6)'}}>
            తెలంగాణ గిరిజన సంక్షేమ గురుకుల విద్యా సంస్థ సమాఖ్య
          </div>
          <div className="text-yellow-300 font-black leading-tight" style={{fontSize:'clamp(11px,2vw,20px)',textShadow:'1px 1px 4px rgba(0,0,0,0.6)'}}>
            Telangana Tribal Welfare Residential Educational Institutions Society
          </div>
          <div className="text-white font-bold mt-0.5" style={{fontSize:'clamp(9px,1.3vw,13px)',opacity:0.9}}>
            Government of Telangana — Tribal Welfare Department
          </div>
          <div className="inline-block mt-1 bg-black bg-opacity-20 border border-yellow-400 border-opacity-40 text-yellow-200 font-bold rounded-full px-4 py-0.5" style={{fontSize:'clamp(8px,1vw,11px)'}}>
            🎓 Online Intermediate Admission Management System
          </div>
        </div>

        {/* Right Logos */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Gurukulam Logo */}
          <div className="w-[6rem] h-[6rem] rounded-full bg-white  flex items-center justify-center overflow-hidden shadow-lg">
    
           <img src="/images/Telangana Rising cure-pure-rare.png" alt="telangana raising" />
          </div>
          {/* TTWREIS */}
          <div className="w-[6rem] h-[6rem] rounded-full bg-white  flex items-center justify-center overflow-hidden shadow-lg">
     

           <img src="/images/cm-card2.png" alt="telangana raising" />
          </div>
        </div>
      </div>

      {/* User bar if logged in */}
      {user && (
        <div className="bg-black bg-opacity-20 border-t border-white border-opacity-10 px-4 py-1.5 flex items-center justify-between max-w-7xl mx-auto">
          <span className="text-yellow-200 text-xs font-bold">
            👤 {user.name} &nbsp;|&nbsp; <span className="bg-yellow-400 text-green-900 text-xs font-black px-2 py-0.5 rounded">{user.role}</span>
          </span>
          <button onClick={() => { logout(); window.location.href='/' }}
            className="text-xs text-white bg-red-700 hover:bg-red-600 font-bold px-3 py-1 rounded-lg">
            🚪 Logout
          </button>
        </div>
      )}

      <div style={{height:'4px',background:'linear-gradient(90deg,#ffd600,#e65100,#ffd600)'}}/>
    </header>
  )
}
