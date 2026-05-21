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
      alert('Sorry, the studio is closed on Sundays. Please select a date from Monday to Saturday.');
      setBookingDate('');
    } else {
      setBookingDate(e.target.value);
      setBookingTime(''); // Reset time when date changes
    }
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
      return alert('Please select a package, date, and time to proceed.');
    }
    if (!canFitPackage(bookingTime)) {
      return alert(`Not enough spots for this package. Please choose a different time slot.`);
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
      alert('Thank you! Your testimonial has been submitted and is pending admin approval.');
    } catch (err) {
      console.error('Error submitting testimonial:', err);
      alert('Failed to submit testimonial. Please try again.');
    }
  };

  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');

  return (
    <div className="studio-page">
      {/* Hero Section */}
      <section className="studio-hero">
        <h1 className="animate-fade-up">Master the Art of Kuih Talam</h1>
        <p className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Join our premium studio sessions and learn the secrets of making authentic, delicious Kuih Talam from Monday to Saturday.
        </p>
      </section>

      <div className="studio-container animate-fade-in">
        <form onSubmit={handleProceedToPayment}>
          <h2 
            className="studio-section-title" 
            onDoubleClick={() => navigate('/admin')}
            style={{ cursor: 'pointer' }}
          >
            Select Your Package
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
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>For {pkg.pax} Person{pkg.pax > 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>

          <h2 className="studio-section-title">Schedule Your Session</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div className="studio-form-group">
                <label className="studio-label">Select Date (Mon - Sat)</label>
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
              <label className="studio-label" style={{ marginBottom: '1rem' }}>Select Time Slot</label>
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
                        if (!bookingDate) return alert('Please select a date first.');
                        if (!disabled) setBookingTime(time);
                      }}
                      title={inPast ? 'Session time has passed' : full ? 'Fully booked (6 pax limit reached)' : cantFit ? `Only ${spotsLeft} spot(s) left — not enough for your package` : `${spotsLeft} spot(s) left`}
                    >
                      {time}
                      <span style={{ display: 'block', fontSize: '0.7rem', marginTop: '2px', color: inPast ? '#94A3B8' : full ? '#EF4444' : cantFit ? '#F59E0B' : '#64748b' }}>
                        {inPast ? 'Closed' : full ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <h2 className="studio-section-title">Your Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="studio-form-group">
              <label className="studio-label">Full Name</label>
              <input type="text" className="studio-input" required placeholder="e.g. Ali Bin Abu" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="studio-form-group">
              <label className="studio-label">WhatsApp Number</label>
              <input type="tel" className="studio-input" required placeholder="e.g. 0123456789" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="studio-btn" disabled={!selectedPackage || !bookingDate || !bookingTime}>
            Proceed to Payment
          </button>
        </form>

        <hr style={{ margin: '4rem 0', border: 'none', borderTop: '1px solid #E2E8F0' }} />

        {/* Testimonials Section */}
        <div className="testimonials-section">
          <h2 className="studio-section-title">Student Testimonials</h2>

          <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
            {approvedTestimonials.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>No testimonials yet. Be the first to share your experience!</p>
            ) : (
              approvedTestimonials.map(t => (
                <div key={t.id} style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #D4AF37' }}>
                  <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#334155' }}>"{t.text}"</p>
                  <p style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#0F172A' }}>- {t.author} <span style={{ color: '#94A3B8', fontWeight: 'normal', marginLeft: '0.5rem' }}>{t.date}</span></p>
                </div>
              ))
            )}
          </div>

          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#047857' }}>Write a Review</h3>
            <form onSubmit={submitTestimonial}>
              <div className="studio-form-group">
                <label className="studio-label">Your Name</label>
                <input type="text" className="studio-input" required value={newTestimonialName} onChange={e => setNewTestimonialName(e.target.value)} />
              </div>
              <div className="studio-form-group">
                <label className="studio-label">Your Experience</label>
                <textarea className="studio-input" rows="4" required value={newTestimonialText} onChange={e => setNewTestimonialText(e.target.value)}></textarea>
              </div>
              <button type="submit" className="studio-btn" style={{ background: '#0F172A' }}>Submit </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Studio;
