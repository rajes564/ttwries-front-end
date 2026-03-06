import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { STATES, TELANGANA_DISTRICTS, ID_TYPES } from '../../utils/constants'

// ─── Step config ───────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Aadhaar',  icon: '🪪' },
  { id: 2, label: 'Personal', icon: '👤' },
  { id: 3, label: 'Address',  icon: '🏠' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black
              text-sm border-2 transition-all
              ${current > s.id  ? 'bg-green-600 border-green-600 text-white' :
                current === s.id ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-110' :
                                   'bg-gray-100 border-gray-300 text-gray-400'}`}>
              {current > s.id ? '✓' : s.icon}
            </div>
            <span className={`text-xs font-bold mt-1 text-center w-20 leading-tight
              ${current === s.id ? 'text-orange-700' : current > s.id ? 'text-green-700' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-16 mb-5 mx-1 transition-all ${current > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="label">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint  && <p className="text-xs text-orange-600 font-semibold mt-0.5">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-bold mt-0.5">⚠ {error}</p>}
    </div>
  )
}

// ─── Backend Captcha component (shared across all 3 steps) ────────────────────
function CaptchaField({ captchaId, captchaText, captchaLoading, onRefresh, value, onChange, error }) {
  return (
    <div>
      <label className="label">Security Code <span className="text-red-500">*</span></label>
      <div className="flex items-center gap-2">
        {/* Visual box */}
        <button type="button" onClick={onRefresh}
          title="Click to refresh"
          className="flex-shrink-0 w-32 h-11 border-2 border-green-400 rounded-lg
                     flex items-center justify-center relative overflow-hidden
                     bg-gradient-to-br from-green-50 to-emerald-100 select-none">
          <div className="absolute inset-0 opacity-10"
               style={{backgroundImage:'repeating-linear-gradient(45deg,#1b5e20,transparent 2px,transparent 8px)'}} />
          <div className="absolute h-px w-full bg-green-600 opacity-25" style={{top:'42%',transform:'rotate(-4deg)'}} />
          <div className="absolute h-px w-full bg-orange-400 opacity-20" style={{top:'64%',transform:'rotate(3deg)'}} />
          {captchaLoading
            ? <span className="text-xs text-gray-400 italic relative z-10">Loading…</span>
            : <span className="font-black text-xl tracking-[0.2em] text-green-900 relative z-10"
                    style={{fontFamily:'monospace'}}>
                {captchaText}
              </span>
          }
        </button>
        <button type="button" onClick={onRefresh}
          className="flex-shrink-0 border border-green-300 text-green-700 font-bold
                     text-sm px-2 py-2 rounded-lg hover:bg-green-50 transition-colors">
          🔄
        </button>
        <div className="flex-1">
          <input
            type="text"
            className="input-field"
            placeholder="Type code"
            maxLength={6}
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={e => onChange(e.target.value.toUpperCase())}
            style={{letterSpacing:'0.15em'}}
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-500 font-bold mt-1">⚠ {error}</p>}
    </div>
  )
}

// ─── Step 1: Aadhaar ───────────────────────────────────────────────────────────
function AadhaarStep({ onNext }) {
  const [aadhaar,  setAadhaar]  = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [errors,   setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!aadhaar)                         e.aadhaar  = 'Aadhaar number is required'
    else if (!/^\d{12}$/.test(aadhaar))   e.aadhaar  = 'Must be exactly 12 digits'
    if (!confirm)                         e.confirm  = 'Please confirm Aadhaar'
    else if (aadhaar !== confirm)         e.confirm  = 'Aadhaar numbers do not match'
    return e
  }

  const handleNext = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onNext({ aadhaarNumber: aadhaar, confirmAadhaar: confirm })
  }

  return (
    <form onSubmit={handleNext} noValidate className="space-y-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-3 text-xs text-yellow-800 font-semibold">
        ℹ️ Enter your 12-digit Aadhaar number. It will be used to verify your identity.
      </div>
      <Field label="Aadhaar Number" required error={errors.aadhaar}>
        <input type="text" inputMode="numeric" className="input-field"
          placeholder="Enter 12-digit Aadhaar number" maxLength={12}
          value={aadhaar} onChange={e => { setAadhaar(e.target.value.replace(/\D/,'')); setErrors(p=>({...p,aadhaar:''})) }} />
        <p className="text-xs text-gray-400 mt-0.5 font-medium">{aadhaar.length}/12 digits</p>
      </Field>
      <Field label="Confirm Aadhaar Number" required error={errors.confirm}>
        <input type="text" inputMode="numeric" className="input-field"
          placeholder="Re-enter Aadhaar number" maxLength={12}
          value={confirm} onChange={e => { setConfirm(e.target.value.replace(/\D/,'')); setErrors(p=>({...p,confirm:''})) }} />
      </Field>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary">Next → Personal Details</button>
      </div>
    </form>
  )
}

// ─── Step 2: Personal Details ─────────────────────────────────────────────────
function PersonalStep({ onNext, onBack, saved }) {
  const [form, setForm] = useState({
    candidateName:'', fatherName:'', motherName:'', dateOfBirth:'',
    gender:'', email:'', confirmEmail:'', mobileNumber:'', confirmMobile:'',
    alternateMobile:'', idType:'', idNumber:'',
    ...saved
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})) }

  const validate = () => {
    const e = {}
    if (!form.candidateName)  e.candidateName  = 'Name is required'
    if (!form.fatherName)     e.fatherName     = "Father's name is required"
    if (!form.motherName)     e.motherName     = "Mother's name is required"
    if (!form.dateOfBirth)    e.dateOfBirth    = 'Date of birth is required'
    if (!form.gender)         e.gender         = 'Gender is required'
    if (!form.email)          e.email          = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.confirmEmail)   e.confirmEmail   = 'Please confirm email'
    else if (form.email !== form.confirmEmail)  e.confirmEmail = 'Emails do not match'
    if (!form.mobileNumber)   e.mobileNumber   = 'Mobile is required'
    else if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) e.mobileNumber = 'Invalid mobile number'
    if (!form.confirmMobile)  e.confirmMobile  = 'Please confirm mobile'
    else if (form.mobileNumber !== form.confirmMobile) e.confirmMobile = 'Mobile numbers do not match'
    if (!form.idType)         e.idType         = 'ID type is required'
    if (!form.idNumber)       e.idNumber       = 'ID number is required'
    return e
  }

  const handleNext = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onNext(form)
  }

  const F = ({ label, field, type='text', required=true, children, ...rest }) => (
    <Field label={label} required={required} error={errors[field]}>
      {children || (
        <input type={type} className="input-field"
          value={form[field] || ''}
          onChange={e => set(field, e.target.value)}
          {...rest} />
      )}
    </Field>
  )

  return (
    <form onSubmit={handleNext} noValidate className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <F label="Candidate Name"           field="candidateName"  placeholder="Full name as per records" />
        <F label="Father's / Guardian Name" field="fatherName"     placeholder="Father's full name" />
        <F label="Mother's / Guardian Name" field="motherName"     placeholder="Mother's full name" />
        <F label="Date of Birth"            field="dateOfBirth"    type="date" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Gender" required error={errors.gender}>
          <select className="input-field" value={form.gender} onChange={e => set('gender', e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other (Third Gender)</option>
          </select>
        </Field>
        <F label="Mobile Number" field="mobileNumber" type="tel" maxLength={10} placeholder="10-digit mobile" />
        <F label="Confirm Mobile" field="confirmMobile" type="tel" maxLength={10} placeholder="Re-enter mobile" />
        <F label="Alternate Mobile" field="alternateMobile" required={false} type="tel" maxLength={10} placeholder="Optional" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <F label="Email Address"  field="email"        type="email" placeholder="your@email.com" />
        <F label="Confirm Email"  field="confirmEmail" type="email" placeholder="Re-enter email" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="ID Type" required error={errors.idType}>
          <select className="input-field" value={form.idType} onChange={e => set('idType', e.target.value)}>
            <option value="">Select ID Type</option>
            {ID_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <F label="ID Number" field="idNumber" placeholder="Enter ID number" />
      </div>
      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="btn-secondary">← Back</button>
        <button type="submit" className="btn-primary">Next → Address Details</button>
      </div>
    </form>
  )
}

// ─── Step 3: Address + Backend CAPTCHA + Declaration ──────────────────────────
function AddressStep({ onSubmit, onBack, saved, loading }) {
  const [form, setForm] = useState({
    pCountry:'India', pState:'', pDistrict:'', pMandal:'', pVillage:'', pPincode:'',
    permCountry:'India', permState:'', permDistrict:'', permMandal:'', permVillage:'', permPincode:'',
    sameAsPresent: false,
    ...saved
  })
  const [errors,      setErrors]      = useState({})
  const [captchaId,   setCaptchaId]   = useState('')
  const [captchaText, setCaptchaText] = useState('')
  const [captchaVal,  setCaptchaVal]  = useState('')
  const [captchaLoad, setCaptchaLoad] = useState(false)
  const [declared,    setDeclared]    = useState(false)

  // Fetch captcha from backend
  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoad(true)
    setCaptchaVal('')
    try {
      const res = await api.get('/captcha/generate')
      setCaptchaId(res.data.captchaId)
      setCaptchaText(res.data.text)
    } catch {
      toast.error('Could not load security code. Is the backend running?')
    } finally {
      setCaptchaLoad(false)
    }
  }, [])

  useEffect(() => { fetchCaptcha() }, [fetchCaptcha])

  const set = (k, v) => {
    setForm(p => {
      const next = { ...p, [k]: v }
      // Auto-copy present to permanent when checkbox ticked
      if (k === 'sameAsPresent' && v) {
        next.permCountry  = next.pCountry
        next.permState    = next.pState
        next.permDistrict = next.pDistrict
        next.permMandal   = next.pMandal
        next.permVillage  = next.pVillage
        next.permPincode  = next.pPincode
      }
      return next
    })
    setErrors(p => ({ ...p, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.pState)    e.pState    = 'Required'
    if (!form.pDistrict) e.pDistrict = 'Required'
    if (!form.pMandal)   e.pMandal   = 'Required'
    if (!form.pVillage)  e.pVillage  = 'Required'
    if (!form.pPincode)  e.pPincode  = 'Required'
    if (!form.permState)    e.permState    = 'Required'
    if (!form.permDistrict) e.permDistrict = 'Required'
    if (!form.permMandal)   e.permMandal   = 'Required'
    if (!form.permVillage)  e.permVillage  = 'Required'
    if (!form.permPincode)  e.permPincode  = 'Required'
    if (!captchaVal.trim()) e.captcha = 'Enter the security code'
    if (!declared)          e.declared = 'You must accept the declaration'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    // Pass captchaId + captchaInput to parent — backend will verify them
    onSubmit({ ...form, captchaId, captchaInput: captchaVal.trim() })
  }

  const AddrField = ({ label, field, options, disabled }) => (
    <Field label={label} required error={errors[field]}>
      {options
        ? <select className="input-field" value={form[field]||''}
            onChange={e => set(field, e.target.value)} disabled={disabled}>
            <option value="">Select</option>
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        : <input className="input-field" value={form[field]||''}
            onChange={e => set(field, e.target.value)}
            disabled={disabled} placeholder={label} />
      }
    </Field>
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {/* Present Address */}
      <div className="form-section">
        <div className="section-title">📍 Present Address</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Country" required error={errors.pCountry}>
            <input className="input-field" value={form.pCountry}
              onChange={e => set('pCountry', e.target.value)} />
          </Field>
          <AddrField label="State"        field="pState"    options={STATES} />
          <AddrField label="District"     field="pDistrict" options={TELANGANA_DISTRICTS} />
          <AddrField label="Mandal"       field="pMandal" />
          <AddrField label="Village/Town" field="pVillage" />
          <Field label="PIN Code" required error={errors.pPincode}>
            <input type="number" className="input-field" maxLength={6}
              value={form.pPincode||''} onChange={e => set('pPincode', e.target.value)} placeholder="6-digit PIN" />
          </Field>
        </div>
      </div>

      {/* Permanent Address */}
      <div className="form-section">
        <div className="section-title">🏠 Permanent Address</div>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-primary-600"
            checked={form.sameAsPresent}
            onChange={e => set('sameAsPresent', e.target.checked)} />
          <span className="text-sm font-bold text-primary-700">Same as Present Address</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Country" required error={errors.permCountry}>
            <input className="input-field" value={form.permCountry}
              disabled={form.sameAsPresent}
              onChange={e => set('permCountry', e.target.value)} />
          </Field>
          <AddrField label="State"        field="permState"    options={STATES}              disabled={form.sameAsPresent} />
          <AddrField label="District"     field="permDistrict" options={TELANGANA_DISTRICTS} disabled={form.sameAsPresent} />
          <AddrField label="Mandal"       field="permMandal"   disabled={form.sameAsPresent} />
          <AddrField label="Village/Town" field="permVillage"  disabled={form.sameAsPresent} />
          <Field label="PIN Code" required error={errors.permPincode}>
            <input type="number" className="input-field"
              value={form.permPincode||''} disabled={form.sameAsPresent}
              onChange={e => set('permPincode', e.target.value)} placeholder="6-digit PIN" />
          </Field>
        </div>
      </div>

      {/* Backend CAPTCHA */}
      <div className="form-section">
        <div className="section-title">🔐 Security Verification</div>
        <CaptchaField
          captchaId={captchaId}
          captchaText={captchaText}
          captchaLoading={captchaLoad}
          onRefresh={fetchCaptcha}
          value={captchaVal}
          onChange={v => { setCaptchaVal(v); setErrors(p=>({...p,captcha:''})) }}
          error={errors.captcha}
        />
        <p className="text-xs text-gray-400 font-semibold mt-1">
          The security code is verified by the server and expires in 5 minutes.
        </p>
      </div>

      {/* Declaration */}
      <div className="form-section bg-amber-50 border border-amber-200">
        <div className="section-title text-amber-800">📜 Declaration</div>
        <p className="text-xs text-gray-700 font-medium leading-relaxed mb-3">
          I have carefully reviewed and fully understood the guidelines and fee structure.
          I am aware of all the terms, conditions, and associated costs. By registering,
          I confirm that all information provided is accurate and I agree to comply with
          all TTWREIS admission rules and regulations.
        </p>
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" className="mt-0.5 w-4 h-4 accent-primary-600"
            checked={declared} onChange={e => { setDeclared(e.target.checked); setErrors(p=>({...p,declared:''})) }} />
          <span className="text-xs font-bold text-gray-700">
            I have read and agree to the above declaration <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.declared && <p className="text-xs text-red-500 font-bold mt-1">⚠ {errors.declared}</p>}
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="btn-secondary">← Back</button>
        <button type="submit" disabled={loading || captchaLoad}
          className="btn-primary min-w-36 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? '⏳ Registering...' : '✅ Register Now'}
        </button>
      </div>
    </form>
  )
}

// ─── Main Modal ────────────────────────────────────────────────────────────────
export default function RegistrationModal({ onClose }) {
  const [step,     setStep]     = useState(1)
  const [formData, setFormData] = useState({})
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(null)

  const next1 = (data) => { setFormData(d=>({...d,...data})); setStep(2) }
  const next2 = (data) => { setFormData(d=>({...d,...data})); setStep(3) }

  const handleFinalSubmit = async (data) => {
    setLoading(true)
    const payload = { ...formData, ...data }
    try {
      const res = await api.post('/registration/register', payload)
      setSuccess(res.data)
      toast.success(`🎉 Registration Successful! ID: ${res.data.registrationNumber}`)
    } catch (e) {
      const msg = e.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(`❌ ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
             style={{background:'linear-gradient(135deg,#0d3b0d,#1b5e20)'}}>
          <div>
            <h2 className="text-white font-black text-lg">📝 New Candidate Registration</h2>
            <p className="text-green-200 text-xs font-semibold">TTWREIS Admission Portal 2026-27.</p>
          </div>
          <button type="button" onClick={onClose}
            className="text-white hover:text-red-300 font-black text-2xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {success ? (
            /* Success screen */
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-black text-green-700 mb-2">Registration Successful!</h3>
              <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 inline-block text-left mt-2 max-w-sm">
                <p className="text-sm font-bold text-gray-700">Your Registration Number:</p>
                <p className="text-3xl font-black text-green-700 mt-1 tracking-wider">
                  {success.registrationNumber}
                </p>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-gray-600 font-semibold">
                    🔑 Default Password: <strong>Date of Birth (DD-MM-YYYY)</strong>
                  </p>
                  <p className="text-xs text-gray-600 font-semibold">
                    📱 Sent to mobile: {success.mobile}
                  </p>
                </div>
              </div>
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 font-semibold max-w-sm mx-auto">
                ⚠️ Please save your Registration Number. You will need it to login and track your application.
              </div>
              <button type="button" onClick={onClose}
                className="btn-primary mt-6 px-8">
                Go to Login →
              </button>
            </div>
          ) : (
            <>
              <StepBar current={step} />
              {step === 1 && <AadhaarStep  onNext={next1} />}
              {step === 2 && <PersonalStep onNext={next2} onBack={() => setStep(1)} saved={formData} />}
              {step === 3 && <AddressStep  onSubmit={handleFinalSubmit} onBack={() => setStep(2)} saved={formData} loading={loading} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}