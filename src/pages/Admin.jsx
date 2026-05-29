import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const statusBadge = (status) => {
  const styles = {
    approved:  { background: '#ECFDF5', color: '#065F46', border: '1px solid #10B981' },
    cancelled: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #EF4444' },
  };
  const s = styles[status] || styles.approved;
  return (
    <span style={{ ...s, padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
      {status}
    </span>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoadingLogin(true);

    const normalizedEmail = email.trim().toLowerCase();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      setLoginError(authError.message || 'Gagal log masuk. Semak email dan kata laluan.');
      setLoadingLogin(false);
      return;
    }

    const userEmail = authData.user?.email ?? authData.session?.user?.email;
    if (!userEmail) {
      setLoginError('Email tidak dijumpai dari sesi Supabase.');
      setLoadingLogin(false);
      return;
    }

    const { data: adminDataArray, error: adminError } = await supabase
      .from('admin_users')
      .select('role, full_name')
      .eq('email', userEmail)
      .limit(1);

    if (adminError) {
      console.error('admin_users query failed:', adminError);
      setLoginError(adminError.message || 'Akaun admin tidak dapat diproses. Sila semak permissions dan admin_users.');
      await supabase.auth.signOut();
      setLoadingLogin(false);
      return;
    }

    const adminData = adminDataArray?.[0];
    if (!adminData) {
      setLoginError('Email ini belum dimasukkan ke dalam admin_users.');
      await supabase.auth.signOut();
      setLoadingLogin(false);
      return;
    }

    setLoggedInUser({ email: userEmail, username: adminData.full_name || userEmail, role: adminData.role || 'Admin' });
    setEmail('');
    setPassword('');
    setLoadingLogin(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLoggedInUser(null);
    setBookings([]);
    setTestimonials([]);
    setActiveTab('bookings');
  };

  useEffect(() => {
    const restoreSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session || error) return;

      const userEmail = session.user?.email;
      if (!userEmail) return;

      const { data: adminDataArray, error: adminError } = await supabase
        .from('admin_users')
        .select('role, full_name')
        .eq('email', userEmail)
        .limit(1);

      if (adminError || !adminDataArray?.length) {
        await supabase.auth.signOut();
        return;
      }

      const adminData = adminDataArray[0];
      setLoggedInUser({ email: userEmail, username: adminData.full_name || userEmail, role: adminData.role || 'Admin' });
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (!loggedInUser) return;

    const fetchData = async () => {
      try {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*');
        if (!bookingsError && bookingsData) {
          setBookings(bookingsData);
        }

        const { data: testimonialsData, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('*');
        if (!testimonialsError && testimonialsData) {
          setTestimonials(testimonialsData);
        }
      } catch (err) {
        console.error('Error fetching initial admin data:', err);
      }
    };

    fetchData();

    // Subscribe to bookings changes
    const bookingsChannel = supabase
      .channel('admin:bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookings((prev) => {
              if (prev.some((b) => b.orderId === payload.new.orderId || b.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setBookings((prev) =>
              prev.map((b) => (b.orderId === payload.new.orderId || b.id === payload.new.id ? payload.new : b))
            );
          } else if (payload.eventType === 'DELETE') {
            setBookings((prev) =>
              prev.filter((b) => b.orderId !== payload.old.orderId && b.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to testimonials changes
    const testimonialsChannel = supabase
      .channel('admin:testimonials')
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
  }, [loggedInUser]);

  // ─── Testimonial Actions ───────────────────────────────────────────────────
  const handleApproveTestimonial = async (id) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ status: 'approved' })
        .eq('id', id);
      if (error) throw error;
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    } catch (err) {
      console.error('Error approving testimonial:', err);
    }
  };
  const handleDeleteTestimonial = async (id) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting testimonial:', err);
    }
  };

  // ─── Booking Actions ───────────────────────────────────────────────────────
  const updateBookingStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('orderId', orderId);
      if (error) throw error;
      setBookings(prev => prev.map(b => b.orderId === orderId ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };
  const deleteBooking = async (orderId) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('orderId', orderId);
      if (error) throw error;
      setBookings(prev => prev.filter(b => b.orderId !== orderId));
    } catch (err) {
      console.error('Error deleting booking:', err);
    }
  };

  if (!loggedInUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '16px', boxShadow: '0 20px 60px rgba(15,23,42,0.1)', padding: '2rem' }}>
          <h1 style={{ margin: 0, marginBottom: '0.75rem', color: '#0F172A' }}>Admin Login</h1>
          <p style={{ margin: 0, marginBottom: '1.5rem', color: '#475569' }}>Masukkan nama pengguna dan kata laluan untuk mengakses dashboard.</p>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="studio-input"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="studio-input"
                placeholder="password"
                required
              />
            </div>
            {loginError && <p style={{ color: '#DC2626', marginBottom: '1rem' }}>{loginError}</p>}
            <button type="submit" className="studio-btn" style={{ width: '100%' }} disabled={loadingLogin}>
              {loadingLogin ? 'Memproses...' : 'Log Masuk'}
            </button>
          </form>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
            <p>Log masuk menggunakan email admin Supabase yang ada di jadual <strong>admin_users</strong>.</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingTestimonials  = testimonials.filter(t => t.status === 'pending');
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
  const approvedBookings     = bookings.filter(b => b.status === 'approved');
  const cancelledBookings    = bookings.filter(b => b.status === 'cancelled');

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.5rem',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #047857' : '3px solid transparent',
    background: 'none',
    fontWeight: activeTab === tab ? '700' : '400',
    color: activeTab === tab ? '#047857' : '#64748b',
    cursor: 'pointer',
    fontSize: '1rem',
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem', fontFamily: 'sans-serif', minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontFamily: '"Playfair Display", serif', margin: 0 }}>Admin Dashboard</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Studio Noni Talam Management Panel</p>
          {loggedInUser && (
            <>
              <p style={{ margin: '0.5rem 0 0', color: '#475569' }}><strong>{loggedInUser.username}</strong> logged in as <strong>{loggedInUser.role}</strong></p>
              <p style={{ margin: '0.5rem 0 0', color: '#0F172A', fontWeight: 700 }}>Welcome, {loggedInUser.role}!</p>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={handleLogout} style={{ padding: '0.6rem 1.2rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Log Out
          </button>
          <button onClick={() => navigate('/')} style={{ padding: '0.6rem 1.2rem', background: '#0F172A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            ← Back to Site
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Bookings', value: bookings.length,       color: '#0F172A' },
          { label: 'Confirmed',      value: approvedBookings.length,  color: '#047857' },
          { label: 'Cancelled',      value: cancelledBookings.length, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '8px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 1rem' }}>
          <button style={tabStyle('bookings')} onClick={() => setActiveTab('bookings')}>
            Bookings
          </button>
          <button style={tabStyle('testimonials')} onClick={() => setActiveTab('testimonials')}>
            Testimonials {pendingTestimonials.length > 0 && <span style={{ background: '#EF4444', color: 'white', borderRadius: '50%', padding: '1px 6px', fontSize: '0.7rem', marginLeft: '6px' }}>{pendingTestimonials.length}</span>}
          </button>
        </div>

        <div style={{ padding: '2rem' }}>

          {/* ── BOOKINGS TAB ── */}
          {activeTab === 'bookings' && (
            <div>
              {bookings.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No bookings yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9', textAlign: 'left' }}>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Order ID</th>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Customer</th>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Session</th>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Package</th>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Total</th>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Status</th>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.orderId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '0.8rem', fontWeight: 'bold', fontSize: '0.8rem', color: '#64748b' }}>{b.orderId}</td>
                          <td style={{ padding: '0.8rem' }}>
                            <div style={{ fontWeight: 'bold' }}>{b.customerName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.customerPhone}</div>
                          </td>
                          <td style={{ padding: '0.8rem' }}>
                            <div style={{ fontWeight: 'bold' }}>{b.bookingDate}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.bookingTime}</div>
                          </td>
                          <td style={{ padding: '0.8rem' }}>{(b.package?.title || b.packageTitle) ?? 'Unknown package'} ({b.package?.pax ?? b.packagePax ?? 'N/A'} pax)</td>
                          <td style={{ padding: '0.8rem', fontWeight: 'bold', color: '#047857' }}>RM {(typeof b.total === 'number' ? b.total.toFixed(2) : b.total)}</td>
                          <td style={{ padding: '0.8rem' }}>{statusBadge(b.status || 'approved')}</td>
                          <td style={{ padding: '0.8rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {b.status !== 'cancelled' ? (
                                <button onClick={() => updateBookingStatus(b.orderId, 'cancelled')}
                                  style={{ background: '#EF4444', color: 'white', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                  ✗ Cancel Order
                                </button>
                              ) : (
                                <button onClick={() => updateBookingStatus(b.orderId, 'approved')}
                                  style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                  ↩ Restore
                                </button>
                              )}
                              <button onClick={() => deleteBooking(b.orderId)}
                                style={{ background: '#94A3B8', color: 'white', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TESTIMONIALS TAB ── */}
          {activeTab === 'testimonials' && (
            <div>
              <h3 style={{ color: '#D97706', marginBottom: '1rem' }}>Pending ({pendingTestimonials.length})</h3>
              {pendingTestimonials.length === 0 ? <p style={{ color: '#64748b' }}>No pending testimonials.</p> : null}
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {pendingTestimonials.map(t => (
                  <div key={t.id} style={{ background: '#FFFBEB', padding: '1rem', borderLeft: '4px solid #F59E0B', borderRadius: '4px' }}>
                    <p><strong>{t.author}</strong> — {t.date}</p>
                    <p style={{ margin: '0.5rem 0', fontStyle: 'italic' }}>"{t.text}"</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                      <button onClick={() => handleApproveTestimonial(t.id)} style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✓ Approve</button>
                      <button onClick={() => handleDeleteTestimonial(t.id)} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>✗ Reject</button>
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ color: '#047857', marginBottom: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem' }}>Approved ({approvedTestimonials.length})</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {approvedTestimonials.map(t => (
                  <div key={t.id} style={{ background: '#F8FAFC', padding: '1rem', borderLeft: '4px solid #10B981', borderRadius: '4px' }}>
                    <p><strong>{t.author}</strong> — {t.date}</p>
                    <p style={{ margin: '0.5rem 0', fontStyle: 'italic' }}>"{t.text}"</p>
                    <button onClick={() => handleDeleteTestimonial(t.id)} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem' }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
