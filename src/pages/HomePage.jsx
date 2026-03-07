import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header               from '../components/common/Header'
import NotificationScroller from '../components/common/NotificationScroller'
import RegistrationModal    from '../components/modals/RegistrationModal'
import GrievanceModal       from '../components/modals/GrievanceModal'
import HelpdeskModal        from '../components/modals/HelpdeskModal'
import { useAuth }          from '../context/AuthContext'
import api                  from '../api/axios'

// ─── SHA-256 + Salt ───────────────────────────────────────────────────────────
const APP_SECRET  = 'iGrShYdErAbAdRaJeShNiC'
const TIME_WINDOW = 3600
async function sha256(msg) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}
async function buildLoginPayload(u, pw) {
  const salt = await sha256(`${u}:${APP_SECRET}:${Math.floor(Date.now()/1000/TIME_WINDOW)}`)
  return await sha256(salt + await sha256(pw))
}

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const B = {
  purple:  '#46166b',
  dark:    '#2d0b47',
  deep:    '#1e0730',
  light:   '#6b2a9e',
  gold:    '#ffd84d',
  goldDp:  '#f7c81a',
  crimson: '#c0392b',
  blue:    '#1a4a8a',
  pale:    '#f5edfb',  // very light purple tint
  goldPale:'#fff8d0',
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TIMELINE = [
  { num:1,  title:'Notification Released',              date:'1st Feb 2025',          status:'done'   },
  { num:2,  title:'Registration Portal Opened',         date:'10th Feb 2025',         status:'done'   },
  { num:3,  title:'Application & Fee Payment',          date:'10 Feb – 31 Mar 2025',  status:'active', note:'🔴 Ongoing' },
  { num:4,  title:'Hall Ticket Download',               date:'From 10th Apr 2025',    status:'upcoming' },
  { num:5,  title:'Entrance Examination',               date:'20 Apr 2025 | 10AM–1PM',status:'upcoming' },
  { num:6,  title:'Provisional Answer Key',             date:'25th Apr 2025',         status:'upcoming' },
  { num:7,  title:'Result & Merit List',                date:'1st May 2025',          status:'upcoming' },
  { num:8,  title:'Phase-1 Seat Allotment',             date:'5th May 2025',          status:'upcoming' },
  { num:9,  title:'Fee Payment (Phase-1)',               date:'6–15 May 2025',         status:'upcoming' },
  { num:10, title:'Phase-2 Allotment (Vacancies)',      date:'20th May 2025',         status:'upcoming' },
  { num:11, title:'Reporting at Allotted College',      date:'1st Jun 2025',          status:'upcoming' },
  { num:12, title:'Classes Begin 2025-26',              date:'10th Jun 2025',         status:'upcoming' },
]

function Timeline() {
  return (
    <div className="rounded-xl shadow border overflow-hidden" style={{ background:'white', borderColor:'#e8d5f5' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2"
           style={{ background:`linear-gradient(135deg,${B.dark},${B.purple})` }}>
        <span className="text-xl">🗓️</span>
        <div>
          <h3 className="font-black text-sm sm:text-base" style={{ color: B.gold }}>
            Admission Process Timeline
          </h3>
          <p className="text-xs font-semibold" style={{ color:'#ffffff' }}>Academic Year 2026-27</p>
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 overflow-y-auto" >
        <div className="relative pl-8">
          {/* Vertical connector */}
          <div className="absolute left-3 top-2 bottom-2 w-0.5"
               style={{ background:`linear-gradient(180deg,${B.purple},${B.gold},${B.crimson},#d1d5db)` }}/>

          {TIMELINE.map(item => (
            <div key={item.num} className="relative mb-4 last:mb-0">
              {/* Dot */}
              <div className="absolute -left-7 top-0.5 w-5 h-5 rounded-full flex items-center
                              justify-center text-xs font-black border-2 border-white shadow"
                   style={{
                     background: item.status==='done'   ? B.purple :
                                 item.status==='active' ? B.crimson : '#e0e0e0',
                     color:      item.status==='upcoming'? '#999' : 'white',
                     ...(item.status==='active' ? { boxShadow:`0 0 0 4px rgba(192,57,43,0.2)`, transform:'scale(1.15)' } : {}),
                   }}>
                {item.status==='done' ? '✓' : item.num}
              </div>

              <p className="text-sm font-bold leading-tight"
                 style={{ color: item.status==='active' ? B.crimson :
                                 item.status==='done'   ? B.dark    : '#555' }}>
                {item.title}
              </p>
              <p className="text-xs font-semibold mt-0.5" style={{ color:'#888' }}>📅 {item.date}</p>

              {item.note && (
                <span className="inline-block text-xs font-black px-2 py-0.5 rounded mt-1"
                      style={{ background:'#fde8e8', color: B.crimson }}>
                  {item.note}
                </span>
              )}
              {item.status==='done' && (
                <span className="inline-block text-xs font-black px-2 py-0.5 rounded mt-1"
                      style={{ background:'#f5edfb', color: B.purple }}>
                  ✅ Completed
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Captcha ──────────────────────────────────────────────────────────────────
function CaptchaBox({ captchaText, onRefresh, value, onChange, error }) {
  return (
    <div>
      <label className="label">Security Code <span style={{ color:B.crimson }}>*</span></label>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-1">
        {/* Visual */}
        <div className="h-12 sm:w-36 sm:flex-shrink-0 border-2 rounded-lg flex items-center justify-center
                        relative overflow-hidden select-none"
             style={{ background:`linear-gradient(135deg,${B.goldPale},#f5edfb)`, borderColor: B.purple }}>
          <div className="absolute inset-0 opacity-10"
               style={{ backgroundImage:`repeating-linear-gradient(45deg,${B.purple},transparent 2px,transparent 8px)` }}/>
          <div className="absolute h-px w-full opacity-20"
               style={{ top:'40%', background:B.purple, transform:'rotate(-3deg)' }}/>
          {captchaText
            ? <span className="font-black text-2xl tracking-[0.3em] relative z-10"
                    style={{ fontFamily:'monospace', color:B.dark, textShadow:'1px 1px 0 rgba(0,0,0,0.12)' }}>
                {captchaText}
              </span>
            : <span className="text-xs text-gray-400 italic">Loading…</span>
          }
        </div>

        {/* Refresh + Input */}
        <div className="flex items-center gap-2 flex-1">
          <button type="button" onClick={onRefresh} title="New code"
            className="border-2 rounded-lg font-bold text-sm flex-shrink-0 flex items-center justify-center transition-colors"
            style={{ borderColor:B.purple, color:B.purple, height:'44px', minWidth:'44px', background:'white' }}
            onMouseEnter={e=>e.currentTarget.style.background=B.pale}
            onMouseLeave={e=>e.currentTarget.style.background='white'}>
            🔄
          </button>
          <input type="text" className="input-field flex-1"
            placeholder="Type code here"
            maxLength={6} autoComplete="off" spellCheck={false}
            value={value}
            onChange={e => onChange(e.target.value.toUpperCase())}
            style={{ letterSpacing:'0.22em', minHeight:'44px' }}
          />
        </div>
      </div>
      {error && <p className="text-xs font-bold mt-1" style={{ color:B.crimson }}>⚠ {error}</p>}
    </div>
  )
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onRegister, onGrievance, onHelpdesk }) {
  const { setUserData } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [captchaId,  setCaptchaId]   = useState('')
  const [captchaText,setCaptchaText] = useState('')
  const [captchaVal, setCaptchaVal]  = useState('')
  const [loading,        setLoading]        = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const usernameRef = useRef(null)

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true); setCaptchaVal('')
    try {
      const res = await api.get('/captcha/generate')
      setCaptchaId(res.data.captchaId); setCaptchaText(res.data.text)
    } catch { toast.error('Could not load security code.') }
    finally  { setCaptchaLoading(false) }
  }, [])

  useEffect(() => { fetchCaptcha(); usernameRef.current?.focus() }, [])

  const validate = () => {
    const e = {}
    if (!username.trim()) e.username = 'User ID is required'
    if (!password.trim()) e.password = 'Password is required'
    if (!captchaVal.trim()) e.captcha = 'Enter the security code'
    return e
  }

  const handleLogin = async (ev) => {
    ev.preventDefault(); ev.stopPropagation()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({}); setLoading(true)
    try {
      const hp  = await buildLoginPayload(username.trim(), password)
      const res = await api.post('/auth/login', {
        username: username.trim(), password: hp,
        captchaId, captchaInput: captchaVal.trim(),
      })
      const ud = res.data
      localStorage.setItem('ttwreis_token', ud.token)
      localStorage.setItem('ttwreis_user',  JSON.stringify(ud))
      setUserData(ud)
      toast.success(`✅ Welcome, ${ud.name}!`)
      ud.role === 'ADMIN' ? navigate('/admin',{replace:true}) : navigate('/dashboard',{replace:true})
    } catch (err) {
      toast.error(`❌ ${err?.response?.data?.message || 'Invalid credentials'}`)
      setPassword(''); fetchCaptcha()
    } finally { setLoading(false) }
  }

 const openPdf = (path) => (e) => {
  e.preventDefault();
  window.open(path, '_self');
};

  // Quick link style helpers
  const qlStyle  = (bg, border, color) => ({ background:bg, borderColor:border, color })
  const qlHover  = (bg) => (e) => { e.currentTarget.style.background = bg }
  const qlLeave  = (bg) => (e) => { e.currentTarget.style.background = bg }

  return (
    <div className="rounded-xl shadow overflow-hidden border" style={{ borderColor:'#d0aaea' }}>
      {/* Card header */}
      <div className="px-4 py-3"
           style={{ background:`linear-gradient(135deg,${B.dark},${B.purple},${B.light})` }}>
        <h3 className="font-black text-sm sm:text-base text-white">🔐 Login</h3>
        <p className="text-xs font-semibold" style={{ color:'#d0aaea' }}>
          Use Registration Number / Staff ID
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-4 bg-white">
        {/* Info hint */}
        <div className="border-l-4 rounded-r-xl p-3 text-xs font-semibold"
             style={{ background:B.goldPale, borderColor:B.gold, color:'#5a3a00' }}>
          <strong>Candidates:</strong> Registration No. as username, DOB (DD-MM-YYYY) as password.<br/>
          <strong>Staff / Admin:</strong> Use your assigned credentials.
        </div>

        <form onSubmit={handleLogin} noValidate className="space-y-3">
          {/* Username */}
          <div>
            <label className="label">
              Registration Number / User ID <span style={{color:B.crimson}}>*</span>
            </label>
            <input ref={usernameRef} type="text" className="input-field"
              placeholder="e.g. TTWREIS2025000001 or ADMIN001"
              autoComplete="username" value={username}
              onChange={e=>{setUsername(e.target.value);setErrors(p=>({...p,username:''}))}}/>
            {errors.username && <p className="text-xs font-bold mt-1" style={{color:B.crimson}}>⚠ {errors.username}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="label">Password <span style={{color:B.crimson}}>*</span></label>
            <div className="relative">
              <input type={showPw?'text':'password'} className="input-field pr-10"
                placeholder="DOB as DD-MM-YYYY for candidates"
                autoComplete="current-password" value={password}
                onChange={e=>{setPassword(e.target.value);setErrors(p=>({...p,password:''}))}}/>
              <button type="button" tabIndex={-1} onClick={()=>setShowPw(v=>!v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                {showPw?'🙈':'👁️'}
              </button>
            </div>
            {errors.password && <p className="text-xs font-bold mt-1" style={{color:B.crimson}}>⚠ {errors.password}</p>}
          </div>

          {/* Captcha */}
          {captchaLoading
            ? <div className="text-xs text-gray-400 font-semibold py-2">⏳ Loading security code…</div>
            : <CaptchaBox captchaText={captchaText} onRefresh={fetchCaptcha}
                value={captchaVal}
                onChange={v=>{setCaptchaVal(v);setErrors(p=>({...p,captcha:''}))}}
                error={errors.captcha}/>
          }

          {/* Submit */}
          <button type="submit" disabled={loading||captchaLoading}
            className="btn-primary w-full py-3 text-sm sm:text-base">
            {loading ? '⏳ Logging in…' : '🔐 Login'}
          </button>
        </form>

        {/* Register + help links */}
        <div className="pt-3 border-t border-gray-100 space-y-3">
          <button type="button" onClick={onRegister} className="btn-orange w-full py-3 text-sm sm:text-base">
            📝 New Candidate Registration
          </button>
          <div className="flex justify-center gap-4 text-xs font-semibold">
            <button type="button"
              onClick={()=>toast.info('Call 040-23450678 for password reset')}
              className="bg-transparent border-none cursor-pointer hover:underline"
              style={{color:B.purple}}>
              Forgot Password?
            </button>
            <span style={{color:'#ccc'}}>|</span>
            <button type="button" onClick={onHelpdesk}
              className="bg-transparent border-none cursor-pointer hover:underline"
              style={{color:B.purple}}>
              Need Help?
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-black uppercase tracking-wider mb-2" style={{color:'#aaa'}}>Quick Links</p>
          <div className="grid grid-cols-2 gap-2">

                      {[
                { label:'📄 Notification', path:'/doc/notification.pdf' },
                { label:'📋 Prospectus',   path:'/doc/procs.pdf' },
                { label:'🏫 College List', path:'/doc/college-list.pdf' },
              ].map(({label, path}) => (
                <a
                  key={label}
                  href={path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-center py-2.5 px-2 rounded-lg border-2 transition-colors block"
                  style={{ color:B.purple, borderColor:'#d0aaea', background:B.pale }}
                  onMouseEnter={e=>e.currentTarget.style.background='#e8d5f5'}
                  onMouseLeave={e=>e.currentTarget.style.background=B.pale}
                >
                  {label}
                </a>
              ))}

            <button type="button" onClick={onHelpdesk}
              className="text-xs font-bold text-center py-2.5 px-2 rounded-lg border-2 transition-colors"
              style={{ color:B.blue, borderColor:'#bbdefb', background:'#e3f2fd' }}
              onMouseEnter={e=>e.currentTarget.style.background='#bbdefb'}
              onMouseLeave={e=>e.currentTarget.style.background='#e3f2fd'}>
              📞 Helpdesk
            </button>

            <button type="button" onClick={onGrievance}
              className="col-span-2 text-xs font-bold text-center py-2.5 px-2 rounded-lg border-2 transition-colors"
              style={{ color:B.crimson, borderColor:'#f5c6c6', background:'#fdf0f0' }}
              onMouseEnter={e=>e.currentTarget.style.background='#fde8e8'}
              onMouseLeave={e=>e.currentTarget.style.background='#fdf0f0'}>
              📝 File a Grievance
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [showReg,       setShowReg]       = useState(false)
  const [showGrievance, setShowGrievance] = useState(false)
  const [showHelpdesk,  setShowHelpdesk]  = useState(false)

  return (
    <div className="min-h-screen flex flex-col" style={{ background:'#f4ecfa' }}>
      <Header />
      <NotificationScroller />

      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-5
                       grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 sm:gap-5 items-start">
        {/* Mobile: Login first, Timeline below */}
        <div className="order-2 lg:order-1"><Timeline /></div>
        <div className="order-1 lg:order-2 lg:sticky lg:top-4">
          <LoginForm
            onRegister  ={() => setShowReg(true)}
            onGrievance ={() => setShowGrievance(true)}
            onHelpdesk  ={() => setShowHelpdesk(true)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-4"
              style={{ background:`linear-gradient(180deg,${B.dark},${B.deep})` }}>
        {/* Gold top bar */}
        <div style={{ height:'3px', background:`linear-gradient(90deg,${B.gold},${B.goldDp},${B.gold})` }}/>
        <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4
                        border-b text-xs" style={{ borderColor:'rgba(255,216,77,0.15)' }}>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wide mb-2" style={{color:B.gold}}>About TTWREIS</h4>
            <p className="font-medium leading-relaxed" style={{color:'#d0aaea'}}>
              TTWREIS is committed to providing quality education to tribal students
              across Telangana under the Government of Telangana, Tribal Welfare Department.
            </p>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wide mb-2" style={{color:B.gold}}>Important Links</h4>
            <ul className="space-y-1">
              {['Admission Notification','Reservation Policy','Exam Center List','Fee Structure','FAQ'].map(l=>(
                <li key={l}>
                  <button type="button" onClick={()=>toast.info(`${l} – coming soon`)}
                    className="font-semibold bg-transparent border-none cursor-pointer p-0 hover:underline"
                    style={{color:'#d0aaea'}}>
                    › {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wide mb-2" style={{color:B.gold}}>Contact Us</h4>
            <p className="font-medium leading-relaxed" style={{color:'#d0aaea'}}>
              TTWREIS Head Office<br/>Masab Tank, Hyderabad – 500028<br/>
              Telangana, India<br/><br/>
              📞 040-23450678<br/>📧 admissions@ttwreis.telangana.gov.in
            </p>
          </div>
        </div>
        <div className="text-center text-xs font-medium py-3" style={{color:'#b37dd8'}}>
          © 2025 TTWREIS – Government of Telangana. All Rights Reserved.
        </div>
      </footer>

      {showReg       && <RegistrationModal onClose={()=>setShowReg(false)} />}
      {showGrievance && <GrievanceModal    onClose={()=>setShowGrievance(false)} />}
      {showHelpdesk  && <HelpdeskModal     onClose={()=>setShowHelpdesk(false)} />}
    </div>
  )
}