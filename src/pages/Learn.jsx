import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../supabaseClient';
import './Learn.css';

const GAME_RECIPES = [
  {
    id: 'pandan',
    name: 'Talam Pandan Asli',
    description: 'Pulut santan dengan kastard pandan harum.',
    emoji: '🌿',
    layers: ['green', 'white'],
    prepTitle: 'Kisar jus pandan',
    prepInstruction: 'Masukkan daun pandan dan air ke dalam pengisar untuk menyediakan jus pandan asli.',
    prepItems: [
      { id: 'pandan-leaves', name: 'Daun pandan', emoji: '🌿' },
      { id: 'water', name: 'Air', emoji: '💧' }
    ],
    prepAction: 'Kisar jus pandan',
    baseTitle: 'Sediakan lapisan pulut',
    baseInstruction: 'Gaulkan pulut dengan santan pekat dan secubit garam sebelum dikukus separuh masak.',
    baseItems: [
      { id: 'glutinous-rice', name: 'Beras pulut', emoji: '🍚' },
      { id: 'coconut-milk', name: 'Santan + garam', emoji: '🥥' }
    ],
    baseAction: 'Gaul dan kukus separuh masak',
    compactBase: true,
    layerTitle: 'Tambah lapisan pandan',
    layerInstruction: 'Tuangkan adunan kastard pandan di atas tapak pulut yang telah dipadatkan.',
    layerAction: 'Tuang adunan pandan',
    layerItems: [
      { id: 'pandan-custard', name: 'Adunan pandan', emoji: '🥣' }
    ]
  },
  {
    id: 'keladi',
    name: 'Talam Keladi Berlauk',
    description: 'Keladi segar, sambal udang kering dan bawang goreng.',
    emoji: '🍠',
    layers: ['white', 'gold'],
    prepTitle: 'Potong keladi segar',
    prepInstruction: 'Potong keladi segar menjadi kiub kecil untuk adunan talam.',
    prepItems: [
      { id: 'taro', name: 'Keladi segar', emoji: '🍠' }
    ],
    prepAction: 'Sediakan keladi',
    prepMode: 'cut',
    prepTarget: 'tray',
    prepTargetLabel: 'Papan pemotong',
    baseTitle: 'Gaul adunan keladi',
    baseInstruction: 'Gaulkan keladi dengan adunan tepung lembut.',
    baseTarget: 'tray',
    baseTargetLabel: 'Loyang kuih',
    baseItems: [
      { id: 'taro-batter', name: 'Adunan tepung', emoji: '🥣' }
    ],
    layerTitle: 'Tabur lauk rangup',
    layerInstruction: 'Lengkapkan talam dengan sambal udang kering dan bawang goreng.',
    layerAction: 'Tabur lauk rangup',
    layerAfterSteam: true,
    layerMode: 'add',
    layerItems: [
      { id: 'dried-shrimp', name: 'Sambal udang kering', emoji: '🦐' },
      { id: 'fried-onion', name: 'Bawang goreng', emoji: '🧅' }
    ]
  },
  {
    id: 'suji',
    name: 'Talam Suji Gula Melaka',
    description: 'Suji keemasan, gula Melaka dan lapisan santan.',
    emoji: '🌾',
    layers: ['gold', 'white'],
    prepTitle: 'Sediakan adunan suji',
    prepInstruction: 'Satukan suji keemasan dengan gula Melaka asli.',
    prepItems: [
      { id: 'suji', name: 'Suji', emoji: '🌾' },
      { id: 'palm-sugar', name: 'Gula Melaka', emoji: '🟤' }
    ],
    prepAction: 'Gaul suji dan gula',
    prepMode: 'stir',
    baseTitle: 'Sediakan lapisan santan',
    baseInstruction: 'Tambah adunan santan pekat untuk lapisan talam yang berkilau.',
    baseItems: [
      { id: 'thick-coconut-milk', name: 'Santan pekat', emoji: '🥥' }
    ],
    baseAction: 'Tambah santan',
    baseMode: 'add',
    layerTitle: 'Susun lapisan suji',
    layerInstruction: 'Tuangkan adunan suji keemasan dan lapisan santan ke dalam loyang.',
    layerAction: 'Susun lapisan suji',
    layerItems: [
      { id: 'suji-batter', name: 'Adunan suji', emoji: '🥣' }
    ]
  },
  {
    id: 'cendol',
    name: 'Talam Cendol Santan',
    description: 'Cendol pandan kenyal dengan lapisan gula Melaka.',
    emoji: '🍃',
    layers: ['green', 'white', 'gold'],
    prepTitle: 'Sediakan lapisan cendol',
    prepInstruction: 'Masukkan butiran cendol pandan ke dalam lapisan bawah.',
    prepItems: [
      { id: 'cendol', name: 'Cendol pandan', emoji: '🍃' }
    ],
    prepAction: 'Sediakan cendol',
    prepMode: 'add',
    baseTitle: 'Tambah lapisan santan',
    baseInstruction: 'Padankan cendol dengan lapisan santan sawit.',
    baseItems: [
      { id: 'palm-coconut-milk', name: 'Santan sawit', emoji: '🥥' }
    ],
    baseAction: 'Tambah lapisan santan',
    baseMode: 'pour',
    layerTitle: 'Tuang gula Melaka',
    layerInstruction: 'Akhiri lapisan dengan gula Melaka pekat.',
    layerAction: 'Tuang gula Melaka',
    layerItems: [
      { id: 'thick-palm-sugar', name: 'Gula Melaka pekat', emoji: '🟤' }
    ]
  },
  {
    id: 'daging',
    name: 'Talam Berlauk Daging',
    description: 'Daging kisar berempah, cili segar dan daun sup.',
    emoji: '🍲',
    layers: ['white', 'gold', 'green'],
    prepTitle: 'Sediakan lauk berempah',
    prepInstruction: 'Sediakan daging kisar berempah bersama cili potong dan daun sup.',
    prepItems: [
      { id: 'minced-beef', name: 'Daging kisar', emoji: '🍲' },
      { id: 'fresh-chilli', name: 'Cili segar', emoji: '🌶️' },
      { id: 'celery-leaves', name: 'Daun sup', emoji: '🌿' }
    ],
    prepAction: 'Gaul bahan lauk',
    prepMode: 'stir',
    baseTitle: 'Sediakan tapak talam',
    baseInstruction: 'Tuang adunan talam lembut ke dalam loyang.',
    baseTarget: 'tray',
    baseTargetLabel: 'Loyang kuih',
    baseItems: [
      { id: 'soft-batter', name: 'Adunan talam', emoji: '🥣' }
    ],
    baseAction: 'Tuang adunan',
    baseMode: 'pour',
    layerTitle: 'Tambah lauk di atas',
    layerInstruction: 'Taburkan campuran daging berempah di atas adunan talam.',
    layerAction: 'Tambah lauk',
    layerMode: 'add',
    layerItems: [
      { id: 'spiced-topping', name: 'Lauk berempah', emoji: '🍲' }
    ]
  }
];

const HEAT_LEVELS = [
  { id: 'low', label: 'Api kecil' },
  { id: 'medium-low', label: 'Sederhana kecil' },
  { id: 'medium', label: 'Api sederhana' },
  { id: 'high', label: 'Api besar' }
];

const KUIH_SIZES = [
  { id: '8x8', label: '8 × 8', portions: '± 25–36 potong' },
  { id: '9x9', label: '9 × 9', portions: '± 36–49 potong' },
  { id: '10x10', label: '10 × 10', portions: '± 50–64 potong' }
];

const createGameSteps = (recipe) => {
  if (Array.isArray(recipe.steps)) return recipe.steps;

  const steps = [
    {
      title: recipe.prepTitle,
      instruction: recipe.prepInstruction,
      target: recipe.prepTarget || 'bowl',
      targetLabel: recipe.prepTargetLabel || 'Mangkuk adunan',
      items: recipe.prepItems,
      action: recipe.prepMode || 'blend',
      actionLabel: recipe.prepAction
    },
    {
      title: recipe.baseTitle,
      instruction: recipe.baseInstruction,
      target: recipe.baseTarget || 'bowl',
      targetLabel: recipe.baseTargetLabel || 'Mangkuk adunan',
      items: recipe.baseItems,
      action: recipe.baseMode || 'stir',
      actionLabel: recipe.baseAction || 'Gaul adunan'
    }
  ];

  if (recipe.compactBase) {
    steps.push({
      title: 'Padatkan tapak pulut',
      instruction: 'Tekan pulut separuh masak di dalam loyang hingga padat sebelum menambah lapisan pandan.',
      target: 'tray',
      targetLabel: 'Loyang pulut',
      items: [
        { id: 'pandan-pulut-base', name: 'Tapak pulut', emoji: '🍚' }
      ],
      action: 'press',
      actionLabel: 'Tekan dan padatkan'
    });
  }

  const layerStep = {
    title: recipe.layerTitle,
    instruction: recipe.layerInstruction,
    target: 'tray',
    targetLabel: 'Loyang kuih',
    items: recipe.layerItems,
    action: recipe.layerMode || 'pour',
    actionLabel: recipe.layerAction || 'Susun lapisan'
  };
  const steamStep = {
    title: 'Kukus hingga masak',
    instruction: 'Kukus dengan api sederhana kecil dan lap penutup kukusan berkala supaya permukaan kuih kekal licin.',
    target: 'steamer',
    targetLabel: 'Pengukus',
    items: [],
    action: 'heat',
    actionLabel: 'Panaskan dan kukus',
    heatLevel: 'medium-low'
  };
  const finishStep = {
    title: 'Sejukkan dan potong',
    instruction: 'Sejukkan kuih sepenuhnya pada suhu bilik (3–4 jam), kemudian gunakan pisau plastik atau pisau yang disapu minyak.',
    target: 'cake',
    targetLabel: 'Kuih talam',
    items: [
      { id: 'knife', name: 'Pisau plastik', emoji: '🔪' }
    ],
    action: 'cut',
    actionLabel: 'Potong kuih talam',
    needsCooling: true
  };

  return recipe.layerAfterSteam
    ? [...steps, steamStep, layerStep, finishStep]
    : [...steps, layerStep, steamStep, finishStep];
};

const Learn = () => {
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'game' | 'modules'

  // Game state
  const [customRecipes, setCustomRecipes] = useState([]);
  const [recipeLoadError, setRecipeLoadError] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [placedIngredients, setPlacedIngredients] = useState([]);
  const [selectedSize, setSelectedSize] = useState('8x8');
  const [isCooled, setIsCooled] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameFeedback, setGameFeedback] = useState('Pilih kuih kegemaran untuk mula bermain.');
  const [stirProgress, setStirProgress] = useState(0);
  const [isStirring, setIsStirring] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [stirToolPosition, setStirToolPosition] = useState(null);
  const [selectedHeat, setSelectedHeat] = useState('');
  const [heatProgress, setHeatProgress] = useState(0);
  const [isHeating, setIsHeating] = useState(false);
  const [cutProgress, setCutProgress] = useState(0);
  const gestureRef = useRef(null);
  const gestureDistanceRef = useRef(0);
  const gestureRotationRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const fetchCustomRecipes = async () => {
      const { data, error } = await supabase
        .from('game_recipes')
        .select('id, name, description, icon, layers, steps')
        .order('created_at', { ascending: true });

      if (!isMounted) return;
      if (error) {
        console.error('Unable to load custom kuih games:', error);
        setRecipeLoadError('Game tambahan belum dapat dimuatkan. Pastikan jadual game_recipes Supabase telah disediakan.');
        return;
      }

      setCustomRecipes((data || []).map((recipe) => ({
        ...recipe,
        emoji: recipe.icon || '🍰',
        layers: Array.isArray(recipe.layers) ? recipe.layers : ['green', 'white']
      })));
    };

    fetchCustomRecipes().catch((error) => {
      console.error('Unable to load custom kuih games:', error);
      if (isMounted) setRecipeLoadError('Game tambahan tidak dapat dimuatkan buat masa ini.');
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHeating) return undefined;

    const timer = window.setInterval(() => {
      setHeatProgress((progress) => Math.min(100, progress + 4));
    }, 120);

    return () => window.clearInterval(timer);
  }, [isHeating]);

  useEffect(() => {
    if (!isPressing) return undefined;

    const timer = window.setInterval(() => {
      setPressProgress((progress) => Math.min(100, progress + 5));
    }, 100);

    return () => window.clearInterval(timer);
  }, [isPressing]);

  useEffect(() => {
    if (pressProgress === 100) {
      setIsPressing(false);
      setGameFeedback('Bagus! Tapak kuih dah padat. ⭐');
    }
  }, [pressProgress]);

  useEffect(() => {
    if (heatProgress === 100) {
      setIsHeating(false);
      setGameFeedback('Hore, kuih dah masak! Jom sambung. ✨');
    }
  }, [heatProgress]);

  const availableRecipes = [...GAME_RECIPES, ...customRecipes];
  const selectedRecipe = availableRecipes.find((recipe) => recipe.id === selectedRecipeId);
  const gameSteps = selectedRecipe ? createGameSteps(selectedRecipe) : [];
  const currentStep = gameSteps[currentStepIndex];
  const areCurrentStepItemsPlaced = currentStep
    ? currentStep.items.every((item) => placedIngredients.includes(item.id))
    : false;
  const isMixingStep = currentStep && (currentStep.action === 'stir' || currentStep.action === 'blend');
  const showUnmixedIngredients = Boolean(
    currentStep &&
    currentStep.target === 'bowl' &&
    placedIngredients.length > 0 &&
    isMixingStep &&
    stirProgress === 0
  );
  const hasBatter = Boolean(
    currentStep &&
    currentStep.target === 'bowl' &&
    placedIngredients.length > 0 &&
    (!isMixingStep || stirProgress > 0)
  );
  const batterPalette = ['pandan', 'cendol'].includes(selectedRecipe?.id)
    ? { light: '#dcebb4', mid: '#9fbd68', dark: '#688b42', highlight: '#f5f9dc' }
    : selectedRecipe?.id === 'suji'
      ? { light: '#f6e3a2', mid: '#d5ad50', dark: '#a77c31', highlight: '#fff3c7' }
      : { light: '#f2e7c7', mid: '#d7c18d', dark: '#ad9058', highlight: '#fff9e8' };

  const resetStepActions = () => {
    setStirProgress(0);
    setIsStirring(false);
    setStirToolPosition(null);
    setPressProgress(0);
    setIsPressing(false);
    setSelectedHeat('');
    setHeatProgress(0);
    setIsHeating(false);
    setCutProgress(0);
    gestureRef.current = null;
    gestureDistanceRef.current = 0;
    gestureRotationRef.current = 0;
  };

  const handleSelectRecipe = (recipeId) => {
    setSelectedRecipeId(recipeId);
    setCurrentStepIndex(0);
    setPlacedIngredients([]);
    setSelectedSize('8x8');
    setIsCooled(false);
    setGameOver(false);
    setIsProcessing(false);
    resetStepActions();
    setGameFeedback('Jom masak! Tekan atau seret bahan ke dalam mangkuk.');
  };

  const handleIngredientDrop = (ingredientId) => {
    if (!currentStep || !currentStep.items.some((item) => item.id === ingredientId)) return;
    if (placedIngredients.includes(ingredientId)) return;

    const ingredient = currentStep.items.find((item) => item.id === ingredientId);
    const allItemsPlaced = currentStep.items.every((item) =>
      item.id === ingredientId || placedIngredients.includes(item.id)
    );
    setPlacedIngredients((items) => [...items, ingredientId]);
    const readyMessage = currentStep.action === 'stir'
      ? 'Semua bahan dah masuk! Jom kacau dengan senduk.'
      : currentStep.action === 'blend'
        ? 'Semua bahan dah masuk! Jom kisar sampai sebati.'
        : 'Semua bahan dah masuk! Teruskan ke langkah seterusnya.';
    setGameFeedback(allItemsPlaced
      ? readyMessage
      : `${ingredient.name} dah masuk. Masukkan bahan seterusnya!`);
  };

  const handleGestureStart = (event) => {
    if (!currentStep || isProcessing || !areCurrentStepItemsPlaced) return;
    if (!['stir', 'blend', 'press', 'cut'].includes(currentStep.action)) return;
    if ((currentStep.needsCooling || currentStep.action === 'cool') && !isCooled) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const targetBounds = event.currentTarget.getBoundingClientRect();
    gestureRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      centerX: targetBounds.left + targetBounds.width / 2,
      centerY: targetBounds.top + targetBounds.height * (currentStep.target === 'bowl' ? 0.25 : 0.5),
      radiusX: targetBounds.width * (currentStep.target === 'bowl' ? 143 / 420 : 0.35),
      radiusY: targetBounds.height * (currentStep.target === 'bowl' ? 27 / 230 : 0.35)
    };
    if (currentStep.action === 'stir' || currentStep.action === 'blend') setIsStirring(true);
    if (currentStep.action === 'stir') {
      setStirToolPosition({
        x: (event.clientX - targetBounds.left) / targetBounds.width * 420,
        y: (event.clientY - targetBounds.top) / targetBounds.height * 230,
        angle: -35
      });
    }
    if (currentStep.action === 'press') setIsPressing(true);
  };

  const handleGestureMove = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - gesture.x;
    const deltaY = event.clientY - gesture.y;
    if (currentStep.action === 'stir') {
      const targetBounds = event.currentTarget.getBoundingClientRect();
      setStirToolPosition({
        x: (event.clientX - targetBounds.left) / targetBounds.width * 420,
        y: (event.clientY - targetBounds.top) / targetBounds.height * 230,
        angle: Math.atan2(deltaY, deltaX) * 180 / Math.PI
      });
    }
    if (currentStep.action === 'stir' || currentStep.action === 'blend') {
      const previousX = (gesture.x - gesture.centerX) / gesture.radiusX;
      const previousY = (gesture.y - gesture.centerY) / gesture.radiusY;
      const currentX = (event.clientX - gesture.centerX) / gesture.radiusX;
      const currentY = (event.clientY - gesture.centerY) / gesture.radiusY;
      const previousRadius = Math.hypot(previousX, previousY);
      const currentRadius = Math.hypot(currentX, currentY);
      if (previousRadius > 0.35 && currentRadius > 0.35) {
        const previousAngle = Math.atan2(previousY, previousX);
        const currentAngle = Math.atan2(currentY, currentX);
        let rotation = currentAngle - previousAngle;
        if (rotation > Math.PI) rotation -= Math.PI * 2;
        if (rotation < -Math.PI) rotation += Math.PI * 2;
        gestureRotationRef.current += rotation;
        const progress = Math.min(100, Math.round(Math.abs(gestureRotationRef.current) / (Math.PI * 2) * 100));
        setStirProgress(progress);
        if (progress === 100) {
          setGameFeedback(currentStep.action === 'blend'
            ? 'Hore! Bahan dah dikisar halus. ⭐'
            : 'Wah, adunan dah sebati! ⭐');
        }
      }
    } else if (currentStep.action === 'cut' && Math.abs(deltaX) > Math.abs(deltaY)) {
      gestureDistanceRef.current += Math.abs(deltaX);
      const progress = Math.min(100, Math.round(gestureDistanceRef.current / 420 * 100));
      setCutProgress(progress);
      if (progress === 100)       setGameFeedback('Wah, potongan kuih kemas! ⭐');
    }

    gestureRef.current = { ...gesture, x: event.clientX, y: event.clientY };
  };

  const handleGestureEnd = (event) => {
    if (gestureRef.current?.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    setIsStirring(false);
    setIsPressing(false);
  };

  const handleStartHeating = () => {
    if (!areCurrentStepItemsPlaced) {
      setGameFeedback('Masukkan bahan dulu, chef kecil!');
      return;
    }

    const targetHeat = currentStep.heatLevel || 'medium-low';
    if (selectedHeat !== targetHeat) {
      const heatLabel = HEAT_LEVELS.find((level) => level.id === targetHeat)?.label || 'tahap api yang betul';
      setGameFeedback(`Cuba pilih ${heatLabel.toLowerCase()} supaya kuih masak sekata.`);
      return;
    }
    setIsHeating(true);
    const heatLabel = HEAT_LEVELS.find((level) => level.id === targetHeat)?.label || 'api yang dipilih';
    setGameFeedback(`Bagus! Kekalkan ${heatLabel.toLowerCase()} sehingga kuih masak.`);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleIngredientDrop(event.dataTransfer.getData('text/plain'));
  };

  const handleNextStep = () => {
    if (!currentStep || isProcessing) return;
    if (!areCurrentStepItemsPlaced) return;
    if ((currentStep.action === 'stir' || currentStep.action === 'blend') && stirProgress < 100) return;
    if (currentStep.action === 'press' && pressProgress < 100) return;
    if (currentStep.action === 'heat' && heatProgress < 100) return;
    if (currentStep.action === 'cut' && cutProgress < 100) return;
    if ((currentStep.needsCooling || currentStep.action === 'cool') && !isCooled) return;

    setIsProcessing(true);
    setGameFeedback('Sedang menyediakan kuih…');
    window.setTimeout(() => {
      if (currentStepIndex + 1 < gameSteps.length) {
        setCurrentStepIndex((step) => step + 1);
        setPlacedIngredients([]);
        setIsCooled(false);
        resetStepActions();
        setGameFeedback('Hebat! Langkah ini dah siap. Jom teruskan! ✨');
      } else {
        setGameOver(true);
        setIsProcessing(false);
        return;
      }
      setIsProcessing(false);
    }, 650);
  };

  const handleRestartGame = () => {
    setSelectedRecipeId(null);
    setCurrentStepIndex(0);
    setPlacedIngredients([]);
    setSelectedSize('8x8');
    setIsCooled(false);
    setGameOver(false);
    setIsProcessing(false);
    resetStepActions();
    setGameFeedback('Pilih kuih kegemaran untuk mula bermain.');
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
                  <h2>{selectedRecipe ? `Jom Buat ${selectedRecipe.name}!` : 'Pilih Kuih Talam'}</h2>
                </div>
                {selectedRecipe && (
                  <button className="change-recipe-btn" type="button" onClick={handleRestartGame} disabled={isProcessing}>
                    Pilih kuih lain
                  </button>
                )}
              </div>

              {!selectedRecipe ? (
                <div className="recipe-select">
                  <p className="recipe-select-intro">Pilih kuih, masukkan bahan, kemudian gaul, kukus dan siapkan kuih satu langkah demi satu langkah!</p>
                  {recipeLoadError && <p className="recipe-load-error" role="status">{recipeLoadError}</p>}
                  <div className="recipe-grid">
                    {availableRecipes.map((recipe) => (
                      <button
                        key={recipe.id}
                        className="recipe-card"
                        type="button"
                        onClick={() => handleSelectRecipe(recipe.id)}
                      >
                        <span className="recipe-icon" aria-hidden="true">{recipe.emoji}</span>
                        <span className="recipe-layers" aria-label="Warna lapisan kuih">
                          {recipe.layers.map((layer, index) => (
                            <span key={`${recipe.id}-${index}`} className={`layer-swatch swatch-${layer}`} />
                          ))}
                        </span>
                        <strong>{recipe.name}</strong>
                        <span className="recipe-description">{recipe.description}</span>
                        <span className="recipe-step-count">
                          {createGameSteps(recipe).length} langkah
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="recipe-note">Bahan dan penerangan permainan diadaptasi daripada maklumat di laman ini. Sukatan penuh tidak dipaparkan.</p>
                </div>
              ) : !gameOver ? (
                <div className="game-body">
                  <div className="game-progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${((currentStepIndex + 1) / gameSteps.length) * 100}%` }}
                    />
                  </div>
                  <div className="game-step-meta">
                    <span className="step-count">Langkah {currentStepIndex + 1} daripada {gameSteps.length}</span>
                    <span className="game-recipe-tag">{selectedRecipe.name}</span>
                    <span className="game-stars">{'⭐'.repeat(Math.min(currentStepIndex, 5))} {currentStepIndex} bintang</span>
                  </div>
                  <h3 className="game-title">{currentStep.title}</h3>
                  <p className="game-prompt">{currentStep.instruction}</p>

                  <div className={`cooking-scene scene-${currentStep.target} ${isProcessing ? 'processing' : ''}`}>
                    <div
                      className={`cooking-target target-${currentStep.target} ${hasBatter ? 'has-batter' : ''} ${['stir', 'blend', 'press', 'cut'].includes(currentStep.action) && areCurrentStepItemsPlaced ? 'gesture-ready' : ''} ${isStirring ? 'stirring' : ''} ${isPressing ? 'pressing' : ''}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={handleDrop}
                      onPointerDown={handleGestureStart}
                      onPointerMove={handleGestureMove}
                      onPointerUp={handleGestureEnd}
                      onPointerCancel={handleGestureEnd}
                      role="region"
                      aria-label={currentStep.action === 'stir'
                        ? 'Gerakkan tetikus atau jari secara berpusing untuk mengaul adunan'
                        : currentStep.action === 'blend'
                          ? 'Gerakkan tetikus atau jari secara berpusing untuk mengisar bahan'
                          : currentStep.action === 'press'
                            ? 'Tekan dan tahan pada loyang untuk memadatkan kuih'
                            : currentStep.action === 'cut'
                              ? 'Seret pisau melintasi kuih untuk memotong'
                              : `Letak bahan di ${currentStep.targetLabel}`}
                    >
                      {currentStep.target === 'bowl' ? (
                        <svg
                          className={`bowl-vessel ${hasBatter ? 'has-batter' : ''}`}
                          viewBox="0 0 420 230"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient id="bowl-body" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#f3f5e9" />
                              <stop offset="18%" stopColor="#dce4d0" />
                              <stop offset="40%" stopColor="#8fae73" />
                              <stop offset="72%" stopColor="#5d8248" />
                              <stop offset="100%" stopColor="#3e6338" />
                            </linearGradient>
                            <linearGradient id="bowl-rim" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#fffef8" />
                              <stop offset="35%" stopColor="#dce7d1" />
                              <stop offset="68%" stopColor="#769859" />
                              <stop offset="100%" stopColor="#365a34" />
                            </linearGradient>
                            <linearGradient id="batter-surface" x1="0" y1="0" x2="0.8" y2="1">
                              <stop offset="0%" stopColor={batterPalette.light} />
                              <stop offset="58%" stopColor={batterPalette.mid} />
                              <stop offset="100%" stopColor={batterPalette.dark} />
                            </linearGradient>
                            <radialGradient id="bowl-gloss" cx="30%" cy="20%" r="80%">
                              <stop offset="0%" stopColor="#fff" stopOpacity=".72" />
                              <stop offset="45%" stopColor="#fff" stopOpacity=".12" />
                              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                            </radialGradient>
                            <clipPath id="batter-clip">
                              <ellipse cx="210" cy="61" rx="143" ry="27" />
                            </clipPath>
                          </defs>

                          <ellipse cx="210" cy="210" rx="153" ry="12" fill="#243d24" opacity=".22" />
                          <path
                            d="M45 58 C49 112 69 168 111 188 C153 208 267 208 309 188 C351 168 371 112 375 58 Z"
                            fill="url(#bowl-body)"
                            stroke="#f8f8ed"
                            strokeWidth="5"
                          />
                          <path
                            d="M76 85 C78 127 92 163 119 177"
                            fill="none"
                            stroke="url(#bowl-gloss)"
                            strokeWidth="16"
                            strokeLinecap="round"
                            opacity=".8"
                          />
                          <path
                            d="M344 86 C341 130 325 163 300 177"
                            fill="none"
                            stroke="#29482e"
                            strokeWidth="10"
                            strokeLinecap="round"
                            opacity=".18"
                          />
                          <ellipse cx="210" cy="58" rx="168" ry="45" fill="url(#bowl-rim)" stroke="#fffef8" strokeWidth="5" />
                          <ellipse cx="210" cy="59" rx="151" ry="34" fill="#557a45" stroke="#dbe5cd" strokeWidth="3" />
                          <ellipse cx="210" cy="57" rx="144" ry="28" fill="#708e4e" opacity={hasBatter ? 0 : 1} />

                          {showUnmixedIngredients && (
                            <g className="unmixed-ingredients">
                              <ellipse cx="210" cy="61" rx="112" ry="19" fill="#e9e2ce" />
                              <ellipse cx="169" cy="57" rx="46" ry="10" fill="#fbf8ec" />
                              <ellipse cx="248" cy="64" rx="39" ry="9" fill="#f3eddd" />
                              <circle cx="127" cy="61" r="2" fill="#d0be96" />
                              <circle cx="278" cy="56" r="2.5" fill="#d0be96" />
                              <circle cx="223" cy="69" r="1.8" fill="#d0be96" />
                            </g>
                          )}

                          {hasBatter && (
                            <>
                              <ellipse cx="210" cy="60" rx="143" ry="27" fill="url(#batter-surface)" stroke={batterPalette.highlight} strokeWidth="2" />
                              <g
                                className={`batter-ripples ${isStirring && currentStep.action === 'stir' ? 'active' : ''}`}
                                clipPath="url(#batter-clip)"
                                fill="none"
                                stroke={batterPalette.highlight}
                                strokeLinecap="round"
                              >
                                <path d="M72 59 C115 32 148 79 188 54 S264 35 345 61" strokeWidth="4" strokeDasharray="18 13" opacity=".76" />
                                <path d="M86 68 C129 45 158 85 207 64 S282 48 330 69" strokeWidth="2" strokeDasharray="11 10" opacity=".52" />
                                <path d="M116 46 C153 68 174 38 216 50 S275 72 311 47" strokeWidth="2" strokeDasharray="12 11" opacity=".38" />
                              </g>
                              <ellipse cx="166" cy="50" rx="18" ry="4" fill="#fff" opacity=".23" />
                              <ellipse cx="285" cy="68" rx="12" ry="3" fill="#fff" opacity=".2" />
                            </>
                          )}

                          {currentStep.action === 'stir' && areCurrentStepItemsPlaced && (
                            <g
                              transform={`translate(${stirToolPosition?.x ?? 210} ${stirToolPosition?.y ?? 59}) rotate(${stirToolPosition?.angle ?? -35})`}
                            >
                              <g className={`spoon-motion ${isStirring ? 'active' : ''}`}>
                                <ellipse cx="1" cy="3" rx="13" ry="8" fill="#263323" opacity=".25" />
                                <ellipse cx="0" cy="0" rx="12" ry="7" fill="#d2a65c" stroke="#76572e" strokeWidth="2" />
                                <ellipse cx="-2" cy="-1" rx="7" ry="3.5" fill="#f3d996" opacity=".86" />
                                <path d="M10 0 L99 0" fill="none" stroke="#76572e" strokeWidth="8" strokeLinecap="round" />
                                <path d="M14 -2 L95 -2" fill="none" stroke="#eed28d" strokeWidth="2" strokeLinecap="round" />
                                <path d="M70 -2 L93 -2" fill="none" stroke="#fff1bc" strokeWidth="1" strokeLinecap="round" />
                              </g>
                            </g>
                          )}
                        </svg>
                      ) : (
                        <span className="target-emoji" aria-hidden="true">
                          {currentStep.target === 'tray' ? '🍱' : currentStep.target === 'steamer' ? '♨️' : '🍰'}
                        </span>
                      )}
                      {currentStep.target !== 'bowl' && (
                        <div className="target-contents" aria-live="polite">
                        {placedIngredients.map((id) => {
                          const item = currentStep.items.find((ingredient) => ingredient.id === id);
                          return item && <span key={id} title={item.name}>{item.emoji}</span>;
                        })}
                        </div>
                      )}
                      <span className="target-label">{currentStep.targetLabel}</span>
                    </div>
                    {isProcessing && <span className="scene-action" aria-live="polite">✨</span>}
                  </div>

                  {(currentStep.action === 'stir' || currentStep.action === 'blend') && (
                    <div className="action-control">
                      <p>
                        {currentStep.action === 'blend'
                          ? 'Gerakkan tetikus atau jari berpusing di atas pengisar untuk mengisar bahan.'
                          : 'Gerakkan tetikus atau jari berpusing di atas mangkuk untuk mengaul adunan.'}
                      </p>
                      <div className="action-progress" role="progressbar" aria-label={currentStep.action === 'blend' ? 'Kemajuan mengisar' : 'Kemajuan mengaul'} aria-valuenow={stirProgress} aria-valuemin="0" aria-valuemax="100">
                        <span style={{ width: `${stirProgress}%` }} />
                      </div>
                      <strong>{stirProgress}% {currentStep.action === 'blend' ? 'siap dikisar' : 'siap dikacau'}</strong>
                    </div>
                  )}

                  {currentStep.action === 'press' && (
                    <div className="action-control">
                      <p>Tekan dan tahan tetikus atau jari pada loyang sehingga tapak kuih padat.</p>
                      <div className="action-progress" role="progressbar" aria-label="Kemajuan memadatkan" aria-valuenow={pressProgress} aria-valuemin="0" aria-valuemax="100">
                        <span style={{ width: `${pressProgress}%` }} />
                      </div>
                      <strong>{pressProgress}% siap dipadatkan</strong>
                    </div>
                  )}

                  {currentStep.action === 'heat' && (
                    <div className="heat-control">
                      <p>Pilih tahap api untuk memanaskan kuih. Api sasaran: {HEAT_LEVELS.find((level) => level.id === (currentStep.heatLevel || 'medium-low'))?.label || 'Sederhana kecil'}.</p>
                      <div className="heat-options">
                        {HEAT_LEVELS.map((level) => (
                          <button
                            key={level.id}
                            className={selectedHeat === level.id ? 'selected' : ''}
                            type="button"
                            onClick={() => setSelectedHeat(level.id)}
                            disabled={isHeating || heatProgress === 100}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                      <button
                        className="heat-start-btn"
                        type="button"
                        onClick={handleStartHeating}
                        disabled={isHeating || heatProgress === 100 || !areCurrentStepItemsPlaced}
                      >
                        {isHeating ? 'Sedang memanaskan…' : '🔥 Mula panaskan'}
                      </button>
                      <div className="action-progress" role="progressbar" aria-label="Kemajuan memasak" aria-valuenow={heatProgress} aria-valuemin="0" aria-valuemax="100">
                        <span style={{ width: `${heatProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {currentStep.action === 'cut' && (
                    <div className="action-control">
                      <p>
                        {currentStep.needsCooling
                          ? 'Seret pisau kiri dan kanan di atas kuih untuk membuat potongan.'
                          : `Seret pisau kiri dan kanan di atas ${currentStep.targetLabel.toLowerCase()} untuk memotong bahan.`}
                      </p>
                      <div className="action-progress" role="progressbar" aria-label="Kemajuan memotong" aria-valuenow={cutProgress} aria-valuemin="0" aria-valuemax="100">
                        <span style={{ width: `${cutProgress}%` }} />
                      </div>
                      <strong>{cutProgress}% siap dipotong</strong>
                    </div>
                  )}

                  {(currentStep.needsCooling || currentStep.action === 'cool') && !isCooled && (
                    <button
                      className="cooling-btn"
                      type="button"
                      onClick={() => {
                        setIsCooled(true);
                        setGameFeedback(currentStep.action === 'cut'
                          ? 'Kuih sudah sejuk. Sekarang potong dengan pisau plastik.'
                          : 'Kuih sudah sejuk. Teruskan langkah seterusnya.');
                      }}
                    >
                      Kuih sudah sejuk sepenuhnya
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

                  <div className={`game-cheer ${isStirring ? 'encouraging' : ''}`}>
                    <span className="game-cheer-mascot" aria-hidden="true">🧑‍🍳</span>
                    <p className="game-feedback" aria-live="polite">{gameFeedback}</p>
                  </div>

                  <button
                    className="next-step-btn"
                    type="button"
                    onClick={handleNextStep}
                    disabled={isProcessing ||
                      !areCurrentStepItemsPlaced ||
                      ((currentStep.action === 'stir' || currentStep.action === 'blend') && stirProgress < 100) ||
                      (currentStep.action === 'press' && pressProgress < 100) ||
                      (currentStep.action === 'heat' && heatProgress < 100) ||
                      (currentStep.action === 'cut' && cutProgress < 100) ||
                      ((currentStep.needsCooling || currentStep.action === 'cool') && !isCooled)
                    }
                  >
                    {isProcessing ? 'Sedang diproses…' : `${currentStep.actionLabel || currentStep.title} ➜`}
                  </button>
                </div>
              ) : (
                <div className="game-result">
                  <div className={`finished-kuih size-${selectedSize}`} aria-hidden="true">
                    {selectedRecipe.layers.map((layer, index) => (
                      <span key={`${layer}-${index}`} className={`finished-layer layer-${layer}`} />
                    ))}
                  </div>
                  <h3>Wah, {selectedRecipe.name} dah siap! 🎉</h3>
                  <p className="result-msg">
                    Hebat, chef kecil! Anda berjaya siapkan semua langkah. Pilih saiz kuih untuk tempahan.
                  </p>

                  <div className="finished-size-select">
                    <h4>Pilih saiz kuih siap</h4>
                    <div className="size-options">
                      {KUIH_SIZES.map((size) => (
                        <button
                          key={size.id}
                          className={selectedSize === size.id ? 'selected' : ''}
                          type="button"
                          onClick={() => setSelectedSize(size.id)}
                          aria-pressed={selectedSize === size.id}
                        >
                          <strong>{size.label}</strong>
                          <span>{size.portions}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="game-result-actions">
                    <button className="restart-btn" type="button" onClick={handleRestartGame}>
                      Buat kuih lain
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
