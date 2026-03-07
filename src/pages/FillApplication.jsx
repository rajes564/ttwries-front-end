import React, { useState, useRef, useCallback, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../components/common/Header'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { CATEGORIES, SUB_CASTES_BY_CATEGORY, CLASSES, STREAMS } from '../utils/constants'
import Webcam from 'react-webcam'

const G = { g900:'#082308', g800:'#0d3b0d', g600:'#1b5e20', g500:'#2e7d32', orange:'#e65100', gold:'#ffd600' }

const STEPS = [
  { label:'Registration', icon:'🪪' },
  { label:'Academic',     icon:'📚' },
  { label:'Caste',        icon:'🏷️' },
  { label:'Colleges',     icon:'🏫' },
  { label:'Photos',       icon:'📸' },
  { label:'Preview',      icon:'👁️' },
]

// ── Every component defined at MODULE level — no inline definitions anywhere ───

function StepBar({ current }) {
  return (
    <div className="flex items-start justify-between mb-6 overflow-x-auto pb-1 gap-0.5">
      {STEPS.map((s, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center min-w-[52px]">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black
              text-sm border-2 transition-all flex-shrink-0
              ${current > i  ? 'text-white' :
                current === i ? 'text-white scale-110 shadow-lg' :
                                'bg-gray-100 border-gray-200 text-gray-400'}`}
              style={current > i  ? {background:G.g600,borderColor:G.g600} :
                     current === i ? {background:G.orange,borderColor:G.orange} : {}}>
              {current > i ? '✓' : s.icon}
            </div>
            <p className={`text-xs font-bold mt-1 text-center leading-tight w-[52px]
              ${current === i ? 'text-orange-700' : current > i ? 'text-green-700' : 'text-gray-400'}`}>
              {s.label}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mt-4 mx-0.5 rounded-full`}
                 style={{background: current > i ? G.g600 : '#e5e7eb'}}/>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function ReadField({ label, value, wide }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <p className="text-xs font-bold text-gray-500 mb-0.5 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-h-[36px]">
        {value || <span className="italic text-xs" style={{color:'#f87171'}}>Not provided in registration</span>}
      </p>
    </div>
  )
}

// PhotoCapture is stable at module level — no re-mount on parent render
function PhotoCapture({ label, onCapture, value }) {
  const [mode,    setMode]    = useState('upload')
  const webcamRef = useRef(null)
  const fileRef   = useRef(null)
  const isPhoto   = label.toLowerCase().includes('photo')
  const w = isPhoto ? 120 : 200
  const h = isPhoto ? 150 : 70

  const capture = useCallback(() => {
    const img = webcamRef.current?.getScreenshot()
    if (img) { onCapture(img); toast.success(`✅ ${label} captured!`) }
    setMode('upload')
  }, [webcamRef, label, onCapture])

  const upload = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { onCapture(ev.target.result); toast.success(`✅ ${label} uploaded!`) }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <label className="text-xs font-black text-gray-700 uppercase tracking-wide text-center">{label} *</label>
      {value ? (
        <div className="relative">
          <img src={value} alt={label} className="border-2 border-green-400 rounded-lg shadow object-cover" style={{width:w,height:h}}/>
          <button type="button" onClick={()=>onCapture(null)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shadow">✕</button>
        </div>
      ) : mode === 'camera' ? (
        <div className="flex flex-col items-center gap-2">
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width={240} height={180} className="rounded-lg border-2 border-green-300"/>
          <div className="flex gap-2">
            <button type="button" onClick={capture} className="btn-primary text-xs py-1.5 px-3">📸 Capture</button>
            <button type="button" onClick={()=>setMode('upload')} className="btn-secondary text-xs py-1.5 px-3">✕</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors bg-gray-50"
               style={{width:w,height:h}} onClick={()=>fileRef.current?.click()}>
            <div className="text-center">
              <div className="text-3xl mb-1">{isPhoto ? '🖼️' : '✍️'}</div>
              <p className="text-xs text-gray-400 font-semibold px-2">Click to upload</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload}/>
          <button type="button" onClick={()=>setMode('camera')}
            className="text-xs font-bold text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50">
            📷 Use Camera
          </button>
        </div>
      )}
    </div>
  )
}

function CollegePriorityPicker({ priorities, onChange, institutes }) {
  const dragIdx  = useRef(null)
  const dragOver = useRef(null)

  const addCollege = (inst) => {
    if (priorities.some(p => p.instituteId === inst.id)) { toast.warning('Already in your list'); return }
    onChange([...priorities, { name:inst.name, instituteId:inst.id }])
  }
  const remove = (idx) => onChange(priorities.filter((_,i) => i !== idx))
  const onDragStart = (e, idx) => { dragIdx.current = idx; e.dataTransfer.effectAllowed='move' }
  const onDragEnter = (idx)    => { dragOver.current = idx }
  const onDragEnd   = () => {
    const from = dragIdx.current, to = dragOver.current
    if (from === null || to === null || from === to) { dragIdx.current = dragOver.current = null; return }
    const next = [...priorities]; const [item] = next.splice(from,1); next.splice(to,0,item)
    onChange(next); dragIdx.current = dragOver.current = null
  }
  const move = (idx, dir) => {
    const t = idx+dir; if (t<0||t>=priorities.length) return
    const next=[...priorities]; [next[idx],next[t]]=[next[t],next[idx]]; onChange(next)
  }
  const badge = (i) => i===0?{background:G.gold,color:G.g800}:i===1?{background:G.g600,color:'white'}:i===2?{background:G.g500,color:'white'}:{background:'#9e9e9e',color:'white'}

  return (
    <div className="flex flex-col gap-5 md:flex-row">
      <div className="flex-1">
        <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2">Your Priority List — drag or ▲▼ to reorder</p>
        {priorities.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <div className="text-3xl mb-2">🏫</div>
            <p className="text-sm text-gray-400 font-semibold">No colleges selected yet</p>
            <p className="text-xs text-gray-400 mt-1">Click a college from the right panel to add →</p>
          </div>
        ) : priorities.map((p,i) => (
          <div key={i} draggable
            className="flex items-center gap-3 bg-white border-2 rounded-xl px-3 py-2.5 mb-2
                       cursor-grab active:cursor-grabbing hover:border-green-300 transition-colors shadow-sm"
            style={{borderColor:i===0?G.gold:'#e8f5e9'}}
            onDragStart={e=>onDragStart(e,i)} onDragEnter={()=>onDragEnter(i)}
            onDragEnd={onDragEnd} onDragOver={e=>e.preventDefault()}>
            <span className="text-gray-300 text-lg select-none">⠿</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0" style={badge(i)}>{i+1}</div>
            <span className="flex-1 font-semibold text-gray-800 text-sm truncate">{p.name}</span>
            <div className="flex flex-col gap-0.5 flex-shrink-0">
              <button type="button" onClick={()=>move(i,-1)} disabled={i===0} className="w-6 h-4 flex items-center justify-center text-gray-400 hover:text-green-700 disabled:opacity-20 text-xs font-black">▲</button>
              <button type="button" onClick={()=>move(i,1)} disabled={i===priorities.length-1} className="w-6 h-4 flex items-center justify-center text-gray-400 hover:text-green-700 disabled:opacity-20 text-xs font-black">▼</button>
            </div>
            <button type="button" onClick={()=>remove(i)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 font-black text-sm flex-shrink-0">✕</button>
          </div>
        ))}
      </div>
      <div className="md:w-72 flex-shrink-0">
        <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2">Available Institutes ({institutes.length})</p>
        {institutes.length === 0
          ? <div className="text-center py-6 text-xs text-gray-400">⏳ Loading institutes…</div>
          : <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 rounded-xl border border-gray-100 p-2 bg-gray-50" style={{scrollbarWidth:'thin'}}>
              {institutes.map(inst => {
                const added = priorities.some(p => p.instituteId === inst.id)
                return (
                  <button key={inst.id} type="button" disabled={added} onClick={()=>addCollege(inst)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left border-2 transition-all text-xs font-semibold
                               ${added?'opacity-50 cursor-not-allowed border-green-200 bg-green-50':'cursor-pointer hover:border-green-400 hover:bg-white border-gray-100 bg-white'}`}>
                    <span className="text-base flex-shrink-0">🏫</span>
                    <span className="flex-1 truncate text-sm">{inst.name}</span>
                    {inst.district && <span className="text-gray-400 flex-shrink-0 text-xs">{inst.district}</span>}
                    {added ? <span className="font-black text-green-600 flex-shrink-0">✓</span>
                           : <span className="font-black text-green-400 flex-shrink-0">＋</span>}
                  </button>
                )
              })}
            </div>
        }
      </div>
    </div>
  )
}

// ── Step 0: Registration details — read only ───────────────────────────────────
function Step0({ prefilled, regNo, onNext }) {
  return (
    <div>
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-3 mb-4 text-xs text-blue-800 font-semibold">
        ℹ️ These details are from your registration record and cannot be edited here. Contact the helpdesk for any corrections.
      </div>
      <div className="form-section mb-4">
        <div className="section-title">🪪 Identity Details</div>
        <div className="grid grid-cols-2 gap-3">
          <ReadField label="Registration Number" value={regNo}/>
          <ReadField label="Aadhaar Number"      value={prefilled.aadhaarNumber}/>
          <ReadField label="Candidate Name" wide  value={prefilled.candidateName}/>
          <ReadField label="Father's Name"        value={prefilled.fatherName}/>
          <ReadField label="Mother's Name"        value={prefilled.motherName}/>
          <ReadField label="Date of Birth"        value={prefilled.dateOfBirth}/>
          <ReadField label="Gender"               value={prefilled.gender}/>
          <ReadField label="Email"                value={prefilled.email}/>
          <ReadField label="Mobile"               value={prefilled.mobileNumber}/>
          <ReadField label="Alternate Mobile"     value={prefilled.alternateMobile}/>
          <ReadField label="ID Type"              value={prefilled.idType}/>
          <ReadField label="ID Number"            value={prefilled.idNumber}/>
        </div>
      </div>
      <div className="form-section mb-4">
        <div className="section-title">📍 Address Details (from Registration)</div>
        <div className="grid grid-cols-2 gap-3">
          <p className="col-span-2 text-xs font-black uppercase tracking-wide" style={{color:G.g600}}>▸ Present Address</p>
          <ReadField label="State"        value={prefilled.pState}/>
          <ReadField label="District"     value={prefilled.pDistrict}/>
          <ReadField label="Mandal"       value={prefilled.pMandal}/>
          <ReadField label="Village/Town" value={prefilled.pVillage}/>
          <ReadField label="PIN Code"     value={prefilled.pPincode}/>
          <p className="col-span-2 text-xs font-black uppercase tracking-wide mt-2" style={{color:G.g600}}>▸ Permanent Address</p>
          <ReadField label="State"        value={prefilled.permState}/>
          <ReadField label="District"     value={prefilled.permDistrict}/>
          <ReadField label="Mandal"       value={prefilled.permMandal}/>
          <ReadField label="Village/Town" value={prefilled.permVillage}/>
          <ReadField label="PIN Code"     value={prefilled.permPincode}/>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={onNext} className="btn-primary">Confirm & Next → Academic Details</button>
      </div>
    </div>
  )
}

// ── Step 1: Academic ───────────────────────────────────────────────────────────
// Direct controlled selects — no wrapper component, useCallback for handlers
function Step1({ saved, onNext, onBack }) {
  const [local, setLocal] = useState({
    classApplied:      saved.classApplied      || '',
    stream:            saved.stream            || '',
    educationalStatus: saved.educationalStatus || '',
  })
  const [errs, setErrs] = useState({})

  const handleChange = useCallback((field) => (e) => {
    setLocal(p => ({...p,[field]:e.target.value}))
    setErrs(p  => ({...p,[field]:''}))
  }, [])

  const handleNext = () => {
    const e = {}
    if (!local.classApplied) e.classApplied = 'Required'
    if (!local.stream)       e.stream       = 'Required'
    if (Object.keys(e).length) { setErrs(e); return }
    onNext(local)
  }

  return (
    <div>
      <div className="form-section mb-4">
        <div className="section-title">📚 Academic & Course Details</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ac-class" className="label">Class Applied For *</label>
            <select id="ac-class" className="input-field" value={local.classApplied} onChange={handleChange('classApplied')}>
              <option value="">Select Class</option>
              {(CLASSES||['Intermediate (MPC)','Intermediate (BiPC)','Intermediate (CEC)','Intermediate (HEC)']).map(c=>(
                <option key={c}>{c}</option>
              ))}
            </select>
            {errs.classApplied && <p className="text-xs text-red-500 font-bold mt-0.5">⚠ {errs.classApplied}</p>}
          </div>
          <div>
            <label htmlFor="ac-stream" className="label">Stream / Group *</label>
            <select id="ac-stream" className="input-field" value={local.stream} onChange={handleChange('stream')}>
              <option value="">Select Stream</option>
              {(STREAMS||['MPC','BiPC','CEC','HEC','MEC']).map(s=><option key={s}>{s}</option>)}
            </select>
            {errs.stream && <p className="text-xs text-red-500 font-bold mt-0.5">⚠ {errs.stream}</p>}
          </div>
          <div>
            <label htmlFor="ac-status" className="label">Current Educational Status</label>
            <select id="ac-status" className="input-field" value={local.educationalStatus} onChange={handleChange('educationalStatus')}>
              <option value="">Select Status</option>
              <option>10th Passed</option>
              <option>10th Appearing</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">← Back</button>
        <button type="button" onClick={handleNext} className="btn-primary">Next → Caste Details</button>
      </div>
    </div>
  )
}

// ── Step 2: Caste & Community ──────────────────────────────────────────────────
function Step2({ saved, onNext, onBack }) {
  const [local, setLocal] = useState({
    community:            saved.community            || '',
    subCaste:             saved.subCaste             || '',
    incomeBelowThreshold: saved.incomeBelowThreshold || '',
  })
  const [errs, setErrs] = useState({})

  const handleChange = useCallback((field) => (e) => {
    setLocal(p => ({...p,[field]:e.target.value}))
    setErrs(p  => ({...p,[field]:''}))
  }, [])

  const handleNext = () => {
    const e = {}
    if (!local.community)            e.community = 'Required'
    if (!local.subCaste)             e.subCaste  = 'Required'
    if (!local.incomeBelowThreshold) e.income    = 'Required'
    if (Object.keys(e).length) { setErrs(e); return }
    onNext(local)
  }

  return (
    <div>
      <div className="form-section mb-4">
        <div className="section-title">🏷️ Caste & Community</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ca-cat" className="label">Category *</label>
            <select id="ca-cat" className="input-field" value={local.community}
              onChange={e => { setLocal(p=>({...p,community:e.target.value,subCaste:''})); setErrs(p=>({...p,community:''})) }}>
              <option value="">Select Category</option>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
            {errs.community && <p className="text-xs text-red-500 font-bold mt-0.5">⚠ {errs.community}</p>}
          </div>
          <div>
            <label htmlFor="ca-sub" className="label">Sub Caste *</label>
            <select id="ca-sub" className="input-field" value={local.subCaste} onChange={handleChange('subCaste')}>
              <option value="">Select Sub Caste</option>
              {(SUB_CASTES_BY_CATEGORY[local.community]||[]).map(s=><option key={s}>{s}</option>)}
            </select>
            {errs.subCaste && <p className="text-xs text-red-500 font-bold mt-0.5">⚠ {errs.subCaste}</p>}
          </div>
        </div>
      </div>
      <div className="form-section mb-4">
        <div className="section-title">💰 Financial Status</div>
        <label className="label">Annual Income below ₹2,00,000 (Urban) / ₹1,50,000 (Rural)? *</label>
        <div className="flex gap-4 mt-2">
          {['YES','NO'].map(v=>(
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="income" value={v} checked={local.incomeBelowThreshold===v}
                onChange={()=>{ setLocal(p=>({...p,incomeBelowThreshold:v})); setErrs(p=>({...p,income:''})) }}
                className="w-4 h-4 accent-primary-600"/>
              <span className="text-sm font-bold text-gray-700">{v}</span>
            </label>
          ))}
        </div>
        {errs.income && <p className="text-xs text-red-500 font-bold mt-1">⚠ {errs.income}</p>}
      </div>
      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">← Back</button>
        <button type="button" onClick={handleNext} className="btn-primary">Next → College Priorities</button>
      </div>
    </div>
  )
}

// ── Step 3: College priorities ─────────────────────────────────────────────────
function Step3({ priorities, setPriorities, institutes, onNext, onBack }) {
  const handleNext = () => {
    if (priorities.length===0) { toast.error('Add at least one college preference'); return }
    onNext()
  }
  return (
    <div>
      <div className="form-section mb-4">
        <div className="section-title">🏫 College Priority Selection</div>
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 font-semibold">
          📌 Select colleges from the right panel. Drag rows or use ▲▼ arrows to order by preference. Priority 1 = top choice.
        </div>
        <CollegePriorityPicker priorities={priorities} onChange={setPriorities} institutes={institutes}/>
      </div>
      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">← Back</button>
        <button type="button" onClick={handleNext} className="btn-primary">Next → Photos</button>
      </div>
    </div>
  )
}

// ── Step 4: Photos & Signature ─────────────────────────────────────────────────
function Step4({ photo, setPhoto, signature, setSignature, onNext, onBack }) {
  const handleNext = () => {
    if (!photo)     { toast.error('❌ Photograph required'); return }
    if (!signature) { toast.error('❌ Signature required');  return }
    onNext()
  }
  return (
    <div>
      <div className="form-section mb-4">
        <div className="section-title">📸 Photograph & Signature</div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700 font-semibold">
          ⚠️ Upload a recent passport-size photograph (white background) and your handwritten signature. These appear on your Hall Ticket and PDF.
        </div>
        <div className="flex flex-col md:flex-row gap-10 items-start justify-around pt-2">
          <PhotoCapture label="Candidate Photograph" onCapture={setPhoto}     value={photo}/>
          <PhotoCapture label="Candidate Signature"  onCapture={setSignature} value={signature}/>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <button type="button" onClick={onBack} className="btn-secondary">← Back</button>
        <button type="button" onClick={handleNext} className="btn-primary">Next → Preview & Submit</button>
      </div>
    </div>
  )
}

// ── Step 5: Preview & Submit ───────────────────────────────────────────────────
function PreviewRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-1.5 text-sm">
      <span className="font-bold text-gray-500 min-w-[130px] flex-shrink-0">{label}:</span>
      <span className="font-semibold text-gray-800 break-all">{String(value)}</span>
    </div>
  )
}

function PreviewSection({ title, rows }) {
  return (
    <div className="mb-4">
      <h4 className="font-black text-xs uppercase tracking-wide px-3 py-1.5 mb-2 rounded-r"
          style={{color:G.g600,background:'#f1f8f1',borderLeft:`3px solid ${G.g600}`}}>{title}</h4>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        {rows.map(([lbl,val]) => <PreviewRow key={lbl} label={lbl} value={val}/>)}
      </div>
    </div>
  )
}

function Step5({ prefilled, formData, photo, signature, priorities, regNo, onBack, onSubmit, submitting }) {
  const [declared, setDeclared] = useState(false)
  const all = { ...prefilled, ...formData }

  return (
    <div>
      <div className="bg-white border-2 border-green-200 rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-green-100">
          <div>
            <h3 className="font-black text-lg" style={{color:G.g800}}>Application Preview</h3>
            <p className="text-xs text-gray-500 font-semibold">Review all details carefully before final submission</p>
          </div>
          <div className="flex gap-3 flex-col items-center">
            {photo     && <div className="text-center"><img src={photo}     alt="Photo" className="w-20 h-24 object-cover border-2 border-gray-300 rounded"/><p className="text-xs text-gray-400 mt-0.5">Photo</p></div>}
            {signature && <div className="text-center"><img src={signature} alt="Sig"   className="w-28 h-9 object-contain border border-gray-200 rounded"/><p className="text-xs text-gray-400 mt-0.5">Signature</p></div>}
          </div>
        </div>
        <PreviewSection title="Registration & Identity" rows={[
          ['Reg. Number',all.registrationNumber||regNo],['Aadhaar',all.aadhaarNumber],
          ['Candidate Name',all.candidateName],["Father's Name",all.fatherName],
          ["Mother's Name",all.motherName],['Date of Birth',all.dateOfBirth],
          ['Gender',all.gender],['Email',all.email],['Mobile',all.mobileNumber],
          ['ID Type',all.idType],['ID Number',all.idNumber],
        ]}/>
        <PreviewSection title="Academic Details" rows={[
          ['Class Applied',all.classApplied],['Stream',all.stream],['Status',all.educationalStatus],
        ]}/>
        <PreviewSection title="Community & Income" rows={[
          ['Category',all.community],['Sub Caste',all.subCaste],['Income Below Limit',all.incomeBelowThreshold],
        ]}/>
        <div className="mb-4">
          <h4 className="font-black text-xs uppercase tracking-wide px-3 py-1.5 mb-2 rounded-r"
              style={{color:G.g600,background:'#f1f8f1',borderLeft:`3px solid ${G.g600}`}}>
            College Preferences ({priorities.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {priorities.map((p,i)=>(
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border"
                   style={{borderColor:'#e8f5e9',background:i===0?'#f9fbe7':'#f9f9f9'}}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
                     style={{background:i===0?G.gold:G.g600,color:i===0?G.g800:'white'}}>{i+1}</div>
                <span className="font-semibold text-gray-800 text-sm truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
        <PreviewSection title="Present Address" rows={[
          ['State',all.pState],['District',all.pDistrict],['Mandal',all.pMandal],['Village',all.pVillage],['PIN',all.pPincode],
        ]}/>
        <PreviewSection title="Permanent Address" rows={[
          ['State',all.permState],['District',all.permDistrict],['Mandal',all.permMandal],['Village',all.permVillage],['PIN',all.permPincode],
        ]}/>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
        <h4 className="font-black text-amber-800 mb-2 text-sm">📜 Declaration</h4>
        <p className="text-xs text-gray-700 font-medium leading-relaxed mb-3">
          I hereby declare that all information provided is true and correct to the best of my knowledge.
          I understand that false information may lead to cancellation of admission.
          I agree to all terms and conditions of TTWREIS Admission 2025-26.
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-primary-600" checked={declared} onChange={e=>setDeclared(e.target.checked)}/>
          <span className="text-xs font-bold text-gray-700">I declare all information is true and correct *</span>
        </label>
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-3 mb-4 text-xs text-green-800 font-semibold">
        💳 After submitting, pay ₹100 on the dashboard to confirm your application. Only paid applications are processed.
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">← Back</button>
        <button type="button" disabled={submitting||!declared} onClick={onSubmit}
          className="btn-primary text-base px-8 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? '⏳ Submitting…' : '✅ Submit Application'}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN — state only, all step components are module-level
// ══════════════════════════════════════════════════════════════════════════════
export default function FillApplication() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [step,       setStep]       = useState(0)
  const [prefilled,  setPrefilled]  = useState(null)
  const [formData,   setFormData]   = useState({})
  const [photo,      setPhoto]      = useState(null)
  const [signature,  setSignature]  = useState(null)
  const [priorities, setPriorities] = useState([])
  const [institutes, setInstitutes] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [appNumber,  setAppNumber]  = useState(null)

  useEffect(() => {
    api.get('/applicant/prefilled-data').then(r => {
      const d = r.data
      setPrefilled(d)
      setFormData(d)
      if (d.photoBase64)     setPhoto(d.photoBase64)
      if (d.signatureBase64) setSignature(d.signatureBase64)
      if (d.collegePriorities?.length)
        setPriorities(d.collegePriorities.map(p=>({ name:p.name, instituteId:p.instituteId||null })))
      if (d.applicationNumber) setAppNumber(d.applicationNumber)
      if (d.status && d.status !== 'DRAFT') setSubmitted(true)
    }).catch(() => setPrefilled({}))

    api.get(`https://ttwreis-backend.onrender.com/api/admin/institutes/all`).then(r => setInstitutes(r.data||[])).catch(()=>{})
  }, [])

  // Stable callbacks — no new function references on re-render
  const goTo        = useCallback((n) => setStep(n), [])
  const saveAndNext = useCallback((data) => { setFormData(p=>({...p,...data})); setStep(s=>s+1) }, [])

  const handleFinalSubmit = useCallback(async () => {
    if (!photo)               { toast.error('❌ Photograph required'); return }
    if (!signature)           { toast.error('❌ Signature required');  return }
    if (priorities.length===0){ toast.error('❌ Add at least one college preference'); return }
    setSubmitting(true)
    try {
      const res = await api.post('/applicant/submit-application', {
        ...formData, photo, signature, collegePriorities:priorities
      })
      setAppNumber(res.data.applicationNumber)
      setSubmitted(true)
      toast.success('🎉 Application submitted! Complete payment to confirm.')
    } catch (e) {
      toast.error('❌ '+(e.response?.data?.message||'Submission failed'))
    } finally { setSubmitting(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo, signature, priorities, formData])

  if (!prefilled) return (
    <div className="min-h-screen bg-gray-50">
      <Header/>
      <div className="flex items-center justify-center h-64">
        <div className="text-center"><div className="text-4xl animate-bounce">⏳</div>
          <p className="mt-2 font-bold text-gray-600">Loading form…</p></div>
      </div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen bg-gray-50">
      <Header/>
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-green-700 mb-2">Application Submitted!</h2>
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 my-4">
            <p className="text-xs text-gray-600 font-semibold">Application Number</p>
            <p className="text-2xl font-black tracking-wider" style={{color:G.g600}}>{appNumber}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-left">
            <h4 className="font-black text-amber-800 text-sm mb-2">⚠️ Next Step — Complete Payment</h4>
            <ol className="text-xs text-amber-700 font-semibold space-y-1 list-decimal list-inside">
              <li>Pay ₹100 application fee to confirm</li>
              <li>Only paid applications are processed</li>
              <li>Download application PDF after payment</li>
              <li>Carry hall ticket on exam day</li>
            </ol>
          </div>
          <button onClick={()=>navigate('/dashboard')} className="btn-primary w-full">Go to Dashboard →</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header/>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-5">
          <button type="button" onClick={()=>navigate('/dashboard')}
            className="text-green-700 hover:text-green-900 font-bold text-sm">← Dashboard</button>
          <div>
            <h1 className="text-xl font-black text-gray-800">Application Form</h1>
            <p className="text-xs text-gray-500 font-semibold">TTWREIS Admission 2025-26 · {user?.registrationNumber}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <StepBar current={step}/>
          {step===0 && <Step0 prefilled={prefilled} regNo={user?.registrationNumber} onNext={()=>goTo(1)}/>}
          {step===1 && <Step1 saved={formData} onNext={saveAndNext} onBack={()=>goTo(0)}/>}
          {step===2 && <Step2 saved={formData} onNext={saveAndNext} onBack={()=>goTo(1)}/>}
          {step===3 && <Step3 priorities={priorities} setPriorities={setPriorities}
                              institutes={institutes} onNext={()=>goTo(4)} onBack={()=>goTo(2)}/>}
          {step===4 && <Step4 photo={photo} setPhoto={setPhoto} signature={signature}
                              setSignature={setSignature} onNext={()=>goTo(5)} onBack={()=>goTo(3)}/>}
          {step===5 && <Step5 prefilled={prefilled} formData={formData} photo={photo}
                              signature={signature} priorities={priorities}
                              regNo={user?.registrationNumber}
                              onBack={()=>goTo(4)} onSubmit={handleFinalSubmit} submitting={submitting}/>}
        </div>
      </div>
    </div>
  )
}
