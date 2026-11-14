import React, { useState } from 'react';
import './Learn.css';

// Interactive Mini Game: Master the Kuih Talam Sequence
const GAME_STEPS = [
  {
    step: 1,
    title: 'Langkah 1: Penyediaan Daun Pandan & Santan',
    prompt: 'Apakah bahan pertama yang perlu dikisar bersama air untuk aroma & warna hijau talam?',
    options: [
      { id: 'a', text: 'Daun Pandan Asli & Air', correct: true, hint: 'Tepat sekali! Daun pandan segar memberikan aroma dan warna hijau semulajadi.' },
      { id: 'b', text: 'Pewarna Tiruan Hijau & Cuka', correct: false, hint: 'Kurang tepat. Noni Talam menggunakan 100% daun pandan asli.' },
      { id: 'c', text: 'Sirap Ros Merah', correct: false, hint: 'Salah, itu untuk sirap bandung!' }
    ]
  },
  {
    step: 2,
    title: 'Langkah 2: Lapisan Bawah (Tapak Pulut)',
    prompt: 'Sebelum mengukus pulut lapisan bawah, apakah cecair yang perlu digaul bersama beras pulut?',
    options: [
      { id: 'a', text: 'Susu Pekat Manis', correct: false, hint: 'Pulut akan jadi terlalu manis dan cepat hangit.' },
      { id: 'b', text: 'Santan Pekat Bersama Secubit Garam', correct: true, hint: 'Bagus! Santan pekat bergaram menjadikan pulut lemak dan gurih.' },
      { id: 'c', text: 'Air Kosong Sejuk', correct: false, hint: 'Pulut perlukan lemak santan untuk melekat dan berkilat.' }
    ]
  },
  {
    step: 3,
    title: 'Langkah 3: Pemadatan Tapak Pulut',
    prompt: 'Setelah pulut masak separuh kukus, apakah tindakan penting sebelum tuang adunan hijau?',
    options: [
      { id: 'a', text: 'Tekan dan padatkan pulut di dalam loyang hingga rapat', correct: true, hint: 'Hebat! Ini mengelakkan lapisan hijau daripada meresap ke dasar loyang.' },
      { id: 'b', text: 'Biarkan pulut berderai longgar', correct: false, hint: 'Jika longgar, lapisan hijau akan meresap dan merosakkan garisan dua tona.' },
      { id: 'c', text: 'Tabur serbuk coklat', correct: false, hint: 'Ini kuih talam tradisional, bukan kek coklat!' }
    ]
  },
  {
    step: 4,
    title: 'Langkah 4: Adunan Kastard Hijau Pandan',
    prompt: 'Berapa suhu api pengukus yang disarankan untuk mendapatkan permukaan talam yang licin tanpa gelembung?',
    options: [
      { id: 'a', text: 'Api sederhana kecil & lap penutup kukusan berkala', correct: true, hint: 'Sempurna! Api sederhana kecil mengelakkan gelembung udara pada permukaan kuih.' },
      { id: 'b', text: 'Api paling besar membara sepanjang masa', correct: false, hint: 'Api terlalu besar membuatkan adunan mendidih berkawah dan berlubang-lubang.' },
      { id: 'c', text: 'Matikan api terus', correct: false, hint: 'Kuih tidak akan masak!' }
    ]
  },
  {
    step: 5,
    title: 'Langkah 5: Masa Menyejuk & Memotong',
    prompt: 'Bilakah masa terbaik untuk memotong kuih talam supaya potongannya tajam dan kemas?',
    options: [
      { id: 'a', text: 'Semasa panas berasap sejurus keluar kukusan', correct: false, hint: 'Kuih masih lembik dan akan hancur lekat pada pisau!' },
      { id: 'b', text: 'Setelah kuih sejuk sepenuhnya ke suhu bilik (3-4 jam) dengan pisau plastik/disapu minyak', correct: true, hint: 'Syabas! Potongan kemas bak cermin bila kuih sudah sejuk sepenuhnya.' },
      { id: 'c', text: 'Simpan beku dalam freezer semalaman', correct: false, hint: 'Santan akan pecah minyak dan tekstur menjadi berair bila cair.' }
    ]
  }
];

const Learn = () => {
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'game' | 'modules'

  // Game state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const currentQ = GAME_STEPS[currentStepIndex];

  const handleSelectOption = (opt) => {
    if (selectedAnswer !== null) return; // Prevent changing after select
    setSelectedAnswer(opt);
    if (opt.correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextStep = () => {
    setSelectedAnswer(null);
    if (currentStepIndex + 1 < GAME_STEPS.length) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setGameOver(true);
    }
  };

  const handleRestartGame = () => {
    setCurrentStepIndex(0);
    setSelectedAnswer(null);
    setScore(0);
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
          Tonton video tutorial interaktif di YouTube atau uji pengetahuan anda melalui Mini Game cabaran membuat kuih talam bertahap!
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
            🎮 Mini Game: Cabaran Kuih Talam
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

        {/* TAB 2: MINI GAME */}
        {activeTab === 'game' && (
          <div className="game-section">
            <div className="game-card">
              <div className="game-header">
                <div>
                  <span className="game-badge">🎮 Mini Game Interaktif</span>
                  <h2>Cabaran Master Kuih Talam</h2>
                </div>
                <div className="game-score-pill">
                  Markah: <strong>{score}</strong> / {GAME_STEPS.length}
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
                  <h3 className="game-title">{currentQ.title}</h3>
                  <p className="game-prompt">{currentQ.prompt}</p>

                  <div className="game-options">
                    {currentQ.options.map((opt) => {
                      let btnClass = 'game-opt-btn';
                      if (selectedAnswer) {
                        if (opt.correct) btnClass += ' correct';
                        else if (selectedAnswer.id === opt.id && !opt.correct) btnClass += ' wrong';
                      }
                      return (
                        <button
                          key={opt.id}
                          className={btnClass}
                          onClick={() => handleSelectOption(opt)}
                          disabled={selectedAnswer !== null}
                        >
                          <span className="opt-letter">{opt.id.toUpperCase()}</span>
                          <span className="opt-text">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedAnswer && (
                    <div className={`answer-feedback ${selectedAnswer.correct ? 'success' : 'alert'}`}>
                      <strong>{selectedAnswer.correct ? '🎉 Tahniah!' : '⚠️ Perhatian:'}</strong> {selectedAnswer.hint}
                      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                        <button className="next-step-btn" onClick={handleNextStep}>
                          {currentStepIndex + 1 < GAME_STEPS.length ? 'Langkah Seterusnya ➔' : 'Lihat Keputusan 🏆'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="game-result">
                  <div className="result-trophy">
                    {score >= 4 ? '🏆' : score >= 2 ? '⭐' : '💪'}
                  </div>
                  <h3>Permainan Selesai!</h3>
                  <p className="result-score-text">
                    Anda mendapat <strong>{score}</strong> daripada <strong>{GAME_STEPS.length}</strong> markah betul!
                  </p>
                  <p className="result-msg">
                    {score === 5 
                      ? 'Hebat sekali! Anda layak bergelar Master Kuih Talam Noni! Sertai kelas studio fizikal kami untuk asah kemahiran praktikal.'
                      : score >= 3
                      ? 'Bagus! Anda sudah faham asas penting kuih talam. Teruskan belajar dengan menonton video tutorial.'
                      : 'Jangan putus asa! Cuba tonton video tutorial di tab YouTube dahulu dan mainkan semula kuiz ini!'}
                  </p>

                  <div className="game-result-actions">
                    <button className="restart-btn" onClick={handleRestartGame}>
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
