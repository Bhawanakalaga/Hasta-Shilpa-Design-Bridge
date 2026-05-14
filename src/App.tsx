/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import Toast from './components/Toast';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import MyWorksScreen from './screens/MyWorksScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import CertificatesScreen from './screens/CertificatesScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import OrderSuccessScreen from './screens/OrderSuccessScreen';
import BlueprintScreen from './screens/BlueprintScreen';
import MaterialTrackerScreen from './screens/MaterialTrackerScreen';
import PriceCalculatorScreen from './screens/PriceCalculatorScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import CartScreen from './screens/CartScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import ProfileScreen from './screens/ProfileScreen';
import LanguagesScreen from './screens/LanguagesScreen';
import ListProductScreen from './screens/ListProductScreen';
import TrackOrderScreen from './screens/TrackOrderScreen';
import CategoryScreen from './screens/CategoryScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative overflow-hidden">
          <Toast />
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            
            <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/category/:id" element={<ProtectedRoute><CategoryScreen /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProtectedRoute><ProductDetailScreen /></ProtectedRoute>} />
            <Route path="/my-works" element={<ProtectedRoute><MyWorksScreen /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesScreen /></ProtectedRoute>} />
            <Route path="/certificates" element={<ProtectedRoute><CertificatesScreen /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutScreen /></ProtectedRoute>} />
            <Route path="/order-success" element={<ProtectedRoute><OrderSuccessScreen /></ProtectedRoute>} />
            <Route path="/blueprint/:id" element={<ProtectedRoute><BlueprintScreen /></ProtectedRoute>} />
            <Route path="/material-tracker" element={<ProtectedRoute><MaterialTrackerScreen /></ProtectedRoute>} />
            <Route path="/price-calculator" element={<ProtectedRoute><PriceCalculatorScreen /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><MarketplaceScreen /></ProtectedRoute>} />
            <Route path="/list-product" element={<ProtectedRoute><ListProductScreen /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><CartScreen /></ProtectedRoute>} />
            <Route path="/track-order" element={<ProtectedRoute><TrackOrderScreen /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><ChatbotScreen /></ProtectedRoute>} />
            <Route path="/languages" element={<LanguagesScreen />} />
            <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
