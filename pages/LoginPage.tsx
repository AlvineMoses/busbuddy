import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockData';
import { Eye, EyeOff, ArrowLeft, ChevronRight, Check, Shield, User as UserIcon, Building2, MessageSquare, Smartphone, Bell, Mail } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

type AuthView = 'LOGIN' | 'FORGOT' | 'CHECK_EMAIL' | 'CODE' | 'RESET';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [recoveryMethod, setRecoveryMethod] = useState<'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP'>('EMAIL');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  // Demo Login Handler
  const handleDemoLogin = (user: User) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin(user);
    }, 800);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login - for this demo, just log in as Super Admin if fields are filled
    setTimeout(() => {
      if (email && password) {
        onLogin(MOCK_USERS[0]);
      } else {
        setIsLoading(false);
        alert("Please enter email and password (or use Demo buttons below)");
      }
    }, 1000);
  };

  // Render Functions for different views
  const renderLogin = () => (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
           <div className="w-8 h-8 bg-brand-black rounded-full flex items-center justify-center text-white text-xs font-bold">BB</div>
        </div>
        <h2 className="text-3xl font-bold text-brand-black mb-2">Login to your account</h2>
        <p className="text-gray-500 text-sm">Unlock Your Progress - Securely Access Your Dashboard!</p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Email Address <span className="text-red-500">*</span></label>
          <input 
            type="email" 
            placeholder="name@school.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ff3600] focus:border-[#ff3600] outline-none transition-all font-medium placeholder:text-gray-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ff3600] focus:border-[#ff3600] outline-none transition-all font-medium placeholder:text-gray-300 pr-12"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-black focus:ring-[#ff3600]" />
            <span className="text-sm font-medium text-gray-500">Remember for 30 days</span>
          </label>
          <button 
            type="button" 
            onClick={() => setView('FORGOT')}
            className="text-sm font-bold text-[#ff3600] hover:text-[#d12e00]"
          >
            Forgot password
          </button>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-[#ff3600] hover:bg-[#d12e00] text-white rounded-full font-bold text-base shadow-lg shadow-[#ff3600]/20 transition-all active:scale-[0.98] flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : 'Sign In'}
        </button>

        <button type="button" className="w-full py-4 bg-white border border-gray-200 text-brand-black rounded-full font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
      </form>

      {/* Demo Credentials Section */}
      <div className="pt-4 border-t border-gray-100">
        <p className="text-center text-sm font-medium text-gray-500 mb-6">
          Don't have an account? <span className="text-[#ff3600] font-bold cursor-pointer hover:underline">Sign up</span>
        </p>
        
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Or Quick Access (Demo)</p>
        <div className="grid grid-cols-3 gap-3">
          {MOCK_USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => handleDemoLogin(u)}
              className="flex flex-col items-center justify-center gap-2 w-full p-4 rounded-3xl bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${
                u.role === 'SUPER_ADMIN' ? 'bg-brand-black' : u.role === 'ADMIN' ? 'bg-brand-green' : 'bg-brand-amber'
              }`}>
                {u.role === 'SUPER_ADMIN' ? <Shield size={16}/> : u.role === 'ADMIN' ? <UserIcon size={16}/> : <Building2 size={16}/>}
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-brand-black">{u.name.split(' ')[0]}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase">{u.role === 'SUPER_ADMIN' ? 'Super' : u.role === 'SCHOOL_ADMIN' ? 'School' : 'Admin'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderForgot = () => (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
           <div className="w-8 h-8 bg-brand-black rounded-full flex items-center justify-center text-white text-xs font-bold">BB</div>
        </div>
        <h2 className="text-3xl font-bold text-brand-black mb-2">Forgot Password?</h2>
        <p className="text-gray-500 text-sm">Select a recovery method to receive your code.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={() => setRecoveryMethod('EMAIL')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${recoveryMethod === 'EMAIL' ? 'border-[#ff3600] bg-[#ff3600]/5 text-[#ff3600]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
                <Mail size={24} />
                <span className="text-xs font-bold uppercase tracking-wide">Email</span>
            </button>
            <button 
                onClick={() => setRecoveryMethod('SMS')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${recoveryMethod === 'SMS' ? 'border-[#ff3600] bg-[#ff3600]/5 text-[#ff3600]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
                <MessageSquare size={24} />
                <span className="text-xs font-bold uppercase tracking-wide">Text / SMS</span>
            </button>
            <button 
                onClick={() => setRecoveryMethod('WHATSAPP')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${recoveryMethod === 'WHATSAPP' ? 'border-[#ff3600] bg-[#ff3600]/5 text-[#ff3600]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
                <Smartphone size={24} />
                <span className="text-xs font-bold uppercase tracking-wide">WhatsApp</span>
            </button>
            <button 
                onClick={() => setRecoveryMethod('IN_APP')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${recoveryMethod === 'IN_APP' ? 'border-[#ff3600] bg-[#ff3600]/5 text-[#ff3600]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
                <Bell size={24} />
                <span className="text-xs font-bold uppercase tracking-wide">In-App</span>
            </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-black uppercase tracking-wide">
            {recoveryMethod === 'EMAIL' ? 'Email Address' : recoveryMethod === 'IN_APP' ? 'Username / Email' : 'Phone Number'} <span className="text-red-500">*</span>
          </label>
          <input 
            type={recoveryMethod === 'EMAIL' ? 'email' : 'text'}
            placeholder={recoveryMethod === 'EMAIL' ? "name@school.com" : "+1 234 567 890"}
            value={recoveryMethod === 'EMAIL' ? email : phone}
            onChange={(e) => recoveryMethod === 'EMAIL' ? setEmail(e.target.value) : setPhone(e.target.value)}
            className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ff3600] focus:border-[#ff3600] outline-none transition-all font-medium placeholder:text-gray-300"
          />
        </div>

        <button 
          onClick={() => {
             if ((recoveryMethod === 'EMAIL' && email) || (recoveryMethod !== 'EMAIL' && phone)) {
                 setView('CHECK_EMAIL'); 
             } else {
                 alert("Please enter your details");
             }
          }}
          className="w-full py-4 bg-[#ff3600] hover:bg-[#d12e00] text-white rounded-full font-bold text-base shadow-lg shadow-[#ff3600]/20 transition-all active:scale-[0.98]"
        >
          Send Recovery Code
        </button>

        <button 
          onClick={() => setView('LOGIN')}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-black transition-colors"
        >
          <ArrowLeft size={16} /> Back to login
        </button>
      </div>
    </div>
  );

  const renderCheckEmail = () => (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
           <div className="w-8 h-8 bg-brand-black rounded-full flex items-center justify-center text-white text-xs font-bold">BB</div>
        </div>
        <h2 className="text-3xl font-bold text-brand-black mb-2">Check your {recoveryMethod === 'EMAIL' ? 'email' : 'device'}</h2>
        <p className="text-gray-500 text-sm">
            We sent a code to <span className="text-brand-black font-bold">{recoveryMethod === 'EMAIL' ? email : phone}</span> via {recoveryMethod.toLowerCase().replace('_', '-')}.
        </p>
      </div>

      <div className="space-y-6">
        <button 
          onClick={() => setView('CODE')}
          className="w-full py-4 bg-[#ff3600] hover:bg-[#d12e00] text-white rounded-full font-bold text-base shadow-lg shadow-[#ff3600]/20 transition-all active:scale-[0.98]"
        >
          Enter the code Manually
        </button>

        <button 
          onClick={() => setView('LOGIN')}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-black transition-colors"
        >
          <ArrowLeft size={16} /> Back to login
        </button>
      </div>
    </div>
  );

  const renderCode = () => (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
           <div className="w-8 h-8 bg-brand-black rounded-full flex items-center justify-center text-white text-xs font-bold">BB</div>
        </div>
        <h2 className="text-3xl font-bold text-brand-black mb-2">Enter the code</h2>
        <p className="text-gray-500 text-sm">Unlock Your Account: Enter the Code to Regain Control!</p>
      </div>

      <div className="space-y-8">
        <div className="flex gap-3 justify-between">
           {otp.map((digit, idx) => (
             <input
               key={idx}
               id={`otp-${idx}`}
               type="text"
               maxLength={1}
               value={digit}
               onChange={(e) => handleOtpChange(idx, e.target.value)}
               className="w-14 h-14 text-center text-2xl font-bold text-[#ff3600] border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#ff3600] focus:border-[#ff3600] outline-none transition-all bg-white"
             />
           ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => alert("Code resent!")}
              className="w-full py-4 bg-white border border-gray-200 text-brand-black rounded-full font-bold text-base hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              Resend
            </button>
            <button 
              onClick={() => setView('RESET')}
              className="w-full py-4 bg-[#ff3600] hover:bg-[#d12e00] text-white rounded-full font-bold text-base shadow-lg shadow-[#ff3600]/20 transition-all active:scale-[0.98]"
            >
              Verify
            </button>
        </div>

        <button 
          onClick={() => setView('LOGIN')}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-black transition-colors"
        >
          <ArrowLeft size={16} /> Back to login
        </button>
      </div>
    </div>
  );

  const renderReset = () => (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
           <div className="w-8 h-8 bg-brand-black rounded-full flex items-center justify-center text-white text-xs font-bold">BB</div>
        </div>
        <h2 className="text-3xl font-bold text-brand-black mb-2">Reset Password</h2>
        <p className="text-gray-500 text-sm">Enter your new secure password.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-black uppercase tracking-wide">New Password <span className="text-red-500">*</span></label>
          <input 
            type="password" 
            className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ff3600] focus:border-[#ff3600] outline-none transition-all font-medium placeholder:text-gray-300"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Confirm Password <span className="text-red-500">*</span></label>
          <input 
            type="password" 
            className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ff3600] focus:border-[#ff3600] outline-none transition-all font-medium placeholder:text-gray-300"
          />
        </div>

        <button 
          onClick={() => {
             alert("Password Reset Successfully!");
             setView('LOGIN');
          }}
          className="w-full py-4 bg-[#ff3600] hover:bg-[#d12e00] text-white rounded-full font-bold text-base shadow-lg shadow-[#ff3600]/20 transition-all active:scale-[0.98]"
        >
          Confirm Reset
        </button>

        <button 
          onClick={() => setView('LOGIN')}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-black transition-colors"
        >
          <ArrowLeft size={16} /> Back to login
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white font-urbanist">
       {/* Left Section - Auth Forms */}
       <div className="w-full lg:w-1/2 p-8 lg:p-12 xl:p-24 flex flex-col justify-center relative z-10 overflow-y-auto">
          {view === 'LOGIN' && renderLogin()}
          {view === 'FORGOT' && renderForgot()}
          {view === 'CHECK_EMAIL' && renderCheckEmail()}
          {view === 'CODE' && renderCode()}
          {view === 'RESET' && renderReset()}
       </div>

       {/* Right Section - Marketing/Image */}
       <div className="hidden lg:block w-1/2 relative bg-gray-100 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
             <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop" 
                className="w-full h-full object-cover" 
                alt="Workspace"
             />
             <div className="absolute inset-0 bg-brand-black/20 mix-blend-multiply"></div>
          </div>

          {/* Floating Pill - Top Left */}
          <div className="absolute top-12 left-12 bg-black/40 backdrop-blur-md rounded-full pl-6 pr-2 py-2 flex items-center gap-4 text-white border border-white/10 shadow-2xl animate-in slide-in-from-top-8 duration-700">
             <span className="font-bold tracking-wide">Bus Buddy</span>
             <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ChevronRight size={16} />
             </div>
          </div>

          {/* Join Badge - Top Right */}
          <div className="absolute top-12 right-12 bg-black/40 backdrop-blur-md rounded-[2rem] p-3 pr-8 flex items-center gap-4 border border-white/10 shadow-2xl animate-in slide-in-from-right-8 duration-700 delay-100">
             <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                   <img key={i} src={`https://picsum.photos/10${i}`} className="w-10 h-10 rounded-full border-2 border-gray-800" />
                ))}
             </div>
             <div>
                <p className="text-white font-bold text-sm">Join With 20k+ Users!</p>
                <p className="text-gray-300 text-[10px]">Let's see our happy customer</p>
             </div>
          </div>

          {/* Testimonial Card - Bottom */}
          <div className="absolute bottom-12 left-12 right-12 bg-black/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-12 duration-1000">
             <div className="flex items-center gap-4 mb-6">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop" className="w-14 h-14 rounded-full object-cover border-2 border-white/20" />
                <div>
                   <h4 className="text-xl font-bold text-white">Riaot Escanor</h4>
                   <p className="text-gray-400 text-sm">Project Manager at Google</p>
                </div>
             </div>
             <p className="text-gray-200 text-lg font-light leading-relaxed mb-8">
                “ I Landed Multiple Projects Within A Couple Of Days - With This Tool. Definitely My Go To Freelance Platform Now! “
             </p>
             <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
             </div>
          </div>
       </div>
    </div>
  );
};