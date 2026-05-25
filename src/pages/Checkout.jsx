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

  if (!location.state || !location.state.selectedPackage) return null;

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
      const orderId = generateOrderId();

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

      // Attempt insert with a simple retry on duplicate orderId (max 3 attempts)
      let insertResult;
      for (let attempt = 0; attempt < 3; attempt++) {
        console.log(`Attempt ${attempt + 1} inserting booking:` , newBooking);
        const { data, error } = await supabase.from('bookings').insert([newBooking]);
        if (!error) {
          insertResult = { data, error: null };
          break;
        }
        console.error('Insert error:', error);
        // If it's a duplicate key error, generate a new orderId and retry
        if (error.message && error.message.includes('duplicate key')) {
          newBooking.orderId = generateOrderId();
          continue;
        }
        // Any other error – stop retrying
        insertResult = { data, error };
      // Save to Supabase and return the inserted row
      console.log('Attempting Supabase insert:', newBooking);
      const { data: insertedRows, error: insertError } = await supabase
        .from('bookings')
        .insert([newBooking])
        .select(); // ask Supabase to return the inserted record
      console.log('Supabase insert result:', { insertedRows, insertError });
      if (insertError) throw insertError;

      // Use the first (and only) inserted row as receipt data
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
      return; // early exit – we’ve handled success path
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
        <h1 className="animate-fade-up" style={{ fontSize: '2.5rem' }}>Checkout</h1>
      </section>

      <div className="studio-container animate-fade-in" style={{ marginTop: '-2rem' }}>
        
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 className="studio-section-title">Complete Your Payment</h2>
              <p style={{ fontSize: '1.2rem', color: '#475569' }}>
                Total Amount: <strong style={{ color: '#059669', fontSize: '1.5rem' }}>RM {pack.price.toFixed(2)}</strong>
              </p>
            </div>

            {!isProcessing ? (
              <>
                <div className="payment-methods">
                  <div className={`payment-method ${paymentMethod === 'qr' ? 'selected' : ''}`} onClick={() => setPaymentMethod('qr')}>QR Pay (DuitNow)</div>
                  <div className={`payment-method ${paymentMethod === 'fpx' ? 'selected' : ''}`} onClick={() => setPaymentMethod('fpx')}>FPX / Bank Transfer</div>
                  <div className={`payment-method ${paymentMethod === 'tng' ? 'selected' : ''}`} onClick={() => setPaymentMethod('tng')}>Touch 'n Go eWallet</div>
                  <div className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`} onClick={() => setPaymentMethod('card')}>Credit / Debit Card</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '2rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '2rem', textAlign: 'center' }}>
                  {paymentMethod === 'qr' && (
                    <>
                      <h3 style={{ color: '#E11D48', marginBottom: '1rem' }}>DUITNOW QR</h3>
                      <p>Scan the QR code below to complete your payment.</p>
                      <img src="/qr-code.jpg" alt="QR Code" style={{ width: '200px', margin: '1rem auto', borderRadius: '8px', border: '4px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                      <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Reference: STUDIO KUIH TALAM</p>
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
                      <p>Send your payment to our business number:</p>
                      <h2 style={{ margin: '1rem 0' }}>018-316 8944</h2>
                    </>
                  )}
                  {paymentMethod === 'card' && (
                    <div style={{ background: '#FEF3C7', color: '#92400E', padding: '1rem', borderRadius: '8px' }}>
                      <p>Card payment gateway requires integration. Please use QR Pay, FPX, or TnG for now.</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Link to="/" className="studio-btn" style={{ background: '#94A3B8', flex: 1, textDecoration: 'none', textAlign: 'center' }}>Back</Link>
                  <button type="button" onClick={handleCompletePayment} className="studio-btn" style={{ flex: 2 }} disabled={paymentMethod === 'card'}>
                    Confirm & Get Receipt
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                 <div style={{ width: '50px', height: '50px', border: '4px solid #DFE6E1', borderTop: '4px solid #10B981', borderRadius: '50%', animation: 'spin-slow 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
                 <h3>Processing your booking...</h3>
              </div>
            )}
          </div>
        )}

        {step === 3 && receiptData && (
          <div className="studio-receipt animate-fade-in">
            <div className="receipt-header">
              <h2>Booking Confirmed!</h2>
              <p>Thank you for choosing Studio Noni Talam</p>
            </div>
            
            <div className="receipt-body">
              <div style={{ marginBottom: '2rem' }}>
                <div className="receipt-row">
                  <span style={{ color: '#64748b' }}>Booking ID:</span>
                  <strong>{receiptData.orderId}</strong>
                </div>
                <div className="receipt-row">
                  <span style={{ color: '#64748b' }}>Booking Date:</span>
                  <strong>{receiptData.date}</strong>
                </div>
                <div className="receipt-row">
                  <span style={{ color: '#64748b' }}>Payment Method:</span>
                  <strong>{receiptData.paymentMethod}</strong>
                </div>
              </div>

              <h3 style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Session Details</h3>
              <div className="receipt-row">
                <span>Class Package:</span>
                <strong>{receiptData.package.title} ({receiptData.package.pax} Person)</strong>
              </div>
              <div className="receipt-row">
                <span>Session Date:</span>
                <strong>{receiptData.bookingDate}</strong>
              </div>
              <div className="receipt-row">
                <span>Session Time:</span>
                <strong>{receiptData.bookingTime}</strong>
              </div>
              <div className="receipt-row">
                <span>Customer Name:</span>
                <strong>{receiptData.customerName}</strong>
              </div>

              <div className="receipt-total">
                <span>Total Paid</span>
                <span className="amount">RM {receiptData.total.toFixed(2)}</span>
              </div>

              <div style={{ background: '#ECFDF5', padding: '1.5rem', borderRadius: '8px', border: '1px solid #10B981', marginTop: '2rem', textAlign: 'center' }}>
                <h4 style={{ color: '#047857', marginBottom: '0.5rem' }}>Final Step!</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#065F46' }}>
                  Please send your receipt to our WhatsApp to finalize your studio booking.
                </p>
                <a 
                  href={`https://wa.me/${ADMIN_WHATSAPP}?text=${generateWhatsAppMessage(receiptData.orderId)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="studio-btn"
                  style={{ textDecoration: 'none', display: 'inline-block', background: '#25D366' }}
                >
                  Send Receipt via WhatsApp
                </a>
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to="/" style={{ color: '#059669', fontWeight: 'bold', textDecoration: 'none' }}>Return to Home</Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Checkout;
