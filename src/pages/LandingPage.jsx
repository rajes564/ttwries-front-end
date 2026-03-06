import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import RegistrationModal from '../components/auth/RegistrationModal';
import Header from '../components/common/Header';
import NotificationScroller from '../components/common/NotificationScroller';

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function genCaptcha() {
  return Array.from({length:5},()=>CAPTCHA_CHARS[Math.floor(Math.random()*CAPTCHA_CHARS.length)]).join('');
}

const TIMELINE = [
  { step:1, title:'Notification Released', date:'01 Feb 2025', status:'done' },
  { step:2, title:'Online Registration Portal Opened', date:'10 Feb 2025', status:'done' },
  { step:3, title:'Application Form Submission with Fee Payment', date:'10 Feb – 31 Mar 2025', status:'active', note:'Ongoing' },
  { step:4, title:'Hall Ticket / Admit Card Download', date:'From 10 Apr 2025', status:'upcoming' },
  { step:5, title:'Entrance Examination (V-CET 2025)', date:'20 Apr 2025 | 10AM–1PM', status:'upcoming' },
  { step:6, title:'Provisional Answer Key Release', date:'25 Apr 2025', status:'upcoming' },
  { step:7, title:'Result Declaration & Merit List', date:'01 May 2025', status:'upcoming' },
  { step:8, title:'Phase-1 Seat Allotment', date:'05 May 2025', status:'upcoming' },
  { step:9, title:'Fee Payment & Seat Confirmation (Phase-1)', date:'06–15 May 2025', status:'upcoming' },
  { step:10, title:'Phase-2 Seat Allotment (Vacancies)', date:'20 May 2025', status:'upcoming' },
  { step:11, title:'Reporting & Joining at Allotted College', date:'01 Jun 2025', status:'upcoming' },
  { step:12, title:'Commencement of Classes 2025-26', date:'10 Jun 2025', status:'upcoming' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showRegModal, setShowRegModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [captcha, setCaptcha] = useState(genCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   if (!username.trim() || !password.trim()) { toast.error('Please enter username and password'); return; }
  //   if (captchaInput.toUpperCase() !== captcha) { toast.error('Incorrect CAPTCHA. Please try again.'); setCaptcha(genCaptcha()); setCaptchaInput(''); return; }
  //   setLoading(true);
  //   try {
  //     const user = await login(username, password);
  //     toast.success(`Welcome, ${user.name || user.username}!`);
  //     navigate('/admin');
  //     // if (user.role === 'ADMIN') navigate('/admin');
  //     // else navigate('/applicant');
  //   } catch(err) {
  //     toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
  //     setCaptcha(genCaptcha()); setCaptchaInput('');
  //   } finally { setLoading(false); }
  // };



    /****
   *
   * handleLogin
   *
   *
   *
   */

  const handleLogin = async (loginData) => {
    console.log("Handle Login was called...");
      
    if (!username.trim() || !password.trim()) { toast.error('Please enter username and password'); return; }
      setLoading(true);
    try {
      // const hashedPassword = await hashInput(loginData.password.trim()).then(
      //   (data) => {
      //     return data;
      //   }
      // );
      // const saltedHashedPassword = await hashInput(salt + hashedPassword).then(
      //   (data) => {
      //     return data;
      //   }
      // );

      const loginPayload = {
        username:username,
        password:password
      };

      // const response = await authService.login(loginData);
      // const response = await axios.post(`${API_URL}`, loginData);
      const response = await axios.post(`${SPRING_URL}/api/auth/login`, loginPayload);
      //  console.log("Full Response:", response); // Add this line to log full response
      toast.success(`Welcome, ${user.name || user.username}!`);
      console.log(response);
            if (user.role === 'ADMIN') navigate('/admin');
                else navigate('/applicant');
    //  if (!response.data.success) {
     //   setIsLoading(false);
        //if fails
        // First-time login specific check
        // if (response.status === 400 && response.data.message === "YES") {
        //   console.log("FIRST TIME LOGIN DETECTED");
        //   // console.log("Response Details:", response);
        //   //reset the login Data to default
        //   setLoginData((prevData) => ({
        //     ...prevData,
        //     password: "",
        //     captcha: "",
        //   }));
        //   setShowPasswordChangeForm(true);
        //   //setErr("First-time login detected. Please change your password.");

        //   return;
        // }
        // if (
        //   response.status === 400 &&
        //   response.data.message === "YES-EXPIRED"
        // ) {
        //   console.log("Password expired");
        //   // console.log("Response Details:", response);
        //   setIsPasswordExpired(true);
        //   setShowPasswordChangeForm(true);

        //   //reset the login Data to default
        //   setLoginData((prevData) => ({
        //     ...prevData,
        //     password: "",
        //     captcha: "",
        //   }));
        //   // setErr("First-time login detected. Please change your password.");
        //   return;
        // }

        // setErr(response.data.message);
    //  }
      console.table(response);


    } catch (error) {
      console.log("In catch block...");
      console.log("Error:", error);
      console.error("FULL LOGIN ERROR:", error);

    //   // Comprehensive error logging
    //   if (error.response) {
    //     console.log("Error Response Status:", error.response.status);
    //     console.log("Error Response Data:", error.response.data);
    //     setIsLoading(false);

    //     if (!error.response.data.success) {
    //       //if fails
    //       // First-time login specific check
    //       if (
    //         error.response.status === 400 &&
    //         error.response.data.message === "YES"
    //       ) {
    //         console.log("FIRST TIME LOGIN DETECTED");
    //         //   console.log("Response Details:", error.response);
    //         setShowPasswordChangeForm(true);
    //         setLoginData((prevData) => ({
    //           ...prevData,
    //           password: "",
    //           captcha: "",
    //         }));
    //         return;
    //       }
    //       if (
    //         error.response.status === 400 &&
    //         error.response.data.message === "YES-EXPIRED"
    //       ) {
    //         console.log("Password expired");
    //         //    console.log("Response Details:", error.response);
    //         setIsPasswordExpired(true);
    //         setShowPasswordChangeForm(true);
    //         setLoginData((prevData) => ({
    //           ...prevData,
    //           password: "",
    //           captcha: "",
    //         }));
    //         return;
    //       }
    //       if (
    //         error.response.status === 400 &&
    //         error.response.data.message === "NIC-YES"
    //       ) {
    //         console.log("nic user.....Password expired....");
    //         // console.log("Response Details:", error.response);
    //         setIsNicUserFirstTimeLogin(true);
    //         // setIsPasswordExpired(true);
    //         setShowPasswordChangeForm(true);
    //         setLoginData((prevData) => ({
    //           ...prevData,
    //           password: "",
    //           captcha: "",
    //         }));
    //         return;
    //       }
    //       if (
    //         error.response.status === 400 &&
    //         error.response.data.message === "YES-EXPIRED-NIC"
    //       ) {
    //         console.log("nic user.....Password expired ....yahh");
    //         //   console.log("Response Details:", error.response);

    //         setIsPasswordExpired(true);
    //         setIsNicUserPasswordExpired(true);
    //         setShowPasswordChangeForm(true);
    //         setLoginData((prevData) => ({
    //           ...prevData,
    //           password: "",
    //           captcha: "",
    //         }));
    //         return;
    //       }

    //       if (
    //         error.response.status === 400 &&
    //         error.response.data.message === "Invalid captcha"
    //       ) {
    //         console.log("Invalid Captcha");
    //         console.log("Response Details:", error.response);

    //         setLoginData((prevData) => ({
    //           ...prevData,
    //           captcha: "",
    //         }));
    //         console.log("data datata......", error.response.data.data);
    //         setErr(error.response.data.message);
    //         setReCaptcha(error.response.data.data);
    //         //   onSaltChange
    //         return;
    //       }

    //       setErr(error.response.data.message);
    //     }
    //   }

    //   // Generic error handling
    //   const errorMessage =
    //     error.response?.data?.message ||
    //     error.message ||
    //     "Login failed. Please try again.";

    //   setErr(errorMessage);
     }
  };

    const submitHandler = async (e) => {
    e.preventDefault();
    console.log("Submit handler is called...");

      setIsLoading(true);
      await handleLogin(loginData);
    
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <NotificationScroller />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">

        {/* LEFT: Timeline */}
        <div className="card overflow-hidden">
          <div className="section-header flex items-center gap-2">
            <span>🗓️</span> Admission Process Timeline — V-CET 2025
          </div>
          <div className="p-5">
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-700 via-accent-500 to-gray-300" />
              <div className="space-y-5">
                {TIMELINE.map((item) => (
                  <div key={item.step} className="relative">
                    {/* Dot */}
                    <div className={`absolute -left-5 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ring-4 ring-white
                      ${item.status==='done' ? 'bg-primary-700 text-white' : item.status==='active' ? 'bg-accent-500 text-white animate-pulse' : 'bg-gray-300 text-gray-500'}`}>
                      {item.status==='done' ? '✓' : item.step}
                    </div>
                    <div>
                      <p className={`text-sm font-bold leading-tight ${item.status==='active' ? 'text-accent-600' : 'text-gray-800'}`}>{item.title}</p>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">📅 {item.date}</p>
                      {item.status==='done' && <span className="inline-block text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full mt-1">✓ Completed</span>}
                      {item.status==='active' && <span className="inline-block text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full mt-1 animate-pulse">🔴 {item.note || 'Ongoing'}</span>}
                      {item.status==='upcoming' && <span className="inline-block text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full mt-1">Upcoming</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Login + Quick Links */}
        <div className="flex flex-col gap-5">

          {/* Login Card */}
          <div className="card overflow-hidden">
            <div className="section-header flex items-center gap-2">
              <span>🔐</span> Candidate / Staff Login
            </div>
            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-xs text-amber-800 font-semibold leading-relaxed">
                <strong>ℹ️ Login Info:</strong> Use your <strong>Application Number</strong> as Username. Default password is your <strong>Date of Birth (DD-MM-YYYY)</strong>. Admin/Staff use assigned credentials.
              </div>

              <form onSubmit={submitHandler} className="space-y-4">
                <div>
                  <label className="form-label">Username / Application No.</label>
                  <input className="form-input" type="text" placeholder="Enter username or App. No."
                    value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input className="form-input pr-10" type={showPw?'text':'password'} placeholder="DD-MM-YYYY (candidates)"
                      value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" />
                    <button type="button" onClick={()=>setShowPw(v=>!v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm">
                      {showPw?'🙈':'👁️'}
                    </button>
                  </div>
                  <p className="text-xs text-amber-600 font-semibold mt-1">Default: Date of Birth (DD-MM-YYYY)</p>
                </div>

                {/* CAPTCHA */}
                <div>
                  <label className="form-label">Security Code (CAPTCHA)</label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-shrink-0 w-32 h-11 bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-primary-300 rounded-lg flex items-center justify-center cursor-pointer select-none relative overflow-hidden"
                      onClick={()=>{setCaptcha(genCaptcha());setCaptchaInput('');}}>
                      <div className="absolute inset-0 opacity-10" style={{backgroundImage:'repeating-linear-gradient(45deg,#1e5e3d 0,#1e5e3d 1px,transparent 0,transparent 50%)',backgroundSize:'6px 6px'}} />
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-primary-400 opacity-40 -rotate-2" />
                      <span className="text-xl font-black tracking-[8px] text-primary-800 font-mono relative z-10" style={{letterSpacing:'6px'}}>{captcha}</span>
                    </div>
                    <button type="button" onClick={()=>{setCaptcha(genCaptcha());setCaptchaInput('');}}
                      className="w-10 h-11 border-2 border-gray-300 rounded-lg flex items-center justify-center text-primary-700 hover:bg-green-50 hover:border-primary-400 transition-all">🔄</button>
                    <input className="form-input flex-1" type="text" placeholder="Enter code" maxLength={5}
                      value={captchaInput} onChange={e=>setCaptchaInput(e.target.value.toUpperCase())} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <><span className="animate-spin">⏳</span> Verifying...</> : <>🔐 Login to Portal</>}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400 font-semibold">OR</span></div>
              </div>

              <button onClick={()=>setShowRegModal(true)} className="btn-secondary w-full flex items-center justify-center gap-2">
                📝 New Candidate Registration
              </button>

              <p className="text-center text-xs text-gray-400 font-semibold mt-4">
                <a href="#" className="text-primary-700 font-bold hover:underline">Forgot Password?</a>
                &nbsp;|&nbsp;
                <a href="#" className="text-primary-700 font-bold hover:underline">Contact Helpdesk</a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card p-4">
            <p className="text-xs font-black text-primary-800 uppercase tracking-wide mb-3">📎 Quick Links</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                {icon:'📄',label:'Notification PDF',bg:'bg-green-50',border:'border-green-200',text:'text-green-800'},
                {icon:'📋',label:'Prospectus',bg:'bg-amber-50',border:'border-amber-200',text:'text-amber-800'},
                {icon:'🏫',label:'College List',bg:'bg-pink-50',border:'border-pink-200',text:'text-pink-800'},
                {icon:'📞',label:'Helpdesk',bg:'bg-purple-50',border:'border-purple-200',text:'text-purple-800'},
              ].map(l=>(
                <a key={l.label} href="#" className={`flex items-center gap-2 ${l.bg} border ${l.border} ${l.text} rounded-lg p-2.5 text-xs font-bold hover:opacity-80 transition-all`}>
                  {l.icon} {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-primary-900 to-primary-800 text-white mt-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-8 border-b border-white/10">
          <div>
            <h4 className="text-amber-300 font-black text-xs uppercase tracking-wider mb-3">About TTWREIS</h4>
            <p className="text-xs text-white/70 leading-relaxed font-medium">
              TTWREIS is committed to providing quality residential education to tribal students across Telangana under the Tribal Welfare Department, Government of Telangana.
            </p>
          </div>
          <div>
            <h4 className="text-amber-300 font-black text-xs uppercase tracking-wider mb-3">Important Links</h4>
            <ul className="space-y-1">
              {['Admission Notification','Application Guidelines','Reservation Policy','Fee Structure','FAQ'].map(l=>(
                <li key={l}><a href="#" className="text-xs text-white/70 hover:text-amber-300 font-semibold transition-colors">› {l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-amber-300 font-black text-xs uppercase tracking-wider mb-3">Contact</h4>
            <p className="text-xs text-white/70 leading-relaxed font-medium">
              <strong className="text-amber-300">TTWREIS Head Office</strong><br/>
              Masab Tank, Hyderabad – 500028<br/>
              📞 040-23450678<br/>
              📧 admissions@ttwreis.telangana.gov.in
            </p>
          </div>
        </div>
        <div className="text-center py-3 text-xs text-white/50 font-medium">
          © 2025 <strong className="text-amber-300">TTWREIS</strong> — Telangana Tribal Welfare Residential Educational Institutions Society | Government of Telangana
        </div>
      </footer>

      {/* Registration Modal */}
      {showRegModal && <RegistrationModal onClose={()=>setShowRegModal(false)} />}
    </div>
  );
}
