import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import AdminDashboard from './pages/AdminDashboard';
import PaymentGateway from './pages/PaymentGateway';
import IntroAnimation from './components/IntroAnimation';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('raya_intro_shown');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('raya_intro_shown', 'true');
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans selection:bg-gold selection:text-white">
        {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
        
        <div className={`transition-opacity duration-1000 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/payment-gateway" element={<PaymentGateway />} />
            </Routes>
          </main>
          
          <footer className="bg-emerald-950 text-emerald-100/50 py-16">
            <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
              <div className="flex justify-center items-center space-x-2 text-white">
                  <span className="font-serif text-2xl font-bold">Raya Studio Premium</span>
              </div>
              <div className="flex flex-wrap justify-center gap-8 text-sm font-medium uppercase tracking-widest">
                  <a href="#" className="hover:text-gold">Privasi</a>
                  <a href="#" className="hover:text-gold">Terma</a>
                  <a href="#" className="hover:text-gold">Hubungi</a>
                  <a href="#" className="hover:text-gold">Lokasi</a>
              </div>
              <p className="text-xs">&copy; 2024 Raya Studio Premium. Semua Hak Terpelihara. Abadikan setiap detik mulia.</p>
            </div>
          </footer>
        </div>
      </div>
    </Router>
  );
};

export default App;