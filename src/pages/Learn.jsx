import React, { useState } from 'react';
import './Learn.css';

// Step-by-step kuih talam cooking game
const GAME_STEPS = [
  {
    title: 'Kisar daun pandan',
    instruction: 'Masukkan daun pandan dan air ke dalam pengisar untuk menyediakan jus pandan asli.',
    target: 'bowl',
    targetLabel: 'Mangkuk pengisar',
    items: [
      { id: 'pandan', name: 'Daun pandan', emoji: '🌿' },
      { id: 'water', name: 'Air', emoji: '💧' }
    ],
    action: 'Kisar jus pandan'
  },
  {
    title: 'Sediakan lapisan pulut',
    instruction: 'Gaulkan pulut dengan santan pekat dan secubit garam sebelum dikukus separuh masak.',
    target: 'bowl',
    targetLabel: 'Mangkuk adunan',
    items: [
      { id: 'glutinous-rice', name: 'Beras pulut', emoji: '🍚' },
      { id: 'coconut-milk', name: 'Santan + garam', emoji: '🥥' }
    ],
    action: 'Gaul dan kukus pulut'
  },
  {
    title: 'Padatkan tapak pulut',
    instruction: 'Pindahkan pulut separuh masak ke dalam loyang dan tekan hingga padat.',
    target: 'tray',
    targetLabel: 'Loyang',
    items: [
      { id: 'spatula', name: 'Pulut separuh masak', emoji: '🍚' }
    ],
    action: 'Tekan dan padatkan'
  },
  {
    title: 'Tambah lapisan pandan',
    instruction: 'Tuangkan adunan kastard pandan di atas tapak pulut yang telah dipadatkan.',
    target: 'tray',
    targetLabel: 'Loyang kuih',
    items: [
      { id: 'pandan-custard', name: 'Adunan pandan', emoji: '🥣' }
    ],
    action: 'Tuang adunan pandan'
  },
  {
    title: 'Kukus hingga masak',
    instruction: 'Kukus dengan api sederhana kecil dan lap penutup kukusan berkala supaya permukaan kuih kekal licin.',
    target: 'steamer',
    targetLabel: 'Pengukus',
    items: [],
    action: 'Kukus kuih'
  },
  {
    title: 'Sejukkan dan potong',
    instruction: 'Sejukkan kuih sepenuhnya pada suhu bilik (3–4 jam), kemudian gunakan pisau plastik atau pisau yang disapu minyak.',
    target: 'cake',
    targetLabel: 'Kuih talam',
    items: [
      { id: 'knife', name: 'Pisau plastik', emoji: '🔪' }
    ],
    action: 'Potong kuih talam',
    needsCooling: true
  }
];

const Learn = () => {
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'game' | 'modules'

  // Game state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [placedIngredients, setPlacedIngredients] = useState([]);
  const [isCooled, setIsCooled] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentStep = GAME_STEPS[currentStepIndex];

  const handleIngredientDrop = (ingredientId) => {
    if (!currentStep.items.some((item) => item.id === ingredientId)) return;
    setPlacedIngredients((items) => items.includes(ingredientId) ? items : [...items, ingredientId]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleIngredientDrop(event.dataTransfer.getData('text/plain'));
  };

  const handleNextStep = () => {
    const allItemsPlaced = currentStep.items.every((item) => placedIngredients.includes(item.id));
    if (!allItemsPlaced || (currentStep.needsCooling && !isCooled)) return;

    if (currentStepIndex + 1 < GAME_STEPS.length) {
      setCurrentStepIndex((step) => step + 1);
      setPlacedIngredients([]);
      setIsCooled(false);
    } else {
      setGameOver(true);
    }
  };

  const handleRestartGame = () => {
    setCurrentStepIndex(0);
    setPlacedIngredients([]);
    setIsCooled(false);
    setGameOver(false);
  };

  const videoTutorials = [
    {
      id: 'v1',
      title: 'Tutorial Lengkap Kuih Talam Pandan Asli (Seri Muka)',
      channel: 'YouTube Video Tutorial',
      duration: '18:45',
      badge: 'Video Utama',
      youtubeUrl: 'https://www.youtube.com/results?search_query=cara+buat+kuih+talam+pandan+sedap',
      embedId: 'dQw4w9WgXcQ', // Placeholder or search link
      desc: 'Pelajari nisbah santan, air pandan dan tepung beras untuk menghasilkan lapisan seri muka yang licin dan lemak manis seimbang.'
    },
    {
      id: 'v2',
      title: 'Rahsia Potongan Kuih Talam Kemas & Berkilat',
      channel: 'Tips Dapur Noni',
      duration: '08:20',
      badge: 'Teknik Potong',
      youtubeUrl: 'https://www.youtube.com/results?search_query=tips+potong+kuih+talam+cantik',
      desc: 'Teknik menggunakan pisau plastik bergerigi khas dan sapuan minyak nipis untuk elakkan kuih melekat.'
    },
    {
      id: 'v3',
      title: 'Cara Mengukus Kuih Talam Keladi Berlauk',
      channel: 'Resipi Tradisi',
      duration: '14:10',
      badge: 'Talam Berlauk',
      youtubeUrl: 'https://www.youtube.com/results?search_query=kuih+talam+keladi+berlauk+kukus',
      desc: 'Gandingan keladi lembut dengan taburan sambal udang kering rangup dan bawang goreng wangi.'
    }
  ];

  const recipeModules = [
    {
      title: 'Modul 1: Mengenal Jenis Tepung & Sukatan',
      level: 'Asas',
      summary: 'Ketahui perbezaan tepung beras cap teratai, tepung ubi untuk keanjalan, dan tepung gandum untuk struktur.',
      readTime: '5 minit bacaan'
    },
    {
      title: 'Modul 2: Kawalan Suhu & Wap Pengukus',
      level: 'Pertengahan',
      summary: 'Mengapa balut penutup kukus dengan kain bersih amat penting bagi mengelakkan air menitis ke muka kuih.',
      readTime: '7 minit bacaan'
    },
    {
      title: 'Modul 3: Mengatasi Masalah Kuih Mentah / Berair',
      level: 'Lanjutan',
      summary: 'Langkah membaiki adunan yang terlembik atau santan pecah minyak semasa proses pengukusan.',
      readTime: '6 minit bacaan'
    }
  ];

  return (
    <div className="learn-page">
      {/* Hero */}
      <section className="learn-hero">
        <div className="learn-hero-badge">🎓 Akademi Maya Noni Talam</div>
        <h1>Belajar Membuat Kuih Talam</h1>
        <p>
          Tonton tutorial, cuba game membuat kuih talam langkah demi langkah, atau terokai modul pembelajaran kami.
        </p>

        {/* Tab switchers */}
        <div className="learn-tabs">
          <button 
            className={`learn-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            📺 Video Tutorial (YouTube)
          </button>
          <button 
            className={`learn-tab-btn ${activeTab === 'game' ? 'active' : ''}`}
            onClick={() => setActiveTab('game')}
          >
            🎮 Game Buat Kuih Talam
          </button>
          <button 
            className={`learn-tab-btn ${activeTab === 'modules' ? 'active' : ''}`}
            onClick={() => setActiveTab('modules')}
          >
            📖 Modul & Rahsia Resipi
          </button>
        </div>
      </section>

      <div className="learn-container">
        {/* TAB 1: YOUTUBE VIDEOS */}
        {activeTab === 'video' && (
          <div className="video-section">
            <div className="section-intro">
              <h2>Video Pembelajaran Terpilih</h2>
              <p>Pilih mana-mana video di bawah untuk ditonton di YouTube atau ikuti panduan langkah demi langkah.</p>
            </div>

            <div className="video-grid">
              {videoTutorials.map((vid) => (
                <div key={vid.id} className="video-card">
                  <div className="video-thumbnail-box">
                    <div className="play-button-overlay">
                      <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="duration-tag">{vid.duration}</span>
                    <span className="vid-badge">{vid.badge}</span>
                  </div>
                  <div className="video-info">
                    <span className="vid-channel">{vid.channel}</span>
                    <h3 className="vid-title">{vid.title}</h3>
                    <p className="vid-desc">{vid.desc}</p>
                    <a 
                      href={vid.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="youtube-watch-btn"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="#FF0000">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Tonton di YouTube
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="youtube-channel-callout">
              <div className="callout-icon">🔴</div>
              <div>
                <h4>Ingin lebih banyak tutorial video?</h4>
                <p>Layari pencarian YouTube kami untuk pelbagai variasi kuih talam tradisional yang sedap dan terbukti menjadi.</p>
              </div>
              <a 
                href="https://www.youtube.com/results?search_query=resepi+kuih+talam+sukatan+cawan" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="youtube-explore-btn"
              >
                Cari Resipi di YouTube ↗
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: COOKING GAME */}
        {activeTab === 'game' && (
          <div className="game-section">
            <div className="game-card">
              <div className="game-header">
                <div>
                  <span className="game-badge">🎮 Dapur Interaktif</span>
                  <h2>Jom Buat Kuih Talam!</h2>
                </div>
              </div>

              {!gameOver ? (
                <div className="game-body">
                  <div className="game-progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${((currentStepIndex + 1) / GAME_STEPS.length) * 100}%` }}
                    />
                  </div>
                  <div className="step-count">Langkah {currentStepIndex + 1} daripada {GAME_STEPS.length}</div>
                  <h3 className="game-title">{currentStep.title}</h3>
                  <p className="game-prompt">{currentStep.instruction}</p>

                  <div className={`cooking-scene scene-${currentStep.target}`}>
                    <div className="scene-shelf" aria-hidden="true">
                      <span>🫙</span><span>🥄</span><span>🧂</span>
                    </div>
                    <div className="scene-utensils" aria-hidden="true">🥄　🍴　🥣</div>
                    <div
                      className={`cooking-target target-${currentStep.target}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={handleDrop}
                      role="region"
                      aria-label={`Letak bahan di ${currentStep.targetLabel}`}
                    >
                      <span className="target-emoji" aria-hidden="true">
                        {currentStep.target === 'bowl' ? '🥣' : currentStep.target === 'tray' ? '🍱' : currentStep.target === 'steamer' ? '♨️' : '🍰'}
                      </span>
                      <div className="target-contents" aria-live="polite">
                        {placedIngredients.map((id) => {
                          const item = currentStep.items.find((ingredient) => ingredient.id === id);
                          return item && <span key={id} title={item.name}>{item.emoji}</span>;
                        })}
                      </div>
                      <span className="target-label">{currentStep.targetLabel}</span>
                    </div>
                  </div>

                  {currentStep.needsCooling && !isCooled && (
                    <button className="cooling-btn" type="button" onClick={() => setIsCooled(true)}>
                      ❄️ Kuih sudah sejuk sepenuhnya
                    </button>
                  )}

                  {currentStep.items.length > 0 ? (
                    <div className="ingredient-picker" aria-label="Bahan dan peralatan">
                      {currentStep.items.map((item) => {
                        const isPlaced = placedIngredients.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            className={`ingredient-card ${isPlaced ? 'placed' : ''}`}
                            type="button"
                            draggable={!isPlaced && (!currentStep.needsCooling || isCooled)}
                            disabled={isPlaced || (currentStep.needsCooling && !isCooled)}
                            onClick={() => handleIngredientDrop(item.id)}
                            onDragStart={(event) => event.dataTransfer.setData('text/plain', item.id)}
                            aria-pressed={isPlaced}
                          >
                            <span className="ingredient-emoji" aria-hidden="true">{item.emoji}</span>
                            <span>{isPlaced ? 'Dimasukkan!' : item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="steam-tip">Api sederhana kecil membantu menghasilkan permukaan kuih yang licin.</div>
                  )}

                  <p className="game-interaction-hint">
                    {currentStep.items.length > 0
                      ? 'Seret bahan ke dalam bekas atau tekan bahannya.'
                      : 'Ikuti arahan dan mulakan proses mengukus.'}
                  </p>

                  <button
                    className="next-step-btn"
                    type="button"
                    onClick={handleNextStep}
                    disabled={
                      !currentStep.items.every((item) => placedIngredients.includes(item.id)) ||
                      (currentStep.needsCooling && !isCooled)
                    }
                  >
                    {currentStep.action} ➜
                  </button>
                </div>
              ) : (
                <div className="game-result">
                  <div className="finished-kuih" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <h3>Kuih Talam Siap!</h3>
                  <p className="result-msg">
                    Hebat! Anda sudah menyediakan jus pandan, membina lapisan pulut dan pandan, mengukus, menyejukkan, serta memotong kuih talam.
                  </p>

                  <div className="game-result-actions">
                    <button className="restart-btn" type="button" onClick={handleRestartGame}>
                      🔄 Main Semula
                    </button>
                    <a href="/" className="book-studio-btn">
                      🏛️ Tempah Kelas Bengkel Studio
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RECIPE MODULES */}
        {activeTab === 'modules' && (
          <div className="modules-section">
            <div className="section-intro">
              <h2>Modul Teori & Sukatan Rahsia</h2>
              <p>Panduan ringkas nota studio untuk menghasilkan kuih talam bermutu tinggi.</p>
            </div>

            <div className="modules-grid">
              {recipeModules.map((m, idx) => (
                <div key={idx} className="module-card">
                  <div className="module-top">
                    <span className="module-level">{m.level}</span>
                    <span className="module-time">⏱️ {m.readTime}</span>
                  </div>
                  <h3>{m.title}</h3>
                  <p>{m.summary}</p>
                  <div className="module-footer">
                    <span className="module-status">Tersedia untuk Pelajar Studio</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;
