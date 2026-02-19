import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types';
import { Eye, EyeOff, ArrowLeft, ChevronRight, Shield, User as UserIcon, Building2, MessageSquare, Smartphone, Bell, Mail, AlertCircle, CheckCircle, GraduationCap, Briefcase } from 'lucide-react';
import { useTheme } from '../src/hooks/useTheme';
import { ThemedInput, ThemedButton, ThemedLink, ThemedLogo, ThemedPlatformName } from '../src/components/ThemedComponents';
import { getUploadedFileUrl } from '../src/services/fileUploadService';
import { authService } from '../src/services/AuthService';
import type { OtpChannel, OtpChannelOptions, LoginResponse } from '../src/services/AuthService';
import { PhoneInput } from '../src/components/PhoneInput';

interface LoginPageProps {
 onLogin: (user: User) => void;
}

type AuthView = 'LOGIN' | 'FORGOT' | 'CHOOSE_CHANNEL' | 'CHECK_EMAIL' | 'CODE' | 'RESET' | 'SUCCESS' | 'SIGNUP_CHOICE' | 'SIGNUP_FORM' | 'SIGNUP_OTP' | 'CREATE_PASSWORD';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
 // SMART DATA-FLOW: Read settings from Redux store (single source of truth)
 const { colors, platformName, loginHeroImage, testimonials, featureFlags, settings } = useTheme();
 
 const [view, setView] = useState<AuthView>('LOGIN');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [otp, setOtp] = useState(['', '', '', '', '']);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState('');

 // Flow type discriminator: 'forgot' for password reset, 'login' for login OTP, 'signup' for registration
 const [flowType, setFlowType] = useState<'forgot' | 'login' | 'signup'>('forgot');

 // Forgot password flow state
 const [otpToken, setOtpToken] = useState('');
 const [otpOptions, setOtpOptions] = useState<OtpChannelOptions | null>(null);
 const [otpChannelToken, setOtpChannelToken] = useState('');
 const [selectedChannel, setSelectedChannel] = useState<OtpChannel>('EMAIL');
 const [sentViaChannel, setSentViaChannel] = useState<string>('email');
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [showNewPassword, setShowNewPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);

 // OTP UX improvements
 const [otpStatus, setOtpStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
 const [resendCooldown, setResendCooldown] = useState(0);

 // Signup flow state
 const [signupType, setSignupType] = useState<'school' | 'company' | null>(null);
 const [signupData, setSignupData] = useState({ schoolName: '', email: '', adminName: '', adminPhone: '' });

 // Resend cooldown timer
 useEffect(() => {
 if (resendCooldown > 0) {
 const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
 return () => clearTimeout(timer);
 }
 }, [resendCooldown]);

 // Auto-verify OTP when all 5 digits are entered
 const autoVerifyTriggered = useRef(false);
 useEffect(() => {
 const code = otp.join('');
 if (code.length === 5 && otpStatus === 'idle' && !autoVerifyTriggered.current) {
 autoVerifyTriggered.current = true;
 handleAutoVerifyOtp();
 }
 }, [otp, otpStatus]);

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
 if (otpStatus !== 'idle') return; // Block input during verify/animation
 const newOtp = [...otp];
 newOtp[index] = value;
 setOtp(newOtp);
 
 // Auto-focus next input
 if (value && index < 4) {
 const nextInput = document.getElementById(`otp-${index + 1}`);
 nextInput?.focus();
 }
 };

 const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
 if (e.key === 'Backspace' && !otp[index] && index > 0) {
 const prevInput = document.getElementById(`otp-${index - 1}`);
 prevInput?.focus();
 }
 };

 const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
 e.preventDefault();
 const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
 if (pasted.length > 0) {
 const newOtp = [...otp];
 pasted.split('').forEach((char, i) => { newOtp[i] = char; });
 setOtp(newOtp);
 const focusIdx = Math.min(pasted.length, 4);
 document.getElementById(`otp-${focusIdx}`)?.focus();
 }
 };

 const resetForgotState = () => {
 setOtp(['', '', '', '', '']);
 setOtpToken('');
 setOtpOptions(null);
 setOtpChannelToken('');
 setNewPassword('');
 setConfirmPassword('');
 setError('');
 setSentViaChannel('email');
 setFlowType('forgot');
 setOtpStatus('idle');
 autoVerifyTriggered.current = false;
 };

 const resetSignupState = () => {
 setSignupData({ schoolName: '', email: '', adminName: '', adminPhone: '' });
 setSignupType(null);
 setOtp(['', '', '', '', '']);
 setOtpStatus('idle');
 setNewPassword('');
 setConfirmPassword('');
 setError('');
 autoVerifyTriggered.current = false;
 };

 const handleForgotPassword = async () => {
 if (!email) { setError('Please enter your email address'); return; }
 setIsLoading(true);
 setError('');
 setFlowType('forgot');
 try {
 const res = await authService.forgotPassword(email);
 if (res.status === 'pending') {
 setOtpToken(res.otp_token);
 setSentViaChannel('email');
 setView('CODE');
 } else if (res.status === 'choose_otp_channel') {
 setOtpOptions(res.otp_options);
 setOtpChannelToken(res.otp_channel_token);
 // Pre-select first available channel
 const available = Object.keys(res.otp_options) as OtpChannel[];
 if (available.length > 0) setSelectedChannel(available[0]);
 setView('CHOOSE_CHANNEL');
 }
 } catch (err: any) {
 setError(err?.message || 'Failed to send reset code. Please try again.');
 } finally {
 setIsLoading(false);
 }
 };

 const handleSelectChannel = async () => {
 setIsLoading(true);
 setError('');
 try {
 const res = await authService.selectOtpChannel(selectedChannel, otpChannelToken);
 setOtpToken(res.otp_token);
 setSentViaChannel(selectedChannel.toLowerCase());
 setView('CODE');
 } catch (err: any) {
 setError(err?.message || 'Failed to send OTP. Please try again.');
 } finally {
 setIsLoading(false);
 }
 };

 // Auto-verify OTP handler (called automatically when all digits entered)
 const handleAutoVerifyOtp = async () => {
 const code = otp.join('');
 if (code.length < 5) return;
 setError('');
 setOtpStatus('verifying');

 if (flowType === 'login') {
 try {
 const result = await authService.verifyLoginOtp(code, otpToken);
 setOtpStatus('success');
 setTimeout(() => { onLogin(result.user); }, 600);
 } catch (err: any) {
 setOtpStatus('error');
 setTimeout(() => {
 setOtp(['', '', '', '', '']);
 setOtpStatus('idle');
 autoVerifyTriggered.current = false;
 document.getElementById('otp-0')?.focus();
 }, 800);
 setError(err?.message || 'OTP verification failed. Please try again.');
 }
 } else if (flowType === 'signup') {
 try {
 await new Promise(resolve => setTimeout(resolve, 800));
 setOtpStatus('success');
 setTimeout(() => {
 setOtpStatus('idle');
 autoVerifyTriggered.current = false;
 setView('CREATE_PASSWORD');
 }, 600);
 } catch (err: any) {
 setOtpStatus('error');
 setTimeout(() => {
 setOtp(['', '', '', '', '']);
 setOtpStatus('idle');
 autoVerifyTriggered.current = false;
 document.getElementById('otp-0')?.focus();
 }, 800);
 }
 } else {
 // Forgot password flow — verify OTP then move to reset
 try {
 await new Promise(resolve => setTimeout(resolve, 800));
 setOtpStatus('success');
 setTimeout(() => {
 setOtpStatus('idle');
 autoVerifyTriggered.current = false;
 setView('RESET');
 }, 600);
 } catch (err: any) {
 setOtpStatus('error');
 setTimeout(() => {
 setOtp(['', '', '', '', '']);
 setOtpStatus('idle');
 autoVerifyTriggered.current = false;
 document.getElementById('otp-0')?.focus();
 }, 800);
 setError(err?.message || 'OTP verification failed. Please try again.');
 }
 }
 };

 const handleResetPassword = async () => {
 if (!newPassword) { setError('Please enter a new password'); return; }
 if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
 if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
 setIsLoading(true);
 setError('');
 try {
 const code = otp.join('');
 await authService.resetPassword(code, newPassword, otpToken);
 setView('SUCCESS');
 } catch (err: any) {
 setError(err?.message || 'Failed to reset password. Please try again.');
 } finally {
 setIsLoading(false);
 }
 };

 const handleResendOtp = async () => {
 if (resendCooldown > 0) return;
 setIsLoading(true);
 setError('');
 try {
 if (flowType === 'login') {
 await authService.resendLoginOtp(email);
 } else {
 const res = await authService.resendOtp(email);
 if (res.status === 'pending') {
 setOtpToken(res.otp_token);
 }
 }
 setResendCooldown(20);
 } catch (err: any) {
 setError(err?.message || 'Failed to resend code. Please try again.');
 } finally {
 setIsLoading(false);
 }
 };

 const handleLoginSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!email || !password) {
 setError('Please enter email and password');
 return;
 }
 setIsLoading(true);
 setError('');
 try {
 const res: LoginResponse = await authService.login({ email, password });
 if (res.status === 'success') {
 onLogin(res.user);
 } else if (res.status === 'otp_required') {
 // Login requires OTP verification
 setFlowType('login');
 setOtpChannelToken(res.otp_channel_token);
 if (res.otp_options && Object.keys(res.otp_options).length > 0) {
 setOtpOptions(res.otp_options);
 const available = Object.keys(res.otp_options) as OtpChannel[];
 if (available.length > 0) setSelectedChannel(available[0]);
 setView('CHOOSE_CHANNEL');
 } else {
 // No channel selection needed — go directly to code entry
 setSentViaChannel('email');
 setView('CODE');
 }
 }
 } catch (err: any) {
 setError(err?.message || 'Login failed. Please check your credentials.');
 } finally {
 setIsLoading(false);
 }
 };

 // Signup handlers
 const handleSignupSubmit = async () => {
 if (!signupData.schoolName || !signupData.email || !signupData.adminName || !signupData.adminPhone) {
 setError('Please fill in all fields');
 return;
 }
 setIsLoading(true);
 setError('');
 setFlowType('signup');
 setEmail(signupData.email);
 try {
 await new Promise(resolve => setTimeout(resolve, 800));
 setSentViaChannel('email');
 setView('CODE');
 } catch (err: any) {
 setError(err?.message || 'Failed to send verification code.');
 } finally {
 setIsLoading(false);
 }
 };

 const handleCreatePassword = async () => {
 if (!newPassword) { setError('Please enter a password'); return; }
 if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
 if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
 setIsLoading(true);
 setError('');
 try {
 await new Promise(resolve => setTimeout(resolve, 1000));
 const mockUser: User = {
 id: `U${Date.now()}`,
 name: signupData.adminName,
 email: signupData.email,
 role: UserRole.SCHOOL_ADMIN,
 avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(signupData.adminName)}&background=random`,
 schoolId: undefined
 };
 onLogin(mockUser);
 } catch (err: any) {
 setError(err?.message || 'Failed to create account. Please try again.');
 } finally {
 setIsLoading(false);
 }
 };

 // Render Functions for different views
 const renderLogin = () => (
 <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="text-center mb-10">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
 <ThemedLogo size={32} />
 </div>
 <h2 className="text-3xl font-bold text-brand-black mb-2">Login to your account</h2>
 <p className="text-gray-500 text-sm">Unlock Your Progress - Securely Access Your Dashboard!</p>
 </div>

 <form onSubmit={handleLoginSubmit} className="space-y-6">
 {error && (
 <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm">
 <AlertCircle size={18} className="shrink-0" />
 <span>{error}</span>
 </div>
 )}
 <div className="space-y-2">
 <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Email Address <span className="text-red-500">*</span></label>
 <ThemedInput 
 type="email" 
 placeholder="name@school.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 />
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Password <span className="text-red-500">*</span></label>
 <div className="relative">
 <ThemedInput 
 type={showPassword ? "text" : "password"} 
 placeholder="••••••••"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="pr-12"
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
 <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-black" style={{ accentColor: colors.primary }} />
 <span className="text-sm font-medium text-gray-500">Remember for 30 days</span>
 </label>
 <ThemedLink onClick={() => setView('FORGOT')} className="text-sm">
 Forgot password
 </ThemedLink>
 </div>

 <button 
 type="submit"
 disabled={isLoading}
 className="w-full py-4 text-white rounded-full font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
 style={{ backgroundColor: colors.primary }}
 >
 {isLoading ? (
 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : 'Sign In'}
 </button>

 {/* Social Sign-in: only visible when feature flag is ON */}
 {featureFlags.socialSignIn && (
 <button type="button" className="w-full py-4 bg-white border border-gray-200 text-brand-black rounded-full font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
 <svg className="w-5 h-5" viewBox="0 0 24 24">
 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
 </svg>
 Sign in with Google
 </button>
 )}
 </form>

 {/* Demo Credentials Section — only visible when Demo Mode is ON */}
 <div className="pt-4 border-t border-gray-100">
 <p className="text-center text-sm font-medium text-gray-500 mb-6">
 Don't have an account? <ThemedLink className="text-sm" onClick={() => { resetSignupState(); setView('SIGNUP_CHOICE'); }}>Sign up</ThemedLink>
 </p>
 
 {featureFlags.demoMode && (
 <>
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
 </>
 )}
 </div>
 </div>
 );

 const renderForgot = () => (
 <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
 <div className="text-center mb-8">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
 <ThemedLogo size={32} />
 </div>
 <h2 className="text-3xl font-bold text-brand-black mb-2">Forgot Password?</h2>
 <p className="text-gray-500 text-sm">Enter your email and we'll send you a recovery code.</p>
 </div>

 <div className="space-y-6">
 {error && (
 <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm">
 <AlertCircle size={18} className="shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <div className="space-y-2">
 <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Email Address <span className="text-red-500">*</span></label>
 <ThemedInput 
 type="email"
 placeholder="name@school.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 />
 </div>

 <ThemedButton 
 variant="primary"
 onClick={handleForgotPassword}
 disabled={isLoading}
 >
 {isLoading ? (
 <div className="flex items-center justify-center gap-2">
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 Sending...
 </div>
 ) : 'Send Recovery Code'}
 </ThemedButton>

 <button 
 onClick={() => { resetForgotState(); setView('LOGIN'); }}
 className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-black transition-colors"
 >
 <ArrowLeft size={16} /> Back to login
 </button>
 </div>
 </div>
 );

 const renderChooseChannel = () => {
 const channelIcons: Record<string, React.ReactNode> = {
 EMAIL: <Mail size={24} />,
 SMS: <MessageSquare size={24} />,
 WHATSAPP: <Smartphone size={24} />,
 INAPPNOTIFICATION: <Bell size={24} />,
 };
 const channelLabels: Record<string, string> = {
 EMAIL: 'Email',
 SMS: 'Text / SMS',
 WHATSAPP: 'WhatsApp',
 INAPPNOTIFICATION: 'In-App',
 };

 return (
 <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
 <div className="text-center mb-8">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
 <ThemedLogo size={32} />
 </div>
 <h2 className="text-3xl font-bold text-brand-black mb-2">Choose Delivery Method</h2>
 <p className="text-gray-500 text-sm">Select how you'd like to receive your verification code.</p>
 </div>

 <div className="space-y-6">
 {error && (
 <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm">
 <AlertCircle size={18} className="shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <div className="grid grid-cols-2 gap-3">
 {otpOptions && Object.entries(otpOptions).map(([channel, maskedValue]) => (
 <button 
 key={channel}
 onClick={() => setSelectedChannel(channel as OtpChannel)}
 className="p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all"
 style={{
 borderColor: selectedChannel === channel ? colors.primary : '#e5e7eb',
 color: selectedChannel === channel ? colors.primary : '#6b7280'
 }}
 >
 {channelIcons[channel] || <Mail size={24} />}
 <span className="text-xs font-bold uppercase tracking-wide">{channelLabels[channel] || channel}</span>
 <span className="text-[10px] text-gray-400 font-medium">{maskedValue}</span>
 </button>
 ))}
 </div>

 <ThemedButton 
 variant="primary"
 onClick={handleSelectChannel}
 disabled={isLoading}
 >
 {isLoading ? (
 <div className="flex items-center justify-center gap-2">
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 Sending...
 </div>
 ) : 'Send Code'}
 </ThemedButton>

 <button 
 onClick={() => { setError(''); setView(flowType === 'login' ? 'LOGIN' : 'FORGOT'); }}
 className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-black transition-colors"
 >
 <ArrowLeft size={16} /> Back
 </button>
 </div>
 </div>
 );
 };

 const renderCheckEmail = () => (
 <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
 <div className="text-center mb-6">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
 <ThemedLogo size={32} />
 </div>
 <h2 className="text-3xl font-bold text-brand-black mb-2">Check your {sentViaChannel === 'email' ? 'email' : 'device'}</h2>
 <p className="text-gray-500 text-sm">
 We sent a 5-digit code to <span className="text-brand-black font-bold">{email}</span> via {sentViaChannel}.
 </p>
 </div>

 <div className="space-y-6">
 <ThemedButton 
 variant="primary"
 onClick={() => setView('CODE')}
 >
 Enter the code Manually
 </ThemedButton>

 <button 
 onClick={() => { resetForgotState(); setView('LOGIN'); }}
 className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-black transition-colors"
 >
 <ArrowLeft size={16} /> Back to login
 </button>
 </div>
 </div>
 );

 const renderCode = () => {
 const getOtpInputStyle = () => {
 const base = 'w-14 h-14 text-center text-2xl font-bold border rounded-2xl outline-none transition-all bg-white';
 if (otpStatus === 'success') return `${base} border-green-500 bg-green-50 text-green-600`;
 if (otpStatus === 'error') return `${base} border-red-500 bg-red-50 text-red-600 animate-shake`;
 return `${base} border-gray-200`;
 };

 return (
 <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
 <div className="text-center mb-6">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
 <ThemedLogo size={32} />
 </div>
 <h2 className="text-3xl font-bold text-brand-black mb-2">Enter the code</h2>
 <p className="text-gray-500 text-sm">Enter the 5-digit code sent to your {sentViaChannel}.{flowType === 'login' ? ' Verify to complete sign in.' : flowType === 'signup' ? ' Verify to continue registration.' : ''}</p>
 </div>

 <div className="space-y-8">
 {error && otpStatus === 'idle' && (
 <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm">
 <AlertCircle size={18} className="shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <div className="flex gap-3 justify-between">
 {otp.map((digit, idx) => (
 <input
 key={idx}
 id={`otp-${idx}`}
 type="text"
 inputMode="numeric"
 maxLength={1}
 value={digit}
 onChange={(e) => handleOtpChange(idx, e.target.value.replace(/\D/g, ''))}
 onKeyDown={(e) => handleOtpKeyDown(idx, e)}
 onPaste={idx === 0 ? handleOtpPaste : undefined}
 className={getOtpInputStyle()}
 style={otpStatus === 'idle' ? { color: colors.primary } : undefined}
 disabled={otpStatus !== 'idle'}
 onFocus={(e) => {
 if (otpStatus === 'idle') {
 e.currentTarget.style.borderColor = colors.primary;
 e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
 }
 }}
 onBlur={(e) => {
 if (otpStatus === 'idle') {
 e.currentTarget.style.borderColor = '#e5e7eb';
 e.currentTarget.style.boxShadow = 'none';
 }
 }}
 />
 ))}
 </div>

 {/* Verifying indicator */}
 {otpStatus === 'verifying' && (
 <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
 <div className="w-4 h-4 border-2 border-gray-300 border-t-brand-black rounded-full animate-spin" />
 <span className="font-medium">Verifying...</span>
 </div>
 )}

 {/* Resend + Use Another Method — no Continue button */}
 <div className="grid grid-cols-2 gap-4">
 <button 
 onClick={handleResendOtp}
 disabled={isLoading || resendCooldown > 0}
 className="w-full py-4 text-white rounded-full font-bold text-base transition-all active:scale-[0.98] disabled:opacity-60"
 style={{ backgroundColor: colors.primary }}
 >
 {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : isLoading ? 'Sending...' : 'Resend'}
 </button>
 <button 
 onClick={() => {
 setError('');
 setOtp(['', '', '', '', '']);
 setOtpStatus('idle');
 autoVerifyTriggered.current = false;
 if (flowType === 'signup') { setView('SIGNUP_FORM'); }
 else { setView('CHOOSE_CHANNEL'); }
 }}
 className="w-full py-4 bg-white border border-gray-200 text-brand-black rounded-full font-bold text-base hover:bg-gray-50 transition-all active:scale-[0.98]"
 >
 Use Another Method
 </button>
 </div>

 <button 
 onClick={() => { resetForgotState(); resetSignupState(); setView('LOGIN'); }}
 className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-black transition-colors"
 >
 <ArrowLeft size={16} /> Back to login
 </button>
 </div>
 </div>
 );
 };

 const renderReset = () => (
 <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
 <div className="text-center mb-10">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
 <ThemedLogo size={32} />
 </div>
 <h2 className="text-3xl font-bold text-brand-black mb-2">Reset Password</h2>
 <p className="text-gray-500 text-sm">Enter your new secure password.</p>
 </div>

 <div className="space-y-6">
 {error && (
 <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm">
 <AlertCircle size={18} className="shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <div className="space-y-2">
 <label className="text-xs font-bold text-brand-black uppercase tracking-wide">New Password <span className="text-red-500">*</span></label>
 <div className="relative">
 <ThemedInput 
 type={showNewPassword ? "text" : "password"}
 placeholder="Min. 8 characters"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="pr-12"
 />
 <button 
 type="button"
 onClick={() => setShowNewPassword(!showNewPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black"
 >
 {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
 </button>
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Confirm Password <span className="text-red-500">*</span></label>
 <div className="relative">
 <ThemedInput 
 type={showConfirmPassword ? "text" : "password"}
 placeholder="Re-enter password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="pr-12"
 />
 <button 
 type="button"
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black"
 >
 {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
 </button>
 </div>
 </div>

 <ThemedButton 
 variant="primary"
 onClick={handleResetPassword}
 disabled={isLoading}
 >
 {isLoading ? (
 <div className="flex items-center justify-center gap-2">
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 Resetting...
 </div>
 ) : 'Reset Password'}
 </ThemedButton>

 <button 
 onClick={() => { setError(''); setView('CODE'); }}
 className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-black transition-colors"
 >
 <ArrowLeft size={16} /> Back to code entry
 </button>
 </div>
 </div>
 );

 const renderSuccess = () => (
 <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="text-center mb-10">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 mb-6 shadow-sm">
 <CheckCircle size={32} className="text-green-600" />
 </div>
 <h2 className="text-3xl font-bold text-brand-black mb-2">Password Reset!</h2>
 <p className="text-gray-500 text-sm">Your password has been successfully reset. You can now sign in with your new password.</p>
 </div>

 <ThemedButton 
 variant="primary"
 onClick={() => { resetForgotState(); setView('LOGIN'); }}
 >
 Back to Sign In
 </ThemedButton>
 </div>
 );

 // ========================================
 // SIGNUP VIEWS
 // ========================================

 const renderSignupChoice = () => (
 <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
 <div className="text-center mb-8">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
 <ThemedLogo size={32} />
 </div>
 <h2 className="text-3xl font-bold text-brand-black mb-2">Sign Up As</h2>
 <p className="text-gray-500 text-sm">Choose your account type to get started.</p>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <button
 onClick={() => { setSignupType('school'); setView('SIGNUP_FORM'); }}
 className="p-8 rounded-[2rem] border-2 border-gray-200 hover:border-transparent flex flex-col items-center gap-4 transition-all group hover:shadow-xl"
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.backgroundColor = `${colors.primary}08`; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = ''; }}
 >
 <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: colors.primary }}>
 <GraduationCap size={28} />
 </div>
 <div>
 <h3 className="text-lg font-bold text-brand-black">School</h3>
 <p className="text-xs text-gray-400 mt-1">Register an institution</p>
 </div>
 </button>

 <button
 onClick={() => { setSignupType('company'); setView('SIGNUP_FORM'); }}
 className="p-8 rounded-[2rem] border-2 border-gray-200 hover:border-transparent flex flex-col items-center gap-4 transition-all group hover:shadow-xl"
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.backgroundColor = `${colors.primary}08`; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = ''; }}
 >
 <div className="w-16 h-16 rounded-2xl bg-brand-black flex items-center justify-center text-white shadow-lg">
 <Briefcase size={28} />
 </div>
 <div>
 <h3 className="text-lg font-bold text-brand-black">Company</h3>
 <p className="text-xs text-gray-400 mt-1">Register a transport company</p>
 </div>
 </button>
 </div>

 <button 
 onClick={() => { resetSignupState(); setView('LOGIN'); }}
 className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-black transition-colors"
 >
 <ArrowLeft size={16} /> Back to login
 </button>
 </div>
 );

 const renderSignupForm = () => (
 <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
 <div className="text-center mb-8">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
 <ThemedLogo size={32} />
 </div>
 <h2 className="text-3xl font-bold text-brand-black mb-2">
 {signupType === 'school' ? 'Register School' : 'Register Company'}
 </h2>
 <p className="text-gray-500 text-sm">Fill in the details to create your account.</p>
 </div>

 <div className="space-y-5">
 {error && (
 <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm">
 <AlertCircle size={18} className="shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <div className="space-y-2">
 <label className="text-xs font-bold text-brand-black uppercase tracking-wide">
 {signupType === 'school' ? 'School Name' : 'Company Name'} <span className="text-red-500">*</span>
 </label>
 <ThemedInput 
 type="text"
 placeholder={signupType === 'school' ? 'e.g. Greenfield Academy' : 'e.g. City Express Transport'}
 value={signupData.schoolName}
 onChange={(e) => setSignupData({ ...signupData, schoolName: e.target.value })}
 />
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Email <span className="text-red-500">*</span></label>
 <ThemedInput 
 type="email"
 placeholder="admin@school.com"
 value={signupData.email}
 onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
 />
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Admin Name <span className="text-red-500">*</span></label>
 <ThemedInput 
 type="text"
 placeholder="Full name"
 value={signupData.adminName}
 onChange={(e) => setSignupData({ ...signupData, adminName: e.target.value })}
 />
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Admin Phone <span className="text-red-500">*</span></label>
 <PhoneInput
 value={signupData.adminPhone}
 onChange={(val) => setSignupData({ ...signupData, adminPhone: val })}
 placeholder="712 345 678"
 />
 </div>

 <button 
 onClick={handleSignupSubmit}
 disabled={isLoading}
 className="w-full py-4 text-white rounded-full font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
 style={{ backgroundColor: colors.primary }}
 >
 {isLoading ? (
 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : 'Continue'}
 </button>

 <button 
 onClick={() => { setError(''); setView('SIGNUP_CHOICE'); }}
 className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-black transition-colors"
 >
 <ArrowLeft size={16} /> Back
 </button>
 </div>
 </div>
 );

 const renderCreatePassword = () => (
 <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
 <div className="text-center mb-10">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
 <ThemedLogo size={32} />
 </div>
 <h2 className="text-3xl font-bold text-brand-black mb-2">Create New Password</h2>
 <p className="text-gray-500 text-sm">Set a secure password for your account.</p>
 </div>

 <div className="space-y-6">
 {error && (
 <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm">
 <AlertCircle size={18} className="shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <div className="space-y-2">
 <label className="text-xs font-bold text-brand-black uppercase tracking-wide">New Password <span className="text-red-500">*</span></label>
 <div className="relative">
 <ThemedInput 
 type={showNewPassword ? "text" : "password"}
 placeholder="Min. 8 characters"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="pr-12"
 />
 <button 
 type="button"
 onClick={() => setShowNewPassword(!showNewPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black"
 >
 {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
 </button>
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Confirm Password <span className="text-red-500">*</span></label>
 <div className="relative">
 <ThemedInput 
 type={showConfirmPassword ? "text" : "password"}
 placeholder="Re-enter password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="pr-12"
 />
 <button 
 type="button"
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black"
 >
 {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
 </button>
 </div>
 </div>

 <button 
 onClick={handleCreatePassword}
 disabled={isLoading}
 className="w-full py-4 text-white rounded-full font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
 style={{ backgroundColor: colors.primary }}
 >
 {isLoading ? (
 <div className="flex items-center justify-center gap-2">
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 Creating Account...
 </div>
 ) : 'Create Password'}
 </button>

 <button 
 onClick={() => { setError(''); setView('CODE'); }}
 className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-black transition-colors"
 >
 <ArrowLeft size={16} /> Back to code entry
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
 {view === 'CHOOSE_CHANNEL' && renderChooseChannel()}
 {view === 'CHECK_EMAIL' && renderCheckEmail()}
 {view === 'CODE' && renderCode()}
 {view === 'RESET' && renderReset()}
 {view === 'SUCCESS' && renderSuccess()}
 {view === 'SIGNUP_CHOICE' && renderSignupChoice()}
 {view === 'SIGNUP_FORM' && renderSignupForm()}
 {view === 'CREATE_PASSWORD' && renderCreatePassword()}
 </div>

 {/* Right Section - Marketing/Image */}
 <div className="hidden lg:block w-1/2 relative bg-gray-100 overflow-hidden">
 {/* Background Image - SMART DATA-FLOW: reads from settings store */}
 <div className="absolute inset-0">
 <img 
 src={getUploadedFileUrl(loginHeroImage) || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop"} 
 className="w-full h-full object-cover" 
 alt="Workspace"
 />
 <div className="absolute inset-0 bg-brand-black/20 mix-blend-multiply"></div>
 </div>

 {/* Floating Pill - Top Left */}
 <div className="absolute top-12 left-12 bg-black/40 backdrop-blur-md rounded-full pl-6 pr-2 py-2 flex items-center gap-4 text-white border border-white/10 shadow-2xl animate-in slide-in-from-top-8 duration-700">
 <span className="font-bold tracking-wide">{platformName}</span>
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
 <img src={testimonials?.[0]?.avatar || "https://plus.unsplash.com/premium_photo-1661498011647-983403f1643c?q=80&w=800&auto=format&fit=crop"} className="w-14 h-14 rounded-full object-cover border-2 border-white/20" alt={testimonials?.[0]?.name || "Testimonial"} />
 <div>
 <h4 className="text-xl font-bold text-white">{testimonials?.[0]?.name || "Samuel Okoye"}</h4>
 <p className="text-gray-400 text-sm">{testimonials?.[0]?.role || "Bus Driver"}</p>
 </div>
 </div>
 <p className="text-gray-200 text-lg font-light leading-relaxed mb-8">
 "{testimonials?.[0]?.text || "The students anf parents both love it! Boarding and dropping off students has never been easier."}"
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
