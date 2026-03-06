import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { authAPI } from '../../context/AuthContext';
import { X, CheckCircle, ChevronRight, ChevronLeft, Shield, User, MapPin } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Aadhaar Details', icon: Shield,  desc: 'Verify your Aadhaar' },
  { id: 2, label: 'Personal Details', icon: User,    desc: 'Fill personal info' },
  { id: 3, label: 'Address Details',  icon: MapPin,  desc: 'Enter address' },
];

const STATES       = ['Telangana','Andhra Pradesh','Maharashtra','Karnataka','Tamil Nadu','Kerala','Odisha'];
const DISTRICTS_TS = ['Hyderabad','Khammam','Warangal','Karimnagar','Nizamabad','Adilabad','Nalgonda','Medak','Rangareddy','Mahaboobnagar'];
const ID_TYPES     = ['PAN Card','Driving Licence','School Identity Card','Other Govt ID Card'];

// ── CaptchaWidget — standalone, defined OUTSIDE RegistrationModal ─────────────
// (Defining inside parent would cause remount on every parent re-render)
function CaptchaWidget({ onValidate }) {
  const chars   = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const genCode = () => Array.from({length:5}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  const [code,  setCode]  = useState(genCode);
  const [input, setInput] = useState('');
  const [err,   setErr]   = useState('');

  const refresh = () => { setCode(genCode()); setInput(''); setErr(''); onValidate(false); };

  const validate = () => {
    if (input.toUpperCase() === code) {
      setErr(''); onValidate(true); return;
    }
    setErr('Incorrect CAPTCHA. Please try again.');
    refresh();
  };

  return (
    <div>
      <label className="form-label">Security PIN (CAPTCHA) *</label>
      <div className="flex gap-2 items-center">
        <div
          className="flex-shrink-0 w-32 h-11 rounded-lg border border-gray-300 flex items-center justify-center relative overflow-hidden cursor-pointer select-none"
          style={{background:'linear-gradient(135deg,#e8f5e9,#f1f8e9)'}}
          onClick={refresh} title="Click to refresh">
          <div className="absolute inset-0" style={{backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(26,107,46,0.05) 2px,rgba(26,107,46,0.05) 4px)'}}/>
          <div className="absolute" style={{top:'40%',left:0,right:0,height:2,background:'rgba(26,107,46,0.2)',transform:'rotate(-3deg)'}}/>
          <span className="font-black text-xl text-primary-700 z-10 tracking-widest"
                style={{fontFamily:'Courier New, monospace',transform:'skewX(-5deg)'}}>{code}</span>
        </div>
        <button type="button" onClick={refresh}
          className="h-11 w-10 border border-gray-300 rounded-lg flex items-center justify-center text-primary-700 hover:bg-primary-50 transition-colors"
          title="Refresh">🔄</button>
        <input
          type="text"
          className="form-input flex-1"
          placeholder="Enter code"
          maxLength={5}
          value={input}
          autoComplete="off"
          onChange={e => setInput(e.target.value.toUpperCase())}
          onBlur={validate}
          style={{textTransform:'uppercase', letterSpacing:4}}
        />
      </div>
      {err && <p className="form-error">{err}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function RegistrationModal({ onClose }) {
  const [step,         setStep]         = useState(1);
  const [formData,     setFormData]     = useState({});
  const [sameAddress,  setSameAddress]  = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [declared,     setDeclared]     = useState(false);

  // ── mode:'onBlur' is CRITICAL — 'onChange' re-renders on every keystroke
  // which remounts dynamic child components and causes focus loss ──────────────
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    setValue,
    trigger,
  } = useForm({ mode: 'onBlur' });

  const aadhar = watch('aadhaarNumber');
  const email  = watch('email');
  const mobile = watch('mobile');

  const handleSameAddress = (checked) => {
    setSameAddress(checked);
    if (checked) {
      const v = getValues();
      setValue('permanentCountry',  v.presentCountry  || 'India');
      setValue('permanentState',    v.presentState    || '');
      setValue('permanentDistrict', v.presentDistrict || '');
      setValue('permanentMandal',   v.presentMandal   || '');
      setValue('permanentVillage',  v.presentVillage  || '');
      setValue('permanentPincode',  v.presentPincode  || '');
    }
  };

  const nextStep = async () => {
    let fields = [];
    if (step === 1) fields = ['aadhaarNumber','confirmAadhaarNumber'];
    if (step === 2) fields = ['candidateName','fatherName','motherName','dob','email','confirmEmail','gender','mobile','confirmMobile','idType','idNumber'];
    const ok = await trigger(fields);
    if (ok) {
      setFormData(prev => ({ ...prev, ...getValues() }));
      setStep(s => s + 1);
    }
  };

  const onSubmit = async (data) => {
    if (!captchaValid) { toast.error('Please complete the CAPTCHA verification.'); return; }
    if (!declared)     { toast.error('Please accept the declaration to proceed.'); return; }
    setLoading(true);
    try {
      const payload = { ...formData, ...data };
      const res = await authAPI.register(payload);
      toast.success(
        `✅ Registration Successful! Your Reg No: ${res.data.registrationNumber} has been sent to your mobile. Default password is your Date of Birth.`,
        { autoClose: 8000 }
      );
      onClose();
    } catch (err) {
      toast.error(`❌ ${err.response?.data?.message || 'Registration failed. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
             style={{background:'linear-gradient(135deg,#0f4a1e,#1a6b2e)'}}>
          <div>
            <h2 className="text-white font-black text-lg">New Candidate Registration</h2>
            <p className="text-white/70 text-xs font-semibold">TGTWREIS V-CET 2025 — Online Admission Portal</p>
          </div>
          <button onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-all">
            <X size={20}/>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center px-6 py-4 bg-gray-50 border-b">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done   = step > s.id;
            const active = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all duration-300 ${
                    done   ? 'bg-green-500 border-green-500 text-white'
                  : active ? 'bg-primary-700 border-primary-700 text-white'
                  :          'bg-white border-gray-300 text-gray-400'}`}>
                    {done ? <CheckCircle size={18}/> : <Icon size={16}/>}
                  </div>
                  <div className={`text-xs font-bold mt-1 text-center w-24 ${
                    active ? 'text-primary-700' : done ? 'text-green-600' : 'text-gray-400'}`}>
                    {s.label}
                  </div>
                </div>
                {i < STEPS.length-1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-300 ${
                    step > s.id ? 'bg-green-500' : 'bg-gray-200'}`}/>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ── STEP 1: Aadhaar ────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 font-semibold">
                🔒 Your Aadhaar details are encrypted and stored securely as per Government guidelines.
              </div>
              <div>
                <label className="form-label">Aadhaar Number *</label>
                <input
                  id="aadhaarNumber"
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  className="form-input"
                  placeholder="Enter 12-digit Aadhaar number"
                  autoComplete="off"
                  {...register('aadhaarNumber', {
                    required: 'Aadhaar number is required',
                    pattern: { value:/^\d{12}$/, message:'Aadhaar must be exactly 12 digits' },
                  })}
                />
                {errors.aadhaarNumber && <p className="form-error">{errors.aadhaarNumber.message}</p>}
              </div>
              <div>
                <label className="form-label">Confirm Aadhaar Number *</label>
                <input
                  id="confirmAadhaarNumber"
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  className="form-input"
                  placeholder="Re-enter 12-digit Aadhaar number"
                  autoComplete="off"
                  {...register('confirmAadhaarNumber', {
                    required: 'Please confirm Aadhaar number',
                    validate: v => v === aadhar || 'Aadhaar numbers do not match',
                  })}
                />
                {errors.confirmAadhaarNumber && <p className="form-error">{errors.confirmAadhaarNumber.message}</p>}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 font-semibold">
                ⚠️ Ensure the Aadhaar number belongs to the candidate. Providing false information is an offence.
              </div>
            </div>
          )}

          {/* ── STEP 2: Personal Details ───────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">

                <div className="col-span-2">
                  <label className="form-label">Candidate Name *</label>
                  <input id="candidateName" className="form-input" placeholder="Full name as per Aadhaar"
                    autoComplete="name"
                    {...register('candidateName', { required:'Candidate name is required', minLength:{value:2,message:'Name too short'} })}/>
                  {errors.candidateName && <p className="form-error">{errors.candidateName.message}</p>}
                </div>

                <div>
                  <label className="form-label">Father's / Guardian Name *</label>
                  <input id="fatherName" className="form-input" placeholder="Father / Guardian name"
                    autoComplete="off"
                    {...register('fatherName', { required:"Father/Guardian name is required" })}/>
                  {errors.fatherName && <p className="form-error">{errors.fatherName.message}</p>}
                </div>

                <div>
                  <label className="form-label">Mother's Name *</label>
                  <input id="motherName" className="form-input" placeholder="Mother name"
                    autoComplete="off"
                    {...register('motherName', { required:"Mother's name is required" })}/>
                  {errors.motherName && <p className="form-error">{errors.motherName.message}</p>}
                </div>

                <div>
                  <label className="form-label">Date of Birth *</label>
                  <input id="dob" type="date" className="form-input"
                    {...register('dob', { required:'Date of Birth is required' })}/>
                  {errors.dob && <p className="form-error">{errors.dob.message}</p>}
                </div>

                <div>
                  <label className="form-label">Gender *</label>
                  <select id="gender" className="form-input" {...register('gender', { required:'Gender is required' })}>
                    <option value="">Select Gender</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.gender && <p className="form-error">{errors.gender.message}</p>}
                </div>

                <div>
                  <label className="form-label">Email Address *</label>
                  <input id="email" type="email" className="form-input" placeholder="your@email.com"
                    autoComplete="email"
                    {...register('email', { required:'Email is required', pattern:{value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,message:'Invalid email'} })}/>
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="form-label">Confirm Email Address *</label>
                  <input id="confirmEmail" type="email" className="form-input" placeholder="Re-enter email"
                    autoComplete="off"
                    {...register('confirmEmail', { required:'Please confirm email', validate: v => v===email || 'Emails do not match' })}/>
                  {errors.confirmEmail && <p className="form-error">{errors.confirmEmail.message}</p>}
                </div>

                <div>
                  <label className="form-label">Mobile Number *</label>
                  <input id="mobile" type="tel" className="form-input" placeholder="10-digit mobile"
                    maxLength={10} autoComplete="tel"
                    {...register('mobile', { required:'Mobile is required', pattern:{value:/^[6-9]\d{9}$/,message:'Enter valid 10-digit mobile number'} })}/>
                  {errors.mobile && <p className="form-error">{errors.mobile.message}</p>}
                </div>

                <div>
                  <label className="form-label">Confirm Mobile Number *</label>
                  <input id="confirmMobile" type="tel" className="form-input" placeholder="Re-enter mobile"
                    maxLength={10} autoComplete="off"
                    {...register('confirmMobile', { required:'Please confirm mobile', validate: v => v===mobile || 'Mobile numbers do not match' })}/>
                  {errors.confirmMobile && <p className="form-error">{errors.confirmMobile.message}</p>}
                </div>

                <div>
                  <label className="form-label">Alternate Mobile</label>
                  <input id="alternateMobile" type="tel" className="form-input" placeholder="Optional"
                    maxLength={10} autoComplete="off"
                    {...register('alternateMobile', { pattern:{value:/^[6-9]\d{9}$/,message:'Enter valid mobile number'} })}/>
                  {errors.alternateMobile && <p className="form-error">{errors.alternateMobile.message}</p>}
                </div>

                <div>
                  <label className="form-label">Identification Type *</label>
                  <select id="idType" className="form-input" {...register('idType', { required:'ID type is required' })}>
                    <option value="">Select ID Type</option>
                    {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.idType && <p className="form-error">{errors.idType.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="form-label">Identification Number *</label>
                  <input id="idNumber" className="form-input" placeholder="Enter ID number"
                    autoComplete="off"
                    {...register('idNumber', { required:'ID number is required' })}/>
                  {errors.idNumber && <p className="form-error">{errors.idNumber.message}</p>}
                </div>

              </div>
            </div>
          )}

          {/* ── STEP 3: Address + CAPTCHA + Declaration ────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">

              {/* Present Address */}
              <div>
                <h3 className="font-black text-primary-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-700 rounded-full text-white text-xs flex items-center justify-center font-black">P</span>
                  Present Address
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Country *</label>
                    <input id="presentCountry" className="form-input" defaultValue="India" autoComplete="off"
                      {...register('presentCountry', { required:'Country is required' })}/>
                    {errors.presentCountry && <p className="form-error">{errors.presentCountry.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">State *</label>
                    <select id="presentState" className="form-input"
                      {...register('presentState', { required:'State is required' })}>
                      <option value="">Select State</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.presentState && <p className="form-error">{errors.presentState.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">District *</label>
                    <select id="presentDistrict" className="form-input"
                      {...register('presentDistrict', { required:'District is required' })}>
                      <option value="">Select District</option>
                      {DISTRICTS_TS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.presentDistrict && <p className="form-error">{errors.presentDistrict.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Mandal *</label>
                    <input id="presentMandal" className="form-input" placeholder="Enter Mandal" autoComplete="off"
                      {...register('presentMandal', { required:'Mandal is required' })}/>
                    {errors.presentMandal && <p className="form-error">{errors.presentMandal.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Village *</label>
                    <input id="presentVillage" className="form-input" placeholder="Enter Village" autoComplete="off"
                      {...register('presentVillage', { required:'Village is required' })}/>
                    {errors.presentVillage && <p className="form-error">{errors.presentVillage.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Pincode *</label>
                    <input id="presentPincode" type="text" inputMode="numeric" maxLength={6}
                      className="form-input" placeholder="6-digit pincode" autoComplete="off"
                      {...register('presentPincode', { required:'Pincode is required', pattern:{value:/^\d{6}$/,message:'Pincode must be 6 digits'} })}/>
                    {errors.presentPincode && <p className="form-error">{errors.presentPincode.message}</p>}
                  </div>
                </div>
              </div>

              {/* Permanent Address — explicit fields, NOT .map() */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-primary-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <span className="w-6 h-6 bg-orange-500 rounded-full text-white text-xs flex items-center justify-center font-black">A</span>
                    Permanent Address
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sameAddress}
                      onChange={e => handleSameAddress(e.target.checked)}
                      className="w-4 h-4 accent-primary-700 rounded"/>
                    <span className="text-xs font-bold text-primary-700">Same as Present Address</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Country *</label>
                    <input id="permanentCountry" className="form-input disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Country" autoComplete="off" disabled={sameAddress}
                      {...register('permanentCountry', { required:'Country is required' })}/>
                    {errors.permanentCountry && <p className="form-error">{errors.permanentCountry.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">State *</label>
                    <select id="permanentState" className="form-input disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={sameAddress}
                      {...register('permanentState', { required:'State is required' })}>
                      <option value="">Select State</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.permanentState && <p className="form-error">{errors.permanentState.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">District *</label>
                    <select id="permanentDistrict" className="form-input disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={sameAddress}
                      {...register('permanentDistrict', { required:'District is required' })}>
                      <option value="">Select District</option>
                      {DISTRICTS_TS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.permanentDistrict && <p className="form-error">{errors.permanentDistrict.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Mandal *</label>
                    <input id="permanentMandal" className="form-input disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter Mandal" autoComplete="off" disabled={sameAddress}
                      {...register('permanentMandal', { required:'Mandal is required' })}/>
                    {errors.permanentMandal && <p className="form-error">{errors.permanentMandal.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Village *</label>
                    <input id="permanentVillage" className="form-input disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter Village" autoComplete="off" disabled={sameAddress}
                      {...register('permanentVillage', { required:'Village is required' })}/>
                    {errors.permanentVillage && <p className="form-error">{errors.permanentVillage.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Pincode *</label>
                    <input id="permanentPincode" type="text" inputMode="numeric" maxLength={6}
                      className="form-input disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="6-digit pincode" autoComplete="off" disabled={sameAddress}
                      {...register('permanentPincode', { required:'Pincode is required', pattern:{value:/^\d{6}$/,message:'Pincode must be 6 digits'} })}/>
                    {errors.permanentPincode && <p className="form-error">{errors.permanentPincode.message}</p>}
                  </div>
                </div>
              </div>

              {/* CAPTCHA */}
              <CaptchaWidget onValidate={setCaptchaValid}/>

              {/* Declaration */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-black text-amber-800 text-sm mb-2">📋 Declaration</h4>
                <p className="text-xs text-amber-700 font-semibold leading-relaxed mb-3">
                  I have carefully reviewed and fully understood the provided guidelines and fee structure.
                  I am aware of all the terms, conditions, and associated costs. By acknowledging this, I confirm
                  that I agree to comply with the specified guidelines and fee requirements.
                </p>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={declared}
                    onChange={e => setDeclared(e.target.checked)}
                    className="w-4 h-4 accent-primary-700 mt-0.5 flex-shrink-0"/>
                  <span className="text-xs font-bold text-amber-800">
                    I hereby declare that the above information is true and correct to the best of my knowledge.
                    I accept the terms and conditions.
                  </span>
                </label>
              </div>

            </div>
          )}
        </form>

        {/* Footer buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-xs text-gray-500 font-semibold">Step {step} of {STEPS.length}</div>
          <div className="flex gap-3">
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s-1)}
                className="btn-secondary flex items-center gap-1">
                <ChevronLeft size={16}/> Back
              </button>
            )}
            {step < STEPS.length ? (
              <button type="button" onClick={nextStep}
                className="btn-primary flex items-center gap-1">
                Next <ChevronRight size={16}/>
              </button>
            ) : (
              <button type="button" onClick={handleSubmit(onSubmit)}
                disabled={loading || !declared || !captchaValid}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Registering…</>
                ) : (
                  <><CheckCircle size={16}/> Register Now</>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
