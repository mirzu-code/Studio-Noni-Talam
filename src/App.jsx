import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Studio from './pages/Studio';
import OrderKuih from './pages/OrderKuih';
import Product from './pages/Product';
import Learn from './pages/Learn';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Studio />} />
            <Route path="/tempah-kuih" element={<OrderKuih />} />
            <Route path="/product" element={<Product />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <ChatWidget />
    </Router>
  );
}

export default App;
