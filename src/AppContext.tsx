import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, User, CartItem, Product } from './types';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs, limit } from 'firebase/firestore';

async function testConnection() {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  userWorks: any[];
  addWork: (work: any) => void;
  removeFromWorks: (id: string) => void;
  userCertificates: any[];
  addCertificate: (cert: any) => void;
  removeFromCertificates: (id: string) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  profileImage: string | null;
  setProfileImage: (img: string | null) => void;
  materialHistory: any[];
  setMaterialHistory: React.Dispatch<React.SetStateAction<any[]>>;
  poles: Record<string, number>;
  setPolesForProduct: (productId: string, count: number) => void;
  notification: { message: string; type: 'success' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  lastOrderId: string | null;
  setLastOrderId: (id: string | null) => void;
  loading: boolean;
  t: Record<string, any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
import { TRANSLATIONS } from './constants';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const [lastOrderId, setLastOrderIdState] = useState<string | null>(() => {
    return localStorage.getItem('last_order_id');
  });

  const setLastOrderId = (id: string | null) => {
    setLastOrderIdState(id);
    if (id) localStorage.setItem('last_order_id', id);
    else localStorage.removeItem('last_order_id');
  };

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return localStorage.getItem('profile_image');
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [userWorks, setUserWorks] = useState<any[]>(() => {
    const saved = localStorage.getItem('user_works');
    return saved ? JSON.parse(saved) : [];
  });

  const [userCertificates, setUserCertificates] = useState<any[]>(() => {
    const saved = localStorage.getItem('user_certs');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [materialHistory, setMaterialHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('material_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [poles, setPoles] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('poles_map');
    return saved ? JSON.parse(saved) : {};
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!initialAuthChecked) setLoading(true);
      
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      try {
        if (firebaseUser) {
          const userPath = `users/${firebaseUser.uid}`;
          const userRef = doc(db, 'users', firebaseUser.uid);

          // Initial check/migration
          let userDoc;
          try {
            userDoc = await getDoc(userRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, userPath);
            setLoading(false);
            return;
          }

          if (!userDoc.exists()) {
            let foundProfile = false;
            // If phone login, try to find profile by phone number (registered via email)
            if (firebaseUser.phoneNumber) {
              const q = query(
                collection(db, 'users'), 
                where('phone', '==', firebaseUser.phoneNumber),
                limit(1)
              );
              try {
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                  const existingData = querySnapshot.docs[0].data();
                  // Copy profile to this new UID to link them
                  const newUser = {
                    name: existingData.name || 'Artisan',
                    email: existingData.email || '',
                    language: existingData.language || 'en',
                    phone: existingData.phone || firebaseUser.phoneNumber
                  };
                  // link doc to new firebase user UID
                  await setDoc(userRef, {
                    ...existingData,
                    ...newUser,
                    createdAt: existingData.createdAt || serverTimestamp(),
                  }, { merge: true });
                  
                  // Also update the original document if it was a different UID to prevent duplicate searches
                  if (querySnapshot.docs[0].id !== firebaseUser.uid) {
                    const oldRef = doc(db, 'users', querySnapshot.docs[0].id);
                    await setDoc(oldRef, { linkedTo: firebaseUser.uid }, { merge: true }).catch(() => {});
                  }

                  setUser(newUser);
                  foundProfile = true;
                }
              } catch (err) {
                // Non-fatal, just log and continue. Might be no permission to search whole collection.
                console.warn('Search query failed:', err);
              }
            }
            
            if (!foundProfile) {
              // Always auto-create profile if missing, instead of signing out
              const isGoogle = firebaseUser.providerData.some(p => p.providerId === 'google.com');
              const newUser: User = {
                name: firebaseUser.displayName || (isGoogle ? 'Artisan' : ''),
                email: firebaseUser.email || '',
                language: language || 'en',
                phone: firebaseUser.phoneNumber || ''
              };
              
              setUser(newUser);
              await setDoc(userRef, {
                ...newUser,
                favorites: favorites || [],
                cart: cart || [],
                createdAt: serverTimestamp()
              }, { merge: true });
            }
          } else {
            // Force set user from doc data to avoid null state during navigation
            const data = userDoc.data();
            setUser({
              name: data.name || 'Artisan',
              email: data.email || '',
              language: data.language || 'en',
              phone: data.phone || ''
            });
          }

          // Real-time listener
          unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              const userData = doc.data();
              setUser({
                name: userData.name || 'Artisan',
                email: userData.email || '',
                language: userData.language || 'en',
                phone: userData.phone || ''
              });
              if (userData.language) setLanguage(userData.language as Language);
              if (userData.favorites) setFavorites(userData.favorites);
              if (userData.cart) setCart(userData.cart);
              if (userData.photoURL) setProfileImage(userData.photoURL);
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, userPath);
          });

        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error in auth/snapshot setup:', err);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialAuthChecked(true);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    // Sync with Firestore if logged in
    if (user && auth.currentUser) {
      const userPath = `users/${auth.currentUser.uid}`;
      const userRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userRef, { language }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, userPath);
      });
    }
  }, [language, user]);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    // Sync with Firestore if logged in
    if (user && auth.currentUser) {
      const userPath = `users/${auth.currentUser.uid}`;
      const userRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userRef, { cart }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, userPath);
      });
    }
  }, [cart, user]);

  useEffect(() => {
    localStorage.setItem('user_works', JSON.stringify(userWorks));
  }, [userWorks]);

  useEffect(() => {
    localStorage.setItem('user_certs', JSON.stringify(userCertificates));
  }, [userCertificates]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    // Sync with Firestore if logged in
    if (user && auth.currentUser) {
      const userPath = `users/${auth.currentUser.uid}`;
      const userRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userRef, { favorites }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, userPath);
      });
    }
  }, [favorites, user]);

  useEffect(() => {
    if (profileImage) localStorage.setItem('profile_image', profileImage);
    else localStorage.removeItem('profile_image');

    // Sync with Firestore if logged in
    if (user && auth.currentUser) {
      const userPath = `users/${auth.currentUser.uid}`;
      const userRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userRef, { photoURL: profileImage || '' }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, userPath);
      });
    }
  }, [profileImage, user]);

  useEffect(() => {
    localStorage.setItem('material_history', JSON.stringify(materialHistory));
  }, [materialHistory]);

  useEffect(() => {
    localStorage.setItem('poles_map', JSON.stringify(poles));
  }, [poles]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const addWork = (work: any) => setUserWorks(prev => [work, ...prev]);
  const removeFromWorks = (id: string) => setUserWorks(prev => prev.filter(w => w.id !== id));
  const addCertificate = (cert: any) => setUserCertificates(prev => [cert, ...prev]);
  const removeFromCertificates = (id: string) => setUserCertificates(prev => prev.filter(c => c.id !== id));

  const setPolesForProduct = (productId: string, count: number) => {
    setPoles(prev => ({ ...prev, [productId]: count }));
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const t = {
    ...TRANSLATIONS.en,
    ...(TRANSLATIONS[language as keyof typeof TRANSLATIONS] || {})
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, 
      user, setUser, 
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      userWorks, addWork, removeFromWorks,
      userCertificates, addCertificate, removeFromCertificates,
      favorites, toggleFavorite,
      profileImage, setProfileImage,
      materialHistory, setMaterialHistory,
      poles, setPolesForProduct,
      notification, showNotification,
      lastOrderId, setLastOrderId,
      loading,
      t
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
