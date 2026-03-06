import React, { useEffect, useState } from 'react'
import api from '../../api/axios'

const defaultNotifs = [
  { id: 1, text: "Online Admission Registration for Intermediate 2025-26 is now OPEN. Apply before 31st March 2025.", isNew: true },
  { id: 2, text: "Hall Ticket download will be available from 10th April 2025 onwards.", isNew: false },
  { id: 3, text: "Entrance Examination scheduled on 20th April 2025 | 10:00 AM – 1:00 PM.", isNew: false },
  { id: 4, text: "Phase-1 Seat Allotment list will be published on 5th May 2025.", isNew: true },
  { id: 5, text: "Fee payment window: 6th May – 15th May 2025. Pay online to confirm seat.", isNew: false },
  { id: 6, text: "For technical support call: 040-23450678 (Mon–Sat, 9AM–6PM)", isNew: false },
]

export default function NotificationScroller() {
  const [notifications, setNotifications] = useState(defaultNotifs)

  useEffect(() => {
    api.get('/notifications/active').then(r => {
      if (r.data?.length) setNotifications(r.data)
    }).catch(() => {})
  }, [])

  const doubled = [...notifications, ...notifications]

  return (
    // <div className="flex items-stretch overflow-hidden border-b-2 border-yellow-500" style={{background:'linear-gradient(90deg,#0d3b0d,#1b5e20)'}}>
    <div className="flex items-stretch overflow-hidden border-b-2 border-yellow-500  w-full text-base py-3" style={{backgroundColor:"rgb(112 105 125)"}} >
      <div className="flex items-center gap-2 bg-orange-600 text-white font-black text-xs px-4 py-2 flex-shrink-0 uppercase tracking-wider">
      {/* <div className="flex items-center gap-2 bg-orange-600 text-white font-black text-xs px-4 py-2 flex-shrink-0 uppercase tracking-wider"> */}
        <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"/>
        NOTICES
      </div>
      <div className="flex-1 overflow-hidden flex items-center">
        <div className="flex gap-16 animate-[scroll_35s_linear_infinite] whitespace-nowrap hover:[animation-play-state:paused]">
          {doubled.map((n, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-white text-xs font-semibold py-2 cursor-pointer hover:text-yellow-300">
              <span className="text-yellow-400">📢</span>
              {n.text}
              {n.isNew && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse">NEW</span>}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
