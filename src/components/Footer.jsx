import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-box">
          <h3>Studio Noni Talam</h3>
          <p>Pakar bimbingan masakan kuih talam tradisional dengan teknik rahsia warisan turun-temurun.</p>
          <div className="social-links">
            <a href="https://www.tiktok.com/@studiononitalam" target="_blank" rel="noopener noreferrer" className="social-icon" title="Follow kami di TikTok">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18c0 1.94-.66 3.82-1.88 5.32A8.91 8.91 0 0 1 13 27a9.15 9.15 0 0 1-5.18-1.55A9.13 9.13 0 0 1 4 20.25a9.13 9.13 0 0 1 3.82-7.2A8.91 8.91 0 0 1 13 11.5c.34 0 .68.02 1.02.07V15.7c-.34-.1-.7-.15-1.07-.15-2.51 0-4.55 2.04-4.55 4.55s2.04 4.55 4.55 4.55 4.55-2.04 4.55-4.55V6.62c0-2.2.01-4.4.02-6.6z"/>
              </svg>
            </a>
            <a href="#" className="social-icon">🔵</a> 
            <a href="#" className="social-icon">📸</a>
          </div>
        </div>

        <div className="footer-box">
          <h3>Lokasi & Hubungi</h3>
          <p>
            <a href="https://www.google.com/maps/search/?api=1&query=ALIFF+AVENUE+S,+01-09,+Jalan+Tampoi,+Kawasan+Perindustrian+Tampoi,+81200+Johor+Bahru" target="_blank" rel="noopener noreferrer" style={{ display: 'inline', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.4, transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color='var(--color-accent)'} onMouseOut={e => e.currentTarget.style.color='rgba(255, 255, 255, 0.7)'}>
                📍 ALIFF AVENUE S, 01-09, Jalan Tampoi, Kawasan Perindustrian Tampoi, 81200 Johor Bahru, Johor Darul Ta'zim
            </a>
          </p>
          <p>📞 018-316 8944</p>
          <p>📱 <a href="https://wa.me/60183168944" target="_blank" rel="noopener noreferrer" style={{ display: 'inline', color: 'var(--color-accent)', fontWeight: 500 }} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='var(--color-accent)'}>WhatsApp Kami</a></p>
        </div>

        <div className="footer-box">
          <h3>Rangkaian Kami</h3>
          <p>Pakar bimbingan masakan kuih talam tradisional dengan teknik rahsia warisan turun-temurun.</p>
          
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: 'var(--color-accent)', fontWeight: 600, marginBottom: '10px', fontSize: '0.85rem', letterSpacing: '0.5px' }}>IKUTI KAMI DI TIKTOK:</p>
            
            <a href="https://www.tiktok.com/@studiononitalam" target="_blank" rel="noopener noreferrer" className="tiktok-link">
              <div className="social-icon small">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18c0 1.94-.66 3.82-1.88 5.32A8.91 8.91 0 0 1 13 27a9.15 9.15 0 0 1-5.18-1.55A9.13 9.13 0 0 1 4 20.25a9.13 9.13 0 0 1 3.82-7.2A8.91 8.91 0 0 1 13 11.5c.34 0 .68.02 1.02.07V15.7c-.34-.1-.7-.15-1.07-.15-2.51 0-4.55 2.04-4.55 4.55s2.04 4.55 4.55 4.55 4.55-2.04 4.55-4.55V6.62c0-2.2.01-4.4.02-6.6z"/></svg>
              </div>
              <span>@studiononitalam (Bengkel)</span>
            </a>

            <a href="https://www.tiktok.com/@nonitalam" target="_blank" rel="noopener noreferrer" className="tiktok-link">
              <div className="social-icon small accent">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18c0 1.94-.66 3.82-1.88 5.32A8.91 8.91 0 0 1 13 27a9.15 9.15 0 0 1-5.18-1.55A9.13 9.13 0 0 1 4 20.25a9.13 9.13 0 0 1 3.82-7.2A8.91 8.91 0 0 1 13 11.5c.34 0 .68.02 1.02.07V15.7c-.34-.1-.7-.15-1.07-.15-2.51 0-4.55 2.04-4.55 4.55s2.04 4.55 4.55 4.55 4.55-2.04 4.55-4.55V6.62c0-2.2.01-4.4.02-6.6z"/></svg>
              </div>
              <span>@nonitalam (Kedai Kuih)</span>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; 2026 Studio Noni Talam. Hak Cipta Terpelihara.
      </div>
    </footer>
  );
};

export default Footer;
