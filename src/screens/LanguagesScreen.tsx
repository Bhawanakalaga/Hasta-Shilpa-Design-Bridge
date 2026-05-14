import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Globe, Check } from 'lucide-react';
import ScreenLayout from '../components/ScreenLayout';
import { LANGUAGES, TRANSLATIONS } from '../constants';
import { useApp } from '../AppContext';
import { Language } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function LanguagesScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, user, showNotification } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const onboarding = location.state?.from === 'onboarding';

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    showNotification(`Language set to ${LANGUAGES[lang]}`);
    setTimeout(() => {
      if (onboarding) {
        navigate('/home', { replace: true });
      } else if (user) {
        navigate(-1);
      } else {
        navigate('/login');
      }
    }, 300);
  };

  return (
    <ScreenLayout showNav={false} className="bg-bamboo-ivory">
      <div className="flex items-center gap-4 mb-8 pt-4 px-1">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-bamboo-dark/60 hover:bg-bamboo-gold/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-serif font-bold text-bamboo-dark tracking-tight">{t.selectLanguage}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 pb-12">
        {(Object.keys(LANGUAGES) as Language[]).map((lang, idx) => (
          <motion.button
            key={lang}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleSelect(lang)}
            className={cn(
              "w-full flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 h-24 shadow-sm",
              language === lang 
                ? "bg-white border-bamboo-gold ring-2 ring-bamboo-gold/20 scale-[1.02] shadow-xl" 
                : "bg-white border-bamboo-gold/5 opacity-70 hover:opacity-100 hover:border-bamboo-gold/30 active:scale-[0.98]"
            )}
          >
            <div className="flex items-center gap-5">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                language === lang ? "bg-bamboo-rich text-white shadow-xl shadow-bamboo-rich/30" : "bg-bamboo-ivory text-bamboo-dark/30"
              )}>
                <Globe size={28} strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <p className={cn(
                  "font-bold text-lg font-serif",
                  language === lang ? "text-bamboo-dark" : "text-bamboo-dark/60"
                )}>
                  {LANGUAGES[lang]}
                </p>
                {lang !== 'en' && (
                  <p className="text-[10px] text-bamboo-gold font-bold uppercase tracking-[0.2em] leading-none mt-2">
                    {lang.toUpperCase()}
                  </p>
                )}
              </div>
            </div>
            
            {language === lang && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 rounded-full bg-bamboo-gold flex items-center justify-center text-white shadow-lg"
              >
                <Check size={20} strokeWidth={3} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </ScreenLayout>
  );
}
