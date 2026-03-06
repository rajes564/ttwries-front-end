import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

// ─── Brand palette (matches Header + tailwind.config) ──────────────────────────
const B = {
  g900:'#082308', g800:'#0d3b0d', g700:'#145214',
  g600:'#1b5e20', g500:'#2e7d32', g400:'#66bb6a', g300:'#a5d6a7',
  orange:'#e65100', gold:'#ffd600', amber:'#ff8f00',
}
const CHART_COLORS = [B.g600,'#1565c0',B.orange,'#6a1b9a','#00695c',B.amber,B.g500,'#c62828']

// ─── Nav config ────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  { label:'Main', items:[
    { id:'dashboard',     icon:'📊', label:'Dashboard'            },
    { id:'applications',  icon:'📋', label:'Applications'         },
    { id:'candidates',    icon:'👥', label:'Candidates'           },
  ]},
  { label:'Masters', items:[
    { id:'institutes',    icon:'🏫', label:'Institutes / Colleges' },
    { id:'examcenters',   icon:'📍', label:'Exam Centers'         },
    { id:'invigilators',  icon:'👨‍🏫', label:'Invigilators'        },
    { id:'notifications', icon:'📢', label:'Notifications'        },
  ]},
  { label:'Exam', items:[
    { id:'halltickets',   icon:'🎟️', label:'Hall Tickets'         },
    { id:'results',       icon:'📈', label:'Results'              },
    { id:'allotment',     icon:'🪑', label:'Seat Allotment'       },
  ]},
  { label:'Finance', items:[
    { id:'payments',      icon:'💳', label:'Payments'             },
    { id:'reports',       icon:'📑', label:'Reports'              },
  ]},
  { label:'Settings', items:[
    { id:'users',         icon:'👤', label:'Admin Users'          },
    { id:'settings',      icon:'⚙️',  label:'Settings'            },
  ]},
]
const ALL_NAV = NAV_GROUPS.flatMap(g => g.items)

// ─── Shared primitives ─────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-2">
    <div style={{width:36,height:36,border:`3px solid ${B.g300}`,borderTopColor:B.g600,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
    <p className="text-xs font-semibold text-gray-400">Loading…</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
)

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm"
         style={{borderLeft:`4px solid ${accent||B.g600}`,border:`1px solid #e8f5e9`,borderLeftWidth:4,borderLeftColor:accent||B.g600}}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500 truncate">{label}</p>
          <p className="text-2xl font-black text-gray-800 mt-0.5 leading-none">
            {typeof value==='number' ? value.toLocaleString('en-IN') : (value ?? '—')}
          </p>
          {sub && <p className="text-xs text-gray-400 font-semibold mt-1 truncate">{sub}</p>}
        </div>
        <span className="text-3xl ml-2 flex-shrink-0 leading-none">{icon}</span>
      </div>
    </div>
  )
}

function Badge({ v, colorMap }) {
  const c = colorMap?.[v] || { bg:'#f5f5f5', fg:'#616161' }
  return <span className="px-2 py-0.5 rounded-full text-xs font-black whitespace-nowrap"
               style={{background:c.bg,color:c.fg}}>{v || '—'}</span>
}

// Page-level header inside content div
function ContentHeader({ nav, subtitle }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl leading-none">{nav?.icon}</span>
        <div>
          <h2 className="text-xl font-black leading-tight" style={{color:B.g800}}>{nav?.label}</h2>
          <p className="text-xs font-semibold text-gray-500 mt-0.5">
            {subtitle || 'TTWREIS Admission Management System · 2025-26'}
          </p>
        </div>
      </div>
      <div className="mt-3 h-0.5 rounded-full" style={{background:`linear-gradient(90deg,${B.g600},${B.gold},transparent)`}}/>
    </div>
  )
}

// Pagination
function Pager({ page, total, size, onChange }) {
  const pages = Math.max(1, Math.ceil(total / size))
  if (pages <= 1 && total <= size) return null
  const lo = Math.max(0, page-2), hi = Math.min(pages-1, page+2)
  const nums = []
  for (let i=lo;i<=hi;i++) nums.push(i)
  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 flex-wrap gap-2">
      <p className="text-xs text-gray-500 font-semibold">
        Showing {page*size+1}–{Math.min((page+1)*size,total)} of {total.toLocaleString('en-IN')} records
      </p>
      <div className="flex items-center gap-1">
        <button type="button" disabled={page===0} onClick={()=>onChange(0)}
          className="px-2 py-1.5 text-xs font-bold rounded-lg border disabled:opacity-30 hover:bg-green-50 border-gray-200">«</button>
        <button type="button" disabled={page===0} onClick={()=>onChange(page-1)}
          className="px-2 py-1.5 text-xs font-bold rounded-lg border disabled:opacity-30 hover:bg-green-50 border-gray-200">‹</button>
        {lo>0 && <span className="px-2 text-gray-400 text-xs">…</span>}
        {nums.map(n=>(
          <button key={n} type="button" onClick={()=>onChange(n)}
            className="px-3 py-1.5 text-xs font-black rounded-lg border transition-all"
            style={n===page?{background:B.g600,color:'white',borderColor:B.g600}:{borderColor:'#e5e7eb'}}>
            {n+1}
          </button>
        ))}
        {hi<pages-1 && <span className="px-2 text-gray-400 text-xs">…</span>}
        <button type="button" disabled={page>=pages-1} onClick={()=>onChange(page+1)}
          className="px-2 py-1.5 text-xs font-bold rounded-lg border disabled:opacity-30 hover:bg-green-50 border-gray-200">›</button>
        <button type="button" disabled={page>=pages-1} onClick={()=>onChange(pages-1)}
          className="px-2 py-1.5 text-xs font-bold rounded-lg border disabled:opacity-30 hover:bg-green-50 border-gray-200">»</button>
      </div>
    </div>
  )
}

// Data table
function DataTable({ columns, rows, total=0, page=0, size=10, onPage, loading, empty='No records found.' }) {
  if (loading) return <Spinner/>
  if (!rows?.length) return (
    <div className="text-center py-14">
      <div className="text-5xl mb-3">🗂️</div>
      <p className="text-sm text-gray-400 font-semibold">{empty}</p>
    </div>
  )
  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr style={{background:`linear-gradient(135deg,${B.g800},${B.g600})`}}>
              {columns.map(c=>(
                <th key={c.key||c.label} className="text-left px-4 py-3 text-xs font-black text-green-100 uppercase tracking-wider whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row,i)=>(
              <tr key={i} className={`border-t border-gray-50 hover:bg-green-50/40 transition-colors ${i%2===1?'bg-gray-50/30':''}`}>
                {columns.map(c=>(
                  <td key={c.key||c.label} className="px-4 py-2.5 font-semibold text-gray-700 text-sm whitespace-nowrap">
                    {c.render ? c.render(row[c.key],row) : (row[c.key]??'—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} total={total} size={size} onChange={onPage}/>
    </>
  )
}

// Toolbar: search + add button
function Toolbar({ search, onSearch, placeholder, onAdd, addLabel, extra }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center">
      <div className="relative flex-1 min-w-0">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
        <input type="search" className="input-field pl-9 w-full"
          placeholder={placeholder||'Search…'} value={search}
          onChange={e=>onSearch(e.target.value)}/>
      </div>
      {extra}
      {onAdd && (
        <button type="button" onClick={onAdd}
          className="flex-shrink-0 text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-md
                     hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
          style={{background:`linear-gradient(135deg,${B.g600},${B.g500})`}}>
          <span>＋</span>{addLabel||'Add'}
        </button>
      )}
    </div>
  )
}

// Modal
function Modal({ title, subtitle, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{background:'rgba(0,0,0,0.65)'}}>
      <div className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden
        ${wide?'w-full max-w-3xl':'w-full max-w-lg'} max-h-[90vh]`}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
             style={{background:`linear-gradient(135deg,${B.g800},${B.g600})`}}>
          <div>
            <h2 className="text-white font-black text-base leading-tight">{title}</h2>
            {subtitle && <p className="text-green-300 text-xs font-semibold mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       text-white hover:bg-white/20 font-black text-lg transition-colors">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  )
}

function FormRow({ label, required, error, children, wide }) {
  return (
    <div className={wide?'col-span-2':''}>
      <label className="label">{label}{required&&<span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-xs text-red-500 font-bold mt-0.5">⚠ {error}</p>}
    </div>
  )
}

// ─── Paged data hook ───────────────────────────────────────────────────────────
function usePagedData(endpoint, extraParams) {
  const [rows,    setRows]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [search,  setSearch]  = useState('')
  const debounce              = useRef(null)
  const PAGE_SIZE = 10

  const fetch = useCallback((p, s, extra) => {
    setLoading(true)
    const params = new URLSearchParams({page:p, size:PAGE_SIZE, search:s||'', ...(extra||{})})
    api.get(`${endpoint}?${params}`)
      .then(r => {
        const d = r.data
        setRows(d.content || [])
        setTotal(d.totalElements || 0)
        setPage(d.number || 0)
      })
      .catch(() => { setRows([]); setTotal(0) })
      .finally(() => setLoading(false))
  }, [endpoint])

  const stableExtra = JSON.stringify(extraParams)

  useEffect(() => {
    fetch(0, '', extraParams)
  }, [fetch, stableExtra])

  const onSearch = (v) => {
    setSearch(v)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => fetch(0, v, extraParams), 380)
  }

  const onPage = (p) => fetch(p, search, extraParams)
  const refetch = () => fetch(page, search, extraParams)

  return { rows, total, page, size:PAGE_SIZE, loading, search, onSearch, onPage, refetch }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD PANEL
// ═══════════════════════════════════════════════════════════════════════════════
const FALLBACK_STATS = {
  totalApplications:4832, paidApplications:4215, pendingApplications:617,
  totalAmountReceived:8430000, hallTicketsGenerated:4100, appeared:3856, notAppeared:244,
  categoryBreakdown:[{name:'ST',value:2150},{name:'SC',value:890},{name:'BC-A',value:420},{name:'BC-B',value:380},{name:'OC',value:375}],
  collegeWise:[{name:'KGBV Khammam',filled:80,vacant:20},{name:'KGBV Warangal',filled:72,vacant:28},{name:'KGBV Adilabad',filled:65,vacant:35},{name:'KGBV Nalgonda',filled:58,vacant:42}]
}
const TREND_DATA = [
  {d:'Feb 10',n:120},{d:'Feb 15',n:340},{d:'Feb 20',n:580},{d:'Feb 25',n:820},
  {d:'Mar 01',n:1100},{d:'Mar 08',n:1670},{d:'Mar 15',n:2340},{d:'Mar 22',n:3150},{d:'Mar 31',n:4215},
]

function DashboardPanel() {
  const [stats,setStats]=useState(null)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    api.get('/admin/stats').then(r=>setStats(r.data)).catch(()=>setStats(FALLBACK_STATS)).finally(()=>setLoading(false))
  },[])

  const nav = ALL_NAV.find(n=>n.id==='dashboard')
  if(loading) return <><ContentHeader nav={nav}/><Spinner/></>
  const s = stats || FALLBACK_STATS
  return(
    <div>
      <ContentHeader nav={nav} subtitle={`Live statistics — ${s.totalApplications?.toLocaleString('en-IN')} applications registered`}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard icon="📋" label="Total Applications"  value={s.totalApplications}  accent={B.g600}/>
        <StatCard icon="💳" label="Paid Applications"   value={s.paidApplications}   accent="#1565c0" sub="Payment confirmed"/>
        <StatCard icon="⏳" label="Pending Payment"     value={s.pendingApplications} accent={B.orange}/>
        <StatCard icon="💰" label="Amount Received" accent={B.gold}
          value={`₹${((s.totalAmountReceived||0)/100000).toFixed(1)}L`}
          sub={`₹${(s.totalAmountReceived||0).toLocaleString('en-IN')}`}/>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard icon="🎟️" label="Hall Tickets" value={s.hallTicketsGenerated} accent="#6a1b9a"/>
        <StatCard icon="✅" label="Appeared"     value={s.appeared}            accent={B.g500}/>
        <StatCard icon="❌" label="Absent"       value={s.notAppeared}         accent="#c62828"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-2xl shadow-sm p-5" style={{border:`1px solid #e8f5e9`}}>
          <h3 className="font-black text-sm mb-3" style={{color:B.g800}}>Category-wise Applications</h3>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={s.categoryBreakdown||[]} cx="50%" cy="50%"
                outerRadius={78} innerRadius={30} dataKey="value"
                label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                {(s.categoryBreakdown||[]).map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
              </Pie>
              <Tooltip/><Legend iconType="circle" iconSize={9}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5" style={{border:`1px solid #e8f5e9`}}>
          <h3 className="font-black text-sm mb-3" style={{color:B.g800}}>College Seat Status</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={s.collegeWise||[]} margin={{left:-22,bottom:28}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0"/>
              <XAxis dataKey="name" tick={{fontSize:9}} angle={-25} textAnchor="end" height={52}/>
              <YAxis tick={{fontSize:9}}/>
              <Tooltip/>
              <Legend verticalAlign="top" wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="filled" name="Filled" fill={B.g600} radius={[3,3,0,0]}/>
              <Bar dataKey="vacant" name="Vacant" fill={B.orange} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-5" style={{border:`1px solid #e8f5e9`}}>
        <h3 className="font-black text-sm mb-3" style={{color:B.g800}}>Daily Registration Trend</h3>
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={TREND_DATA} margin={{left:-10}}>
            <defs>
              <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={B.g600} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={B.g600} stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0"/>
            <XAxis dataKey="d" tick={{fontSize:10}}/>
            <YAxis tick={{fontSize:10}}/>
            <Tooltip/>
            <Area type="monotone" dataKey="n" name="Applications"
              stroke={B.g600} strokeWidth={2.5} fill="url(#aGrad)"
              dot={{r:3,fill:B.g600,stroke:'white',strokeWidth:2}} activeDot={{r:6}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPLICATIONS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
const APP_STATUS = {
  SUBMITTED:       {bg:'#e3f2fd',fg:'#1565c0'},
  PAID:            {bg:'#e8f5e9',fg:'#2e7d32'},
  PAYMENT_PENDING: {bg:'#fff3e0',fg:'#e65100'},
  VERIFIED:        {bg:'#f3e5f5',fg:'#6a1b9a'},
  ALLOTTED:        {bg:'#e0f7fa',fg:'#006064'},
  DRAFT:           {bg:'#f5f5f5',fg:'#616161'},
}
const PAY_STATUS = { PAID:{bg:'#e8f5e9',fg:'#2e7d32'}, PENDING:{bg:'#fff3e0',fg:'#e65100'}, FAILED:{bg:'#ffebee',fg:'#c62828'} }

function ApplicationsPanel() {
  const [statusFilter, setStatusFilter] = useState('')
  const extra = useMemo(()=> statusFilter ? {status:statusFilter} : {}, [statusFilter])
  const { rows, total, page, size, loading, search, onSearch, onPage, refetch } = usePagedData('/admin/applications', extra)

  return(
    <div>
      <ContentHeader nav={ALL_NAV.find(n=>n.id==='applications')} subtitle={`${total.toLocaleString('en-IN')} total applications`}/>
      {/* Status chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['','SUBMITTED','PAID','PAYMENT_PENDING','VERIFIED','ALLOTTED','DRAFT'].map(s=>(
          <button key={s} type="button" onClick={()=>setStatusFilter(s)}
            className="px-3 py-1.5 rounded-full text-xs font-black border transition-all"
            style={statusFilter===s
              ?{background:B.g600,color:'white',borderColor:B.g600}
              :{background:'white',borderColor:'#d1d5db',color:'#374151'}}>
            {s||'ALL STATUSES'}
          </button>
        ))}
      </div>
      <Toolbar search={search} onSearch={v=>{onSearch(v)}} placeholder="Search by name, app no., community…"/>
      <DataTable loading={loading} rows={rows} total={total} page={page} size={size} onPage={onPage}
        empty="No applications found. They appear here once candidates submit."
        columns={[
          {key:'applicationNumber', label:'App No.'},
          {key:'registrationNumber',label:'Reg. No.'},
          {key:'candidateName',    label:'Candidate'},
          {key:'community',        label:'Community'},
          {key:'classApplied',     label:'Class'},
          {key:'status',    label:'Status',  render:v=><Badge v={v} colorMap={APP_STATUS}/>},
          {key:'paymentStatus',label:'Payment',render:v=><Badge v={v} colorMap={PAY_STATUS}/>},
          {key:'submittedAt',  label:'Date'},
        ]}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANDIDATES PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function CandidatesPanel() {
  const { rows, total, page, size, loading, search, onSearch, onPage } = usePagedData('/admin/candidates')
  return(
    <div>
      <ContentHeader nav={ALL_NAV.find(n=>n.id==='candidates')} subtitle={`${total.toLocaleString('en-IN')} registered`}/>
      <Toolbar search={search} onSearch={onSearch} placeholder="Search by name, reg. no. or mobile…"/>
      <DataTable loading={loading} rows={rows} total={total} page={page} size={size} onPage={onPage}
        empty="No candidates registered yet."
        columns={[
          {key:'registrationNumber',label:'Reg. No.'},
          {key:'candidateName',    label:'Name'},
          {key:'gender',           label:'Gender'},
          {key:'mobileNumber',     label:'Mobile'},
          {key:'email',            label:'Email'},
          {key:'aadhaarNumber',    label:'Aadhaar'},
          {key:'dateOfBirth',      label:'DOB'},
          {key:'active',label:'Status',render:v=>(
            <span className="px-2 py-0.5 rounded-full text-xs font-black"
              style={v?{background:'#e8f5e9',color:'#2e7d32'}:{background:'#ffebee',color:'#c62828'}}>
              {v?'Active':'Inactive'}
            </span>
          )},
        ]}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSTITUTES PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function InstitutesPanel() {
  const { rows, total, page, size, loading, search, onSearch, onPage, refetch } = usePagedData('/admin/institutes')
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({name:'',code:'',district:'',mandal:'',address:'',type:'Girls',totalSeats:''})
  const [saving, setSaving] = useState(false)
  const [errs,   setErrs]   = useState({})

  const save = async()=>{
    const e={}
    if(!form.name) e.name='Required'
    if(!form.code) e.code='Required'
    if(Object.keys(e).length){setErrs(e);return}
    setSaving(true)
    try{
      await api.post('/admin/institutes',{...form,totalSeats:Number(form.totalSeats)||0})
      toast.success('✅ Institute added!')
      setModal(false);setForm({name:'',code:'',district:'',mandal:'',address:'',type:'Girls',totalSeats:''});setErrs({})
      refetch()
    }catch(e){toast.error('❌ '+(e.response?.data?.message||'Failed'))}
    finally{setSaving(false)}
  }

  return(
    <div>
      <ContentHeader nav={ALL_NAV.find(n=>n.id==='institutes')} subtitle={`${total} institutes`}/>
      <Toolbar search={search} onSearch={onSearch} placeholder="Search by name, code, district…"
        onAdd={()=>setModal(true)} addLabel="Add Institute"/>
      <DataTable loading={loading} rows={rows} total={total} page={page} size={size} onPage={onPage}
        empty="No institutes added yet."
        columns={[
          {key:'name',       label:'Institute Name'},
          {key:'code',       label:'Code'},
          {key:'district',   label:'District'},
          {key:'type',       label:'Type'},
          {key:'totalSeats', label:'Total'},
          {key:'filledSeats',label:'Filled'},
          {key:'vacantSeats',label:'Vacant',
            render:v=><span className="font-black" style={{color:v>0?B.g600:B.orange}}>{v}</span>},
          {key:'active',label:'',render:v=>(
            <span className="px-2 py-0.5 rounded-full text-xs font-black"
              style={v?{background:'#e8f5e9',color:'#2e7d32'}:{background:'#ffebee',color:'#c62828'}}>
              {v?'Active':'Inactive'}
            </span>
          )},
        ]}
      />
      {modal&&(
        <Modal title="🏫 Add New Institute" subtitle="Enter institute details below" onClose={()=>setModal(false)}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <FormRow label="Institute Name" required error={errs.name} wide>
              <input className="input-field" value={form.name}
                onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. KGBV Warangal"/>
            </FormRow>
            <FormRow label="Code" required error={errs.code}>
              <input className="input-field" value={form.code} onChange={e=>setForm(p=>({...p,code:e.target.value}))}/>
            </FormRow>
            <FormRow label="District">
              <input className="input-field" value={form.district} onChange={e=>setForm(p=>({...p,district:e.target.value}))}/>
            </FormRow>
            <FormRow label="Mandal">
              <input className="input-field" value={form.mandal} onChange={e=>setForm(p=>({...p,mandal:e.target.value}))}/>
            </FormRow>
            <FormRow label="Type" required>
              <select className="input-field" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                <option>Girls</option><option>Boys</option><option>Co-Ed</option>
              </select>
            </FormRow>
            <FormRow label="Total Seats">
              <input type="number" className="input-field" value={form.totalSeats} onChange={e=>setForm(p=>({...p,totalSeats:e.target.value}))}/>
            </FormRow>
            <FormRow label="Address" wide>
              <input className="input-field" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))}/>
            </FormRow>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={()=>setModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button type="button" disabled={saving} onClick={save} className="btn-primary text-sm">
              {saving?'⏳ Saving…':'✅ Add Institute'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAM CENTERS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function ExamCentersPanel() {
  const { rows, total, page, size, loading, search, onSearch, onPage, refetch } = usePagedData('/admin/exam-centers')
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({name:'',address:'',district:'',noOfRooms:'',roomCapacity:''})
  const [saving, setSaving] = useState(false)
  const totalCap = (Number(form.noOfRooms)||0)*(Number(form.roomCapacity)||0)

  const save = async()=>{
    if(!form.name){toast.error('Name required');return}
    setSaving(true)
    try{
      await api.post('/admin/exam-centers',{...form,noOfRooms:Number(form.noOfRooms)||0,roomCapacity:Number(form.roomCapacity)||0})
      toast.success('✅ Exam Center added!')
      setModal(false);setForm({name:'',address:'',district:'',noOfRooms:'',roomCapacity:''})
      refetch()
    }catch(e){toast.error('❌ '+(e.response?.data?.message||'Failed'))}
    finally{setSaving(false)}
  }

  return(
    <div>
      <ContentHeader nav={ALL_NAV.find(n=>n.id==='examcenters')} subtitle={`${total} exam centers`}/>
      <Toolbar search={search} onSearch={onSearch} placeholder="Search by center name or district…"
        onAdd={()=>setModal(true)} addLabel="Add Center"/>
      <DataTable loading={loading} rows={rows} total={total} page={page} size={size} onPage={onPage}
        empty="No exam centers added yet."
        columns={[
          {key:'name',          label:'Center Name'},
          {key:'district',      label:'District'},
          {key:'address',       label:'Address'},
          {key:'noOfRooms',     label:'Rooms'},
          {key:'roomCapacity',  label:'Cap/Room'},
          {key:'totalCapacity', label:'Total Capacity',
            render:v=><span className="font-black" style={{color:B.g600}}>{v||0}</span>},
          {key:'active',label:'',render:v=>(
            <span className="px-2 py-0.5 rounded-full text-xs font-black"
              style={v?{background:'#e8f5e9',color:'#2e7d32'}:{background:'#ffebee',color:'#c62828'}}>
              {v?'Active':'Inactive'}
            </span>
          )},
        ]}
      />
      {modal&&(
        <Modal title="📍 Add Exam Center" subtitle="Center details and capacity" onClose={()=>setModal(false)}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <FormRow label="Center Name" required wide>
              <input className="input-field" value={form.name}
                onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Govt. Degree College, Khammam"/>
            </FormRow>
            <FormRow label="District">
              <input className="input-field" value={form.district} onChange={e=>setForm(p=>({...p,district:e.target.value}))}/>
            </FormRow>
            <FormRow label="Number of Rooms">
              <input type="number" className="input-field" value={form.noOfRooms} onChange={e=>setForm(p=>({...p,noOfRooms:e.target.value}))}/>
            </FormRow>
            <FormRow label="Capacity per Room">
              <input type="number" className="input-field" value={form.roomCapacity} onChange={e=>setForm(p=>({...p,roomCapacity:e.target.value}))}/>
            </FormRow>
            {totalCap>0&&(
              <div className="col-span-2 rounded-xl px-4 py-3 text-sm font-black flex items-center gap-2"
                   style={{background:'#e8f5e9',color:B.g600}}>
                🏢 Total Capacity: <span className="text-xl">{totalCap.toLocaleString('en-IN')}</span> students
              </div>
            )}
            <FormRow label="Full Address" wide>
              <input className="input-field" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))}/>
            </FormRow>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={()=>setModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button type="button" disabled={saving} onClick={save} className="btn-primary text-sm">
              {saving?'⏳ Saving…':'✅ Add Center'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVIGILATORS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function InvigilatorsPanel() {
  const { rows, total, page, size, loading, search, onSearch, onPage, refetch } = usePagedData('/admin/invigilators')
  const [modal,   setModal]   = useState(false)
  const [centers, setCenters] = useState([])
  const [form,    setForm]    = useState({name:'',designation:'',mobile:'',examCenterId:''})
  const [saving,  setSaving]  = useState(false)

  useEffect(()=>{
    api.get('/admin/exam-centers/all').then(r=>setCenters(Array.isArray(r.data)?r.data:(r.data?.content||[]))).catch(()=>{})
  },[])

  const save = async()=>{
    if(!form.name){toast.error('Name is required');return}
    setSaving(true)
    try{
      await api.post('/admin/invigilators',{...form,examCenterId:form.examCenterId?Number(form.examCenterId):null})
      toast.success('✅ Invigilator added!')
      setModal(false);setForm({name:'',designation:'',mobile:'',examCenterId:''})
      refetch()
    }catch(e){toast.error('❌ '+(e.response?.data?.message||'Failed'))}
    finally{setSaving(false)}
  }

  return(
    <div>
      <ContentHeader nav={ALL_NAV.find(n=>n.id==='invigilators')} subtitle={`${total} assigned`}/>
      <Toolbar search={search} onSearch={onSearch} placeholder="Search by name, designation, mobile…"
        onAdd={()=>setModal(true)} addLabel="Add Invigilator"/>
      <DataTable loading={loading} rows={rows} total={total} page={page} size={size} onPage={onPage}
        empty="No invigilators assigned yet."
        columns={[
          {key:'name',        label:'Name'},
          {key:'designation', label:'Designation'},
          {key:'mobile',      label:'Mobile'},
          {key:'examCenter',  label:'Exam Center'},
          {key:'active',label:'',render:v=>(
            <span className="px-2 py-0.5 rounded-full text-xs font-black"
              style={v?{background:'#e8f5e9',color:'#2e7d32'}:{background:'#f5f5f5',color:'#616161'}}>
              {v?'Active':'Inactive'}
            </span>
          )},
        ]}
      />
      {modal&&(
        <Modal title="👨‍🏫 Add Invigilator" onClose={()=>setModal(false)}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <FormRow label="Full Name" required wide>
              <input className="input-field" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
            </FormRow>
            <FormRow label="Designation">
              <input className="input-field" value={form.designation} onChange={e=>setForm(p=>({...p,designation:e.target.value}))} placeholder="e.g. Lecturer"/>
            </FormRow>
            <FormRow label="Mobile">
              <input type="tel" maxLength={10} className="input-field" value={form.mobile} onChange={e=>setForm(p=>({...p,mobile:e.target.value}))}/>
            </FormRow>
            <FormRow label="Assign to Exam Center" wide>
              <select className="input-field" value={form.examCenterId} onChange={e=>setForm(p=>({...p,examCenterId:e.target.value}))}>
                <option value="">— Not assigned —</option>
                {centers.map(c=><option key={c.id} value={c.id}>{c.name}{c.district?` (${c.district})`:''}</option>)}
              </select>
            </FormRow>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={()=>setModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button type="button" disabled={saving} onClick={save} className="btn-primary text-sm">
              {saving?'⏳ Saving…':'✅ Add Invigilator'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function NotificationsPanel() {
  const [items,  setItems]  = useState([])
  const [loading,setLoading]= useState(true)
  const [text,   setText]   = useState('')
  const [expiry, setExpiry] = useState('')
  const [markNew,setMarkNew]= useState(true)
  const [saving, setSaving] = useState(false)

  const load=useCallback(()=>{
    setLoading(true)
    api.get('/notifications/active').then(r=>setItems(r.data||[])).catch(()=>setItems([])).finally(()=>setLoading(false))
  },[])
  useEffect(()=>load(),[load])

  const publish=async()=>{
    if(!text.trim()){toast.error('Notification text required');return}
    setSaving(true)
    try{
      await api.post('/notifications',{text,expiryDate:expiry||null,isNew:markNew,active:true})
      toast.success('✅ Published!');setText('');setExpiry('')
      load()
    }catch{toast.error('❌ Failed')}finally{setSaving(false)}
  }

  const remove=async(id)=>{
    try{await api.delete(`/notifications/${id}`);toast.success('Removed');load()}
    catch{toast.error('Failed to remove')}
  }

  return(
    <div>
      <ContentHeader nav={ALL_NAV.find(n=>n.id==='notifications')} subtitle="Manage portal announcements"/>
      <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm" style={{border:`1px solid #e8f5e9`}}>
        <h3 className="font-black text-sm mb-3" style={{color:B.g800}}>➕ Publish New Notification</h3>
        <div className="space-y-3">
          <div>
            <label className="label">Text <span className="text-red-500">*</span></label>
            <textarea className="input-field" rows={3} value={text} onChange={e=>setText(e.target.value)}
              placeholder="e.g. Online Registration for 2025-26 is open. Last date: 31st March 2025."/>
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="label">Expiry Date (optional)</label>
              <input type="date" className="input-field w-44" value={expiry} onChange={e=>setExpiry(e.target.value)}/>
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-1">
              <input type="checkbox" className="w-4 h-4" checked={markNew} onChange={e=>setMarkNew(e.target.checked)}/>
              <span className="text-xs font-bold text-gray-700">Mark as 🆕 New</span>
            </label>
            <button type="button" disabled={saving} onClick={publish}
              className="text-white font-black text-sm px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
              style={{background:`linear-gradient(135deg,${B.g600},${B.g500})`}}>
              {saving?'⏳ Publishing…':'📢 Publish'}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-black text-sm" style={{color:B.g800}}>Active Notifications</h3>
        <span className="px-2 py-0.5 rounded-full text-xs font-black" style={{background:'#e8f5e9',color:B.g600}}>
          {items.length}
        </span>
      </div>
      {loading ? <Spinner/> : items.length===0
        ? <div className="text-center py-10 text-gray-400 text-sm italic">No active notifications</div>
        : <div className="space-y-3">
            {items.map(n=>(
              <div key={n.id} className="bg-white rounded-xl p-4 flex gap-3 items-start
                                         hover:border-green-300 transition-all shadow-sm"
                   style={{border:`1px solid #e8f5e9`}}>
                <span className="text-xl flex-shrink-0 leading-none mt-0.5">{n.isNew?'🆕':'📢'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed">{n.text}</p>
                  {n.expiryDate&&<p className="text-xs font-semibold mt-1" style={{color:B.orange}}>Expires: {n.expiryDate}</p>}
                </div>
                <button type="button" onClick={()=>remove(n.id)}
                  className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border
                             border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                  Remove
                </button>
              </div>
            ))}
          </div>
      }
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER PANELS
// ═══════════════════════════════════════════════════════════════════════════════
function PlaceholderPanel({ navId, items }) {
  const nav = ALL_NAV.find(n=>n.id===navId)
  return(
    <div>
      <ContentHeader nav={nav}/>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(c=>(
          <div key={c.title} onClick={()=>toast.info(`${c.title} – available in next release`)}
               className="bg-white rounded-xl p-5 flex items-center gap-4 cursor-pointer
                          hover:shadow-md transition-all shadow-sm group"
               style={{border:`1px solid #e8f5e9`}}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                 style={{background:'#f1f8f1'}}>
              {c.icon}
            </div>
            <div>
              <h4 className="font-black text-sm text-gray-800 group-hover:text-green-700 transition-colors">{c.title}</h4>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsPanel() {
  const nav=ALL_NAV.find(n=>n.id==='settings')
  const [st,setSt]=useState({portalOpen:true,registrationOpen:true,paymentOpen:false,hallTicketOpen:false,resultsPublished:false})
  const ROWS=[
    {k:'portalOpen',l:'Admission Portal',d:'Main portal visibility for candidates'},
    {k:'registrationOpen',l:'New Registration',d:'Allow new candidate registration'},
    {k:'paymentOpen',l:'Fee Payment',d:'Allow online fee payment'},
    {k:'hallTicketOpen',l:'Hall Ticket Download',d:'Allow hall ticket downloads'},
    {k:'resultsPublished',l:'Results',d:'Publish results to candidates'},
  ]
  return(
    <div>
      <ContentHeader nav={nav} subtitle="Configure portal module access"/>
      <div className="bg-white rounded-2xl shadow-sm p-5" style={{border:`1px solid #e8f5e9`}}>
        <h3 className="font-black text-sm mb-4" style={{color:B.g800}}>Module Access Toggles</h3>
        {ROWS.map(t=>(
          <div key={t.k} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-black text-gray-800">{t.l}</p>
              <p className="text-xs text-gray-400 font-semibold">{t.d}</p>
            </div>
            <button type="button"
              onClick={()=>{setSt(p=>({...p,[t.k]:!p[t.k]}));toast.success(`${t.l} ${!st[t.k]?'enabled':'disabled'}`)}}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4"
              style={{background:st[t.k]?B.g600:'#d1d5db'}}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform
                ${st[t.k]?'translate-x-6':'translate-x-1'}`}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [active,      setActive]      = useState('dashboard')
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  const handleLogout = useCallback(()=>{ logout(); navigate('/',{replace:true}) },[logout,navigate])
  const navTo = (id) => { setActive(id); setMobileOpen(false) }
  const activeItem = ALL_NAV.find(n=>n.id===active)

  const renderPanel = () => {
    switch(active) {
      case 'dashboard':     return <DashboardPanel/>
      case 'applications':  return <ApplicationsPanel/>
      case 'candidates':    return <CandidatesPanel/>
      case 'institutes':    return <InstitutesPanel/>
      case 'examcenters':   return <ExamCentersPanel/>
      case 'invigilators':  return <InvigilatorsPanel/>
      case 'notifications': return <NotificationsPanel/>
      case 'halltickets':   return <PlaceholderPanel navId="halltickets" items={[
        {icon:'⚙️',title:'Configure Exam Schedule',desc:'Set exam date, time and instructions'},
        {icon:'📍',title:'Assign Exam Centers',desc:'Allocate candidates to exam centers'},
        {icon:'🖨️',title:'Generate Hall Tickets',desc:'Bulk generate for all paid applications'},
        {icon:'📤',title:'Download / Print',desc:'Download hall tickets in bulk as PDF'},
      ]}/>
      case 'results':       return <PlaceholderPanel navId="results" items={[
        {icon:'📥',title:'Upload Answer Key',desc:'Upload provisional and final answer keys'},
        {icon:'📊',title:'Process Results',desc:'Calculate marks and generate merit list'},
        {icon:'📋',title:'View Merit List',desc:'Browse and filter the merit list'},
        {icon:'📤',title:'Publish Results',desc:'Make results visible to candidates'},
      ]}/>
      case 'allotment':     return <PlaceholderPanel navId="allotment" items={[
        {icon:'1️⃣',title:'Phase 1 Allotment',desc:'Initial allotment – 5th May 2025'},
        {icon:'2️⃣',title:'Phase 2 Allotment',desc:'Vacancy allotment – 20th May 2025'},
        {icon:'3️⃣',title:'Phase 3 / Spot',desc:'Spot allotment – June 2025'},
        {icon:'📊',title:'Allotment Report',desc:'Download phase-wise allotment data'},
      ]}/>
      case 'payments':      return <PlaceholderPanel navId="payments" items={[
        {icon:'📊',title:'Payment Dashboard',desc:'Collection summary and statistics'},
        {icon:'🔄',title:'Reconciliation',desc:'Match gateway records with applications'},
        {icon:'↩️',title:'Refund Management',desc:'Process and track refund requests'},
        {icon:'📑',title:'Payment Reports',desc:'Download detailed payment reports'},
      ]}/>
      case 'reports':       return <PlaceholderPanel navId="reports" items={[
        {icon:'📋',title:'Application Status Report',desc:'All applications with current status'},
        {icon:'🏷️',title:'Category-wise Report',desc:'Applications grouped by community'},
        {icon:'🗺️',title:'District-wise Report',desc:'Applications by candidate district'},
        {icon:'🏫',title:'College-wise Report',desc:'Seat fill status per institute'},
        {icon:'📍',title:'Exam Center Report',desc:'Candidates per exam center'},
        {icon:'💰',title:'Payment Report',desc:'Fee collection summary'},
        {icon:'🏆',title:'Merit List Report',desc:'Rank-wise merit list after exam'},
        {icon:'🪑',title:'Allotment Report',desc:'Phase-wise allotment details'},
      ]}/>
      case 'users':         return <PlaceholderPanel navId="users" items={[
        {icon:'🔑',title:'System Admin',desc:'Full access – manage all modules'},
        {icon:'🏫',title:'Principal',desc:'Institute-level data access'},
        {icon:'📝',title:'Exam Cell Staff',desc:'Exam management access only'},
        {icon:'⌨️',title:'Data Entry Operator',desc:'Application data entry access'},
      ]}/>
      case 'settings':      return <SettingsPanel/>
      default:              return <DashboardPanel/>
    }
  }

  // ── Sidebar inner ─────────────────────────────────────────────────────────
  const SideInner = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Top brand block */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5"
           style={{background:`linear-gradient(135deg,${B.g900},${B.g800})`,borderBottom:`1px solid ${B.g700}`}}>
        {/* Mini logo badge */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-md"
             style={{background:B.gold,color:B.g800,letterSpacing:0}}>
          <svg viewBox="0 0 36 36" className="w-8 h-8">
            <circle cx="18" cy="18" r="17" fill={B.g600}/>
            <rect x="14" y="19" width="8" height="10" fill={B.gold} rx="1"/>
            <rect x="11" y="16" width="14" height="4" fill={B.gold} rx="1"/>
            <rect x="11" y="7" width="3" height="11" fill={B.gold} rx="1.5"/>
            <rect x="22" y="7" width="3" height="11" fill={B.gold} rx="1.5"/>
            <rect x="15" y="8" width="2.5" height="9" fill={B.gold} rx="1.2"/>
            <rect x="18.5" y="8" width="2.5" height="9" fill={B.gold} rx="1.2"/>
            <ellipse cx="12.5" cy="7" rx="2" ry="3" fill={B.orange}/>
            <ellipse cx="23.5" cy="7" rx="2" ry="3" fill={B.orange}/>
            <ellipse cx="16" cy="8" rx="1.5" ry="2.5" fill={B.orange}/>
            <ellipse cx="20" cy="8" rx="1.5" ry="2.5" fill={B.orange}/>
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-black text-sm leading-none" style={{color:B.gold}}>TTWREIS</p>
            <p className="font-bold text-xs mt-0.5" style={{color:B.g300}}>Admin Portal</p>
          </div>
        )}
      </div>

      {/* User card */}
      {!collapsed && (
        <div className="flex-shrink-0 px-3 py-3"
             style={{background:'rgba(0,0,0,0.2)',borderBottom:`1px solid ${B.g700}`}}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                 style={{background:B.g500,color:'white'}}>
              {user?.name?.charAt(0)||'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-xs text-white truncate">{user?.name||'Administrator'}</p>
              <p className="font-semibold text-xs truncate" style={{color:B.g300}}>{user?.registrationNumber}</p>
            </div>
          </div>
          <span className="inline-block mt-1.5 text-xs font-black px-2 py-0.5 rounded-full"
                style={{background:B.gold,color:B.g800}}>
            {user?.role}
          </span>
        </div>
      )}

      {/* Nav items — overflow scroll only in the nav area */}
      <nav className="flex-1 py-2 overflow-y-auto admin-nav-scroll">
        {NAV_GROUPS.map(grp=>(
          <div key={grp.label}>
            {!collapsed && (
              <p className="px-4 pt-3.5 pb-1 text-xs font-black uppercase tracking-widest"
                 style={{color:B.g400}}>
                {grp.label}
              </p>
            )}
            {grp.items.map(item=>{
              const on = active===item.id
              return(
                <button key={item.id} type="button"
                  onClick={()=>navTo(item.id)}
                  title={collapsed?item.label:undefined}
                  className="w-full text-left text-sm font-semibold py-2.5 flex items-center gap-3
                             transition-colors duration-100 relative"
                  style={{
                    paddingLeft: collapsed?0:16,
                    paddingRight: collapsed?0:12,
                    justifyContent: collapsed?'center':'flex-start',
                    background: on?`${B.g600}`:undefined,
                    color: on?'white':B.g300,
                  }}
                  onMouseEnter={e=>{if(!on)e.currentTarget.style.background='rgba(255,255,255,0.07)'}}
                  onMouseLeave={e=>{if(!on)e.currentTarget.style.background='transparent'}}>
                  {on && <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r"
                               style={{background:B.gold}}/>}
                  <span className="text-base flex-shrink-0 leading-none">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {on && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:B.gold}}/>}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        ))}
        {/* Bottom padding so last items aren't hidden behind logout */}
        <div className="h-2"/>
      </nav>

      {/* Logout — always visible at bottom, never scrolls away */}
      <div className="flex-shrink-0 p-3" style={{borderTop:`1px solid ${B.g700}`}}>
        <button type="button" onClick={handleLogout}
          title={collapsed?'Logout':undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold
                     transition-colors hover:bg-red-900/40"
          style={{color:'#ef9a9a',justifyContent:collapsed?'center':'flex-start'}}>
          <span className="text-base flex-shrink-0 leading-none">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{background:'#f0f4f0'}}>

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 h-full transition-all duration-300 overflow-hidden
        ${collapsed?'w-[60px]':'w-[230px]'}`}
        style={{background:`linear-gradient(180deg,${B.g800} 0%,${B.g700} 40%,${B.g600} 100%)`}}>
        <SideInner/>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-60 flex-shrink-0 flex flex-col h-full"
               style={{background:`linear-gradient(180deg,${B.g800},${B.g600})`}}>
            <SideInner/>
          </div>
          <div className="flex-1" style={{background:'rgba(0,0,0,0.55)'}}
               onClick={()=>setMobileOpen(false)}/>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header bar — full brand gradient matching portal header */}
        <header className="flex-shrink-0 flex items-center gap-3 px-4"
                style={{
                  minHeight:52,
                  background:`linear-gradient(135deg,${B.g800} 0%,${B.g600} 60%,${B.g500} 100%)`,
                  boxShadow:'0 2px 12px rgba(0,0,0,0.3)',
                }}>
          {/* Gold top strip */}
          <div className="absolute top-0 left-0 right-0 h-[3px]"
               style={{background:`linear-gradient(90deg,${B.gold},${B.orange},${B.gold})`}}/>

          {/* Mobile hamburger */}
          <button type="button" onClick={()=>setMobileOpen(true)}
            className="md:hidden text-white p-1 rounded flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          {/* Desktop collapse */}
          <button type="button" onClick={()=>setCollapsed(c=>!c)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg
                       text-white hover:bg-white/15 transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d={collapsed?"M9 5l7 7-7 7":"M15 19l-7-7 7-7"}/>
            </svg>
          </button>

          {/* Current page crumb */}
          <div className="flex-1 min-w-0 flex items-center gap-2 py-3">
            <span className="text-xl leading-none flex-shrink-0">{activeItem?.icon}</span>
            <div className="min-w-0">
              <p className="font-black text-sm text-white truncate leading-tight">{activeItem?.label}</p>
              <p className="text-xs font-semibold hidden sm:block" style={{color:B.g300}}>
                TTWREIS · Admin Panel · 2025-26
              </p>
            </div>
          </div>

          {/* User badge */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full flex-shrink-0"
               style={{background:'rgba(255,255,255,0.1)',border:`1px solid rgba(255,214,0,0.3)`}}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
                 style={{background:B.g500,color:'white'}}>
              {user?.name?.charAt(0)||'A'}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-black text-white leading-none truncate max-w-28">{user?.name}</p>
              <p className="text-xs font-bold leading-none mt-0.5" style={{color:B.gold}}>{user?.role}</p>
            </div>
          </div>
        </header>

        {/* Gold + orange accent strip under header */}
        <div className="flex-shrink-0" style={{height:3,background:`linear-gradient(90deg,${B.gold},${B.orange},${B.gold})`}}/>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderPanel()}
        </main>
      </div>
    </div>
  )
}
