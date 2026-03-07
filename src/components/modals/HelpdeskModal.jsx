import React from 'react'

const M = { maroon:'#8B0000', dark:'#5a0000', deep:'#3d0000', gold:'#ffd600', orange:'#e65100' }

const HELPDESK = [
  {
    title:'General Enquiries',
    person:'Sri. K. Ravi Kumar', designation:'Admission Coordinator',
    phone:'040-23450678', mobile:'9876543210',
    timings:'Mon – Sat: 9:00 AM – 6:00 PM',
    email:'admissions@ttwreis.telangana.gov.in',
  },
  {
    title:'Technical / Portal Support',
    person:'Sri. M. Suresh', designation:'IT Cell Officer',
    phone:'040-23450679', mobile:'9876543211',
    timings:'Mon – Fri: 9:00 AM – 5:00 PM',
    email:'techsupport@ttwreis.telangana.gov.in',
  },
  {
    title:'Payment Issues',
    person:'Smt. P. Lakshmi', designation:'Accounts Officer',
    phone:'040-23450680', mobile:'9876543212',
    timings:'Mon – Fri: 10:00 AM – 4:00 PM',
    email:'accounts@ttwreis.telangana.gov.in',
  },
]

export default function HelpdeskModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
         style={{ background:'rgba(0,0,0,0.65)', backdropFilter:'blur(3px)' }}>

      <div className="bg-white w-full sm:max-w-xl sm:rounded-2xl shadow-2xl flex flex-col
                      rounded-t-2xl max-h-[95vh] sm:max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 rounded-t-2xl"
             style={{ background:`linear-gradient(135deg,${M.deep},${M.maroon})` }}>
          <div>
            <h2 className="text-white font-black text-base">📞 Helpdesk & Contact</h2>
            <p className="text-red-200 text-xs font-semibold">TTWREIS Admission Support 2025-26</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white font-black text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
          {HELPDESK.map((h, i) => (
            <div key={i} className="border rounded-xl overflow-hidden" style={{borderColor:'#f9c3c3'}}>
              <div className="px-4 py-2" style={{background:M.maroon}}>
                <p className="text-white font-black text-sm">{h.title}</p>
              </div>
              <div className="p-3 grid grid-cols-2 gap-y-2 gap-x-3 text-sm bg-white">
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-bold text-gray-400 uppercase">Contact Person</p>
                  <p className="font-bold text-gray-800 text-sm">{h.person}</p>
                  <p className="text-xs text-gray-500">{h.designation}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-bold text-gray-400 uppercase">Office Hours</p>
                  <p className="font-semibold text-gray-700 text-xs">{h.timings}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                  <a href={`tel:${h.phone}`} className="font-black hover:underline text-sm" style={{color:M.maroon}}>{h.phone}</a>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Mobile</p>
                  <a href={`tel:${h.mobile}`} className="font-black hover:underline text-sm" style={{color:M.maroon}}>{h.mobile}</a>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                  <a href={`mailto:${h.email}`} className="text-xs font-semibold text-blue-600 hover:underline break-all">{h.email}</a>
                </div>
              </div>
            </div>
          ))}

          {/* Office address */}
          <div className="border rounded-xl overflow-hidden" style={{borderColor:'#ffe0b2'}}>
            <div className="px-4 py-2" style={{background:M.orange}}>
              <p className="text-white font-black text-sm">🏢 TTWREIS Head Office</p>
            </div>
            <div className="p-3 bg-white space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                Tribal Welfare Residential Educational Institutions Society,<br/>
                Masab Tank, Hyderabad – 500 028,<br/>
                Telangana, India.
              </p>
              <p className="text-xs text-gray-500">📍 Near Masab Tank Bus Stop</p>
              <a href="https://maps.google.com/?q=Masab+Tank+Hyderabad" target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                🗺️ View on Google Maps
              </a>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-semibold">
            ⚠️ Keep your <strong>Registration Number</strong> handy when calling for faster assistance.
          </div>
        </div>

        <div className="px-4 py-3 border-t bg-gray-50 flex-shrink-0 flex justify-end safe-bottom">
          <button onClick={onClose} className="btn-primary px-8">Close</button>
        </div>
      </div>
    </div>
  )
}
