import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Studio.css';

const Studio = () => {
  const navigate = useNavigate();

  // Booking Details
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Live Database Data
  const [existingBookings, setExistingBookings] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  // New Testimonial State
  const [newTestimonialName, setNewTestimonialName] = useState('');
  const [newTestimonialText, setNewTestimonialText] = useState('');

  // Check if a time slot is in the past (based on local time)
  const isSlotInPast = (dateStr, timeStr) => {
    if (!dateStr) return false;
    
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
    if (dateStr < todayStr) return true; // past day
    if (dateStr > todayStr) return false; // future day

    // If it's today, we need to compare times
    const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return false;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return now >= slotTime;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*');
        if (!bookingsError && bookingsData) {
          setExistingBookings(bookingsData);
        }

        const { data: testimonialsData, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('*');
        if (!testimonialsError && testimonialsData) {
          setTestimonials(testimonialsData);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };

    fetchData();

    // Subscribe to bookings changes
    const bookingsChannel = supabase
      .channel('public:bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setExistingBookings((prev) => {
              if (prev.some((b) => b.orderId === payload.new.orderId || b.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setExistingBookings((prev) =>
              prev.map((b) => (b.orderId === payload.new.orderId || b.id === payload.new.id ? payload.new : b))
            );
          } else if (payload.eventType === 'DELETE') {
            setExistingBookings((prev) =>
              prev.filter((b) => b.orderId !== payload.old.orderId && b.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to testimonials changes
    const testimonialsChannel = supabase
      .channel('public:testimonials')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'testimonials' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTestimonials((prev) => {
              if (prev.some((t) => t.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setTestimonials((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTestimonials((prev) =>
              prev.filter((t) => t.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(testimonialsChannel);
    };
  }, []);

  const packages = [
    { id: 1, title: 'Package 1', pax: 1, price: 100, icon: '🧑' },
    { id: 2, title: 'Package 2', pax: 2, price: 180, icon: '🧑‍🤝‍🧑' },
    { id: 3, title: 'Package 3', pax: 3, price: 250, icon: '👨‍👩‍👧' },
    { id: 4, title: 'Package 4', pax: 4, price: 300, icon: '👨‍👩‍👧‍👦' },
  ];

  const timeSlots = ['10:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const day = selectedDate.getDay();
    // 0 is Sunday
    if (day === 0) {
      alert('Maaf, studio ditutup pada hari Ahad. Sila pilih tarikh dari Isnin hingga Sabtu.');
      setBookingDate('');
    } else {
      setBookingDate(e.target.value);
      setBookingTime(''); // Reset time when date changes
    }
  };

  const isValidPhone = (phone) => {
    const cleaned = phone.replace(/[^0-9+]/g, '');
    return /^(?:\+?60|0)1[0-9]{8,9}$/.test(cleaned);
  };

  const MAX_PAX_PER_SLOT = 6;

  // Count total booked pax for a given date+time (excluding cancelled)
  const getPaxBooked = (time) => {
    if (!bookingDate) return 0;
    return existingBookings
      .filter(b => b.bookingDate === bookingDate && b.bookingTime === time && b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.package?.pax || 0), 0);
  };

  const selectedPax = packages.find(p => p.id === selectedPackage)?.pax || 0;

  const isSlotFull = (time) => {
    return getPaxBooked(time) >= MAX_PAX_PER_SLOT;
  };

  const canFitPackage = (time) => {
    if (!selectedPackage) return true; // No package selected yet, don't block
    return getPaxBooked(time) + selectedPax <= MAX_PAX_PER_SLOT;
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!selectedPackage || !bookingDate || !bookingTime) {
      return alert('Sila pilih pakej, tarikh, dan waktu untuk meneruskan.');
    }
    if (!customerPhone || !isValidPhone(customerPhone)) {
      setPhoneError('Sila masukkan nombor WhatsApp yang sah (contoh: 0123456789 atau +60123456789).');
      return;
    }
    setPhoneError('');
    if (!canFitPackage(bookingTime)) {
      return alert(`Tidak cukup tempat untuk pakej ini. Sila pilih slot waktu yang lain.`);
    }

    navigate('/checkout', {
      state: {
        selectedPackage,
        bookingDate,
        bookingTime,
        customerName,
        customerPhone
      }
    });
  };

  const submitTestimonial = async (e) => {
    e.preventDefault();
    if (!newTestimonialName || !newTestimonialText) return;

    const newTestimonial = {
      author: newTestimonialName,
      text: newTestimonialText,
      status: 'pending', // Requires admin approval
      date: new Date().toLocaleDateString()
    };

    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([newTestimonial])
        .select();

      if (error) {
        throw error;
      }

      setNewTestimonialName('');
      setNewTestimonialText('');
      alert('Terima kasih! Testimoni anda telah dikemukakan dan sedang menunggu perlulusan admin.');
    } catch (err) {
      console.error('Error submitting testimonial:', err);
      alert('Gagal menghantar testimoni. Sila cuba lagi.');
    }
  };

  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
  const currentTestimonial = approvedTestimonials[testimonialIndex] || null;

  useEffect(() => {
    if (approvedTestimonials.length <= 1) {
      setTestimonialIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % approvedTestimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [approvedTestimonials.length]);

  return (
    <div className="studio-page">
      {/* Hero Section */}
      <section className="studio-hero">
        <h1 className="animate-fade-up">Kuasai Seni Membuat Kuih Talam</h1>
        <p className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Sertai sesi studio premium kami dan pelajari rahsia membuat Kuih Talam yang asli dan sedap dari Isnin hingga Sabtu.
        </p>
      </section>

      <div className="studio-container animate-fade-in">
        <form onSubmit={handleProceedToPayment}>
          <h2 
            className="studio-section-title" 
            onDoubleClick={() => navigate('/admin')}
            style={{ cursor: 'pointer' }}
          >
            Pilih Pakej Anda
          </h2>
          <div className="packages-grid">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`package-card ${selectedPackage === pkg.id ? 'selected' : ''}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <div className="package-icon">{pkg.icon}</div>
                <h3 className="package-title">{pkg.title}</h3>
                <div className="package-price">RM {pkg.price}</div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Untuk {pkg.pax} Orang{pkg.pax > 1 ? '' : ''}</p>
              </div>
            ))}
          </div>

          <h2 className="studio-section-title">Jadualkan Sesi Anda</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div className="studio-form-group">
                <label className="studio-label">Pilih Tarikh (Isn - Sab)</label>
                <input
                  type="date"
                  className="studio-input"
                  required
                  value={bookingDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div>
              <label className="studio-label" style={{ marginBottom: '1rem' }}>Pilih Slot Waktu</label>
              <div className="time-slots">
                {timeSlots.map(time => {
                  const paxBooked = getPaxBooked(time);
                  const spotsLeft = MAX_PAX_PER_SLOT - paxBooked;
                  const full = spotsLeft <= 0;
                  const cantFit = selectedPackage && !full && !canFitPackage(time);
                  const inPast = isSlotInPast(bookingDate, time);
                  const disabled = full || cantFit || inPast;
                  return (
                    <div
                      key={time}
                      className={`time-slot ${bookingTime === time ? 'selected' : ''}`}
                      style={{
                        opacity: disabled ? 0.5 : 1,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        background: disabled ? '#f1f5f9' : ''
                      }}
                      onClick={() => {
                        if (!bookingDate) return alert('Sila pilih tarikh terlebih dahulu.');
                        if (!disabled) setBookingTime(time);
                      }}
                      title={inPast ? 'Waktu sesi telah berlalu' : full ? 'Penuh (had 6 orang tercapai)' : cantFit ? `Hanya ${spotsLeft} tempat tersisa — tidak cukup untuk pakej anda` : `${spotsLeft} tempat tersisa`}
                    >
                      {time}
                      <span style={{ display: 'block', fontSize: '0.7rem', marginTop: '2px', color: inPast ? '#94A3B8' : full ? '#EF4444' : cantFit ? '#F59E0B' : '#64748b' }}>
                        {inPast ? 'Ditutup' : full ? 'Penuh' : `${spotsLeft} tempat${spotsLeft !== 1 ? '' : ''} tersisa`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <h2 className="studio-section-title">Detail Anda</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="studio-form-group">
              <label className="studio-label">Nama Penuh</label>
              <input type="text" className="studio-input" required placeholder="cth. Ali Bin Abu" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="studio-form-group">
              <label className="studio-label">Nombor WhatsApp</label>
              <input
                type="tel"
                className="studio-input"
                required
                pattern="^(?:\\+?60|0)1[0-9]{8,9}$"
                title="Sila masukkan nombor SAH, contohnya 0123456789 atau +60123456789"
                placeholder="cth. 0123456789"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  if (phoneError) setPhoneError('');
                }}
              />
              {phoneError && <p style={{ color: '#DC2626', marginTop: '0.5rem', fontSize: '0.9rem' }}>{phoneError}</p>}
            </div>
          </div>

          <button type="submit" className="studio-btn" disabled={!selectedPackage || !bookingDate || !bookingTime}>
            Teruskan ke Pembayaran
          </button>
        </form>

        <hr style={{ margin: '4rem 0', border: 'none', borderTop: '1px solid #E2E8F0' }} />

        {/* Testimonials Section */}
        <div className="testimonials-section">
          <h2 className="studio-section-title">Testimonial Pelajar</h2>

          <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
            {approvedTestimonials.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>Tiada testimoni lagi. Jadilah yang pertama berkongsi pengalaman anda!</p>
            ) : (
              <>
                <div key={currentTestimonial?.id || 'testimonial'} style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #D4AF37' }}>
                  <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#334155' }}>&ldquo;{currentTestimonial?.text}&rdquo;</p>
                  <p style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#0F172A' }}>- {currentTestimonial?.author} <span style={{ color: '#94A3B8', fontWeight: 'normal', marginLeft: '0.5rem' }}>{currentTestimonial?.date}</span></p>
                </div>
                {approvedTestimonials.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setTestimonialIndex((prev) => (prev - 1 + approvedTestimonials.length) % approvedTestimonials.length)}
                      style={{ padding: '0.5rem 0.9rem', borderRadius: '999px', border: '1px solid #CBD5E1', background: 'white', cursor: 'pointer' }}
                    >
                      Sebelumnya
                    </button>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {approvedTestimonials.map((_, idx) => (
                        <span
                          key={idx}
                          style={{ width: '10px', height: '10px', borderRadius: '50%', background: testimonialIndex === idx ? '#0F172A' : '#CBD5E1' }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setTestimonialIndex((prev) => (prev + 1) % approvedTestimonials.length)}
                      style={{ padding: '0.5rem 0.9rem', borderRadius: '999px', border: '1px solid #CBD5E1', background: 'white', cursor: 'pointer' }}
                    >
                      Seterusnya
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#047857' }}>Tulis Ulasan</h3>
            <form onSubmit={submitTestimonial}>
              <div className="studio-form-group">
                <label className="studio-label">Nama Anda</label>
                <input type="text" className="studio-input" required value={newTestimonialName} onChange={e => setNewTestimonialName(e.target.value)} />
              </div>
              <div className="studio-form-group">
                <label className="studio-label">Pengalaman Anda</label>
                <textarea className="studio-input" rows="4" required value={newTestimonialText} onChange={e => setNewTestimonialText(e.target.value)}></textarea>
              </div>
              <button type="submit" className="studio-btn" style={{ background: '#0F172A' }}>Hantar </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Studio;
