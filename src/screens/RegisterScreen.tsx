import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import Button from '../components/Button';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { language, user, setUser, showNotification } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Strict Validations
    if (!name || !email || !password || !phone) {
      setError(t.errorFillAll);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.errorInvalidEmail);
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setError(t.errorInvalidPhone);
      return;
    }

    if (password.length < 8) {
      setError(t.errorInvalidPassword);
      return;
    }

    setLoading(true);
    const userPath = 'users';
    
    // Normalize phone for consistent searching later
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+') && formattedPhone.replace(/\D/g, '').length >= 10) {
      formattedPhone = `+91${formattedPhone.replace(/\D/g, '')}`;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const fullUserPath = `${userPath}/${userCredential.user.uid}`;
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name,
            email,
            phone: formattedPhone,
            language,
            createdAt: serverTimestamp()
          });
          showNotification(t.registrationSuccess);
          navigate('/login');
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, fullUserPath);
        }
      })
      .catch((err) => {
        if (err.code === 'auth/operation-not-allowed') {
          setError('Email/Password registration is not enabled. Please enable it in Firebase.');
        } else if (err.code === 'auth/network-request-failed') {
          setError('Network error. Please try again.');
        } else if (err.code === 'auth/email-already-in-use') {
          setError('Email already registered. If you previously signed up with Google, please use the Login page.');
        } else if (err.code === 'auth/unauthorized-domain') {
          setError('Unauthorized Domain: Please add this domain/IP (e.g., localhost, 192.168.0.212) to the "Authorized domains" list in the Firebase Console (Authentication > Settings > Authorized domains).');
        } else {
          setError(err.message || 'Registration failed');
        }
        setLoading(false);
      });
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    signInWithPopup(auth, provider)
      .then(async (userCredential) => {
        const userDocPath = `users/${userCredential.user.uid}`;
        try {
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              name: userCredential.user.displayName || 'Artisan',
              email: userCredential.user.email,
              language: 'en',
              createdAt: serverTimestamp()
            });
          }
          showNotification('Signup Successful');
          navigate('/home');
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, userDocPath);
        }
      })
      .catch((err) => {
        if (err.code === 'auth/unauthorized-domain') {
          setError('Unauthorized Domain: Please add this domain/IP to the "Authorized domains" list in the Firebase Console.');
        } else {
          setError(err.message || 'Google signup failed');
        }
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-bamboo-ivory p-6 flex flex-col">
      <div className="mt-12 mb-8 flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-bamboo-dark rounded-3xl flex items-center justify-center mb-4 shadow-xl border border-bamboo-gold/20"
        >
          <UserPlus size={32} className="text-bamboo-gold" />
        </motion.div>
        <h1 className="text-3xl font-serif font-bold text-bamboo-dark">{t.register}</h1>
        <p className="text-xs text-bamboo-dark/40 font-medium uppercase tracking-[0.2em] mt-2">Join the Design Bridge</p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
          <label className="text-[10px] uppercase tracking-widest font-bold text-bamboo-dark/40 ml-2">{t.name}</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold/40" size={18} />
            <input
              type="text"
              className="w-full bg-white border border-bamboo-gold/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-bamboo-gold/30 outline-none transition-all text-bamboo-dark"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest font-bold text-bamboo-dark/40 ml-2">{t.phone}</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold/40" size={18} />
            <input
              type="tel"
              className="w-full bg-white border border-bamboo-gold/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-bamboo-gold/30 outline-none transition-all text-bamboo-dark"
              placeholder="+91 00000 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest font-bold text-bamboo-dark/40 ml-2">{t.email}</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold/40" size={18} />
            <input
              type="email"
              className="w-full bg-white border border-bamboo-gold/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-bamboo-gold/30 outline-none transition-all text-bamboo-dark"
              placeholder="artisan@domain.com"
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
              className="w-full bg-white border border-bamboo-gold/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-bamboo-gold/30 outline-none transition-all text-bamboo-dark"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} size="lg" className="mt-4 w-full rounded-xl bg-bamboo-rich text-white py-4 font-bold shadow-xl shadow-bamboo-dark/10 group">
          <span className="flex items-center justify-center gap-2">
            {loading ? 'Creating Account...' : t.register}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </span>
        </Button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-bamboo-dark/10" />
        <span className="text-[10px] font-black text-bamboo-dark/30 uppercase tracking-[0.2em]">quick signup</span>
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
        {t.googleSignUp}
      </motion.button>

      <div className="mt-auto text-center pb-8 pt-10">
        <p className="text-sm text-bamboo-dark/60">
          {t.alreadyAccount}{' '}
          <Link to="/login" className="text-bamboo-gold font-black uppercase tracking-widest hover:underline ml-1">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
