import React, { useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const CATEGORIES = [
  'Registration Issue',
  'Login / Password Issue',
  'Application Form Issue',
  'Payment Issue',
  'Hall Ticket Issue',
  'Exam Center Issue',
  'Seat Allotment Issue',
  'Technical / Website Issue',
  'Other',
]

export default function GrievanceModal({ onClose }) {
  const [form, setForm] = useState({
    applicantName: '', mobileNumber: '', email: '',
    registrationNumber: '', category: '', description: '',
  })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(null) // { grievanceNumber, message }

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }))
    setErrors(p => ({ ...p, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.applicantName.trim()) e.applicantName = 'Name is required'
    if (!form.mobileNumber.trim())  e.mobileNumber  = 'Mobile is required'
    else if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) e.mobileNumber = 'Invalid mobile number'
    if (!form.category)             e.category      = 'Select a category'
    if (!form.description.trim())   e.description   = 'Describe your grievance'
    else if (form.description.trim().length < 20)
                                    e.description   = 'Please provide more detail (min 20 chars)'
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
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
             style={{background:'linear-gradient(135deg,#0d3b0d,#1a6b2e)'}}>
          <div>
            <h2 className="text-white font-black text-lg">📝 File a Grievance</h2>
            <p className="text-green-200 text-xs font-semibold">TTWREIS Grievance Redressal System</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white font-black text-xl">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {success ? (
            /* ── Success screen ── */
            <div className="text-center py-6">
              <div className="text-6xl mb-3">✅</div>
              <h3 className="text-xl font-black text-green-700 mb-1">Grievance Submitted!</h3>
              <p className="text-sm text-gray-600 mb-4">Your grievance has been registered successfully.</p>

              <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-5 text-left max-w-xs mx-auto">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Grievance Number</p>
                <p className="text-2xl font-black text-green-700 tracking-wider">{success.grievanceNumber}</p>
                <p className="text-xs text-gray-500 font-semibold mt-3">
                  📌 Save this number to track your grievance status.
                </p>
              </div>

              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 font-semibold max-w-xs mx-auto">
                ⏱️ Expected resolution time: <strong>3–5 working days</strong><br/>
                📞 For urgent issues call: <strong>040-23450678</strong>
              </div>

              <button onClick={onClose} className="mt-5 btn-primary px-8">Close</button>
            </div>
          ) : (
            /* ── Form ── */
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-3 text-xs text-blue-800 font-semibold">
                ℹ️ Fill in your details and describe your issue. You will receive a Grievance Number to track progress.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Full Name <span className="text-red-500">*</span></label>
                  <input className="input-field" placeholder="Your full name"
                    value={form.applicantName} onChange={set('applicantName')}/>
                  {errors.applicantName && <p className="text-xs text-red-500 font-bold mt-0.5">⚠ {errors.applicantName}</p>}
                </div>

                <div>
                  <label className="label">Mobile Number <span className="text-red-500">*</span></label>
                  <input className="input-field" placeholder="10-digit mobile" maxLength={10}
                    inputMode="numeric" value={form.mobileNumber} onChange={set('mobileNumber')}/>
                  {errors.mobileNumber && <p className="text-xs text-red-500 font-bold mt-0.5">⚠ {errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="label">Email (Optional)</label>
                  <input className="input-field" placeholder="your@email.com" type="email"
                    value={form.email} onChange={set('email')}/>
                </div>

                <div className="col-span-2">
                  <label className="label">Registration Number (if available)</label>
                  <input className="input-field" placeholder="e.g. TTWREIS2025001234"
                    value={form.registrationNumber} onChange={set('registrationNumber')}/>
                </div>

                <div className="col-span-2">
                  <label className="label">Grievance Category <span className="text-red-500">*</span></label>
                  <select className="input-field" value={form.category} onChange={set('category')}>
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 font-bold mt-0.5">⚠ {errors.category}</p>}
                </div>

                <div className="col-span-2">
                  <label className="label">Grievance Description <span className="text-red-500">*</span></label>
                  <textarea className="input-field resize-none" rows={4}
                    placeholder="Describe your issue in detail..."
                    value={form.description} onChange={set('description')}/>
                  <p className="text-xs text-gray-400 mt-0.5">{form.description.length} chars (min 20)</p>
                  {errors.description && <p className="text-xs text-red-500 font-bold mt-0.5">⚠ {errors.description}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 flex-shrink-0">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? '⏳ Submitting…' : '📨 Submit Grievance'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}