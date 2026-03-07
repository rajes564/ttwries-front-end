import React, { useEffect, useState } from 'react'
import api from '../../api/axios'

const defaultNotifs = [
  { id:1, text:"Online Admission Registration for Intermediate 2025-26 is now OPEN. Apply before 31st March 2025.", isNew:true },
  { id:2, text:"Hall Ticket download will be available from 10th April 2025 onwards.", isNew:false },
  { id:3, text:"Entrance Examination scheduled on 20th April 2025 | 10:00 AM – 1:00 PM.", isNew:false },
  { id:4, text:"Phase-1 Seat Allotment list will be published on 5th May 2025.", isNew:true },
  { id:5, text:"Fee payment window: 6th May – 15th May 2025. Pay online to confirm seat.", isNew:false },
  { id:6, text:"For technical support call: 040-23450678 (Mon–Sat, 9AM–6PM)", isNew:false },
]

export default function NotificationScroller() {
  const [notifications, setNotifications] = useState(defaultNotifs)

  useEffect(() => {
    api.get('/notifications/active').then(r => {
      if (r.data?.length) setNotifications(r.data)
    }).catch(() => {})
  }, [])

  const items = [...notifications, ...notifications]

  return (
    <div className="flex items-stretch overflow-hidden"
         style={{
           background: 'linear-gradient(90deg,#2d0b47,#46166b)',
         
           height: '34px',
         }}>
      {/* Label */}
      <div className="flex items-center gap-1.5 flex-shrink-0 font-black text-xs uppercase tracking-wider px-3"
           style={{ background:'linear-gradient(90deg,rgb(243 233 245), rgb(203 138 169))', color:'#2d0b47', whiteSpace:'nowrap' }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
              style={{ background:'#c0392b' }}/>
        NOTICES
      </div>

      {/* Scrolling track */}
      <div className="flex-1 overflow-hidden flex items-center">
        <div className="marquee-track flex gap-14 whitespace-nowrap">
          {items.map((n, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 font-semibold text-xs"
                  style={{ color:'#ffe8a0' }}>
              <span style={{ color:'#ffd84d' }}>📢</span>
              {n.text}
              {n.isNew && (
                <span className="font-black text-white px-1.5 py-0.5 rounded animate-pulse flex-shrink-0"
                      style={{ background:'#c0392b', fontSize:'9px' }}>NEW</span>
              )}
              <span style={{ color:'#6b2a9e', margin:'0 4px' }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}