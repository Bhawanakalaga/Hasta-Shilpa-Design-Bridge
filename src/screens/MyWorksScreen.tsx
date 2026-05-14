import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Image as ImageIcon, Trash2, Calendar } from 'lucide-react';
import ScreenLayout from '../components/ScreenLayout';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

export default function MyWorksScreen() {
  const navigate = useNavigate();
  const { language, userWorks, addWork, removeFromWorks } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && newTitle) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addWork({
          id: Date.now().toString(),
          title: newTitle,
          image: reader.result as string,
          date: new Date().toLocaleDateString()
        });
        setIsUploading(false);
        setNewTitle('');
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
          <h1 className="text-xl font-bold text-gray-900">{t.myWorks}</h1>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white p-6 rounded-3xl shadow-xl border border-amber-100 mb-8"
          >
            <h3 className="font-bold text-gray-900 mb-4">Upload New Work</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Title</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Traditional Bamboo Vase"
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors cursor-pointer"
              >
                <ImageIcon size={32} className="mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest">Select Image</span>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
              
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsUploading(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4 pb-12">
        {userWorks.length > 0 ? (
          userWorks.map((work) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={work.id} 
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col"
            >
              <div className="h-40 bg-gray-100 relative">
                <img src={work.image} alt={work.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{work.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar size={10} />
                    <span className="text-[10px] font-medium">{work.date}</span>
                  </div>
                  {removeFromWorks && (
                    <button 
                      onClick={() => removeFromWorks(work.id)}
                      className="p-1.5 text-red-100 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-2 py-20 flex flex-col items-center text-gray-300">
            <ImageIcon size={48} strokeWidth={1} />
            <p className="mt-4 font-bold text-sm tracking-wide">NO ARTWORKS YET</p>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}
