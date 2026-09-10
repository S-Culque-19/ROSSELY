import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SupportChatbot from './components/SupportChatbot';
import LoyaltyWalletCard from './components/LoyaltyWalletCard';
import SubscriptionBannerWidget from './components/SubscriptionBannerWidget';
import SubscriptionBannerWidget from './components/SubscriptionBannerWidget';
import HomeView from './views/HomeView';
import CatalogView from './views/CatalogView';
import CommunityView from './views/CommunityView';
import ProductDetailView from './views/ProductDetailView';
import CartView from './views/CartView';
import CheckoutView from './views/CheckoutView';
import AdminDashboardView from './views/AdminDashboardView';
import AuthView from './views/AuthView';
import SubscriptionView from './views/SubscriptionView';
import './App.css';

function MainContent({ busqueda }) {
  const { currentView } = useStore();

  return (
    <main className="w-full flex-grow">
      {currentView === 'home' && <HomeView />}
      {currentView === 'catalog' && <CatalogView busqueda={busqueda} />}
      {currentView === 'community' && <CommunityView />}
      {currentView === 'detail' && <ProductDetailView />}
      {currentView === 'cart' && <CartView />}
      {currentView === 'checkout' && <CheckoutView />}
      {currentView === 'admin' && <AdminDashboardView />}
      {currentView === 'auth' && <AuthView />}
      {currentView === 'suscripcion' && <SubscriptionView />}
    </main>
  );
}

export default function App() {
  const [busqueda, setBusqueda] = useState('');

  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col justify-between bg-[#FFF5F7] text-[#222222]">
        <Navbar busqueda={busqueda} setBusqueda={setBusqueda} />
        <MainContent busqueda={busqueda} />
        <Footer />
        {/* Componentes Flotantes Globales */}
        <SupportChatbot />
        <LoyaltyWalletCard />
        <SubscriptionBannerWidget />
      </div>
    </StoreProvider>
  );
}