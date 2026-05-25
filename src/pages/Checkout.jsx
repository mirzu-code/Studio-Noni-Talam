import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { supabase } from '../../supabaseClient';
import './Studio.css'; // Reuse styles

// ─── EmailJS Configuration ──────────────────────────────────────────────────
// IMPORTANT: You need to fill in these values after setting up your EmailJS account.
// See setup instructions in the README or from the assistant.
const EMAILJS_SERVICE_ID  = 'service_f45x2sd';  // ✅ Set
const EMAILJS_TEMPLATE_ID = 'template_wuwjjk1'; // ✅ Set
const EMAILJS_PUBLIC_KEY  = 'u79V0OHRkuWasWZdk'; // ✅ Set
// ─────────────────────────────────────────────────────────────────────────────

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState(2); // Start at Payment
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [receiptData, setReceiptData] = useState(null);

  // Admin WhatsApp
  const ADMIN_WHATSAPP = '60183168944';
  // Owner Notification Email (will be sent after receipt is confirmed)
  const OWNER_EMAIL = 'owner@example.com'; // TODO: replace with actual owner email

  const packages = [
    { id: 1, title: 'Package 1', pax: 1, price: 100, icon: '🧑' },
    { id: 2, title: 'Package 2', pax: 2, price: 180, icon: '🧑‍🤝‍🧑' },
    { id: 3, title: 'Package 3', pax: 3, price: 250, icon: '👨‍👩‍👧' },
    { id: 4, title: 'Package 4', pax: 4, price: 300, icon: '👨‍👩‍👧‍👦' },
  ];

  // If accessed directly without state, redirect to studio
  useEffect(() => {
    if (!location.state || !location.state.selectedPackage) {
      navigate('/');
    }
  }, [location, navigate]);

  if (!location.state || !location.state.selectedPackage) return (
    <div className="studio-page">
      <section className="studio-hero" style={{ padding: '3rem 2rem' }}>
        <h1 className="animate-fade-up" style={{ fontSize: '2.5rem' }}>Akses Ditolak</h1>
      </section>
      <div className="studio-container animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '1.5rem' }}>
          Anda perlu membuat tempahan terlebih dahulu untuk melihat resit.
        </p>
        <Link to="/" className="studio-btn">
          Kembali ke Pejabat Utama
        </Link>
      </div>
    </div>
  );

  const { selectedPackage, bookingDate, bookingTime, customerName, customerPhone } = location.state;
  const pack = packages.find(p => p.id === selectedPackage);

  const generateWhatsAppMessage = (orderId) => {
    let message = `*NEW STUDIO BOOKING: ${orderId}*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${customerName}\n`;
    message += `Phone: ${customerPhone}\n\n`;
    
    message += `*Booking Details:*\n`;
    message += `Package: ${pack.title} (${pack.pax} Person)\n`;
    message += `Date: ${bookingDate}\n`;
    message += `Time: ${bookingTime}\n\n`;

    message += `*Payment Details:*\n`;
    message += `Method: ${paymentMethod.toUpperCase()}\n`;
    message += `Total: RM ${pack.price.toFixed(2)}\n\n`;
    
    message += `_Sila semak resit bayaran sekiranya pelanggan menggunakan QR Pay / Bank Transfer / E-Wallet._`;

    return encodeURIComponent(message);
  };

    // Generate a unique order ID using UUID to avoid duplicate-key errors
    const generateOrderId = () => {
      // UUID is virtually guaranteed to be unique
      return `STD-${crypto.randomUUID()}`;
    };

    const handleCompletePayment = async () => {
    setIsProcessing(true);
    // Generate a unique orderId
    let orderId = generateOrderId();
    const newBooking = {
      orderId,
      date: new Date().toLocaleString(),
      package: pack,
      bookingDate,
      bookingTime,
      customerName,
      customerPhone,
      paymentMethod: paymentMethod.toUpperCase(),
      total: pack.price,
      status: 'approved',
    };

    // Retry insert (max 3 attempts) and request the inserted row
    let insertedRows = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      console.log(`Attempt ${attempt + 1} inserting booking:`, newBooking);
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .insert([newBooking])
          .select(); // ask Supabase to return the inserted record

        if (!error && data && data.length > 0) {
          insertedRows = data;
          break;
        }

        console.error('Insert error:', error);
        // Duplicate key – generate a new orderId and retry
        if (error?.message?.includes('duplicate key')) {
          newBooking.orderId = generateOrderId();
          continue;
        }
        // Any other error – abort
        alert(`Failed to save booking: ${error?.message || error}`);
        setIsProcessing(false);
        return;
      } catch (err) {
        console.error('Catch block error:', err);
        alert(`Failed to save booking: ${err.message}`);
        setIsProcessing(false);
        return;
      }
    }

    if (!insertedRows) {
      alert('Failed to save booking after multiple attempts.');
      setIsProcessing(false);
      return;
    }

    const savedBooking = insertedRows[0];
    // Send email to admin only after a successful insert
    const emailParams = {
      to_email: 'ammarizzu14@gmail.com',
      order_id: savedBooking.orderId,
      customer_name: savedBooking.customerName,
      customer_phone: savedBooking.customerPhone,
      package_name: `${pack.title} (${pack.pax} Person)`,
      booking_date: savedBooking.bookingDate,
      booking_time: savedBooking.bookingTime,
      payment_method: savedBooking.paymentMethod,
      total_amount: `RM ${savedBooking.total.toFixed(2)}`,
      booking_time_submitted: savedBooking.date,
    };
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams, EMAILJS_PUBLIC_KEY)
      .then(() => console.log('Admin email sent successfully.'))
      .catch((err) => console.error('Failed to send admin email:', err));

    // Update UI state with the saved booking
    setIsProcessing(false);
    setReceiptData(savedBooking);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  // Send owner notification after receipt is displayed (step 3)
  React.useEffect(() => {
    if (step === 3 && receiptData) {
      const ownerEmailParams = {
        to_email: OWNER_EMAIL,
        order_id: receiptData.orderId,
        customer_name: receiptData.customerName,
        customer_phone: receiptData.customerPhone,
        package_name: `${receiptData.package.title} (${receiptData.package.pax} Person)`,
        booking_date: receiptData.bookingDate,
        booking_time: receiptData.bookingTime,
        payment_method: receiptData.paymentMethod,
        total_amount: `RM ${receiptData.total.toFixed(2)}`,
        booking_time_submitted: receiptData.date,
        // Additional flag to indicate final confirmation
        status: 'completed',
      };
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, ownerEmailParams, EMAILJS_PUBLIC_KEY)
        .then(() => console.log('Owner email sent successfully.'))
        .catch((err) => console.error('Failed to send owner email:', err));
    }
  }, [step, receiptData]);

  return (
    <div className="studio-page">
      <section className="studio-hero" style={{ padding: '3rem 2rem' }}>
        <h1 className="animate-fade-up" style={{ fontSize: '2.5rem' }}>Pembayaran</h1>
      </section>

      <div className="studio-container animate-fade-in" style={{ marginTop: '-2rem' }}>
        
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 className="studio-section-title">Lengkapkan Pembayaran Anda</h2>
              <p style={{ fontSize: '1.2rem', color: '#475569' }}>
                Jumlah Total: <strong style={{ color: '#059669', fontSize: '1.5rem' }}>RM {pack.price.toFixed(2)}</strong>
              </p>
            </div>

            {!isProcessing ? (
              <>
                <div className="payment-methods">
                  <div className={`payment-method ${paymentMethod === 'qr' ? 'selected' : ''}`} onClick={() => setPaymentMethod('qr')}>QR Pay (DuitNow)</div>
                  <div className={`payment-method ${paymentMethod === 'fpx' ? 'selected' : ''}`} onClick={() => setPaymentMethod('fpx')}>FPX / Pemindahan Bank</div>
                  <div className={`payment-method ${paymentMethod === 'tng' ? 'selected' : ''}`} onClick={() => setPaymentMethod('tng')}>Touch 'n Go eWallet</div>
                  <div className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`} onClick={() => setPaymentMethod('card')}>Kad Kredit / Debit</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '2rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '2rem', textAlign: 'center' }}>
                  {paymentMethod === 'qr' && (
                    <>
                      <h3 style={{ color: '#E11D48', marginBottom: '1rem' }}>DUITNOW QR</h3>
                      <p>Imbas kod QR di bawah untuk melengkapkan pembayaran anda.</p>
                      <img src="/qr-code.jpg" alt="QR Code" style={{ width: '200px', margin: '1rem auto', borderRadius: '8px', border: '4px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                      <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Rujukan: STUDIO KUIH TALAM</p>
                    </>
                  )}
                  {paymentMethod === 'fpx' && (
                    <>
                      <h3 style={{ color: '#F59E0B' }}>MAYBANK</h3>
                      <h2 style={{ letterSpacing: '2px', margin: '1rem 0' }}>1140 1234 5678</h2>
                      <p><strong>Noni Talam Enterprise</strong></p>
                    </>
                  )}
                  {paymentMethod === 'tng' && (
                    <>
                      <h3 style={{ color: '#0284C7' }}>TOUCH 'N GO</h3>
                      <p>Hantar pembayaran anda ke nombor perniagaan kami:</p>
                      <h2 style={{ margin: '1rem 0' }}>018-316 8944</h2>
                    </>
                  )}
                  {paymentMethod === 'card' && (
                    <div style={{ background: '#FEF3C7', color: '#92400E', padding: '1rem', borderRadius: '8px' }}>
                      <p>Pintu gerbang pembayaran kad memerlukan integrasi. Sila gunakan QR Pay, FPX, atau TnG buat sementara ini.</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Link to="/" className="studio-btn" style={{ background: '#94A3B8', flex: 1, textDecoration: 'none', textAlign: 'center' }}>Kembali</Link>
                  <button type="button" onClick={handleCompletePayment} className="studio-btn" style={{ flex: 2 }} disabled={paymentMethod === 'card'}>
                    Sahkan & Dapatkan Resit
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                 <div style={{ width: '50px', height: '50px', border: '4px solid #DFE6E1', borderTop: '4px solid #10B981', borderRadius: '50%', animation: 'spin-slow 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
                 <h3>Memproses tempahan anda...</h3>
              </div>
            )}
          </div>
        )}

        {step === 3 && receiptData && (
          <div className="studio-receipt animate-fade-in">
            <div className="receipt-header">
              <h2>Tempahan Disahkan!</h2>
              <p>Terima kasih kerana memilih Studio Noni Talam</p>
            </div>
            
            <div className="receipt-body">
              <div style={{ marginBottom: '2rem' }}>
                <div className="receipt-row">
                  <span style={{ color: '#64748b' }}>ID Tempahan:</span>
                  <strong>{receiptData.orderId}</strong>
                </div>
                <div className="receipt-row">
                  <span style={{ color: '#64748b' }}>Tarikh Tempahan:</span>
                  <strong>{receiptData.date}</strong>
                </div>
                <div className="receipt-row">
                  <span style={{ color: '#64748b' }}>Kaedah Pembayaran:</span>
                  <strong>{receiptData.paymentMethod}</strong>
                </div>
              </div>

              <h3 style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Butiran Sesi</h3>
              <div className="receipt-row">
                <span>Pakej Kelas:</span>
                <strong>{receiptData.package.title} ({receiptData.package.pax} Orang)</strong>
              </div>
              <div className="receipt-row">
                <span>Tarikh Sesi:</span>
                <strong>{receiptData.bookingDate}</strong>
              </div>
              <div className="receipt-row">
                <span>Waktu Sesi:</span>
                <strong>{receiptData.bookingTime}</strong>
              </div>
              <div className="receipt-row">
                <span>Nama Pelanggan:</span>
                <strong>{receiptData.customerName}</strong>
              </div>

              <div className="receipt-total">
                <span>Jumlah Dibayar</span>
                <span className="amount">RM {receiptData.total.toFixed(2)}</span>
              </div>

              <div style={{ background: '#ECFDF5', padding: '1.5rem', borderRadius: '8px', border: '1px solid #10B981', marginTop: '2rem', textAlign: 'center' }}>
                <h4 style={{ color: '#047857', marginBottom: '0.5rem' }}>Langkah Akhir!</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#065F46' }}>
                  Sila hantar resit anda ke WhatsApp kami untuk memuktamadkan tempahan studio anda.
                </p>
                <a 
                  href={`https://wa.me/${ADMIN_WHATSAPP}?text=${generateWhatsAppMessage(receiptData.orderId)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="studio-btn"
                  style={{ textDecoration: 'none', display: 'inline-block', background: '#25D366' }}
                >
                  Hantar Resit melalui WhatsApp
                </a>
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to="/" style={{ color: '#059669', fontWeight: 'bold', textDecoration: 'none' }}>Kembali ke Halaman Utama</Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Checkout;
