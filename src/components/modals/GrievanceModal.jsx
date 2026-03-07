import React, { useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const M = { maroon:'#8B0000', dark:'#5a0000', deep:'#3d0000', gold:'#ffd600', orange:'#e65100' }

const CATEGORIES = [
  'Registration Issue','Login / Password Issue','Application Form Issue',
  'Payment Issue','Hall Ticket Issue','Exam Center Issue',
  'Seat Allotment Issue','Technical / Website Issue','Other',
]

export default function GrievanceModal({ onClose }) {
  const [form, setForm] = useState({
    applicantName:'', mobileNumber:'', email:'',
    registrationNumber:'', category:'', description:'',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const set = (k) => (e) => {
    setForm(p => ({...p, [k]: e.target.value}))
    setErrors(p => ({...p, [k]: ''}))
  }

  const validate = () => {
    const e = {}
    if (!form.applicantName.trim()) e.applicantName = 'Name is required'
    if (!form.mobileNumber.trim())  e.mobileNumber  = 'Mobile is required'
    else if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) e.mobileNumber = 'Invalid mobile'
    if (!form.category)   e.category    = 'Select a category'
    if (!form.description.trim()) e.description = 'Describe your grievance'
    else if (form.description.trim().length < 20) e.description = 'Min 20 characters required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      const res = await api.post('/grievances/submit', form)
      setSuccess(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Try again.')
    } finally { setLoading(false) }
  }

  return (
    /* Full-screen on mobile, centered card on desktop */
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
         style={{ background:'rgba(0,0,0,0.65)', backdropFilter:'blur(3px)' }}>

      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl flex flex-col
                      rounded-t-2xl max-h-[95vh] sm:max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 rounded-t-2xl sm:rounded-t-2xl"
             style={{ background:`linear-gradient(135deg,${M.deep},${M.maroon})` }}>
          <div>
            <h2 className="text-white font-black text-base">📝 File a Grievance</h2>
            <p className="text-red-200 text-xs font-semibold">TTWREIS Grievance Redressal System</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white font-black text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-4 py-4">
          {success ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-lg font-black mb-1" style={{color:M.maroon}}>Grievance Submitted!</h3>
              <p className="text-sm text-gray-600 mb-4">Registered successfully.</p>
              <div className="border-2 rounded-2xl p-4 text-left max-w-xs mx-auto mb-4"
                   style={{borderColor:M.maroon, background:'#fdf2f2'}}>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Grievance Number</p>
                <p className="text-2xl font-black tracking-wider" style={{color:M.maroon}}>{success.grievanceNumber}</p>
                <p className="text-xs text-gray-500 font-semibold mt-2">📌 Save this number to track status.</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-semibold max-w-xs mx-auto mb-4">
                ⏱️ Resolution: <strong>3–5 working days</strong><br/>
                📞 Urgent: <strong>040-23450678</strong>
              </div>
              <button onClick={onClose} className="btn-primary px-8">Close</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-3 text-xs text-blue-800 font-semibold">
                ℹ️ Fill your details and describe the issue. You'll get a Grievance Number to track progress.
              </div>

              {/* Name */}
              <div>
                <label className="label">Full Name <span className="text-red-600">*</span></label>
                <input className="input-field" placeholder="Your full name"
                  value={form.applicantName} onChange={set('applicantName')}/>
                {errors.applicantName && <p className="text-xs text-red-600 font-bold mt-0.5">⚠ {errors.applicantName}</p>}
              </div>

              {/* Mobile + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Mobile <span className="text-red-600">*</span></label>
                  <input className="input-field" placeholder="10-digit mobile" maxLength={10}
                    inputMode="numeric" value={form.mobileNumber} onChange={set('mobileNumber')}/>
                  {errors.mobileNumber && <p className="text-xs text-red-600 font-bold mt-0.5">⚠ {errors.mobileNumber}</p>}
                </div>
                <div>
                  <label className="label">Email (Optional)</label>
                  <input className="input-field" placeholder="your@email.com" type="email"
                    value={form.email} onChange={set('email')}/>
                </div>
              </div>

              {/* Reg No */}
              <div>
                <label className="label">Registration Number (if available)</label>
                <input className="input-field" placeholder="e.g. TTWREIS2025001234"
                  value={form.registrationNumber} onChange={set('registrationNumber')}/>
              </div>

              {/* Category */}
              <div>
                <label className="label">Category <span className="text-red-600">*</span></label>
                <select className="input-field" value={form.category} onChange={set('category')}>
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-600 font-bold mt-0.5">⚠ {errors.category}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="label">Description <span className="text-red-600">*</span></label>
                <textarea className="input-field resize-none" rows={4}
                  placeholder="Describe your issue in detail…"
                  value={form.description} onChange={set('description')}/>
                <p className="text-xs text-gray-400 mt-0.5">{form.description.length} chars (min 20)</p>
                {errors.description && <p className="text-xs text-red-600 font-bold mt-0.5">⚠ {errors.description}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 flex-shrink-0 safe-bottom">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? '⏳ Submitting…' : '📨 Submit Grievance'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}