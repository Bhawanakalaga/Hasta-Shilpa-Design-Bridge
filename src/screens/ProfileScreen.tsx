import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, Settings, Award, History, Heart, ChevronRight, Languages, ImagePlus, Trash2, Camera, Star, ShoppingBag, Package, Layers, Edit2, Check, X, Mail, Phone, Share2, User as UserIconType } from 'lucide-react';
import ScreenLayout from '../components/ScreenLayout';
import { useApp } from '../AppContext';
import { TRANSLATIONS, LANGUAGES } from '../constants';
import Button from '../components/Button';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

export default function ProfileScreen() {
  const { user, setUser, language, userWorks, favorites, userCertificates, profileImage, setProfileImage, showNotification } = useApp();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if user changes (e.g. from context updates)
  React.useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    if (!editName.trim() || !editEmail.trim()) {
      showNotification(t.errorFillAll, 'error');
      return;
    }

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const updates = {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updates);
      
      setUser({
        ...user!,
        ...updates
      });

      showNotification(t.updateSuccess || 'Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification('Logged out successfully');
      navigate('/login');
    } catch (error) {
           console.error('Logout error:', error);
      showNotification('Logout failed. Please try again.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        showNotification('Profile updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const menuItems = [
    { icon: Languages, label: t.selectLanguage, subLabel: LANGUAGES[language], path: '/languages' },
    { icon: History, label: t.myWorks, count: userWorks.length.toString(), path: '/my-works' },
    { icon: Layers, label: t.materialTracker, subLabel: 'Production Pipeline', path: '/material-tracker' },
    { icon: Package, label: t.trackOrder, subLabel: 'Follow the journey', path: '/track-order' },
    { icon: Heart, label: t.favorites, count: favorites.length.toString(), path: '/favorites' },
    { icon: Award, label: t.certificates, count: userCertificates.length.toString(), path: '/certificates' },
  ];

  return (
    <ScreenLayout title={t.profile}>
      <div className="flex flex-col items-center mb-10 pt-4">
        <div className="relative mb-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-32 h-32 bg-bamboo-ivory rounded-[2.5rem] flex items-center justify-center text-bamboo-dark border-4 border-white shadow-2xl overflow-hidden ring-1 ring-bamboo-gold/20"
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={56} className="opacity-20" />
            )}
          </motion.div>
          <div className="absolute -bottom-1 -right-1 flex gap-2">
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 bg-bamboo-dark text-bamboo-gold rounded-2xl border-2 border-bamboo-gold/30 flex items-center justify-center shadow-2xl shadow-black/40 hover:border-bamboo-gold transition-all duration-300"
              title="Add/Change Photo"
            >
              <ImagePlus size={20} strokeWidth={2.5} />
            </motion.button>
            {profileImage && (
              <motion.button 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setProfileImage(null);
                  showNotification('Profile photo cleared');
                }}
                className="w-11 h-11 bg-bamboo-dark text-bamboo-gold rounded-2xl border-2 border-bamboo-gold/30 flex items-center justify-center shadow-2xl shadow-black/40 hover:border-red-400 hover:text-red-400 transition-all duration-300"
                title="Remove Photo"
              >
                <Trash2 size={20} strokeWidth={2.5} />
              </motion.button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload}
          />
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div 
              key="edit-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-xs space-y-4 px-4"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black text-bamboo-gold uppercase tracking-widest ml-1">{t.nameLabel}</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white border border-bamboo-gold/20 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-bamboo-dark focus:outline-none focus:border-bamboo-gold transition-colors"
                    placeholder={t.nameLabel}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-bamboo-gold uppercase tracking-widest ml-1">{t.emailLabel}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold" />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-white border border-bamboo-gold/20 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-bamboo-dark focus:outline-none focus:border-bamboo-gold transition-colors"
                    placeholder={t.emailLabel}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-bamboo-gold uppercase tracking-widest ml-1">{t.phoneLabel}</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold" />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-white border border-bamboo-gold/20 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-bamboo-dark focus:outline-none focus:border-bamboo-gold transition-colors"
                    placeholder={t.phoneLabel}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1 rounded-2xl py-3 text-xs font-black uppercase tracking-widest"
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t.saveChanges}
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-2xl py-3 px-4"
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(user?.name || '');
                    setEditEmail(user?.email || '');
                    setEditPhone(user?.phone || '');
                  }}
                >
                  <X size={18} />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="display-profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-serif font-bold text-bamboo-dark">{user?.name || 'Artisan'}</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 bg-bamboo-gold/10 text-bamboo-gold rounded-lg hover:bg-bamboo-gold hover:text-white transition-all"
                >
                  <Edit2 size={14} />
                </motion.button>
              </div>
              <p className="text-xs font-bold text-bamboo-dark/30 uppercase tracking-[0.2em] mb-4">{user?.email}</p>
              {user?.phone && (
                <p className="text-[10px] font-black text-bamboo-gold/60 uppercase tracking-widest mb-4 flex items-center gap-1">
                  <Phone size={10} /> {user.phone}
                </p>
              )}
              <div className="bg-bamboo-gold/10 text-bamboo-gold px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-bamboo-gold/20 flex items-center gap-2">
                <Star size={12} fill="currentColor" />
                Master Artisan
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10 px-2">
        <div className="bg-white p-6 rounded-[2.5rem] border border-bamboo-gold/5 text-center shadow-sm">
           <span className="block text-2xl font-black text-bamboo-dark mb-1">4.9</span>
           <span className="text-[10px] text-bamboo-dark/30 uppercase tracking-widest font-black">Rating</span>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-bamboo-gold/5 text-center shadow-sm">
           <span className="block text-2xl font-black text-bamboo-dark mb-1">156</span>
           <span className="text-[10px] text-bamboo-dark/30 uppercase tracking-widest font-black">Sales</span>
        </div>
      </div>

      <div className="space-y-3 mb-10">
        {menuItems.map((item, i) => (
           <motion.button 
             key={i} 
             whileHover={{ x: 5 }}
             onClick={() => navigate(item.path)}
             className="w-full bg-white p-5 rounded-3xl flex items-center justify-between border border-bamboo-gold/5 hover:border-bamboo-gold/20 shadow-sm transition-all group"
           >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-bamboo-ivory rounded-2xl flex items-center justify-center text-bamboo-dark group-hover:bg-bamboo-dark group-hover:text-bamboo-gold transition-colors">
                    <item.icon size={22} strokeWidth={1.5} />
                 </div>
                 <div className="flex flex-col items-start">
                    <span className="font-bold text-bamboo-dark text-sm leading-tight">{item.label}</span>
                    {'subLabel' in item && <span className="text-[9px] text-bamboo-gold font-black uppercase tracking-widest mt-0.5">{item.subLabel}</span>}
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 {'count' in item && <span className="bg-bamboo-gold/10 text-bamboo-gold px-2.5 py-1 rounded-lg text-[10px] font-black">{item.count}</span>}
                 <ChevronRight size={18} className="text-bamboo-dark/20 group-hover:text-bamboo-gold transition-colors" />
              </div>
           </motion.button>
        ))}
      </div>

      <div className="px-2 pb-10 space-y-4">
        <Button 
          variant="secondary"
          className="w-full gap-3 py-5 rounded-3xl bg-bamboo-gold/10 border-bamboo-gold/20 text-bamboo-dark hover:bg-bamboo-gold/20 transition-all font-bold"
          onClick={async () => {
            if (navigator.share) {
              try {
                await navigator.share({
                  title: 'Hasta-Shilpa',
                  text: 'Check out this amazing platform for Artisan Bamboo Furniture!',
                  url: window.location.origin
                });
              } catch (err) {
                console.log('Share failed:', err);
              }
            } else {
              navigator.clipboard.writeText(window.location.origin);
              showNotification("App link copied to clipboard!");
            }
          }}
        >
          <Share2 size={20} className="text-bamboo-gold" />
          {t.shareApp || 'Share App with Friends'}
        </Button>

        <Button 
          variant="outline" 
          className="w-full gap-3 py-5 rounded-3xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all font-bold"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {t.logout}
        </Button>
      </div>
    </ScreenLayout>
  );
}
