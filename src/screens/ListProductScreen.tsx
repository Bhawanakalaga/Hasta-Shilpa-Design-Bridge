import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Package, Tag, Layers, ShoppingBag } from 'lucide-react';
import ScreenLayout from '../components/ScreenLayout';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { motion } from 'motion/react';
import Button from '../components/Button';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

export default function ListProductScreen() {
  const navigate = useNavigate();
  const { language, showNotification } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Home Decor');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      showNotification('Please login to sell products', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'products'), {
        title: { [language]: title, en: title },
        description: { [language]: 'Artisan listed product', en: 'Artisan listed product' },
        price: parseFloat(price),
        category,
        image: image || 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=800',
        sellerId: auth.currentUser.uid,
        sellerName: auth.currentUser.displayName || 'Artisan',
        createdAt: new Date().toISOString(),
        isModern: true
      });
      showNotification('Product Listed Successfully');
      navigate('/marketplace');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenLayout showNav={false} className="bg-white">
      <div className="flex items-center gap-4 mb-8 pt-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">List New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-12">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-bamboo-gold hover:text-bamboo-gold transition-all cursor-pointer overflow-hidden relative shadow-inner"
        >
          {image ? (
            <img src={image} alt="Product preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera size={48} strokeWidth={1} className="mb-4" />
              <span className="text-sm font-bold uppercase tracking-widest">Upload Product Photo</span>
            </>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product Title</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold/40" size={18} />
              <input
                type="text"
                required
                placeholder="e.g. Handmade Bamboo Vase"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-bamboo-gold outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold/40" size={18} />
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-bamboo-gold outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-bamboo-gold/40" size={18} />
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-bamboo-gold outline-none appearance-none font-medium"
                >
                  <option>Home Decor</option>
                  <option>Furniture</option>
                  <option>Accessories</option>
                  <option>Garden</option>
                  <option>Lighting</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full py-4 text-lg gap-2" 
          disabled={!image || isSubmitting}
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingBag size={20} />
              Post to Marketplace
            </>
          )}
        </Button>

        <div className="pt-4 text-center">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">Product still in progress?</p>
          <button 
            type="button"
            onClick={() => navigate('/material-tracker')}
            className="text-xs font-bold text-bamboo-gold border-b border-bamboo-gold/30 pb-0.5"
          >
            Track Raw Material & Production Progress
          </button>
        </div>
      </form>
    </ScreenLayout>
  );
}
