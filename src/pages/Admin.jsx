import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { DEFAULT_KUIH_LIST } from './OrderKuih';

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

const GAME_ACTION_OPTIONS = [
  { value: 'blend', label: 'Kisar' },
  { value: 'stir', label: 'Gaul' },
  { value: 'heat', label: 'Panaskan / kukus' },
  { value: 'pour', label: 'Tuang' },
  { value: 'press', label: 'Tekan / padatkan' },
  { value: 'cool', label: 'Sejukkan' },
  { value: 'cut', label: 'Potong' },
  { value: 'add', label: 'Tambah bahan' }
];

const GAME_TARGET_OPTIONS = [
  { value: 'bowl', label: 'Mangkuk adunan' },
  { value: 'tray', label: 'Loyang kuih' },
  { value: 'steamer', label: 'Pengukus' },
  { value: 'cake', label: 'Kuih siap' }
];

const createGameStepDraft = () => ({
  title: '',
  instruction: '',
  action: 'stir',
  target: 'bowl',
  ingredients: '',
  heatLevel: 'medium-low',
  needsCooling: false
});

const gameFormFieldStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: '0.35rem',
  padding: '0.65rem 0.75rem',
  color: '#164C2D',
  font: 'inherit',
  background: '#FFFEF9',
  border: '1px solid #D5E5CE',
  borderRadius: '8px'
};

const gameFormLabelStyle = {
  display: 'block',
  color: '#164C2D',
  fontSize: '0.87rem',
  fontWeight: 700
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
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'kuih_catalog' | 'game_recipes' | 'testimonials' | 'pages'
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'kuih' | 'studio'
  const [kuihCatalog, setKuihCatalog] = useState(DEFAULT_KUIH_LIST);
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [gameRecipes, setGameRecipes] = useState([]);
  const [gameRecipeError, setGameRecipeError] = useState('');
  const [gameRecipeSuccess, setGameRecipeSuccess] = useState('');
  const [gameRecipeLoading, setGameRecipeLoading] = useState(false);
  const [savingGameRecipe, setSavingGameRecipe] = useState(false);
  const [deletingGameRecipeId, setDeletingGameRecipeId] = useState(null);
  const [gameRecipeDraft, setGameRecipeDraft] = useState({
    name: '',
    description: '',
    icon: '🍰',
    layers: 'green,white'
  });
  const [gameStepDrafts, setGameStepDrafts] = useState([createGameStepDraft()]);

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

    console.log('Searching admin_users for email:', userEmail);
    console.log('Email length:', userEmail?.length);
    
    // Debug: get ALL admin_users to see what's there
    const { data: allAdmins } = await supabase
      .from('admin_users')
      .select('*');
    console.log('All admin_users in DB:', allAdmins);
    
    const { data: adminDataArray, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .ilike('email', userEmail);

    console.log('admin_users query result - array:', adminDataArray);
    console.log('admin_users query result - error:', adminError);
    console.log('admin_users array length:', adminDataArray?.length);

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
        .select('*')
        .ilike('email', userEmail);

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

        const { data: catalogData, error: catalogError } = await supabase
          .from('kuih_catalog')
          .select('*');
        if (!catalogError && catalogData && catalogData.length > 0) {
          setKuihCatalog(catalogData);
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

  useEffect(() => {
    if (!loggedInUser) return undefined;
    let isMounted = true;
    setGameRecipeLoading(true);
    setGameRecipeError('');

    const fetchGameRecipes = async () => {
      const { data, error } = await supabase
        .from('game_recipes')
        .select('id, name, description, icon, layers, steps, created_at')
        .order('created_at', { ascending: true });

      if (!isMounted) return;
      if (error) {
        console.error('Unable to load game recipes in admin:', error);
        setGameRecipeError('Game tambahan tidak dapat dimuatkan. Pastikan migrasi game_recipes telah dijalankan.');
      } else {
        setGameRecipes(data || []);
      }
      setGameRecipeLoading(false);
    };

    fetchGameRecipes().catch((error) => {
      console.error('Unable to load game recipes in admin:', error);
      if (isMounted) {
        setGameRecipeError('Game tambahan tidak dapat dimuatkan buat masa ini.');
        setGameRecipeLoading(false);
      }
    });

    return () => {
      isMounted = false;
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

  const updateGameStepDraft = (index, field, value) => {
    setGameStepDrafts((steps) => steps.map((step, stepIndex) => (
      stepIndex === index ? { ...step, [field]: value } : step
    )));
  };

  const resetGameRecipeForm = () => {
    setGameRecipeDraft({ name: '', description: '', icon: '🍰', layers: 'green,white' });
    setGameStepDrafts([createGameStepDraft()]);
  };

  const handleCreateGameRecipe = async (event) => {
    event.preventDefault();
    setGameRecipeError('');
    setGameRecipeSuccess('');

    const layers = gameRecipeDraft.layers.split(',').map((layer) => layer.trim()).filter(Boolean);
    const invalidLayer = layers.some((layer) => !['green', 'white', 'gold'].includes(layer));
    const hasInvalidStep = gameStepDrafts.some((step) => !step.title.trim() || !step.instruction.trim());
    if (!gameRecipeDraft.name.trim() || !gameRecipeDraft.description.trim() ||
      layers.length === 0 || invalidLayer || gameStepDrafts.length === 0 || hasInvalidStep) {
      setGameRecipeError('Lengkapkan nama, penerangan, warna lapisan yang sah, dan tajuk serta arahan bagi setiap langkah.');
      return;
    }

    const steps = gameStepDrafts.map((step, stepIndex) => {
      const target = GAME_TARGET_OPTIONS.find((option) => option.value === step.target);
      const action = GAME_ACTION_OPTIONS.find((option) => option.value === step.action);
      const items = step.ingredients
        .split('\n')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name, ingredientIndex) => ({
          id: `step-${stepIndex + 1}-ingredient-${ingredientIndex + 1}`,
          name,
          emoji: '🥣'
        }));

      return {
        title: step.title.trim(),
        instruction: step.instruction.trim(),
        target: step.target,
        targetLabel: target.label,
        items,
        action: step.action,
        actionLabel: action.label,
        heatLevel: step.action === 'heat' ? step.heatLevel : undefined,
        needsCooling: step.needsCooling || step.action === 'cut'
      };
    });

    setSavingGameRecipe(true);
    try {
      const { data, error } = await supabase
        .from('game_recipes')
        .insert({
          name: gameRecipeDraft.name.trim(),
          description: gameRecipeDraft.description.trim(),
          icon: gameRecipeDraft.icon.trim() || '🍰',
          layers,
          steps
        })
        .select('id, name, description, icon, layers, steps, created_at')
        .single();

      if (error) {
        console.error('Unable to save game recipe:', error);
        setGameRecipeError(`Game tidak berjaya disimpan: ${error.message}`);
        return;
      }

      setGameRecipes((recipes) => [...recipes, data]);
      setGameRecipeSuccess(`${data.name} berjaya ditambah ke game.`);
      resetGameRecipeForm();
    } catch (error) {
      console.error('Unable to save game recipe:', error);
      setGameRecipeError('Game tidak berjaya disimpan kerana sambungan Supabase terganggu.');
    } finally {
      setSavingGameRecipe(false);
    }
  };

  const handleDeleteGameRecipe = async (recipe) => {
    if (!window.confirm(`Padam game "${recipe.name}"?`)) return;
    setGameRecipeError('');
    setGameRecipeSuccess('');
    setDeletingGameRecipeId(recipe.id);

    try {
      const { error } = await supabase
        .from('game_recipes')
        .delete()
        .eq('id', recipe.id);

      if (error) {
        console.error('Unable to delete game recipe:', error);
        setGameRecipeError(`Game tidak berjaya dipadam: ${error.message}`);
        return;
      }

      setGameRecipes((recipes) => recipes.filter((item) => item.id !== recipe.id));
      setGameRecipeSuccess(`${recipe.name} telah dipadam.`);
    } catch (error) {
      console.error('Unable to delete game recipe:', error);
      setGameRecipeError('Game tidak berjaya dipadam kerana sambungan Supabase terganggu.');
    } finally {
      setDeletingGameRecipeId(null);
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
  // ─── Kuih Catalog Availability Toggle ──────────────────────────────────────
  const toggleKuihAvailability = async (kuihId) => {
    setSavingCatalog(true);
    const updated = kuihCatalog.map(k => {
      if (k.id === kuihId) {
        return { ...k, available: k.available === false ? true : false };
      }
      return k;
    });
    setKuihCatalog(updated);

    try {
      const item = updated.find(k => k.id === kuihId);
      // Try to upsert into supabase kuih_catalog table
      await supabase
        .from('kuih_catalog')
        .upsert({ id: item.id, name: item.name, available: item.available, prices: item.prices, category: item.category }, { onConflict: 'id' });
    } catch (err) {
      console.log('Catalog update offline/fallback:', err);
    } finally {
      setSavingCatalog(false);
    }
  };

  const updateKuihPrice = async (kuihId, sizeKey, newPrice) => {
    const val = parseFloat(newPrice);
    if (isNaN(val)) return;

    const updated = kuihCatalog.map(k => {
      if (k.id === kuihId) {
        const newPrices = { ...(k.prices || {}), [sizeKey]: val };
        return { ...k, prices: newPrices, defaultPrice: sizeKey === '8x8' ? val : k.defaultPrice };
      }
      return k;
    });
    setKuihCatalog(updated);

    try {
      const item = updated.find(k => k.id === kuihId);
      await supabase
        .from('kuih_catalog')
        .upsert({ id: item.id, prices: item.prices, defaultPrice: item.defaultPrice }, { onConflict: 'id' });
    } catch (err) {
      console.log('Price update fallback:', err);
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
  const kuihOrders           = bookings.filter(b => b.orderType === 'kuih_order' || b.package?.orderType === 'kuih_order' || (b.orderId && b.orderId.startsWith('KUIH-')));
  const studioBookings       = bookings.filter(b => !kuihOrders.includes(b));

  const filteredBookings = orderFilter === 'kuih' 
    ? kuihOrders 
    : orderFilter === 'studio' 
    ? studioBookings 
    : bookings;

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
          { label: 'Semua Tempahan', value: bookings.length,         color: '#0F172A' },
          { label: 'Tempah Kuih Siap', value: kuihOrders.length,     color: '#B45309' },
          { label: 'Slot Bengkel Studio', value: studioBookings.length, color: '#2563EB' },
          { label: 'Disahkan',       value: approvedBookings.length, color: '#047857' },
          { label: 'Dibatalkan',     value: cancelledBookings.length,color: '#DC2626' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '8px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 1rem', flexWrap: 'wrap' }}>
          <button style={tabStyle('bookings')} onClick={() => setActiveTab('bookings')}>
            📋 Senarai Tempahan ({bookings.length})
          </button>
          <button style={tabStyle('kuih_catalog')} onClick={() => setActiveTab('kuih_catalog')}>
            🧁 Kawalan Menu & Harga Kuih
          </button>
          <button style={tabStyle('game_recipes')} onClick={() => setActiveTab('game_recipes')}>
            🎮 Pengurusan Game Kuih
          </button>
          <button style={tabStyle('testimonials')} onClick={() => setActiveTab('testimonials')}>
            Testimonials {pendingTestimonials.length > 0 && <span style={{ background: '#EF4444', color: 'white', borderRadius: '50%', padding: '1px 6px', fontSize: '0.7rem', marginLeft: '6px' }}>{pendingTestimonials.length}</span>}
          </button>
          <button style={tabStyle('pages')} onClick={() => setActiveTab('pages')}>
            🌐 Page Management
          </button>
        </div>

        <div style={{ padding: '2rem' }}>

          {/* ── BOOKINGS TAB ── */}
          {activeTab === 'bookings' && (
            <div>
              {/* Order Type Filter Pills */}
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Tapis Pesanan:</span>
                <button
                  onClick={() => setOrderFilter('all')}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    border: '1px solid #CBD5E1',
                    background: orderFilter === 'all' ? '#0F172A' : 'white',
                    color: orderFilter === 'all' ? 'white' : '#475569',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Semua ({bookings.length})
                </button>
                <button
                  onClick={() => setOrderFilter('kuih')}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    border: '1px solid #F59E0B',
                    background: orderFilter === 'kuih' ? '#F59E0B' : 'white',
                    color: orderFilter === 'kuih' ? 'white' : '#B45309',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🧁 Tempah Kuih Siap ({kuihOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('studio')}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    border: '1px solid #2563EB',
                    background: orderFilter === 'studio' ? '#2563EB' : 'white',
                    color: orderFilter === 'studio' ? 'white' : '#1E40AF',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🏛️ Slot Bengkel Studio ({studioBookings.length})
                </button>
              </div>

              {filteredBookings.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>Tiada pesanan dijumpai untuk kategori ini.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9', textAlign: 'left' }}>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Order ID & Jenis</th>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Customer</th>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Tarikh & Masa</th>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Item / Pakej</th>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Total</th>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Status</th>
                        <th style={{ padding: '0.8rem', borderBottom: '2px solid #CBD5E1' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => {
                        const isThisKuih = b.orderType === 'kuih_order' || b.package?.orderType === 'kuih_order' || (b.orderId && b.orderId.startsWith('KUIH-'));
                        return (
                          <tr key={b.orderId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                            <td style={{ padding: '0.8rem' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '0.82rem', color: '#0F172A' }}>{b.orderId}</div>
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                background: isThisKuih ? '#FEF3C7' : '#EFF6FF',
                                color: isThisKuih ? '#92400E' : '#1D4ED8',
                                display: 'inline-block',
                                marginTop: '3px'
                              }}>
                                {isThisKuih ? '🧁 Kuih Siap' : '🏛️ Bengkel'}
                              </span>
                            </td>
                            <td style={{ padding: '0.8rem' }}>
                              <div style={{ fontWeight: 'bold' }}>{b.customerName}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.customerPhone}</div>
                              {b.package?.deliveryAddress && (
                                <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>
                                  📍 {b.package.deliveryAddress.slice(0, 30)}...
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.8rem' }}>
                              <div style={{ fontWeight: 'bold' }}>{b.bookingDate}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.bookingTime}</div>
                            </td>
                            <td style={{ padding: '0.8rem' }}>
                              <div style={{ fontWeight: 600 }}>{(b.package?.title || b.packageTitle) ?? 'Unknown item'}</div>
                              {b.package?.notes && (
                                <div style={{ fontSize: '0.72rem', color: '#92400E', fontStyle: 'italic', marginTop: '2px' }}>
                                  Nota: "{b.package.notes}"
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.8rem', fontWeight: 'bold', color: '#047857' }}>RM {(typeof b.total === 'number' ? b.total.toFixed(2) : b.total)}</td>
                            <td style={{ padding: '0.8rem' }}>{statusBadge(b.status || 'approved')}</td>
                            <td style={{ padding: '0.8rem' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                {b.status !== 'cancelled' ? (
                                  <button onClick={() => updateBookingStatus(b.orderId, 'cancelled')}
                                    style={{ background: '#EF4444', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    ✗ Batal
                                  </button>
                                ) : (
                                  <button onClick={() => updateBookingStatus(b.orderId, 'approved')}
                                    style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    ↩ Sahkan
                                  </button>
                                )}
                                <button onClick={() => deleteBooking(b.orderId)}
                                  style={{ background: '#94A3B8', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                  Padam
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── KUIH CATALOG & AVAILABILITY TAB ── */}
          {activeTab === 'kuih_catalog' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ color: '#0F172A', margin: 0, fontSize: '1.3rem' }}>Kawalan Ketersediaan (Availability) & Harga Saiz Kuih</h3>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '4px 0 0' }}>
                    Tukar status 'Tersedia' / 'Habis (Sold Out)' dan kemas kini harga mengikut saiz 8x8, 9x9, dan 10x10 secara langsung.
                  </p>
                </div>
                {savingCatalog && <span style={{ color: '#047857', fontWeight: 600, fontSize: '0.85rem' }}>🔄 Mengemas kini...</span>}
              </div>

              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {kuihCatalog.map((k) => {
                  const isAvail = k.available !== false;
                  return (
                    <div
                      key={k.id}
                      style={{
                        background: isAvail ? 'white' : '#FFF1F2',
                        border: isAvail ? '1px solid #E2E8F0' : '1px solid #FECDD3',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px' }}>
                        <img
                          src={k.image}
                          alt={k.name}
                          style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={{ margin: 0, color: '#0F172A', fontSize: '1.05rem' }}>{k.name}</h4>
                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#F1F5F9', borderRadius: '4px', color: '#475569' }}>{k.category}</span>
                          </div>
                          <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                            Status: <strong style={{ color: isAvail ? '#047857' : '#DC2626' }}>{isAvail ? '🟢 Buka Tempahan' : '🔴 Tutup / Habis'}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Size Price Editors */}
                      {k.hasSizeOptions ? (
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Harga (RM):</span>
                          {['8x8', '9x9', '10x10'].map(sz => (
                            <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#F8FAFC', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>{sz}:</span>
                              <input
                                type="number"
                                defaultValue={k.prices?.[sz] || ''}
                                onBlur={(e) => updateKuihPrice(k.id, sz, e.target.value)}
                                style={{ width: '50px', padding: '2px 4px', border: '1px solid #94A3B8', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                          Harga Standard: <strong>RM {k.defaultPrice || 45}</strong>
                        </div>
                      )}

                      {/* Availability Toggle Button */}
                      <div>
                        <button
                          onClick={() => toggleKuihAvailability(k.id)}
                          style={{
                            background: isAvail ? '#EF4444' : '#10B981',
                            color: 'white',
                            border: 'none',
                            padding: '0.55rem 1.1rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          {isAvail ? 'Tandakan HABIS' : 'Buka SEMULA'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── KUIH GAME MANAGEMENT TAB ── */}
          {activeTab === 'game_recipes' && (
            <div>
              <div style={{ marginBottom: '1.4rem' }}>
                <h3 style={{ margin: 0, color: '#164C2D' }}>Tambah game membuat kuih</h3>
                <p style={{ margin: '0.4rem 0 0', color: '#64748B', fontSize: '0.9rem' }}>
                  Setiap langkah boleh mengandungi bahan dan tindakan seperti mengaul, mengukus, menyejukkan atau memotong.
                </p>
              </div>

              {gameRecipeError && (
                <p role="alert" style={{ padding: '0.8rem 1rem', color: '#8A4B08', background: '#FAF2D9', border: '1px solid #DFC66F', borderRadius: '8px' }}>
                  {gameRecipeError}
                </p>
              )}
              {gameRecipeSuccess && (
                <p role="status" style={{ padding: '0.8rem 1rem', color: '#164C2D', background: '#EAF3E5', border: '1px solid #BED3AE', borderRadius: '8px' }}>
                  {gameRecipeSuccess}
                </p>
              )}

              <form onSubmit={handleCreateGameRecipe} style={{ display: 'grid', gap: '1rem', padding: '1.25rem', background: '#F8FAF5', border: '1px solid #D5E5CE', borderRadius: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
                  <label style={gameFormLabelStyle}>
                    Nama kuih
                    <input
                      style={gameFormFieldStyle}
                      value={gameRecipeDraft.name}
                      onChange={(event) => setGameRecipeDraft((draft) => ({ ...draft, name: event.target.value }))}
                      maxLength={100}
                      required
                    />
                  </label>
                  <label style={gameFormLabelStyle}>
                    Ikon (emoji)
                    <input
                      style={gameFormFieldStyle}
                      value={gameRecipeDraft.icon}
                      onChange={(event) => setGameRecipeDraft((draft) => ({ ...draft, icon: event.target.value }))}
                      maxLength={8}
                    />
                  </label>
                </div>

                <label style={gameFormLabelStyle}>
                  Penerangan ringkas
                  <textarea
                    style={{ ...gameFormFieldStyle, minHeight: '72px', resize: 'vertical' }}
                    value={gameRecipeDraft.description}
                    onChange={(event) => setGameRecipeDraft((draft) => ({ ...draft, description: event.target.value }))}
                    maxLength={300}
                    required
                  />
                </label>

                <label style={gameFormLabelStyle}>
                  Warna lapisan kuih
                  <select
                    style={gameFormFieldStyle}
                    value={gameRecipeDraft.layers}
                    onChange={(event) => setGameRecipeDraft((draft) => ({ ...draft, layers: event.target.value }))}
                  >
                    <option value="green,white">Hijau dan putih</option>
                    <option value="white,gold">Putih dan kuning keemasan</option>
                    <option value="green,white,gold">Hijau, putih dan kuning keemasan</option>
                  </select>
                </label>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {gameStepDrafts.map((step, index) => (
                    <fieldset key={index} style={{ display: 'grid', gap: '0.8rem', minWidth: 0, padding: '1rem', border: '1px solid #D5E5CE', borderRadius: '10px' }}>
                      <legend style={{ padding: '0 0.4rem', color: '#164C2D', fontWeight: 700 }}>Langkah {index + 1}</legend>
                      <label style={gameFormLabelStyle}>
                        Tajuk langkah
                        <input
                          style={gameFormFieldStyle}
                          value={step.title}
                          onChange={(event) => updateGameStepDraft(index, 'title', event.target.value)}
                          maxLength={100}
                          required
                        />
                      </label>
                      <label style={gameFormLabelStyle}>
                        Arahan untuk pemain
                        <textarea
                          style={{ ...gameFormFieldStyle, minHeight: '70px', resize: 'vertical' }}
                          value={step.instruction}
                          onChange={(event) => updateGameStepDraft(index, 'instruction', event.target.value)}
                          maxLength={400}
                          required
                        />
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                        <label style={gameFormLabelStyle}>
                          Tindakan
                          <select style={gameFormFieldStyle} value={step.action} onChange={(event) => updateGameStepDraft(index, 'action', event.target.value)}>
                            {GAME_ACTION_OPTIONS.map((action) => <option key={action.value} value={action.value}>{action.label}</option>)}
                          </select>
                        </label>
                        <label style={gameFormLabelStyle}>
                          Tempat memasak
                          <select style={gameFormFieldStyle} value={step.target} onChange={(event) => updateGameStepDraft(index, 'target', event.target.value)}>
                            {GAME_TARGET_OPTIONS.map((target) => <option key={target.value} value={target.value}>{target.label}</option>)}
                          </select>
                        </label>
                        {step.action === 'heat' && (
                          <label style={gameFormLabelStyle}>
                            Tahap api sasaran
                            <select style={gameFormFieldStyle} value={step.heatLevel} onChange={(event) => updateGameStepDraft(index, 'heatLevel', event.target.value)}>
                              <option value="low">Api kecil</option>
                              <option value="medium-low">Sederhana kecil</option>
                              <option value="medium">Api sederhana</option>
                              <option value="high">Api besar</option>
                            </select>
                          </label>
                        )}
                      </div>
                      <label style={gameFormLabelStyle}>
                        Bahan/peralatan (satu item setiap baris; boleh dikosongkan untuk langkah panaskan)
                        <textarea
                          style={{ ...gameFormFieldStyle, minHeight: '64px', resize: 'vertical' }}
                          value={step.ingredients}
                          onChange={(event) => updateGameStepDraft(index, 'ingredients', event.target.value)}
                          placeholder={'Contoh:\nTepung beras\nSantan'}
                        />
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#164C2D', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={step.needsCooling}
                          onChange={(event) => updateGameStepDraft(index, 'needsCooling', event.target.checked)}
                        />
                        Minta pemain sejukkan kuih sebelum langkah ini
                      </label>
                      {gameStepDrafts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setGameStepDrafts((steps) => steps.filter((_, stepIndex) => stepIndex !== index))}
                          style={{ justifySelf: 'start', padding: '0.45rem 0.7rem', color: '#991B1B', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '7px', cursor: 'pointer' }}
                        >
                          Buang langkah
                        </button>
                      )}
                    </fieldset>
                  ))}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem' }}>
                  <button
                    type="button"
                    onClick={() => setGameStepDrafts((steps) => [...steps, createGameStepDraft()])}
                    style={{ padding: '0.65rem 0.9rem', color: '#164C2D', fontWeight: 700, background: '#EAF3E5', border: '1px solid #BED3AE', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    + Tambah langkah
                  </button>
                  <button
                    type="submit"
                    disabled={savingGameRecipe}
                    style={{ padding: '0.65rem 1rem', color: 'white', fontWeight: 700, background: '#236B3C', border: 0, borderRadius: '8px', cursor: savingGameRecipe ? 'wait' : 'pointer', opacity: savingGameRecipe ? 0.65 : 1 }}
                  >
                    {savingGameRecipe ? 'Menyimpan…' : 'Simpan game'}
                  </button>
                </div>
              </form>

              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: '#164C2D' }}>Game tambahan ({gameRecipes.length})</h3>
                {gameRecipeLoading ? (
                  <p style={{ color: '#64748B' }}>Memuatkan game tambahan…</p>
                ) : gameRecipes.length === 0 ? (
                  <p style={{ color: '#64748B' }}>Belum ada game tambahan.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {gameRecipes.map((recipe) => (
                      <div key={recipe.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', padding: '0.9rem 1rem', background: '#FFFEF9', border: '1px solid #E2E8F0', borderRadius: '9px' }}>
                        <div>
                          <strong style={{ color: '#164C2D' }}>{recipe.icon || '🍰'} {recipe.name}</strong>
                          <p style={{ margin: '0.25rem 0 0', color: '#64748B', fontSize: '0.82rem' }}>
                            {Array.isArray(recipe.steps) ? recipe.steps.length : 0} langkah · {recipe.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={deletingGameRecipeId === recipe.id}
                          onClick={() => handleDeleteGameRecipe(recipe)}
                          style={{ padding: '0.5rem 0.75rem', color: '#991B1B', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '7px', cursor: 'pointer' }}
                        >
                          {deletingGameRecipeId === recipe.id ? 'Memadam…' : 'Padam game'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

          {/* ── PAGES MANAGEMENT TAB ── */}
          {activeTab === 'pages' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ color: '#0F172A', margin: 0, fontSize: '1.3rem' }}>Pengurusan Semua Halaman (All Pages)</h3>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '4px 0 0' }}>
                    Semak, pantau, dan akses pantas pautan konfigurasi bagi setiap halaman web Studio Noni Talam.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* 1. Studio Page Info */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🏛️</span>
                    <span style={{ background: '#ECFDF5', color: '#047857', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>AKTIF</span>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.1rem' }}>1. Studio Page (Bengkel)</h4>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                    Pakej bengkel, pemilihan tarikh & slot masa, pendaftaran borang murid, dan integrasi bayaran.
                  </p>
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Route: <code>/</code></span>
                    <button onClick={() => navigate('/')} style={{ background: '#047857', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                      Buka Studio ↗
                    </button>
                  </div>
                </div>

                {/* 2. Order Kuih Siap Info */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🧁</span>
                    <span style={{ background: '#FEF3C7', color: '#B45309', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>TEMPAH KUIH</span>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.1rem' }}>2. Tempah Kuih Siap (Loyang)</h4>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                    Pelanggan tempah kuih talam siap masak dengan pilihan saiz 8x8, 9x9, 10x10, kaedah ambil/penghantaran, dan terus bayar.
                  </p>
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Route: <code>/tempah-kuih</code></span>
                    <button onClick={() => navigate('/tempah-kuih')} style={{ background: '#B45309', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                      Buka Tempah Kuih ↗
                    </button>
                  </div>
                </div>

                {/* 2. Product Page Info */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🛍️</span>
                    <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>TIKTOK SHOP</span>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.1rem' }}>2. Product Page (Landing Page)</h4>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                    Koleksi produk kuih, tepung premix, peralatan loyang, dan sambungan terus ke TikTok Shop rasmi (@nonitalam).
                  </p>
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Route: <code>/product</code></span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => navigate('/product')} style={{ background: '#1E293B', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                        Buka Produk ↗
                      </button>
                      <a href="https://www.tiktok.com/@nonitalam" target="_blank" rel="noopener noreferrer" style={{ background: '#000000', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                        TikTok
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. Learn Page Info */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🎓</span>
                    <span style={{ background: '#FEF3C7', color: '#B45309', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>VIDEO & GAME</span>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.1rem' }}>3. Learn Page (Video & Game)</h4>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                    Pautan video panduan YouTube, modul teori kuih, dan Mini Game interaktif 5 langkah pembuatan talam.
                  </p>
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Route: <code>/learn</code></span>
                    <button onClick={() => navigate('/learn')} style={{ background: '#B45309', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                      Buka Learn ↗
                    </button>
                  </div>
                </div>

                {/* 4. Admin Portal Info */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🔐</span>
                    <span style={{ background: '#F3E8FF', color: '#7E22CE', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>PORTAL PENTADBIR</span>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.1rem' }}>4. Admin Dashboard</h4>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                    Kawalan pesanan tempahan slot studio, pengesahan testimoni, dan pengurusan navigasi laman.
                  </p>
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Route: <code>/admin</code></span>
                    <span style={{ color: '#047857', fontSize: '0.8rem', fontWeight: 600 }}>Sesi Aktif</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
