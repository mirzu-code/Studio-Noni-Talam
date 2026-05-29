import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Studio from './pages/Studio';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';


function App() {
  return (
    <Router>
      <ScrollToTop />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Studio />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
