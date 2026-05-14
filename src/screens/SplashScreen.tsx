import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Leaf } from 'lucide-react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { language, user, loading } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  useEffect(() => {
    if (loading) return;
    
    const timer = setTimeout(() => {
      if (user) {
        navigate('/home');
      } else {
        navigate('/languages');
      }
    }, 4500); 

    return () => clearTimeout(timer);
  }, [navigate, user, loading]);

  return (
    <div className="h-screen w-full bg-[#0F3D2E] flex flex-col items-center justify-center text-[#F8F5F0] p-8 overflow-hidden relative font-serif select-none">
      {/* Background with Vignette and Gradient */}
      <div className="absolute inset-0 bg-[#0F3D2E] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332] to-[#0F3D2E] opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
      
      {/* Subtle Background Silhouettes */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden blur-[1px]">
        <div className="absolute top-[-10%] right-[-10%] rotate-[45deg]">
          <Leaf size={500} fill="currentColor" />
        </div>
        <div className="absolute bottom-[10%] left-[-10%] rotate-[-20deg]">
          <Leaf size={400} fill="currentColor" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 2.5, 
          ease: [0.22, 1, 0.36, 1], // Anticipatory curve for premium feel
          opacity: { duration: 1.5 }
        }}
        className="flex flex-col items-center text-center w-full max-w-md relative z-10 -mt-20"
      >
        {/* Glow behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />

        {/* Photorealistic SVG Logo */}
        <div className="relative w-80 h-80 mb-6 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
            <defs>
              <linearGradient id="bambooGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A67C52" />
                <stop offset="20%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#E5C76B" />
                <stop offset="80%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#8B6914" />
              </linearGradient>
              <filter id="emboss">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.75" specularExponent="20" lightingColor="#white" result="specOut">
                  <fePointLight x="-5000" y="-10000" z="20000" />
                </feSpecularLighting>
                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
              </filter>
            </defs>

            {/* Circular Bamboo Ring Frame */}
            <circle cx="100" cy="100" r="82" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.2" />
            
            {/* Cane Weaving (Right Arc) */}
            <path 
              d="M125 45 A65 65 0 0 1 125 155" 
              fill="none" 
              stroke="#D4AF37" 
              strokeWidth="12" 
              strokeOpacity="0.3" 
              strokeLinecap="round"
            />
            {/* Woven details */}
            <g stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.2">
              {[...Array(9)].map((_, i) => (
                <line key={i} x1="125" y1={55 + (i * 12)} x2={165 + (Math.sin(i) * 5)} y2={55 + (i * 12)} />
              ))}
            </g>

            {/* Bamboo H Monogram */}
            <g filter="url(#emboss)">
              {/* Vertical Stalks */}
              <rect x="80" y="45" width="12" height="110" rx="6" fill="url(#bambooGradient)" />
              <rect x="110" y="45" width="12" height="110" rx="6" fill="url(#bambooGradient)" />
              
              {/* Horizontal Bridge */}
              <rect x="70" y="93" width="62" height="14" rx="3" fill="url(#bambooGradient)" />
              {/* Knot details */}
              {[78, 86, 94, 102, 110, 118].map(x => (
                <line key={x} x1={x} y1="94" x2={x+1} y2="106" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
              ))}

              {/* Stalk Segments (Nodes) */}
              {[60, 85, 115, 140].map(y => (
                <g key={y}>
                  <rect x="80" y={y-1} width="12" height="2" fill="rgba(0,0,0,0.4)" />
                  <rect x="110" y={y-1} width="12" height="2" fill="rgba(0,0,0,0.4)" />
                </g>
              ))}
            </g>

            {/* Decorative Swirls at Bottom */}
            <path d="M40 145 C75 185 155 185 190 145" fill="none" stroke="#D4AF37" strokeWidth="4" strokeOpacity="0.5" strokeLinecap="round" />
            <path d="M55 160 C85 195 145 195 175 160" fill="none" stroke="#D4AF37" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />

            {/* Realistic Bamboo Leaves (Left) */}
            <g className="text-[#1B4332] drop-shadow-md">
              <path d="M72 70 C45 60 40 30 75 45 Z" fill="currentColor" fillOpacity="0.9" />
              <path d="M68 95 C40 90 45 65 75 80 Z" fill="currentColor" fillOpacity="0.8" />
              <path d="M72 120 C50 115 50 95 75 105 Z" fill="currentColor" fillOpacity="0.7" />
            </g>

            {/* Small accent leaf on right */}
            <path d="M175 145 C190 155 200 145 185 135 Z" fill="#1B4332" />
          </svg>
        </div>

        {/* Branding - Ivory White Serif */}
        <h1 className="text-6xl font-bold tracking-[0.2em] text-[#F8F5F0] mb-8 select-none drop-shadow-xl">
          HASTA-SHILPA
        </h1>
        
        {/* Divider with Knot Symbol */}
        <div className="flex items-center w-full gap-6 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Knot Symbol Design */}
            <div className="absolute inset-0 border border-[#D4AF37] rotate-45 transform scale-90" />
            <div className="absolute inset-0 border border-[#D4AF37] -rotate-45 transform scale-75" />
            <div className="w-2 h-2 bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
        </div>

        <p className="text-3xl italic text-[#D4AF37] font-medium tracking-wide drop-shadow-lg select-none">
          Design Bridge for Artisans
        </p>
      </motion.div>
      
      {/* Background Decor: Stalks & Wave */}
      <div className="absolute bottom-0 left-0 w-full h-[40%] pointer-events-none select-none">
        {/* Bottom Left Stalks */}
        <div className="absolute bottom-[-20px] left-[-30px] w-64 h-full flex items-end rotate-[12deg] opacity-80 filter drop-shadow-[15px_0_30px_rgba(0,0,0,0.5)]">
          <div className="w-10 h-full bg-[#1B4332] rounded-t-full relative border-r-2 border-[#0F3D2E]">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/30" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute w-full h-[1.5px] bg-[#0F3D2E]/60 shadow-sm" style={{ top: `${15 + (i * 15)}%` }} />
            ))}
          </div>
          <div className="w-14 h-[85%] bg-[#2D6A4F] rounded-t-full relative -ml-4 border-r-2 border-[#1B4332]">
            <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-black/40" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="absolute w-full h-[1.5px] bg-[#0F3D2E]/60 shadow-sm" style={{ top: `${20 + (i * 20)}%` }} />
            ))}
          </div>
        </div>

        {/* Wicker Pattern (Bottom Right Overlay) */}
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full border-[20px] border-[#D4AF37]/5 opacity-20 overflow-hidden transform rotate-45">
          <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#000_0,#000_3px,transparent_3px,transparent_6px)]" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,#000_0,#000_3px,transparent_3px,transparent_6px)]" />
        </div>
      </div>

      {/* Footer Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-20 flex flex-col items-center gap-6 z-20"
      >
        <div className="flex flex-col items-center gap-2 mt-4">
        </div>
      </motion.div>
    </div>
  );
}
