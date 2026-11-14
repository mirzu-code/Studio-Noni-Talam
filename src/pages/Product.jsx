import React, { useState } from 'react';
import './Product.css';

const PRODUCTS = [
  {
    id: 'kuih-talam-pandan',
    name: 'Talam Pandan Asli Seri Muka',
    category: 'Kuih Talam',
    tag: 'Terlaris',
    rating: '5.0 (420+ review)',
    price: 'RM 35.00',
    unit: '1 Loyang (10x10")',
    desc: 'Lapisan bawah pulut kukus berlemak santan asli, disaluti lapisan kastard pandan wangi daripada jus daun pandan segar.',
    tiktokUrl: 'https://www.tiktok.com/@nonitalam',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
    badgeColor: '#059669'
  },
  {
    id: 'talam-keladi',
    name: 'Talam Keladi Berlauk Harum',
    category: 'Kuih Talam',
    tag: 'Pilihan Ramai',
    rating: '4.9 (310+ review)',
    price: 'RM 38.00',
    unit: '1 Loyang (10x10")',
    desc: 'Potongan keladi lembut diadun bersama adunan tepung berkrim, ditabur udang kering rangup, daun sup dan cili merah pedas manis.',
    tiktokUrl: 'https://www.tiktok.com/@nonitalam',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=700&q=80',
    badgeColor: '#7C3AED'
  },
  {
    id: 'talam-suji',
    name: 'Talam Suji Santan Mewah',
    category: 'Kuih Talam',
    tag: 'Tradisi',
    rating: '4.9 (190+ review)',
    price: 'RM 36.00',
    unit: '1 Loyang (10x10")',
    desc: 'Tekstur suji yang unik dan lembut dengan keharuman gula melaka asli di lapisan bawah dan lapisan santan pekat berkilat.',
    tiktokUrl: 'https://www.tiktok.com/@nonitalam',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80',
    badgeColor: '#D97706'
  },
  {
    id: 'tepung-premix-talam',
    name: 'Tepung Premix Kuih Talam Signature Noni',
    category: 'Pakej DIY & Bahan',
    tag: 'Mudah Dimasak',
    rating: '5.0 (580+ review)',
    price: 'RM 22.00',
    unit: 'Pek 500g',
    desc: 'Adunan tepung siap sukat mengikut sukatan rahsia Studio Noni Talam. Hanya tambah santan & air pandan! Dijamin jadi.',
    tiktokUrl: 'https://www.tiktok.com/@nonitalam',
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=700&q=80',
    badgeColor: '#2563EB'
  },
  {
    id: 'loyang-tembaga',
    name: 'Loyang Talam Tembaga Khas 10x10"',
    category: 'Peralatan Studio',
    tag: 'Khas Membakar & Mengukus',
    rating: '4.8 (85+ review)',
    price: 'RM 45.00',
    unit: '1 Unit',
    desc: 'Loyang aluminium gred katering tebal, pengalir haba sekata untuk memastikan lapisan kuih talam masak sekata dan licin sempurna.',
    tiktokUrl: 'https://www.tiktok.com/@nonitalam',
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=700&q=80',
    badgeColor: '#4B5563'
  },
  {
    id: 'talam-combo-mini',
    name: 'Set Gift Box Aneka Mini Talam (16 pcs)',
    category: 'Gift Box & Katering',
    tag: 'Hot Item',
    rating: '5.0 (650+ review)',
    price: 'RM 42.00',
    unit: '1 Kotak Hadiah Eksklusif',
    desc: 'Kombinasi 4 jenis kuih talam terhangat Noni Talam dalam potongan sedia hidang. Sesuai untuk majlis keraian, hadiah atau hidangan keluarga.',
    tiktokUrl: 'https://www.tiktok.com/@nonitalam',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
    badgeColor: '#DC2626'
  }
];

const Product = () => {
  const [filter, setFilter] = useState('Semua');

  const categories = ['Semua', 'Kuih Talam', 'Pakej DIY & Bahan', 'Peralatan Studio', 'Gift Box & Katering'];

  const filteredProducts = filter === 'Semua' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === filter);

  return (
    <div className="product-page">
      {/* Hero Banner */}
      <section className="product-hero">
        <div className="product-hero-badge">🛒 Noni Talam Official Store</div>
        <h1>Koleksi Produk & Kuih Noni Talam</h1>
        <p>
          Nikmati keenakan kuih talam warisan asli, pek pra-campuran (premix), dan peralatan studio premium. 
          Pesan terus secara selamat melalui akaun rasmi TikTok kami!
        </p>
        <div className="product-hero-cta">
          <a 
            href="https://www.tiktok.com/@nonitalam" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="tiktok-hero-btn"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18c0 1.94-.66 3.82-1.88 5.32A8.91 8.91 0 0 1 13 27a9.15 9.15 0 0 1-5.18-1.55A9.13 9.13 0 0 1 4 20.25a9.13 9.13 0 0 1 3.82-7.2A8.91 8.91 0 0 1 13 11.5c.34 0 .68.02 1.02.07V15.7c-.34-.1-.7-.15-1.07-.15-2.51 0-4.55 2.04-4.55 4.55s2.04 4.55 4.55 4.55 4.55-2.04 4.55-4.55V6.62c0-2.2.01-4.4.02-6.6z"/>
            </svg>
            Buka TikTok Shop @nonitalam
          </a>
          <span className="live-pill">🔴 Siaran Live TikTok Harian</span>
        </div>
      </section>

      {/* Main Container */}
      <div className="product-container">
        {/* Category Filter */}
        <div className="filter-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {filteredProducts.map((prod) => (
            <div key={prod.id} className="product-card">
              <div className="product-image-wrap">
                <img src={prod.image} alt={prod.name} loading="lazy" />
                <span className="product-tag" style={{ backgroundColor: prod.badgeColor }}>
                  {prod.tag}
                </span>
              </div>
              <div className="product-body">
                <div className="product-header">
                  <span className="product-cat">{prod.category}</span>
                  <span className="product-rating">⭐ {prod.rating}</span>
                </div>
                <h3 className="product-title">{prod.name}</h3>
                <p className="product-desc">{prod.desc}</p>
                
                <div className="product-pricing">
                  <div>
                    <span className="price-val">{prod.price}</span>
                    <span className="unit-val"> / {prod.unit}</span>
                  </div>
                </div>

                <a 
                  href={prod.tiktokUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="buy-tiktok-btn"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18c0 1.94-.66 3.82-1.88 5.32A8.91 8.91 0 0 1 13 27a9.15 9.15 0 0 1-5.18-1.55A9.13 9.13 0 0 1 4 20.25a9.13 9.13 0 0 1 3.82-7.2A8.91 8.91 0 0 1 13 11.5c.34 0 .68.02 1.02.07V15.7c-.34-.1-.7-.15-1.07-.15-2.51 0-4.55 2.04-4.55 4.55s2.04 4.55 4.55 4.55 4.55-2.04 4.55-4.55V6.62c0-2.2.01-4.4.02-6.6z"/>
                  </svg>
                  Beli di TikTok
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* TikTok Banner Notice */}
        <div className="tiktok-trust-banner">
          <div className="trust-icon">✨</div>
          <div className="trust-content">
            <h4>Beli Terus dengan Selamat di TikTok Shop @nonitalam</h4>
            <p>
              Setiap pembelian dijamin selamat, dibungkus rapi dengan pembungkusan kedap udara khas untuk mengekalkan kesegaran kuih talam semasa penghantaran.
            </p>
          </div>
          <a 
            href="https://www.tiktok.com/@nonitalam" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="trust-action-btn"
          >
            Lawati TikTok Shop
          </a>
        </div>
      </div>
    </div>
  );
};

export default Product;
