import React from 'react'

const HELPDESK = [
  {
    title: 'General Enquiries',
    person: 'Sri. K. Ravi Kumar',
    designation: 'Admission Coordinator',
    phone: '040-23450678',
    mobile: '9876543210',
    timings: 'Mon – Sat: 9:00 AM – 6:00 PM',
    email: 'admissions@ttwreis.telangana.gov.in',
  },
  {
    title: 'Technical / Portal Support',
    person: 'Sri. M. Suresh',
    designation: 'IT Cell Officer',
    phone: '040-23450679',
    mobile: '9876543211',
    timings: 'Mon – Fri: 9:00 AM – 5:00 PM',
    email: 'techsupport@ttwreis.telangana.gov.in',
  },
  {
    title: 'Payment Issues',
    person: 'Smt. P. Lakshmi',
    designation: 'Accounts Officer',
    phone: '040-23450680',
    mobile: '9876543212',
    timings: 'Mon – Fri: 10:00 AM – 4:00 PM',
    email: 'accounts@ttwreis.telangana.gov.in',
  },
]

const OFFICE = {
  name: 'TGTWREIS Head Office',
  address: 'Tribal Welfare Residential Educational Institutions Society,\nMasab Tank, Hyderabad – 500 028,\nTelangana, India.',
  landmark: 'Near Masab Tank Bus Stop',
  mapLink: 'https://maps.google.com/?q=Masab+Tank+Hyderabad',
}

export default function HelpdeskModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
             style={{background:'linear-gradient(135deg,#0d3b0d,#1a6b2e)'}}>
          <div>
            <h2 className="text-white font-black text-lg">📞 Helpdesk & Contact</h2>
            <p className="text-green-200 text-xs font-semibold">TTWREIS Admission Support 2025-26</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white font-black text-xl">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Contact persons */}
          {HELPDESK.map((h, i) => (
            <div key={i} className="border border-green-200 rounded-xl overflow-hidden">
              <div className="bg-green-700 px-4 py-2">
                <p className="text-white font-black text-sm">{h.title}</p>
              </div>
              <div className="p-4 grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Contact Person</p>
                  <p className="font-bold text-gray-800">{h.person}</p>
                  <p className="text-xs text-gray-500">{h.designation}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Office Hours</p>
                  <p className="font-semibold text-gray-700 text-xs">{h.timings}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                  <a href={`tel:${h.phone}`} className="font-black text-green-700 hover:underline">{h.phone}</a>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Mobile</p>
                  <a href={`tel:${h.mobile}`} className="font-black text-green-700 hover:underline">{h.mobile}</a>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                  <a href={`mailto:${h.email}`} className="text-xs font-semibold text-blue-600 hover:underline">{h.email}</a>
                </div>
              </div>
            </div>
          ))}

          {/* Office address */}
          <div className="border border-orange-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2" style={{background:'#e65100'}}>
              <p className="text-white font-black text-sm">🏢 {OFFICE.name}</p>
            </div>
            <div className="p-4 space-y-2">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Address</p>
                <p className="text-sm font-semibold text-gray-700 whitespace-pre-line">{OFFICE.address}</p>
                <p className="text-xs text-gray-500 mt-1">📍 {OFFICE.landmark}</p>
              </div>
              <a href={OFFICE.mapLink} target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                🗺️ View on Google Maps
              </a>
            </div>
          </div>

          {/* Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 font-semibold">
            ⚠️ Please keep your <strong>Registration Number</strong> and <strong>Application Number</strong> handy
            when calling the helpdesk for faster assistance.
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex-shrink-0 flex justify-end">
          <button onClick={onClose} className="btn-primary px-8">Close</button>
        </div>
      </div>
    </div>
  )
}