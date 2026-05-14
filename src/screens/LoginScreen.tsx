import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Lock, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import Button from '../components/Button';
import { auth, db, sendResetEmail, setupRecaptcha, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

type LoginMethod = 'email' | 'otp';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { language, user, setUser, showNotification } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  
  const [method, setMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'checking' | 'not_found'>('idle');
  const recaptchaVerifierRef = React.useRef<any>(null);

  // Robust cleanup and reset
  const resetRecaptcha = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (e) {
        console.warn('Error clearing recaptcha:', e);
      }
      recaptchaVerifierRef.current = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
      container.style.display = 'none'; // Hide when not in use
    }
  };

  useEffect(() => {
    if (method === 'otp' && !otpSent) {
      const initRecaptcha = async () => {
        resetRecaptcha();
        await new Promise(resolve => setTimeout(resolve, 300));
        const container = document.getElementById('recaptcha-container');
        if (container) {
          container.style.display = 'block';
          try {
            const verifier = setupRecaptcha('recaptcha-container');
            recaptchaVerifierRef.current = verifier;
            await verifier.render();
          } catch (e) {
            console.error('Recaptcha init error:', e);
          }
        }
      };
      initRecaptcha();
    }
    return () => resetRecaptcha();
  }, [method, otpSent]);

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t.errorFillAll);
      return;
    }

    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        showNotification(t.loginSuccess);
        navigate('/home');
      })
      .catch((err) => {
        if (err.code === 'auth/operation-not-allowed') {
          setError('Email/Password login is not enabled in Firebase. Please enable it in the Firebase Console.');
        } else if (err.code === 'auth/network-request-failed') {
          setError('Network error. Please check your connection.');
        } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          setError('Invalid email or password. If you signed up with Google, please use the "Sign in with Google" button below.');
        } else if (err.code === 'auth/wrong-password') {
          setError('Invalid password. Please try again.');
        } else if (err.code === 'auth/unauthorized-domain') {
          setError('Unauthorized Domain: This domain is not authorized in your Firebase Project. Please add this domain/IP (e.g., localhost, 192.168.0.212) to the "Authorized domains" list in the Firebase Console (Authentication > Settings > Authorized domains).');
        } else {
          setError(err.message || 'Login failed');
        }
        setLoading(false);
      });
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError(t.enterEmailReset);
      return;
    }
    setLoading(true);
    sendResetEmail(email)
      .then(() => {
        showNotification(t.resetLinkSent);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Failed to send reset link');
      })
      .finally(() => setLoading(false));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Robust phone number extraction and formatting
    let digits = phone.replace(/\D/g, '');
    let formattedPhone = phone.trim();
    
    if (!formattedPhone.startsWith('+')) {
      if (digits.length < 10) {
        setError('Phone number is too short. Please enter at least 10 digits.');
        return;
      }
      formattedPhone = `+91${digits.slice(-10)}`; // Normalize to +91 and last 10 digits
    } else {
      // If it starts with +, ensure it has enough total digits (Country Code + Number)
      if (digits.length < 11) { // Min length including country code
        setError('Invalid phone number format with country code.');
        return;
      }
    }

    if (!recaptchaVerifierRef.current) {
      setError('System initializing. Please wait a second and try again.');
      // Re-trigger effect
      setMethod('email');
      setTimeout(() => setMethod('otp'), 50);
      return;
    }

    setLoading(true);
    try {
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      showNotification(t.otpSentSuccess);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/captcha-check-failed') {
        setError('reCAPTCHA verification failed. This often happens if the domain is not authorized in Firebase. Please add this domain to the "Authorized domains" in Firebase Console.');
        resetRecaptcha(); // Allow retry
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Unauthorized Domain: Please add this domain/IP to the "Authorized domains" list in the Firebase Console (Authentication > Settings > Authorized domains).');
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Daily SMS quota exceeded (10/day). Please use Google Login or try again tomorrow.');
      } else {
        setError(err.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    
    if (!confirmationResult) {
      setError('Session expired. Please send OTP again.');
      return;
    }

    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      showNotification(t.loginSuccess);
      navigate('/home');
    } catch (err: any) {
      setError(t.invalidOtp);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const userDocPath = `users/${result.user.uid}`;
        try {
          // Check if user exists in firestore
          const userDoc = await getDoc(doc(db, 'users', result.user.uid));
          if (!userDoc.exists()) {
            // Create user if not exists
            await setDoc(doc(db, 'users', result.user.uid), {
              name: result.user.displayName || 'Artisan',
              email: result.user.email,
              photoURL: result.user.photoURL,
              createdAt: serverTimestamp(),
              language: language || 'en'
            });
          }
          showNotification('Login Successful');
          navigate('/home');
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, userDocPath);
        }
      })
      .catch((err) => {
        if (err.code === 'auth/unauthorized-domain') {
          setError('Unauthorized Domain: Please add this domain/IP to the "Authorized domains" list in the Firebase Console.');
        } else {
          setError(err.message || 'Google Login failed');
        }
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-bamboo-ivory p-6 flex flex-col">
      {/* Invisible container for Firebase Phone Auth Recaptcha */}
      <div id="recaptcha-container" className="opacity-0 pointer-events-none absolute"></div>

      <div className="mt-16 mb-8 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-bamboo-dark rounded-3xl flex items-center justify-center mb-4 shadow-xl border border-bamboo-gold/20"
        >
          <LogIn size={32} className="text-bamboo-gold" />
        </motion.div>
        <h1 className="text-3xl font-serif font-bold text-bamboo-dark">{t.login}</h1>
        <p className="text-xs text-bamboo-dark/40 font-medium uppercase tracking-[0.2em] mt-2">Welcome Back</p>
      </div>

      <div className="flex bg-white/50 p-1 rounded-2xl mb-8 border border-bamboo-gold/10">
        <button 
          onClick={() => { setMethod('email'); setError(''); setOtpSent(false); }}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${method === 'email' ? 'bg-bamboo-dark text-bamboo-gold shadow-lg' : 'text-bamboo-dark/40 hover:text-bamboo-dark'}`}
        >
          Email & Password
        </button>
        <button 
          onClick={() => { setMethod('otp'); setError(''); }}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${method === 'otp' ? 'bg-bamboo-dark text-bamboo-gold shadow-lg' : 'text-bamboo-dark/40 hover:text-bamboo-dark'}`}
        >
          OTP Login
        </button>
      </div>

      <AnimatePresence mode="wait">
        {method === 'email' ? (
          <motion.form 
            key="email-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleLogin}
            className="flex flex-col gap-4"
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-3"
              >
                <div className="w-1 h-1 bg-red-600 rounded-full" />
                {error}
              </motion.div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-bamboo-dark/40 ml-2">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold/40" size={18} />
                <input
                  type="email"
                  required
                  className="w-full bg-white border border-bamboo-gold/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-bamboo-gold/30 outline-none transition-all text-bamboo-dark"
                  placeholder="artisan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-bamboo-dark/40 ml-2">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold/40" size={18} />
                <input
                  type="password"
                  required
                  className="w-full bg-white border border-bamboo-gold/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-bamboo-gold/30 outline-none transition-all text-bamboo-dark"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end pr-2">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[10px] uppercase tracking-widest font-bold text-bamboo-gold hover:text-bamboo-dark transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="mt-2 w-full rounded-xl bg-bamboo-rich text-white py-4 font-bold shadow-xl shadow-bamboo-dark/10 group">
              <span className="flex items-center justify-center gap-2">
                {loading ? 'Authenticating...' : t.login}
        {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
      </span>
    </Button>
  </motion.form>
) : (
  <motion.form 
    key="otp-form"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
    className="flex flex-col gap-4"
  >
    {error && (
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-3"
      >
        <div className="w-1 h-1 bg-red-600 rounded-full" />
        {error}
      </motion.div>
    )}

    {!otpSent ? (
      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-widest font-bold text-bamboo-dark/40 ml-2">{t.phone}</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold/40" size={18} />
          <input
            type="tel"
            required
            className="w-full bg-white border border-bamboo-gold/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-bamboo-gold/30 outline-none transition-all text-bamboo-dark font-mono"
            placeholder="+91 00000 00000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="bg-bamboo-gold/5 p-4 rounded-2xl border border-bamboo-gold/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-bamboo-gold/10 flex items-center justify-center text-bamboo-gold">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-bamboo-gold tracking-widest">Verification Sent</p>
            <p className="text-xs font-bold text-bamboo-dark">{phone}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setOtpSent(false)} 
            className="ml-auto text-[10px] font-black uppercase text-bamboo-dark/40 hover:text-bamboo-gold"
          >
            Change
          </button>
        </div>
        
        <div className="space-y-1 text-center">
          <label className="text-[10px] uppercase tracking-widest font-bold text-bamboo-dark/40">Enter 6-Digit OTP</label>
          <input
            type="text"
            required
            maxLength={6}
            className="w-full bg-white border border-bamboo-gold/20 rounded-xl py-5 text-center text-3xl font-black tracking-[0.5em] focus:ring-4 focus:ring-bamboo-gold/10 outline-none transition-all text-bamboo-dark shadow-inner"
            placeholder="••••••"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            autoFocus
          />
          <p className="text-[10px] text-bamboo-dark/30 font-medium mt-2 italic">Demo OTP: 123456</p>
        </div>
      </div>
    )}

    <Button type="submit" disabled={loading} size="lg" className="mt-2 w-full rounded-xl bg-bamboo-rich text-white py-4 font-bold shadow-xl shadow-bamboo-dark/10 group">
      <span className="flex items-center justify-center gap-2">
        {loading ? (otpSent ? 'Verifying...' : 'Sending...') : (otpSent ? t.verifyOtp : t.sendOtp)}
        {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
      </span>
    </Button>
  </motion.form>
)}
</AnimatePresence>

<div className="flex items-center gap-4 my-8">
<div className="flex-1 h-px bg-bamboo-dark/10" />
<span className="text-[10px] font-black text-bamboo-dark/30 uppercase tracking-[0.2em]">secure login</span>
<div className="flex-1 h-px bg-bamboo-dark/10" />
</div>

<motion.button 
whileHover={{ scale: 1.01 }}
whileTap={{ scale: 0.98 }}
onClick={handleGoogleLogin}
disabled={loading}
className="w-full flex items-center justify-center gap-4 bg-white border border-bamboo-dark/10 rounded-xl py-4 font-bold text-bamboo-dark hover:bg-gray-50 transition-all shadow-sm group"
>
<svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
</svg>
{t.googleLogin}
</motion.button>

      <div className="mt-auto text-center pb-8 pt-10">
        <p className="text-sm text-bamboo-dark/60">
          {t.noAccount}{' '}
          <Link to="/register" className="text-bamboo-gold font-black uppercase tracking-widest hover:underline ml-1">
            {t.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
