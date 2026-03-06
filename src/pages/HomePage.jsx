import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../components/common/Header'
import NotificationScroller from '../components/common/NotificationScroller'
import RegistrationModal from '../components/modals/RegistrationModal'
import GrievanceModal from '../components/modals/GrievanceModal'
import HelpdeskModal  from '../components/modals/HelpdeskModal'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

// ─── SHA-256 + Salt logic (exactly as specified) ──────────────────────────────
const APP_SECRET  = "iGrShYdErAbAdRaJeShNiC"
const TIME_WINDOW = 3600 // 1-hour window

async function sha256(message) {
  const msgBuffer  = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray  = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function generateSalt(username) {
  const timeSlot = Math.floor(Date.now() / 1000 / TIME_WINDOW)
  return await sha256(`${username}:${APP_SECRET}:${timeSlot}`)
}

async function buildLoginPayload(username, plainPassword) {
  const salt      = await generateSalt(username)
  const innerHash = await sha256(plainPassword)
  const finalHash = await sha256(salt + innerHash)
  return finalHash
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TIMELINE = [
  { num:1,  title:'Notification Released',                    date:'1st February 2025',                    status:'done'   },
  { num:2,  title:'Online Registration Portal Opened',        date:'10th February 2025',                   status:'done'   },
  { num:3,  title:'Application Form Submission & Fee Payment',date:'10th Feb – 31st March 2025',           status:'active', note:'🔴 Ongoing' },
  { num:4,  title:'Hall Ticket / Admit Card Download',        date:'From 10th April 2025',                 status:'upcoming' },
  { num:5,  title:'Entrance Examination',                     date:'20th April 2025 | 10:00 AM – 1:00 PM',status:'upcoming' },
  { num:6,  title:'Provisional Answer Key Release',           date:'25th April 2025',                      status:'upcoming' },
  { num:7,  title:'Result Declaration & Merit List',          date:'1st May 2025',                         status:'upcoming' },
  { num:8,  title:'Phase-1 Seat Allotment',                   date:'5th May 2025',                         status:'upcoming' },
  { num:9,  title:'Fee Payment & Seat Confirmation (Phase-1)',date:'6th – 15th May 2025',                  status:'upcoming' },
  { num:10, title:'Phase-2 Seat Allotment (Vacancies)',       date:'20th May 2025',                        status:'upcoming' },
  { num:11, title:'Reporting & Joining at Allotted College',  date:'1st June 2025',                        status:'upcoming' },
  { num:12, title:'Commencement of Classes 2025-26',          date:'10th June 2025',                       status:'upcoming' },
]

function Timeline() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-2" style={{background:'linear-gradient(135deg,#0d3b0d,#1b5e20)'}}>
        <span className="text-xl">🗓️</span>
        <div>
          <h3 className="text-white font-black text-base">Admission Process Timeline</h3>
          <p className="text-green-200 text-xs font-semibold">Academic Year 2025-26</p>
        </div>
      </div>
      <div className="p-5">
        <div className="relative pl-8">
          <div className="absolute left-3 top-2 bottom-2 w-0.5"
               style={{background:'linear-gradient(180deg,#1b5e20,#ffd600,#e65100,#d1d5db)'}} />
          {TIMELINE.map(item => (
            <div key={item.num} className="relative mb-5 last:mb-0">
              <div className={`absolute -left-7 top-0.5 w-5 h-5 rounded-full flex items-center
                justify-center text-xs font-black border-2 border-white shadow
                ${item.status==='done'   ? 'bg-green-600 text-white' :
                  item.status==='active' ? 'bg-orange-500 text-white ring-4 ring-orange-200 scale-110' :
                                           'bg-gray-200 text-gray-500'}`}>
                {item.status==='done' ? '✓' : item.num}
              </div>
              <p className={`text-sm font-bold leading-tight
                ${item.status==='active' ? 'text-orange-700' :
                  item.status==='done'   ? 'text-green-800' : 'text-gray-700'}`}>
                {item.title}
              </p>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">📅 {item.date}</p>
              {item.note && <span className="inline-block bg-orange-100 text-orange-700 text-xs font-black px-2 py-0.5 rounded mt-1">{item.note}</span>}
              {item.status==='done' && <span className="inline-block bg-green-100 text-green-700 text-xs font-black px-2 py-0.5 rounded mt-1">✅ Completed</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Captcha component ────────────────────────────────────────────────────────
function CaptchaBox({ captchaText, onRefresh, value, onChange, error }) {
  // Render the server-supplied text as a styled visual (noise, tilt, mono font)
  return (
    <div>
      <label className="label">Security Code <span className="text-red-500">*</span></label>
      <div className="flex items-center gap-2 mb-1">
        {/* Visual CAPTCHA box */}
        <div
          className="w-36 h-11 border-2 border-green-400 rounded-lg flex items-center justify-center
                     relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 flex-shrink-0 select-none"
        >
          {/* decorative noise lines */}
          <div className="absolute inset-0 opacity-10"
               style={{backgroundImage:'repeating-linear-gradient(45deg,#1b5e20,transparent 2px,transparent 8px)'}} />
          <div className="absolute h-px w-full bg-green-600 opacity-30" style={{top:'40%',transform:'rotate(-4deg)'}} />
          <div className="absolute h-px w-full bg-orange-400 opacity-20" style={{top:'65%',transform:'rotate(3deg)'}} />
          {captchaText
            ? (
              <span className="font-black text-xl tracking-[0.25em] text-green-900 relative z-10"
                    style={{fontFamily:'monospace', textShadow:'1px 1px 0 rgba(0,0,0,0.15)'}}>
                {captchaText}
              </span>
            )
            : <span className="text-xs text-gray-400 italic">Loading…</span>
          }
        </div>

        {/* Refresh button */}
        <button type="button" onClick={onRefresh} title="Get a new code"
          className="border border-green-300 text-green-700 font-bold text-sm px-2 py-2
                     rounded-lg hover:bg-green-50 transition-colors flex-shrink-0">
          🔄
        </button>

        {/* Input */}
        <input
          type="text"
          className="input-field flex-1"
          placeholder="Type code here"
          maxLength={6}
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={e => onChange(e.target.value.toUpperCase())}
          style={{letterSpacing:'0.18em'}}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-bold mt-1">⚠ {error}</p>}
    </div>
  )
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onRegister, onGrievance, onHelpdesk }) {
  const { setUserData } = useAuth()
  const navigate = useNavigate()

  const [username,   setUsername]   = useState('')
  const [password,   setPassword]   = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [captchaId,  setCaptchaId]  = useState('')
  const [captchaText,setCaptchaText]= useState('')
  const [captchaVal, setCaptchaVal] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [errors,     setErrors]     = useState({})

  const usernameRef = useRef(null)

  // Fetch a fresh captcha from the backend
  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    setCaptchaVal('')
    try {
      const res = await api.get('/captcha/generate')
      setCaptchaId(res.data.captchaId)
      setCaptchaText(res.data.text)
    } catch {
      toast.error('Could not load security code. Check if backend is running.')
    } finally {
      setCaptchaLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCaptcha()
    usernameRef.current?.focus()
  }, [])

  const validate = () => {
    const e = {}
    if (!username.trim()) e.username = 'User ID is required'
    if (!password.trim()) e.password = 'Password is required'
    if (!captchaVal.trim()) e.captcha = 'Enter the security code'
    return e
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      // Build time-windowed salted hash (never sends plain password)
      const hashedPayload = await buildLoginPayload(username.trim(), password)

      const res = await api.post('/auth/login', {
        username:     username.trim(),
        password:     hashedPayload,
        captchaId:    captchaId,
        captchaInput: captchaVal.trim(),
      })

      const userData = res.data
      localStorage.setItem('ttwreis_token', userData.token)
      localStorage.setItem('ttwreis_user',  JSON.stringify(userData))
      setUserData(userData)

      toast.success(`✅ Welcome, ${userData.name}!`)
      if (userData.role === 'ADMIN') navigate('/admin',     { replace: true })
      else                           navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid credentials'
      toast.error(`❌ ${msg}`)
      setPassword('')
      fetchCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div className="px-5 py-4" style={{background:'linear-gradient(135deg,#0d3b0d,#1b5e20)'}}>
        <h3 className="text-white font-black text-base">🔐 Login to Portal</h3>
        <p className="text-green-200 text-xs font-semibold">Use Registration Number / Staff ID to login</p>
      </div>

      <div className="p-6">
        <div className="bg-amber-50 border-l-4 border-yellow-400 rounded-r-xl p-3 mb-5 text-xs text-yellow-800 font-semibold">
          <strong>Candidates:</strong> Registration No. as username, DOB (DD-MM-YYYY) as password.<br/>
          <strong>Staff / Admin:</strong> Use your assigned credentials.
        </div>

        <form onSubmit={handleLogin} noValidate>
          <div className="space-y-4">

            {/* Username */}
            <div>
              <label className="label">Registration Number / User ID <span className="text-red-500">*</span></label>
              <input
                ref={usernameRef}
                type="text"
                className="input-field"
                placeholder="e.g. TTWREIS2025000001 or ADMIN001"
                autoComplete="username"
                value={username}
                onChange={e => { setUsername(e.target.value); setErrors(p=>({...p,username:''})) }}
              />
              {errors.username && <p className="text-xs text-red-500 font-bold mt-1">⚠ {errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="DOB as DD-MM-YYYY for candidates"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p=>({...p,password:''})) }}
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPw(v=>!v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 font-bold mt-1">⚠ {errors.password}</p>}
            </div>

            {/* Captcha */}
            {captchaLoading
              ? <div className="text-xs text-gray-400 font-semibold py-2">⏳ Loading security code…</div>
              : <CaptchaBox
                  captchaText={captchaText}
                  onRefresh={fetchCaptcha}
                  value={captchaVal}
                  onChange={v => { setCaptchaVal(v); setErrors(p=>({...p,captcha:''})) }}
                  error={errors.captcha}
                />
            }

            {/* Submit */}
            <button type="submit" disabled={loading || captchaLoading}
              className="btn-primary w-full text-base py-3 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? '⏳ Logging in...' : '🔐 Login to Portal'}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <button type="button" onClick={onRegister} className="btn-orange w-full text-base py-3">
            📝 New Registration
          </button>
          <div className="flex justify-center gap-4 text-xs font-semibold mt-1">
            <button type="button"
              onClick={() => toast.info('Contact helpdesk for password reset: 040-23450678')}
              className="text-green-700 hover:underline bg-transparent border-none cursor-pointer">
              Forgot Password?
            </button>
            <span className="text-gray-400">|</span>
            <button type="button"
              onClick={() => toast.info('Helpdesk: 040-23450678 (Mon–Sat, 9AM–6PM)')}
              className="text-green-700 hover:underline bg-transparent border-none cursor-pointer">
              Help
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-black text-gray-500 uppercase mb-2">Quick Links</p>
          <div className="grid grid-cols-3 gap-2">
            <a href="/docs/notification.pdf" target="_blank" rel="noreferrer"
              className="text-xs font-bold text-green-700 bg-green-50 border border-green-200
                         rounded-lg px-2 py-2 hover:bg-green-100 text-center col-span-1">
              📄 Notification
            </a>
            <a href="/docs/procs.pdf" target="_blank" rel="noreferrer"
              className="text-xs font-bold text-green-700 bg-green-50 border border-green-200
                         rounded-lg px-2 py-2 hover:bg-green-100 text-center col-span-1">
              📋 Prospectus
            </a>
            <a href="/docs/college-list.pdf" target="_blank" rel="noreferrer"
              className="text-xs font-bold text-green-700 bg-green-50 border border-green-200
                         rounded-lg px-2 py-2 hover:bg-green-100 text-center col-span-1">
              🏫 College List
            </a>
            <button type="button" onClick={onHelpdesk}
              className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200
                         rounded-lg px-2 py-2 hover:bg-blue-100 text-center col-span-1">
              📞 Helpdesk
            </button>
            <button type="button" onClick={onGrievance}
              className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200
                         rounded-lg px-2 py-2 hover:bg-orange-100 text-center col-span-2">
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <NotificationScroller />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-5
                       grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <Timeline />
        <LoginForm onRegister={() => setShowReg(true)} onGrievance={() => setShowGrievance(true)} onHelpdesk={() => setShowHelpdesk(true)} />
      </main>
      <footer className="mt-auto" style={{background:'linear-gradient(135deg,#0d3b0d,#1b5e20)'}}>
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6
                        border-b border-white border-opacity-10">
          <div>
            <h4 className="text-yellow-300 font-black text-sm uppercase tracking-wide mb-3">About TTWREIS</h4>
            <p className="text-green-200 text-xs font-medium leading-relaxed">
              TTWREIS is committed to providing quality education to tribal students
              across Telangana under the Government of Telangana, Tribal Welfare Department.
            </p>
          </div>
          <div>
            <h4 className="text-yellow-300 font-black text-sm uppercase tracking-wide mb-3">Important Links</h4>
            <ul className="space-y-1.5">
              {['Admission Notification','Reservation Policy','Exam Center List','Fee Structure','FAQ'].map(l => (
                <li key={l}>
                  <button type="button" onClick={() => toast.info(`${l} – coming soon`)}
                    className="text-green-200 text-xs font-semibold hover:text-yellow-300
                               bg-transparent border-none cursor-pointer p-0">
                    › {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-yellow-300 font-black text-sm uppercase tracking-wide mb-3">Contact Us</h4>
            <p className="text-green-200 text-xs font-medium leading-relaxed">
              TTWREIS Head Office<br/>Masab Tank, Hyderabad – 500028<br/>
              Telangana, India<br/><br/>
              📞 040-23450678<br/>📧 admissions@ttwreis.telangana.gov.in
            </p>
          </div>
        </div>
        <div className="text-center text-green-300 text-xs font-medium py-3">
          © 2025 TTWREIS – Government of Telangana. All Rights Reserved.
        </div>
      </footer>
      {showReg       && <RegistrationModal onClose={() => setShowReg(false)} />}
      {showGrievance && <GrievanceModal    onClose={() => setShowGrievance(false)} />}
      {showHelpdesk  && <HelpdeskModal     onClose={() => setShowHelpdesk(false)} />}
    </div>
  )
}