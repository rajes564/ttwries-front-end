import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../components/common/Header'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'


const G = { g900:'#082308', g800:'#0d3b0d', g600:'#1b5e20', g500:'#2e7d32', orange:'#e65100', gold:'#ffd600' }

// ── Status timeline ───────────────────────────────────────────────────────────
function StatusTimeline({ appData }) {
  const filled = !!appData?.applicationFilled
  const paid   = appData?.paymentStatus === 'PAID'

  const steps = [
    {
      key: 'registered',
      label: 'Registered',
      icon: '🪪',
      done: true,
      desc: 'Account created',
    },
    {
      key: 'form_filled',
      label: 'Form Filled',
      icon: '📝',
      done: filled,
      desc: filled
        ? `Submitted ${appData?.submittedAt || ''}`
        : 'Fill your application form',
    },
    {
      key: 'payment',
      label: 'Fee Paid',
      icon: '💳',
      done: paid,
      desc: paid
        ? `₹${(appData?.amountPaid || 100).toLocaleString('en-IN')} confirmed`
        : filled ? 'Pay ₹100 to confirm' : 'Complete form first',
      active: filled && !paid,
    },
    {
      key: 'hall_ticket',
      label: 'Hall Ticket',
      icon: '🎟️',
      done: !!appData?.hallTicketAvailable,
      desc: appData?.hallTicketAvailable ? 'Ready to download' : 'After exam allocation',
    },
    {
      key: 'exam',
      label: 'Exam',
      icon: '📋',
      done: !!appData?.appeared,
      desc: appData?.appeared ? 'Appeared' : 'Scheduled',
    },
    {
      key: 'allotment',
      label: 'Allotted',
      icon: '🏫',
      done: !!appData?.seatAllotted,
      desc: appData?.seatAllotted ? appData?.allottedCollege : 'Pending results',
    },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      <h3 className="font-black text-gray-700 mb-5 text-base flex items-center gap-2">
        <span>📊</span> Application Status
      </h3>
      <div className="flex items-start justify-between overflow-x-auto pb-2 gap-0">
        {steps.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center text-center min-w-[72px] max-w-[90px]">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg border-2
                shadow-sm transition-all relative ${
                  s.done   ? 'text-white border-transparent shadow-md'
                : s.active ? 'border-orange-400 bg-orange-50'
                :             'bg-gray-50 border-gray-200'
              }`} style={s.done ? {background:G.g600} : {}}>
                {s.done ? '✓' : s.icon}
                {s.active && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full animate-ping"
                        style={{background:G.orange,opacity:0.7}}/>
                )}
              </div>
              <p className={`text-xs font-black mt-1.5 leading-tight ${
                s.done ? 'text-green-700' : s.active ? 'text-orange-600' : 'text-gray-400'
              }`}>{s.label}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5 leading-tight">{s.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mt-5 mx-0.5 min-w-[12px] rounded-full transition-all`}
                   style={{background: steps[i+1].done ? G.g600 : '#e5e7eb'}}/>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default function ApplicantDashboard() {
  const { user }     = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()          // re-fetch when returning from /application/fill
  const [appData,  setAppData]  = useState(null)
  const [loading,  setLoading]  = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    api.get(`https://ttwreis-backend.onrender.com/api/applicant/application-status`)
      .then(r  => setAppData(r.data))
      .catch(() => setAppData({ status:'NOT_STARTED', applicationFilled:false, paymentStatus:'PENDING', collegePriorities:[] }))
      .finally(() => setLoading(false))
  }, [])

  // Re-fetch every time this page is navigated to (e.g. returning from fill form)
  useEffect(() => { load() }, [load, location.key])

  const downloadApplication = async () => {
    try {
      const res = await api.get('/applicant/download-application', { responseType:'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type:'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = `Application_${user?.registrationNumber}.pdf`; a.click()
      toast.success('✅ Application downloaded!')
    } catch { toast.error('❌ Download failed') }
  }

  const downloadHallTicket = async () => {
    try {
      const res = await api.get('/applicant/hall-ticket', { responseType:'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type:'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = `HallTicket_${user?.registrationNumber}.pdf`; a.click()
      toast.success('✅ Hall Ticket downloaded!')
    } catch { toast.error('❌ Hall ticket not yet available') }
  }



// To this:
const createOrder = async () => {
    const res = await api.post("/payment/create");                              // ✅
    return res.data.orderId;
};

// ── Wrapper (just renders the buttons) ───────────────────────
function PayPalButtonWrapper({ createOrder, onApprove, onError }) {
  const [{ isPending }] = usePayPalScriptReducer()
  if (isPending) return <div className="text-xs text-gray-400">Loading PayPal...</div>
  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
      style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
    />
  )
}

const onApprove = async (data) => {
    const res = await api.post(`/payment/capture/${data.orderID}`);            // ✅
    if (res.data.status === "COMPLETED") {
        toast.success(`✅ Payment of ₹${res.data.amount} INR successful!`);
        load(); // refresh dashboard state
    }
};

    const onError = (err) => {
        console.error("PayPal Error:", err);
        alert("Payment failed. Please try again.");
    };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Header/>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl animate-bounce">⏳</div>
          <p className="mt-2 font-bold text-gray-600">Loading your dashboard…</p>
        </div>
      </div>
    </div>
  )

  const filled   = !!appData?.applicationFilled
  const paid     = appData?.paymentStatus === 'PAID'
  const isLocked = paid
  const canEdit  = filled && !paid

  return (
    <div className="min-h-screen" style={{background:'#f0f4f0'}}>
      <Header/>
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Welcome card */}
        <div className="rounded-2xl shadow-sm p-5 mb-6 relative overflow-hidden"
             style={{background:`linear-gradient(135deg,${G.g900},${G.g600})`}}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -translate-y-8 translate-x-8"
               style={{background:G.gold}}/>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0"
                 style={{background:G.gold,color:G.g800}}>
              {user?.name?.[0] || 'U'}
             
              
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider" style={{color:G.gold}}>Welcome back,</p>
              <h2 className="text-white font-black text-xl leading-tight truncate">{user?.name}</h2>
              <p className="text-sm font-semibold" style={{color:'#a5d6a7'}}>
                Reg No: <span className="font-black" style={{color:G.gold}}>{user?.registrationNumber}</span>
              </p>
            </div>
            {appData?.applicationNumber && (
              <div className="hidden sm:block text-right flex-shrink-0">
                <p className="text-xs font-bold" style={{color:'#a5d6a7'}}>Application No.</p>
                <p className="font-black text-sm text-white">{appData.applicationNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Status timeline — updates every time page loads */}
        <StatusTimeline appData={appData}/>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* ── Fill / View Application ── */}
          <div className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col ${
            canEdit ? 'border-orange-200' : filled ? 'border-green-100' : 'border-gray-100'
          }`}>
            <div className="text-3xl mb-2">
              {!filled ? '📝' : isLocked ? '📄🔒' : '📄'}
            </div>
            <h4 className="font-black text-gray-800 mb-1">
              {!filled ? 'Fill Application' : 'Application Form'}
            </h4>
            <p className="text-xs text-gray-500 font-semibold mb-4 flex-1">
              {!filled
                ? 'Complete your admission application with all required details.'
                : isLocked
                  ? `Confirmed on ${appData?.submittedAt || 'N/A'}. Payment received.`
                  : `Submitted on ${appData?.submittedAt || 'N/A'}. Pay fee to confirm.`
              }
            </p>

            {!filled ? (
              <button onClick={()=>navigate('/application/fill')} className="btn-primary w-full text-sm py-2">
                📝 Fill Application Now
              </button>
            ) : isLocked ? (
              <div className="text-xs font-black px-3 py-1.5 rounded-lg text-center bg-green-100 text-green-700">
                ✅ CONFIRMED & LOCKED
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs font-black px-3 py-1.5 rounded-lg text-center bg-amber-100 text-amber-700">
                  ⚠️ AWAITING PAYMENT
                </div>
                <button onClick={()=>navigate('/application/fill')} className="btn-secondary w-full text-sm py-2">
                  ✏️ Edit Application
                </button>
              </div>
            )}
          </div>

          {/* ── Payment card ── */}
          <div className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col ${
            filled && !paid ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-100'
          }`}>
            <div className="text-3xl mb-2">💳</div>
            <h4 className="font-black text-gray-800 mb-1">Application Fee</h4>
            <div className="flex-1 space-y-2">
              {paid ? (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-green-100 text-green-700">
                    ✅ PAID
                  </div>
                  <p className="text-sm font-black" style={{color:G.g600}}>
                    ₹{(appData?.amountPaid || 100).toLocaleString('en-IN')} confirmed
                  </p>
                  {appData?.paidAt && (
                    <p className="text-xs text-gray-400 font-semibold">
                      Paid on {new Date(appData.paidAt).toLocaleDateString('en-IN')}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 font-semibold">Application fully submitted ✓</p>
                </>
              ) : filled ? (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-orange-100 text-orange-700 animate-pulse">
                    ⚠️ PAYMENT PENDING
                  </div>
                  <p className="text-xs text-gray-600 font-semibold">
                    Pay ₹200 to confirm. Unpaid applications are not processed.
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-400 font-semibold">
                  Complete the application form first to unlock payment.
                </p>
              )}
            </div>
            {/* Payment button only visible when filled & not paid */}
            {filled && !paid && (
              <div className="mt-4">
     
        <PayPalButtonWrapper
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
        />
   
              </div>
            )}
                      </div>

          {/* ── Downloads ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
            <div className="text-3xl mb-2">📥</div>
            <h4 className="font-black text-gray-800 mb-1">Downloads</h4>
            <p className="text-xs text-gray-500 font-semibold mb-4 flex-1">
              Download your application PDF or hall ticket once available.
            </p>
            <div className="space-y-2">
              <button onClick={downloadApplication} disabled={!paid}
                className="btn-secondary w-full text-xs py-2 disabled:opacity-40 disabled:cursor-not-allowed">
                📄 Application PDF
                {!paid && <span className="ml-1 text-xs opacity-60">(after payment)</span>}
              </button>
              <button onClick={downloadHallTicket} disabled={!appData?.hallTicketAvailable}
                className="btn-secondary w-full text-xs py-2 disabled:opacity-40 disabled:cursor-not-allowed">
                🎟️ Hall Ticket
                {!appData?.hallTicketAvailable && <span className="ml-1 text-xs opacity-60">(not ready)</span>}
              </button>
            </div>
          </div>
        </div>

        {/* College preferences */}
        {appData?.collegePriorities?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <h3 className="font-black text-gray-700 text-base mb-3 flex items-center gap-2">
              🏫 College Preferences
              <span className="text-xs font-semibold text-gray-400">
                ({appData.collegePriorities.length} selected)
              </span>
              {canEdit && (
                <button onClick={()=>navigate('/application/fill')}
                  className="ml-auto text-xs font-bold text-green-600 border border-green-200
                             px-3 py-1 rounded-lg hover:bg-green-50">
                  ✏️ Edit
                </button>
              )}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {appData.collegePriorities.map((p, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                     style={{borderColor:'#e8f5e9',background:i===0?'#f9fbe7':'white'}}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{background:i===0?G.gold:G.g500,color:i===0?G.g800:'white'}}>
                    {i+1}
                  </span>
                  <span className="text-xs font-semibold text-gray-700 truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Allotment details */}
        {appData?.seatAllotted && (
          <div className="rounded-2xl p-5 border-2 mb-6" style={{background:'#f1f8f1',borderColor:G.g600}}>
            <h3 className="font-black text-base mb-3 flex items-center gap-2" style={{color:G.g800}}>
              🏫 Seat Allotment Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['College',appData.allottedCollege],['Stream',appData.allottedStream],
                ['Phase',appData.allotmentPhase],['Joining Date',appData.joiningDate]
              ].filter(([,v])=>v).map(([l,v])=>(
                <div key={l}>
                  <span className="font-bold text-gray-500 text-xs uppercase">{l}</span>
                  <p className="font-black" style={{color:G.g600}}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
