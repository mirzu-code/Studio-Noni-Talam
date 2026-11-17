import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './OrderKuih.css';

// Default menu kuih jika belum ada di database atau offline fallback
export const DEFAULT_KUIH_LIST = [
  {
    id: 'kuih-talam-pandan',
    name: 'Talam Pandan Asli (Seri Muka)',
    category: 'Manis Lemak',
    hasSizeOptions: true, // perlu pilih saiz 8x8, 9x9, 10x10
    prices: { '8x8': 35, '9x9': 45, '10x10': 55 },
    defaultPrice: 35,
    description: 'Lapisan pulut santan kukus berlemak di bawah, disaluti kastard pandan jus asli harum di atas.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    id: 'talam-keladi-berlauk',
    name: 'Talam Keladi Berlauk Harum',
    category: 'Berlauk Gurih',
    hasSizeOptions: true,
    prices: { '8x8': 38, '9x9': 48, '10x10': 60 },
    defaultPrice: 38,
    description: 'Keladi segar dipotong dadu diadun tepung lembut, ditabur sambal udang kering rangup dan bawang goreng.',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    id: 'talam-suji',
    name: 'Talam Suji Gula Melaka Mewah',
    category: 'Tradisional',
    hasSizeOptions: true,
    prices: { '8x8': 36, '9x9': 46, '10x10': 58 },
    defaultPrice: 36,
    description: 'Tekstur suji keemasan bersama gula melaka asli, dilapisi adunan santan pekat berkilau.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    id: 'talam-cendol',
    name: 'Talam Cendol Santan Sawit',
    category: 'Manis Lemak',
    hasSizeOptions: true,
    prices: { '8x8': 35, '9x9': 45, '10x10': 55 },
    defaultPrice: 35,
    description: 'Butiran cendol pandan kenyal dalam lapisan bawah, dipadankan lapisan gula merah melaka pekat.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    id: 'talam-berlauk-daging',
    name: 'Talam Berlauk Daging Kisar Pedas Manis',
    category: 'Berlauk Gurih',
    hasSizeOptions: true,
    prices: { '8x8': 42, '9x9': 52, '10x10': 65 },
    defaultPrice: 42,
    description: 'Daging kisar rempah ratus warisan, cili potong segar dan daun sup di atas adunan talam lembut.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    id: 'kuih-lapis-pelangi',
    name: 'Kuih Lapis Pelangi Nyaman',
    category: 'Koleksi Kuih Siap',
    hasSizeOptions: true,
    prices: { '8x8': 34, '9x9': 44, '10x10': 54 },
    defaultPrice: 34,
    description: 'Sembilan lapisan kenyal dan lembut berwarna-warni yang boleh dikopek selapis demi selapis.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    id: 'box-aneka-talam',
    name: 'Platter Gift Box Aneka Mini Talam (25 pcs)',
    category: 'Set Kotak Hidang',
    hasSizeOptions: false, // Standard size box
    prices: { 'Standard': 45 },
    defaultPrice: 45,
    description: 'Kotak hadiah sedia hidang berisi 4 kombinasi kuih talam berbeza yang dipotong kemas.',
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80',
    available: true
  }
];

const OrderKuih = () => {
  const navigate = useNavigate();

  // Menu Items from DB or Fallback
  const [menuItems, setMenuItems] = useState(DEFAULT_KUIH_LIST);
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Cart / Order Selection
  const [selectedKuih, setSelectedKuih] = useState(DEFAULT_KUIH_LIST[0]);
  const [selectedSize, setSelectedSize] = useState('8x8');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Customer Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('11:00 AM');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup'); // 'pickup' | 'delivery'
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Fetch updated availability from Supabase if table exists
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const { data, error } = await supabase
          .from('kuih_catalog')
          .select('*');
        if (!error && data && data.length > 0) {
          // Merge with default items or use db records
          setMenuItems(data);
          const firstAvail = data.find(k => k.available !== false) || data[0];
          setSelectedKuih(firstAvail);
        }
      } catch (err) {
        console.log('Using default local catalog:', err);
      }
    };
    fetchCatalog();
  }, []);

  // Calculate Price
  const getUnitPrice = (kuih, size) => {
    if (!kuih) return 0;
    if (kuih.hasSizeOptions && kuih.prices && kuih.prices[size]) {
      return kuih.prices[size];
    }
    return kuih.defaultPrice || 35;
  };

  const currentUnitPrice = getUnitPrice(selectedKuih, selectedSize);
  const totalPrice = currentUnitPrice * quantity;

  const handleSelectKuih = (item) => {
    if (!item.available) return;
    setSelectedKuih(item);
    if (!item.hasSizeOptions) {
      setSelectedSize('Standard');
    } else if (selectedSize === 'Standard') {
      setSelectedSize('8x8');
    }
  };

  const handleProceedPayment = (e) => {
    e.preventDefault();

    if (!selectedKuih) {
      alert('Sila pilih sekurang-kurangnya satu jenis kuih!');
      return;
    }

    if (!pickupDate) {
      alert('Sila pilih tarikh ambil / penghantaran!');
      return;
    }

    // Build Package Object for Checkout.jsx
    const kuihPackageData = {
      orderType: 'kuih_order',
      title: `${selectedKuih.name} ${selectedKuih.hasSizeOptions ? `(Saiz ${selectedSize})` : ''}`,
      kuihName: selectedKuih.name,
      kuihId: selectedKuih.id,
      size: selectedKuih.hasSizeOptions ? selectedSize : 'Standard',
      quantity: Number(quantity),
      unitPrice: currentUnitPrice,
      price: totalPrice,
      deliveryMethod,
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : 'Ambil Sendiri di Studio Tampoi, JB',
      notes,
      pax: `${quantity} Loyang/Set`,
      icon: '🧁'
    };

    // Navigate to unified Checkout
    navigate('/checkout', {
      state: {
        orderType: 'kuih_order',
        selectedPackage: kuihPackageData.title,
        bookingPackageObj: kuihPackageData,
        bookingDate: pickupDate,
        bookingTime: pickupTime,
        customerName,
        customerPhone,
        totalAmount: totalPrice
      }
    });
  };

  const categories = ['Semua', 'Manis Lemak', 'Berlauk Gurih', 'Tradisional', 'Set Kotak Hidang'];
  const filteredList = selectedCategory === 'Semua'
    ? menuItems
    : menuItems.filter(k => k.category === selectedCategory);

  return (
    <div className="order-kuih-page">
      {/* Hero Banner */}
      <section className="order-hero">
        <div className="order-hero-badge">📦 Tempahan Kuih Talam Siap Masak</div>
        <h1>Tempahan Kuih Talam Siap Loyang</h1>
        <p>
          Pilih mana-mana kuih talam kegemaran anda dalam saiz <strong>8x8</strong>, <strong>9x9</strong>, atau <strong>10x10</strong>.
          Segar dimasak pada hari pengambilan! Sesuai untuk keraian, kenduri, pejabat mahupun santapan keluarga.
        </p>
      </section>

      <div className="order-container">
        <form onSubmit={handleProceedPayment}>
          <div className="order-grid-layout">
            
            {/* LEFT COLUMN: KUIH SELECTION */}
            <div className="order-left-column">
              <div className="order-step-card">
                <div className="step-header">
                  <span className="step-num">1</span>
                  <div>
                    <h2>Pilih Jenis Kuih</h2>
                    <p>Klik kuih yang ingin anda tempah</p>
                  </div>
                </div>

                {/* Filter categories */}
                <div className="kuih-cat-chips">
                  {categories.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      className={`kuih-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Kuih Selection Cards */}
                <div className="kuih-cards-grid">
                  {filteredList.map((item) => {
                    const isSelected = selectedKuih?.id === item.id;
                    const isAvail = item.available !== false;
                    return (
                      <div
                        key={item.id}
                        className={`kuih-select-card ${isSelected ? 'selected' : ''} ${!isAvail ? 'sold-out' : ''}`}
                        onClick={() => handleSelectKuih(item)}
                      >
                        <div className="kuih-img-wrap">
                          <img src={item.image} alt={item.name} loading="lazy" />
                          {!isAvail && <span className="sold-out-badge">Habis / Tutup</span>}
                          {isSelected && <span className="selected-badge">✓ Dipilih</span>}
                        </div>
                        <div className="kuih-card-content">
                          <div className="kuih-badge-row">
                            <span className="category-tag">{item.category}</span>
                            {item.hasSizeOptions && <span className="size-hint">Pilihan 3 Saiz</span>}
                          </div>
                          <h3 className="kuih-name">{item.name}</h3>
                          <p className="kuih-desc-short">{item.description}</p>
                          <div className="kuih-base-price">
                            Dari <strong>RM {item.prices ? item.prices['8x8'] || item.defaultPrice : item.defaultPrice}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: SIZE & QUANTITY */}
              {selectedKuih && (
                <div className="order-step-card">
                  <div className="step-header">
                    <span className="step-num">2</span>
                    <div>
                      <h2>Pilih Saiz & Kuantiti</h2>
                      <p>Kesesuaian saiz loyang mengikut bilangan tetamu</p>
                    </div>
                  </div>

                  {selectedKuih.hasSizeOptions ? (
                    <div className="size-selection-block">
                      <label className="section-label">Pilih Saiz Loyang:</label>
                      <div className="size-options-grid" role="group" aria-label="Pilih saiz loyang">
                        {[
                          { size: '8x8', label: '8" x 8" (Kecil)', slices: '± 25-36 Potong', price: selectedKuih.prices?.['8x8'] || 35 },
                          { size: '9x9', label: '9" x 9" (Sederhana)', slices: '± 36-49 Potong', price: selectedKuih.prices?.['9x9'] || 45 },
                          { size: '10x10', label: '10" x 10" (Besar/Paling Popular)', slices: '± 50-64 Potong', price: selectedKuih.prices?.['10x10'] || 55 }
                        ].map((sz) => (
                          <button
                            key={sz.size}
                            type="button"
                            className={`size-card ${selectedSize === sz.size ? 'active' : ''}`}
                            onClick={() => setSelectedSize(sz.size)}
                            aria-pressed={selectedSize === sz.size}
                          >
                            <div className="size-title">{sz.label}</div>
                            <div className="size-slices">{sz.slices}</div>
                            <div className="size-price">RM {sz.price.toFixed(2)}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="standard-size-box">
                      <span className="box-icon">🎁</span>
                      <div>
                        <strong>Saiz Standard (Kotak Eksklusif)</strong>
                        <p>Kuantiti mengandungi 25 potongan bersaiz hidang.</p>
                      </div>
                      <div className="standard-price">RM {currentUnitPrice.toFixed(2)}</div>
                    </div>
                  )}

                  {/* Quantity & Notes */}
                  <div className="qty-notes-row">
                    <div className="form-group-item">
                      <label className="section-label">Bilangan Loyang / Set:</label>
                      <div className="qty-control">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        >
                          -
                        </button>
                        <span className="qty-number">{quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => setQuantity(prev => prev + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="form-group-item full-width">
                      <label className="section-label">Nota Khas / Permintaan Potongan (Opsional):</label>
                      <input
                        type="text"
                        className="custom-text-input"
                        placeholder="Cth: Potong kecil 64 pcs, bungkus daun pisang, kurangkan manis..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: CUSTOMER DETAILS & ORDER SUMMARY */}
            <div className="order-right-column">
              <div className="order-summary-box">
                <h3>Ringkasan Tempahan</h3>

                <div className="summary-kuih-preview">
                  <div className="summary-img">
                    <img src={selectedKuih?.image} alt={selectedKuih?.name} />
                  </div>
                  <div>
                    <h4 className="preview-name">{selectedKuih?.name}</h4>
                    <span className="preview-size">
                      {selectedKuih?.hasSizeOptions ? `Loyang Saiz: ${selectedSize}` : 'Pek Standard'}
                    </span>
                    <div className="preview-calc">
                      RM {currentUnitPrice.toFixed(2)} x {quantity} unit
                    </div>
                  </div>
                </div>

                <hr className="summary-divider" />

                {/* Step 3 Details Form */}
                <h4 className="form-section-heading">Maklumat Pelanggan</h4>
                
                <div className="form-input-group">
                  <label>Nama Penuh *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama anda"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="summary-input"
                  />
                </div>

                <div className="form-input-group">
                  <label>Nombor WhatsApp / Telefon *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Cth: 0183168944"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="summary-input"
                  />
                </div>

                <div className="form-input-group">
                  <label>Tarikh Ambil / Terima *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="summary-input"
                  />
                  <small className="help-text">Tempahan perlu dibuat sekurang-kurangnya 1 hari awal.</small>
                </div>

                <div className="form-input-group">
                  <label>Waktu Siap Pengambilan *</label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="summary-input"
                  >
                    <option value="10:00 AM">10:00 AM (Pagi)</option>
                    <option value="11:30 AM">11:30 AM (Tengahari)</option>
                    <option value="02:00 PM">02:00 PM (Petang)</option>
                    <option value="04:30 PM">04:30 PM (Petang)</option>
                    <option value="06:00 PM">06:00 PM (Awal Malam)</option>
                  </select>
                </div>

                <div className="form-input-group">
                  <label>Kaedah Pengambilan:</label>
                  <div className="delivery-radio-group">
                    <label className={`radio-pill ${deliveryMethod === 'pickup' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="delMethod"
                        value="pickup"
                        checked={deliveryMethod === 'pickup'}
                        onChange={() => setDeliveryMethod('pickup')}
                      />
                      Ambil Sendiri (Self-Pickup)
                    </label>
                    <label className={`radio-pill ${deliveryMethod === 'delivery' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="delMethod"
                        value="delivery"
                        checked={deliveryMethod === 'delivery'}
                        onChange={() => setDeliveryMethod('delivery')}
                      />
                      Penghantaran (Lalamove/Grab)
                    </label>
                  </div>
                </div>

                {deliveryMethod === 'delivery' && (
                  <div className="form-input-group">
                    <label>Alamat Penghantaran *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Masukkan alamat lengkap rumah / pejabat..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="summary-input"
                    />
                    <small className="help-text">Caj tambang penghantaran akan dibayar terus kepada rider semasa terima.</small>
                  </div>
                )}

                <hr className="summary-divider" />

                {/* Total & Checkout Button */}
                <div className="total-breakdown-row">
                  <span>Jumlah Bayaran:</span>
                  <span className="total-val-highlight">RM {totalPrice.toFixed(2)}</span>
                </div>

                <button type="submit" className="proceed-checkout-btn">
                  Teruskan ke Pembayaran (RM {totalPrice.toFixed(2)}) ➔
                </button>

                <p className="secure-badge">
                  🔒 Bayaran selamat & resit rasmi dikeluarkan serta-merta melalui FPX, DuitNow QR & Touch 'n Go.
                </p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderKuih;
