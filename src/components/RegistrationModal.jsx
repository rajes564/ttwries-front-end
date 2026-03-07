import React, { useState, useEffect, useCallback, useId } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { STATES, TELANGANA_DISTRICTS, ID_TYPES } from '../../utils/constants'

const STEPS = [
  { id: 1, label: 'Aadhaar',  icon: '🪪' },
  { id: 2, label: 'Personal', icon: '👤' },
  { id: 3, label: 'Address',  icon: '🏠' },
]

// ── ALL components at module level — zero inline component definitions ─────────

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black
              text-sm border-2 transition-all
              ${current > s.id  ? 'border-2 border-white" style={{background:"#8B0000",border: text-white' :
                current === s.id ? 'text-white shadow-lg scale-110' :
                                   'bg-gray-100 border-gray-300 text-gray-400'}`}>
              {current > s.id ? '✓' : s.icon}
            </div>
            <span className={`text-xs font-bold mt-1 text-center w-20 leading-tight
              ${current === s.id ? 'text-red-700' : current > s.id ? 'text-red-800' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-8 sm:w-16 mb-5 mx-0.5 sm:mx-1 ${current > s.id ? 'bg-red-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// LabeledInput — standalone controlled input with its own stable id
// Module-level, no closure over parent state → focus never lost
function LabeledInput({ id, label, required, error, hint, type = 'text', value, onChange, ...rest }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}{required !== false && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        className="input-field"
        value={value}
        onChange={onChange}
        {...rest}
      />
      {hint  && <p className="text-xs text-orange-600 font-semibold mt-0.5">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-bold mt-0.5">⚠ {error}</p>}
    </div>
  )
}

function LabeledSelect({ id, label, required, error, value, onChange, options, placeholder, disabled }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}{required !== false && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select id={id} className="input-field" value={value} onChange={onChange} disabled={disabled}>
        <option value="">{placeholder || 'Select'}</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      {error && <p className="text-xs text-red-500 font-bold mt-0.5">⚠ {error}</p>}
    </div>
  )
}

function CaptchaField({ captchaText, captchaLoading, onRefresh, value, onChange, error }) {
  return (
    <div>
      <label className="label">Security Code <span className="text-red-500">*</span></label>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onRefresh} title="Click to refresh"
          className="flex-shrink-0 w-full sm:w-32 h-12 border-2 rounded-lg
                     flex items-center justify-center relative overflow-hidden
                     bg-gradient-to-br from-green-50 to-emerald-100 select-none">
          <div className="absolute inset-0 opacity-10"
               style={{backgroundImage:'repeating-linear-gradient(45deg,#1b5e20,transparent 2px,transparent 8px)'}}/>
          <div className="absolute h-px w-full bg-green-600 opacity-25" style={{top:'42%',transform:'rotate(-4deg)'}}/>
          <div className="absolute h-px w-full bg-orange-400 opacity-20" style={{top:'64%',transform:'rotate(3deg)'}}/>
          {captchaLoading
            ? <span className="text-xs text-gray-400 italic relative z-10">Loading…</span>
            : <span className="font-black text-xl tracking-[0.2em] text-green-900 relative z-10"
                    style={{fontFamily:'monospace'}}>{captchaText}</span>}
        </button>
        <button type="button" onClick={onRefresh}
          className="flex-shrink-0 border border-green-300 text-green-700 font-bold
                     text-sm px-2 py-2 rounded-lg hover:bg-green-50 transition-colors">🔄</button>
        <input type="text" className="input-field flex-1" placeholder="Type code"
          maxLength={6} autoComplete="off" spellCheck={false}
          value={value} onChange={e => onChange(e.target.value.toUpperCase())}
          style={{letterSpacing:'0.15em'}}/>
      </div>
      {error && <p className="text-xs text-red-500 font-bold mt-1">⚠ {error}</p>}
    </div>
  )
}

// ── Step 1: Aadhaar ────────────────────────────────────────────────────────────
function AadhaarStep({ onNext }) {
  const [aadhaar, setAadhaar] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors,  setErrors]  = useState({})

  const handleNext = (e) => {
    e.preventDefault()
    const err = {}
    if (!aadhaar)                       err.aadhaar = 'Aadhaar number is required'
    else if (!/^\d{12}$/.test(aadhaar)) err.aadhaar = 'Must be exactly 12 digits'
    if (!confirm)                       err.confirm = 'Please confirm Aadhaar'
    else if (aadhaar !== confirm)       err.confirm = 'Aadhaar numbers do not match'
    if (Object.keys(err).length) { setErrors(err); return }
    onNext({ aadhaarNumber: aadhaar, confirmAadhaar: confirm })
  }

  return (
    <form onSubmit={handleNext} noValidate className="space-y-4">
      <div className="border-l-4 rounded-r-lg p-3 text-xs font-semibold" style={{background:"#fff8e1",borderColor:"#ffd600",color:"#5a3a00"}}>
        ℹ️ Enter your 12-digit Aadhaar number. It will be used to verify your identity.
      </div>
      <LabeledInput id="aadhaar" label="Aadhaar Number" inputMode="numeric" maxLength={12}
        placeholder="Enter 12-digit Aadhaar" value={aadhaar} error={errors.aadhaar}
        onChange={e => { setAadhaar(e.target.value.replace(/\D/g,'')); setErrors(p=>({...p,aadhaar:''})) }}/>
      <p className="text-xs text-gray-400 font-medium -mt-3">{aadhaar.length}/12 digits</p>
      <LabeledInput id="aadhaar-confirm" label="Confirm Aadhaar Number" inputMode="numeric" maxLength={12}
        placeholder="Re-enter Aadhaar" value={confirm} error={errors.confirm}
        onChange={e => { setConfirm(e.target.value.replace(/\D/g,'')); setErrors(p=>({...p,confirm:''})) }}/>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary">Next → Personal Details</button>
      </div>
    </form>
  )
}

// ── Step 2: Personal Details ───────────────────────────────────────────────────
// Uses direct controlled inputs — NO wrapper components for text fields
function PersonalStep({ onNext, onBack, saved }) {
  const [form, setForm] = useState({
    candidateName:'', fatherName:'', motherName:'', dateOfBirth:'',
    gender:'', email:'', confirmEmail:'', mobileNumber:'', confirmMobile:'',
    alternateMobile:'', idType:'', idNumber:'',
    ...saved,
  })
  const [errors, setErrors] = useState({})

  // useCallback so child inputs don't get a new onChange reference each render
  const handleChange = useCallback((field) => (e) => {
    setForm(p => ({...p, [field]: e.target.value}))
    setErrors(p => ({...p, [field]: ''}))
  }, [])

  const handleNext = (e) => {
    e.preventDefault()
    const err = {}
    if (!form.candidateName) err.candidateName = 'Name is required'
    if (!form.fatherName)    err.fatherName    = "Father's name is required"
    if (!form.motherName)    err.motherName    = "Mother's name is required"
    if (!form.dateOfBirth)   err.dateOfBirth   = 'Date of birth is required'
    if (!form.gender)        err.gender        = 'Gender is required'
    if (!form.email)         err.email         = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Invalid email'
    if (!form.confirmEmail)  err.confirmEmail  = 'Please confirm email'
    else if (form.email !== form.confirmEmail)  err.confirmEmail = 'Emails do not match'
    if (!form.mobileNumber)  err.mobileNumber  = 'Mobile is required'
    else if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) err.mobileNumber = 'Invalid mobile (10 digits)'
    if (!form.confirmMobile) err.confirmMobile = 'Please confirm mobile'
    else if (form.mobileNumber !== form.confirmMobile) err.confirmMobile = 'Mobile numbers do not match'
    if (!form.idType)        err.idType        = 'ID type is required'
    if (!form.idNumber)      err.idNumber      = 'ID number is required'
    if (Object.keys(err).length) { setErrors(err); return }
    onNext(form)
  }

  return (
    <form onSubmit={handleNext} noValidate className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <LabeledInput id="p-name"   label="Candidate Name"           value={form.candidateName}   error={errors.candidateName}  onChange={handleChange('candidateName')}  placeholder="Full name as per records"/>
        <LabeledInput id="p-father" label="Father's / Guardian Name" value={form.fatherName}      error={errors.fatherName}     onChange={handleChange('fatherName')}     placeholder="Father's full name"/>
        <LabeledInput id="p-mother" label="Mother's / Guardian Name" value={form.motherName}      error={errors.motherName}     onChange={handleChange('motherName')}     placeholder="Mother's full name"/>
        <LabeledInput id="p-dob"    label="Date of Birth" type="date" value={form.dateOfBirth}    error={errors.dateOfBirth}    onChange={handleChange('dateOfBirth')}/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <LabeledSelect id="p-gender" label="Gender" value={form.gender} error={errors.gender}
          options={['Female','Male','Other (Third Gender)']}  placeholder="Select Gender"
          onChange={handleChange('gender')}/>
        <LabeledInput id="p-mobile"  label="Mobile Number"   type="tel" maxLength={10} value={form.mobileNumber}    error={errors.mobileNumber}   onChange={handleChange('mobileNumber')}   placeholder="10-digit mobile"/>
        <LabeledInput id="p-mobile2" label="Confirm Mobile"  type="tel" maxLength={10} value={form.confirmMobile}   error={errors.confirmMobile}  onChange={handleChange('confirmMobile')}  placeholder="Re-enter mobile"/>
        <LabeledInput id="p-altmob" label="Alternate Mobile" type="tel" maxLength={10} value={form.alternateMobile} required={false}              onChange={handleChange('alternateMobile')} placeholder="Optional"/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <LabeledInput id="p-email"  label="Email Address" type="email" value={form.email}        error={errors.email}        onChange={handleChange('email')}        placeholder="your@email.com"/>
        <LabeledInput id="p-email2" label="Confirm Email" type="email" value={form.confirmEmail} error={errors.confirmEmail} onChange={handleChange('confirmEmail')} placeholder="Re-enter email"/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <LabeledSelect id="p-idtype" label="ID Type" value={form.idType} error={errors.idType}
          options={ID_TYPES} placeholder="Select ID Type" onChange={handleChange('idType')}/>
        <LabeledInput id="p-idno" label="ID Number" value={form.idNumber} error={errors.idNumber}
          onChange={handleChange('idNumber')} placeholder="Enter ID number"/>
      </div>
      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="btn-secondary">← Back</button>
        <button type="submit" className="btn-primary">Next → Address Details</button>
      </div>
    </form>
  )
}

// ── Step 3: Address + CAPTCHA + Declaration ────────────────────────────────────
function AddressStep({ onSubmit, onBack, saved, loading }) {
  const [form, setForm] = useState({
    pCountry:'India', pState:'', pDistrict:'', pMandal:'', pVillage:'', pPincode:'',
    permCountry:'India', permState:'', permDistrict:'', permMandal:'', permVillage:'', permPincode:'',
    sameAsPresent: false,
    ...saved,
  })
  const [errors,      setErrors]      = useState({})
  const [captchaId,   setCaptchaId]   = useState('')
  const [captchaText, setCaptchaText] = useState('')
  const [captchaVal,  setCaptchaVal]  = useState('')
  const [captchaLoad, setCaptchaLoad] = useState(false)
  const [declared,    setDeclared]    = useState(false)

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoad(true); setCaptchaVal('')
    try {
      const res = await api.get('/captcha/generate')
      setCaptchaId(res.data.captchaId); setCaptchaText(res.data.text)
    } catch { toast.error('Could not load security code. Is the backend running?') }
    finally  { setCaptchaLoad(false) }
  }, [])

  useEffect(() => { fetchCaptcha() }, [fetchCaptcha])

  // useCallback so input onChanges are stable references
  const handleChange = useCallback((field) => (e) => {
    const val = e.target ? e.target.value : e   // handle both event and raw value
    setForm(p => {
      const next = { ...p, [field]: val }
      if (field === 'sameAsPresent' && val) {
        next.permCountry = next.pCountry; next.permState    = next.pState
        next.permDistrict= next.pDistrict; next.permMandal  = next.pMandal
        next.permVillage = next.pVillage;  next.permPincode = next.pPincode
      }
      return next
    })
    setErrors(p => ({...p, [field]: ''}))
  }, [])

  const handleCheckbox = useCallback((e) => {
    const val = e.target.checked
    setForm(p => {
      const next = {...p, sameAsPresent: val}
      if (val) {
        next.permCountry = next.pCountry; next.permState    = next.pState
        next.permDistrict= next.pDistrict; next.permMandal  = next.pMandal
        next.permVillage = next.pVillage;  next.permPincode = next.pPincode
      }
      return next
    })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = {}
    if (!form.pState)       err.pState       = 'Required'
    if (!form.pDistrict)    err.pDistrict    = 'Required'
    if (!form.pMandal)      err.pMandal      = 'Required'
    if (!form.pVillage)     err.pVillage     = 'Required'
    if (!form.pPincode)     err.pPincode     = 'Required'
    if (!form.permState)    err.permState    = 'Required'
    if (!form.permDistrict) err.permDistrict = 'Required'
    if (!form.permMandal)   err.permMandal   = 'Required'
    if (!form.permVillage)  err.permVillage  = 'Required'
    if (!form.permPincode)  err.permPincode  = 'Required'
    if (!captchaVal.trim()) err.captcha      = 'Enter the security code'
    if (!declared)          err.declared     = 'You must accept the declaration'
    if (Object.keys(err).length) { setErrors(err); return }
    onSubmit({ ...form, captchaId, captchaInput: captchaVal.trim() })
  }

  const dis = form.sameAsPresent

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Present Address */}
      <div className="form-section">
        <div className="section-title">📍 Present Address</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LabeledInput  id="p-country"  label="Country"       value={form.pCountry}  onChange={handleChange('pCountry')}/>
          <LabeledSelect id="p-state"    label="State"         value={form.pState}    onChange={handleChange('pState')}    error={errors.pState}    options={STATES}/>
          <LabeledSelect id="p-district" label="District"      value={form.pDistrict} onChange={handleChange('pDistrict')} error={errors.pDistrict} options={TELANGANA_DISTRICTS}/>
          <LabeledInput  id="p-mandal"   label="Mandal"        value={form.pMandal}   onChange={handleChange('pMandal')}   error={errors.pMandal}   placeholder="Enter Mandal"/>
          <LabeledInput  id="p-village"  label="Village / Town" value={form.pVillage} onChange={handleChange('pVillage')}  error={errors.pVillage}  placeholder="Enter Village/Town"/>
          <LabeledInput  id="p-pin"      label="PIN Code" inputMode="numeric" maxLength={6}
            value={form.pPincode} onChange={handleChange('pPincode')} error={errors.pPincode} placeholder="6-digit PIN"/>
        </div>
      </div>

      {/* Permanent Address */}
      <div className="form-section">
        <div className="section-title">🏠 Permanent Address</div>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-primary-600"
            checked={form.sameAsPresent} onChange={handleCheckbox}/>
          <span className="text-sm font-bold text-primary-700">Same as Present Address</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LabeledInput  id="pm-country"  label="Country"       value={form.permCountry}  disabled={dis} onChange={handleChange('permCountry')}/>
          <LabeledSelect id="pm-state"    label="State"         value={form.permState}    disabled={dis} onChange={handleChange('permState')}    error={errors.permState}    options={STATES}/>
          <LabeledSelect id="pm-district" label="District"      value={form.permDistrict} disabled={dis} onChange={handleChange('permDistrict')} error={errors.permDistrict} options={TELANGANA_DISTRICTS}/>
          <LabeledInput  id="pm-mandal"   label="Mandal"        value={form.permMandal}   disabled={dis} onChange={handleChange('permMandal')}   error={errors.permMandal}   placeholder="Enter Mandal"/>
          <LabeledInput  id="pm-village"  label="Village / Town" value={form.permVillage} disabled={dis} onChange={handleChange('permVillage')}  error={errors.permVillage}  placeholder="Enter Village/Town"/>
          <LabeledInput  id="pm-pin"      label="PIN Code" inputMode="numeric" maxLength={6}
            value={form.permPincode} disabled={dis} onChange={handleChange('permPincode')} error={errors.permPincode} placeholder="6-digit PIN"/>
        </div>
      </div>

      {/* CAPTCHA */}
      <div className="form-section">
        <div className="section-title">🔐 Security Verification</div>
        <CaptchaField captchaText={captchaText} captchaLoading={captchaLoad}
          onRefresh={fetchCaptcha} value={captchaVal}
          onChange={v => { setCaptchaVal(v); setErrors(p=>({...p,captcha:''})) }}
          error={errors.captcha}/>
        <p className="text-xs text-gray-400 font-semibold mt-1">
          Security code is verified server-side and expires in 5 minutes.
        </p>
      </div>

      {/* Declaration */}
      <div className="form-section bg-amber-50 border border-amber-200">
        <div className="section-title text-amber-800">📜 Declaration</div>
        <p className="text-xs text-gray-700 font-medium leading-relaxed mb-3">
          I have carefully reviewed and fully understood the guidelines and fee structure.
          I confirm that all information provided is accurate and I agree to comply with
          all TTWREIS admission rules and regulations.
        </p>
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" className="mt-0.5 w-4 h-4 accent-primary-600"
            checked={declared}
            onChange={e => { setDeclared(e.target.checked); setErrors(p=>({...p,declared:''})) }}/>
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

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function RegistrationModal({ onClose }) {
  const [step,     setStep]     = useState(1)
  const [formData, setFormData] = useState({})
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(null)

  const next1 = useCallback((data) => { setFormData(d => ({...d,...data})); setStep(2) }, [])
  const next2 = useCallback((data) => { setFormData(d => ({...d,...data})); setStep(3) }, [])
  const back1 = useCallback(() => setStep(1), [])
  const back2 = useCallback(() => setStep(2), [])

  const handleFinalSubmit = useCallback(async (data) => {
    setLoading(true)
    try {
      const res = await api.post('/registration/register', { ...formData, ...data })
      setSuccess(res.data)
      toast.success(`🎉 Registration Successful! ID: ${res.data.registrationNumber}`)
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.message || 'Registration failed. Please try again.'}`)
    } finally { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[95vh] sm:max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
             style={{background:'linear-gradient(135deg,#3d0000,#8B0000)'}}>
          <div>
            <h2 className="text-white font-black text-lg">📝 New Candidate Registration</h2>
            <p className="text-red-200 text-xs font-semibold">TTWREIS Admission Portal 2025-26</p>
          </div>
          <button type="button" onClick={onClose}
            className="text-white hover:text-red-300 font-black text-2xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 sm:p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-black mb-2" style={{color:"#8B0000"}}>Registration Successful!</h3>
              <div className="border-2 rounded-xl p-5 inline-block text-left mt-2 max-w-sm w-full" style={{background:"#fdf2f2",borderColor:"#8B0000"}}>
                <p className="text-sm font-bold text-gray-700">Your Registration Number:</p>
                <p className="text-3xl font-black mt-1 tracking-wider" style={{color:"#8B0000"}}>{success.registrationNumber}</p>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-gray-600 font-semibold">🔑 Default Password: <strong>Date of Birth (DD-MM-YYYY)</strong></p>
                  <p className="text-xs text-gray-600 font-semibold">📱 Sent to mobile: {success.mobile}</p>
                </div>
              </div>
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 font-semibold max-w-sm mx-auto">
                ⚠️ Save your Registration Number — you need it to login and track your application.
              </div>
              <button type="button" onClick={onClose} className="btn-primary mt-6 px-8">Go to Login →</button>
            </div>
          ) : (
            <>
              <StepBar current={step}/>
              {step === 1 && <AadhaarStep  onNext={next1}/>}
              {step === 2 && <PersonalStep onNext={next2} onBack={back1} saved={formData}/>}
              {step === 3 && <AddressStep  onSubmit={handleFinalSubmit} onBack={back2} saved={formData} loading={loading}/>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
