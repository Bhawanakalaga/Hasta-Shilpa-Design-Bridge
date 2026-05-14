import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Award, Trash2, Calendar, FileText } from 'lucide-react';
import ScreenLayout from '../components/ScreenLayout';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

export default function CertificatesScreen() {
  const navigate = useNavigate();
  const { language, userCertificates, addCertificate, removeFromCertificates } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [newName, setNewName] = useState('');
  const [issuer, setIssuer] = useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && newName) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addCertificate({
          id: Date.now().toString(),
          title: newName,
          issuer: issuer || 'Independent Artist',
          image: reader.result as string,
          date: new Date().toLocaleDateString()
        });
        setIsUploading(false);
        setNewName('');
        setIssuer('');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ScreenLayout showNav={false} className="bg-gray-50">
      <div className="flex items-center justify-between mb-6 pt-2">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{t.certificates}</h1>
        </div>
        <button 
          onClick={() => setIsUploading(true)}
          className="w-10 h-10 bg-amber-700 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-6 rounded-3xl shadow-xl border border-amber-100 mb-8"
          >
            <h3 className="font-bold text-gray-900 mb-4">Add Certificate</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block text-left">Certificate Name</label>
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Master Weaver Award"
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block text-left">Issuing Authority</label>
                <input 
                  type="text"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="e.g. Crafts Council of India"
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors cursor-pointer"
              >
                <FileText size={24} className="mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Select Image / PDF</span>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleUpload} />
              
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsUploading(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 pb-12">
        {userCertificates.length > 0 ? (
          userCertificates.map((cert) => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={cert.id} 
              className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 shrink-0">
                <Award size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{cert.title}</h3>
                <p className="text-xs text-gray-500 mb-1">{cert.issuer}</p>
                <div className="flex items-center gap-2">
                  <Calendar size={10} className="text-gray-300" />
                  <span className="text-[10px] text-gray-400 font-medium">{cert.date}</span>
                </div>
              </div>
              {removeFromCertificates && (
                <button 
                  onClick={() => removeFromCertificates(cert.id)}
                  className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </motion.div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center text-gray-200">
            <Award size={48} strokeWidth={1} />
            <p className="mt-4 font-bold text-sm tracking-widest uppercase">No certificates yet</p>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}
