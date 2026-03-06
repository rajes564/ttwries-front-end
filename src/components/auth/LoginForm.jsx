import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const genCaptcha = () => Array.from({length:5}, () => chars[Math.floor(Math.random()*chars.length)]).join('');

export default function LoginForm({ onRegisterClick }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [captchaCode, setCaptchaCode] = useState(genCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = () => { setCaptchaCode(genCaptcha()); setCaptchaInput(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) { toast.warn('⚠️ Please enter User ID and Password.'); return; }
    if (captchaInput.toUpperCase() !== captchaCode) { toast.error('❌ Incorrect CAPTCHA. Please try again.'); refreshCaptcha(); return; }

    setLoading(true);
    try {
      const res = await authAPI.login({ username: userId, password });
      const { token, user } = res.data;
      login(user, token);
      toast.success(`✅ Welcome, ${user.name}!`);
      if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/applicant');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(`❌ ${msg}`);
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-semibold">
        <strong>ℹ️ Login:</strong> Candidates use Registration Number as User ID. Default password is Date of Birth (DD-MM-YYYY). Admin/Staff use assigned credentials.
      </div>

      <div>
        <label className="form-label">User ID / Registration Number</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter your User ID or Registration Number"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          autoComplete="username"
        />
      </div>

      <div>
        <label className="form-label">Password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            className="form-input pr-10"
            placeholder="Enter password (Candidates: DD-MM-YYYY)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button type="button" onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-700 transition-colors">
            {showPw ? <EyeOff size={17}/> : <Eye size={17}/>}
          </button>
        </div>
        <p className="text-xs text-saffron-500 font-semibold mt-1">Default password: Date of Birth (DD-MM-YYYY)</p>
      </div>

      {/* CAPTCHA */}
      <div>
        <label className="form-label">Enter CAPTCHA *</label>
        <div className="flex gap-2 items-center">
          <div
            className="flex-shrink-0 w-32 h-11 rounded-lg border border-gray-300 flex items-center justify-center relative overflow-hidden cursor-pointer select-none"
            style={{ background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)' }}
            onClick={refreshCaptcha} title="Click to refresh"
          >
            <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(26,107,46,0.05) 2px,rgba(26,107,46,0.05) 4px)' }}/>
            <div className="absolute" style={{ top:'40%', left:0, right:0, height:2, background:'rgba(26,107,46,0.2)', transform:'rotate(-3deg)' }}/>
            <span className="font-black text-xl text-primary-700 z-10 tracking-widest" style={{ fontFamily:'Courier New, monospace', transform:'skewX(-5deg)' }}>{captchaCode}</span>
          </div>
          <button type="button" onClick={refreshCaptcha} className="h-11 w-10 border border-gray-300 rounded-lg flex items-center justify-center text-primary-700 hover:bg-primary-50" title="Refresh">🔄</button>
          <input
            type="text" className="form-input flex-1"
            placeholder="Enter code" maxLength={5}
            value={captchaInput}
            onChange={e => setCaptchaInput(e.target.value.toUpperCase())}
            style={{ textTransform: 'uppercase', letterSpacing: 4 }}
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? (
          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Logging in...</>
        ) : (
          <><LogIn size={16}/> Login to Portal</>
        )}
      </button>

      <div className="text-center text-xs text-gray-500 font-semibold">
        <a href="#" className="text-primary-700 hover:underline">Forgot password?</a>
        {' '}&nbsp;|&nbsp;{' '}
        <a href="#" className="text-primary-700 hover:underline">Help / Support</a>
      </div>

      <div className="border-t pt-3">
        <button type="button" onClick={onRegisterClick} className="btn-secondary w-full flex items-center justify-center gap-2">
          📝 New Candidate Registration
        </button>
      </div>
    </form>
  );
}
