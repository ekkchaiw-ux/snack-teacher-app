import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Play, 
  Users, 
  Database, 
  Camera, 
  Send, 
  CheckCircle, 
  XCircle, 
  Award, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Gamepad2, 
  RefreshCw, 
  LogOut,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';

// === CONSTANTS & INITIAL DATA ===
const INITIAL_SNACKS = [
  { id: "S001", name: "เลย์ รสออริจินัล", calories: 160, sugar: 1, fat: 10, sodium: 170, rating: "good", image: "🥔" },
  { id: "S002", name: "ป๊อกกี้ รสช็อกโกแลต", calories: 200, sugar: 12, fat: 8, sodium: 90, rating: "caution", image: "🍫" },
  { id: "S003", name: "เยลลี่หมีฮาริโบ", calories: 120, sugar: 18, fat: 0, sodium: 15, rating: "bad", image: "🧸" },
  { id: "S004", name: "นมจืดตราหมี", calories: 90, sugar: 4, fat: 5, sodium: 45, rating: "excellent", image: "🥛" },
  { id: "S005", name: "แอปเปิ้ลกรอบฟรีซดราย", calories: 60, sugar: 8, fat: 0, sodium: 0, rating: "excellent", image: "🍎" }
];

const MASCOTS = [
  { name: "น้องชีสซี่ (Cheesy Bear)", emoji: "🧸", color: "from-amber-400 to-yellow-500" },
  { name: "น้องเบอร์รี่ (Berry Bunny)", emoji: "🐰", color: "from-pink-400 to-rose-500" },
  { name: "น้องกรีนนี่ (Greeny Dino)", emoji: "🦖", color: "from-emerald-400 to-green-600" },
  { name: "น้องช็อกโก้ (Choco Kitty)", emoji: "🐱", color: "from-orange-400 to-amber-600" },
  { name: "น้องดัคกี้ (Ducky Hero)", emoji: "🦆", color: "from-yellow-300 to-amber-500" }
];

export default function App() {
  // === SYSTEM STATE ===
  const [userRole, setUserRole] = useState(null); // 'teacher' | 'student' | null
  const [teacherTab, setTeacherTab] = useState('database'); // 'database' | 'room'
  const [isSoundOn, setIsSoundOn] = useState(true);

  // === DATA STATE ===
  const [snacks, setSnacks] = useState(() => {
    const local = localStorage.getItem('snack_hunter_snacks');
    return local ? JSON.parse(local) : INITIAL_SNACKS;
  });

  const [activeRoom, setActiveRoom] = useState(() => {
    const local = localStorage.getItem('snack_hunter_room');
    return local ? JSON.parse(local) : null;
  });

  // === NEW SNACK FORM STATE ===
  const [newSnackId, setNewSnackId] = useState('');
  const [newSnackName, setNewSnackName] = useState('');
  const [newSnackCal, setNewSnackCal] = useState('');
  const [newSnackSugar, setNewSnackSugar] = useState('');
  const [newSnackFat, setNewSnackFat] = useState('');
  const [newSnackSodium, setNewSnackSodium] = useState('');
  const [newSnackRating, setNewSnackRating] = useState('good');
  const [newSnackImage, setNewSnackImage] = useState('🍿');

  // === STUDENT STATE ===
  const [studentName, setStudentName] = useState('');
  const [selectedMascot, setSelectedMascot] = useState(MASCOTS[0]);
  const [currentStudentId, setCurrentStudentId] = useState('');
  const [studentJoined, setStudentJoined] = useState(false);
  const [studentScannedList, setStudentScannedList] = useState([]);
  
  // QR & SCANNER STATE
  const [qrInput, setQrInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { status: 'success'|'failed', data?: Snack, message: string }
  const [showScanAnimation, setShowScanAnimation] = useState(false);
  const [isSubmittingScan, setIsSubmittingScan] = useState(false);

  // Audio elements ref for procedural synth
  const audioContextRef = useRef(null);
  const victoryIntervalRef = useRef(null);

  // Sync Snacks to LocalStorage
  useEffect(() => {
    localStorage.setItem('snack_hunter_snacks', JSON.stringify(snacks));
  }, [snacks]);

  // Sync Active Room to LocalStorage
  useEffect(() => {
    localStorage.setItem('snack_hunter_room', JSON.stringify(activeRoom));
  }, [activeRoom]);

  // Audio Synthesizer Loop for Victory
  useEffect(() => {
    if (activeRoom && activeRoom.status === 'ended' && isSoundOn) {
      // Start Retro Victory Sound loop
      startVictorySoundLoop();
    } else {
      stopVictorySoundLoop();
    }
    return () => stopVictorySoundLoop();
  }, [activeRoom, isSoundOn]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playSynthNote = (freq, duration, type = 'sine') => {
    try {
      initAudio();
      if (!audioContextRef.current || audioContextRef.current.state === 'suspended') return;
      
      const osc = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
      
      gainNode.gain.setValueAtTime(0.15, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      osc.start();
      osc.stop(audioContextRef.current.currentTime + duration);
    } catch (e) {
      console.log("Web Audio not supported or blocked");
    }
  };

  // Play Sound Effects
  const playSoundEffect = (type) => {
    if (!isSoundOn) return;
    try {
      if (type === 'success') {
        playSynthNote(523.25, 0.1, 'square'); // C5
        setTimeout(() => playSynthNote(659.25, 0.1, 'square'), 100); // E5
        setTimeout(() => playSynthNote(783.99, 0.3, 'square'), 200); // G5
      } else if (type === 'fail') {
        playSynthNote(330, 0.15, 'sawtooth'); // E4
        setTimeout(() => playSynthNote(220, 0.3, 'sawtooth'), 150); // A3
      } else if (type === 'click') {
        playSynthNote(600, 0.05, 'sine');
      }
    } catch (e) {}
  };

  const startVictorySoundLoop = () => {
    stopVictorySoundLoop();
    initAudio();
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; // C Major scale
    let index = 0;
    
    victoryIntervalRef.current = setInterval(() => {
      // Create a nice cheerful arpeggio/melody
      const melody = [0, 2, 4, 7, 4, 7, 9, 7];
      const freq = notes[melody[index % melody.length]];
      playSynthNote(freq, 0.25, 'triangle');
      index++;
    }, 280);
  };

  const stopVictorySoundLoop = () => {
    if (victoryIntervalRef.current) {
      clearInterval(victoryIntervalRef.current);
      victoryIntervalRef.current = null;
    }
  };

  // === ROOM FUNCTIONS ===
  const handleCreateRoom = () => {
    playSoundEffect('click');
    const newRoom = {
      roomId: Math.floor(100000 + Math.random() * 900000).toString(),
      status: 'waiting', // 'waiting' | 'playing' | 'ended'
      players: []
    };
    setActiveRoom(newRoom);
    // Auto switch to room screen
    setTeacherTab('room');
  };

  const handleStartGame = () => {
    if (!activeRoom) return;
    playSoundEffect('success');
    setActiveRoom({
      ...activeRoom,
      status: 'playing'
    });
  };

  const handleEndGame = () => {
    if (!activeRoom) return;
    playSoundEffect('success');
    // Sort players and prepare ranks
    const finalPlayers = [...activeRoom.players].sort((a, b) => b.score - a.score);
    setActiveRoom({
      ...activeRoom,
      status: 'ended',
      players: finalPlayers
    });
  };

  const handleRestartGame = () => {
    playSoundEffect('click');
    stopVictorySoundLoop();
    setActiveRoom(null);
    setStudentJoined(false);
    setStudentScannedList([]);
  };

  const handleAddSnack = (e) => {
    e.preventDefault();
    if (!newSnackId || !newSnackName) return;
    
    const isExist = snacks.some(s => s.id === newSnackId);
    if (isExist) {
      alert("รหัสขนมนี้มีอยู่ในระบบแล้ว!");
      return;
    }

    const item = {
      id: newSnackId,
      name: newSnackName,
      calories: Number(newSnackCal) || 0,
      sugar: Number(newSnackSugar) || 0,
      fat: Number(newSnackFat) || 0,
      sodium: Number(newSnackSodium) || 0,
      rating: newSnackRating,
      image: newSnackImage
    };

    setSnacks([...snacks, item]);
    playSoundEffect('success');
    
    // Reset Form
    setNewSnackId('');
    setNewSnackName('');
    setNewSnackCal('');
    setNewSnackSugar('');
    setNewSnackFat('');
    setNewSnackSodium('');
    setNewSnackImage('🍿');
  };

  const handleDeleteSnack = (id) => {
    playSoundEffect('click');
    setSnacks(snacks.filter(s => s.id !== id));
  };

  // === STUDENT FUNCTIONS ===
  const handleStudentJoin = (e) => {
    e.preventDefault();
    if (!studentName.trim() || !activeRoom) return;

    // Check if game is in waiting state
    if (activeRoom.status !== 'waiting') {
      alert("เกมกำลังแข่งขันอยู่ หรือจบลงแล้ว ไม่สามารถเข้าร่วมได้!");
      return;
    }

    const newStudentId = 'STU-' + Math.floor(1000 + Math.random() * 9000);
    const newPlayer = {
      id: newStudentId,
      name: studentName,
      mascot: selectedMascot,
      score: 0,
      scannedCount: 0
    };

    // Add to Local Memory of Room
    const updatedPlayers = [...(activeRoom.players || []), newPlayer];
    setActiveRoom({
      ...activeRoom,
      players: updatedPlayers
    });

    setCurrentStudentId(newStudentId);
    setStudentJoined(true);
    playSoundEffect('success');
  };

  // Simulated Camera QR Trigger
  const handleSimulateCameraScan = (scannedCode) => {
    setQrInput(scannedCode);
    setIsCameraActive(false);
    playSoundEffect('click');
  };

  // Send Scan to verify with Database
  const handleVerifyAndSubmitQr = () => {
    if (!qrInput.trim()) return;

    setIsSubmittingScan(true);
    setShowScanAnimation(true);
    setScanResult(null);

    // Simulate database lookup latency
    setTimeout(() => {
      const foundSnack = snacks.find(s => s.id.toLowerCase() === qrInput.trim().toLowerCase());

      if (foundSnack) {
        // SUCCESS CASE
        playSoundEffect('success');
        setScanResult({
          status: 'success',
          data: foundSnack,
          message: `ว้าว! เจอคุณประโยชน์จาก "${foundSnack.name}" แล้ว!`
        });

        // If duplicate in current student list, calculate score differently
        const isDuplicate = studentScannedList.some(item => item.id === foundSnack.id);
        const scoreGain = calculateScore(foundSnack);

        // Update student history list (Only show scanned snacks by this student!)
        if (!isDuplicate) {
          setStudentScannedList(prev => [foundSnack, ...prev]);
        }

        // Update Score inside the room state
        if (activeRoom) {
          const updatedPlayers = activeRoom.players.map(player => {
            if (player.id === currentStudentId) {
              return {
                ...player,
                score: player.score + (isDuplicate ? Math.floor(scoreGain / 2) : scoreGain),
                scannedCount: player.scannedCount + 1
              };
            }
            return player;
          });
          setActiveRoom({
            ...activeRoom,
            players: updatedPlayers
          });
        }

      } else {
        // FAILED CASE
        playSoundEffect('fail');
        setScanResult({
          status: 'failed',
          message: `ไม่พบรหัสสินค้า "${qrInput}" ในฐานข้อมูลขนมเลย!`
        });
      }
      setIsSubmittingScan(false);
    }, 1200);
  };

  const calculateScore = (snack) => {
    switch (snack.rating) {
      case 'excellent': return 100;
      case 'good': return 80;
      case 'caution': return 50;
      case 'bad': return 10;
      default: return 50;
    }
  };

  const getRatingBadge = (rating) => {
    switch (rating) {
      case 'excellent': return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">ยอดเยี่ยม 🌟</span>;
      case 'good': return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-bold">มีประโยชน์ 👍</span>;
      case 'caution': return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">ควรระวัง ⚠️</span>;
      case 'bad': return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-bold font-bold">หลีกเลี่ยง 🚫</span>;
      default: return null;
    }
  };

  // Determine if Teacher view navigation is disabled
  // LOCKED when room is waiting or playing!
  const isTeacherNavLocked = activeRoom && (activeRoom.status === 'waiting' || activeRoom.status === 'playing');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans transition-all selection:bg-amber-500 selection:text-white">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-30 bg-slate-800/90 backdrop-blur-md border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => !isTeacherNavLocked && setUserRole(null)}>
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25">
            <Gamepad2 className="w-6 h-6 text-slate-900 font-black" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 tracking-wide">
              SNACK HUNTER
            </h1>
            <p className="text-xs text-slate-400">เกมล่าขนมจอมพลัง พลังงานอัจฉริยะ v3.1</p>
          </div>
        </div>

        {/* Global Sound controller and Reset */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSoundOn(!isSoundOn)} 
            className={`p-2 rounded-lg transition-colors ${isSoundOn ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700 text-slate-400'}`}
            title="เปิด/ปิดเสียง"
          >
            {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {userRole && !isTeacherNavLocked && (
            <button 
              onClick={() => { playSoundEffect('click'); setUserRole(null); }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg text-xs font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกระบบ</span>
            </button>
          )}
        </div>
      </header>

      {/* PORTAL SELECTOR */}
      {!userRole && (
        <main className="max-w-4xl mx-auto px-4 py-12 md:py-24">
          <div className="text-center mb-12">
            <span className="bg-amber-400/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              🎮 แหล่งการเรียนรู้สุขศึกษาเชิงรุก
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-3 tracking-tight">
              สแกนหิ้ว พิทักษ์สุขภาพ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                ผจญภัยแฮปปี้คุณหนูช่างเลือก!
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              สแกนบาร์โค้ดหรือคิวอาร์โค้ดบนขนมขบเคี้ยวเพื่อเรียนรู้ปริมาณแคลอรี น้ำตาล และคุณประโยชน์อย่างสนุกสนานร่วมกันในห้องเรียน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* TEACHER ROLE */}
            <button 
              onClick={() => { playSoundEffect('click'); setUserRole('teacher'); setTeacherTab('database'); }}
              className="group relative bg-gradient-to-br from-slate-800 to-slate-800/80 hover:from-slate-700/80 hover:to-slate-800 border border-slate-700 hover:border-amber-500 rounded-3xl p-8 text-left transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/5 transform hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 bg-amber-500/10 group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors duration-300 p-3 rounded-2xl">
                <Users className="w-6 h-6 text-amber-400 group-hover:text-slate-900" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-100 group-hover:text-amber-400 transition-colors">
                ระบบจัดการสำหรับคุณครู
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                สร้างห้องเรียนแข่งขัน, จัดการคลังบาร์โค้ดขนม, ประมวลผลคะแนน, และประกาศเกียรติคุณมาสคอตเด็กดีหน้าเสาธง
              </p>
              <div className="mt-6 inline-flex items-center space-x-2 text-xs font-bold text-amber-400 group-hover:underline">
                <span>เข้าสู่ระบบควบคุม</span>
                <span>→</span>
              </div>
            </button>

            {/* STUDENT ROLE */}
            <button 
              onClick={() => { playSoundEffect('click'); setUserRole('student'); }}
              className="group relative bg-gradient-to-br from-slate-800 to-slate-800/80 hover:from-slate-700/80 hover:to-slate-800 border border-slate-700 hover:border-emerald-500 rounded-3xl p-8 text-left transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/5 transform hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-colors duration-300 p-3 rounded-2xl">
                <Gamepad2 className="w-6 h-6 text-emerald-400 group-hover:text-slate-900" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-100 group-hover:text-emerald-400 transition-colors">
                เข้าร่วมเล่นเกม (นักเรียน)
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                ลงชื่อเลือกมาสคอตคู่ใจ ส่องกล้องสแกนซองขนม คอยตอบคำถามเพื่อสะสมแต้มพิทักษ์โลกกับเพื่อนๆ
              </p>
              <div className="mt-6 inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 group-hover:underline">
                <span>เข้าสู่หน้าต่างสแกนเนอร์</span>
                <span>→</span>
              </div>
            </button>
          </div>
        </main>
      )}

      {/* TEACHER PORTAL */}
      {userRole === 'teacher' && (
        <main className="max-w-6xl mx-auto px-4 py-8">
          
          {/* HEADER PORTAL */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-amber-400 font-bold tracking-wider uppercase bg-amber-400/10 px-2 py-1 rounded">
                Portal คุณครู
              </span>
              <h2 className="text-2xl font-black mt-2">ศูนย์รวมชุดคำสั่งและจัดการคลังวิเศษ</h2>
              <p className="text-xs text-slate-400 mt-1">
                {isTeacherNavLocked 
                  ? "🔒 ระบบกำลังล็อกเพื่อคุมสอบเกม ห้ามปิดหน้าต่างหรือสลับหน้านะคร้าบ!"
                  : "คุณครูสามารถจัดการปรับแต่งคลังสารอาหารขนม หรือเปิดห้องเล่นเกมให้กับเด็กๆ ได้ที่นี่"
                }
              </p>
            </div>
            
            {/* TEACHER NAVIGATION */}
            <div className="flex space-x-2">
              <button
                disabled={isTeacherNavLocked}
                onClick={() => { playSoundEffect('click'); setTeacherTab('database'); }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  teacherTab === 'database' 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20' 
                    : isTeacherNavLocked 
                      ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>จัดการคลังขนม</span>
              </button>

              <button
                disabled={isTeacherNavLocked && activeRoom?.status === 'ended'}
                onClick={() => { playSoundEffect('click'); setTeacherTab('room'); }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  teacherTab === 'room' 
                    ? 'bg-orange-500 text-slate-950 font-black shadow-lg shadow-orange-500/20' 
                    : isTeacherNavLocked && activeRoom?.status === 'ended'
                      ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>ห้องเรียน & บอร์ดคะแนน</span>
              </button>
            </div>
          </div>

          {/* LOCKDOWN WARNING COMPONENT */}
          {isTeacherNavLocked && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl p-3.5 mb-6 flex items-center space-x-3 text-sm animate-pulse">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
              <div>
                <span className="font-extrabold">🚨 ล็อกการสลับเมนูเพื่อป้องการความล่าช้า:</span> คุณครูไม่สามารถเปลี่ยนหน้า แอดข้อมูล หรือออกจากระบบได้จนกว่าจะกดจบเกมที่หน้ารายงาน
              </div>
            </div>
          )}

          {/* TAB 1: SNACK DATABASE */}
          {teacherTab === 'database' && !isTeacherNavLocked && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ADD SNACK FORM */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 h-fit">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2 text-amber-400">
                  <Plus className="w-5 h-5" />
                  <span>เพิ่มรายการขนมใหม่</span>
                </h3>
                
                <form onSubmit={handleAddSnack} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">รหัสคิวอาร์โค้ด / บาร์โค้ด</label>
                    <input 
                      type="text" 
                      required
                      placeholder="เช่น S006, 885..." 
                      value={newSnackId}
                      onChange={(e) => setNewSnackId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">ชื่อของขนม</label>
                    <input 
                      type="text" 
                      required
                      placeholder="เช่น ขนมปังกรอบ, ลูกอมเลมอน" 
                      value={newSnackName}
                      onChange={(e) => setNewSnackName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">แคลอรี (Kcal)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={newSnackCal}
                        onChange={(e) => setNewSnackCal(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">น้ำตาล (กรัม)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={newSnackSugar}
                        onChange={(e) => setNewSnackSugar(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">ไขมัน (กรัม)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={newSnackFat}
                        onChange={(e) => setNewSnackFat(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">โซเดียม (มก.)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={newSnackSodium}
                        onChange={(e) => setNewSnackSodium(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">เกรดโภชนาการ</label>
                      <select 
                        value={newSnackRating}
                        onChange={(e) => setNewSnackRating(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-slate-100"
                      >
                        <option value="excellent">ยอดเยี่ยม 🌟</option>
                        <option value="good">มีประโยชน์ 👍</option>
                        <option value="caution">ควรระวัง ⚠️</option>
                        <option value="bad">หลีกเลี่ยง 🚫</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">สัญลักษณ์ / Emoji</label>
                      <select 
                        value={newSnackImage}
                        onChange={(e) => setNewSnackImage(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-slate-100"
                      >
                        <option value="🍿">🍿 ป๊อปคอร์น</option>
                        <option value="🍫">🍫 ช็อกโกแลต</option>
                        <option value="🍬">🍬 ลูกอมลูกกวาด</option>
                        <option value="🍩">🍩 โดนัท</option>
                        <option value="🥛">🥛 นมกล่อง</option>
                        <option value="🍎">🍎 แอปเปิ้ล</option>
                        <option value="🍪">🍪 คุกกี้</option>
                        <option value="🥔">🥔 เลย์มันฝรั่ง</option>
                        <option value="🍦">🍦 ไอศกรีม</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-extrabold py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20 text-sm mt-2"
                  >
                    บันทึกลงคลังขนมคิวอาร์
                  </button>
                </form>
              </div>

              {/* LIST OF CURRENT DATABASE */}
              <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-200">คลังขนมที่มีในฐานข้อมูลทั้งหมด ({snacks.length} ชิ้น)</h3>
                  <p className="text-xs text-slate-400">ใช้สแกนเพื่อรับคะแนนความท้าทาย</p>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {snacks.map((snack) => (
                    <div 
                      key={snack.id} 
                      className="bg-slate-900 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between hover:border-slate-600 transition"
                    >
                      <div className="flex items-center space-x-3.5">
                        <span className="text-3xl p-1 bg-slate-800 rounded-lg">{snack.image}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-slate-100">{snack.name}</h4>
                            <span className="bg-slate-800 border border-slate-700 text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono">
                              QR: {snack.id}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-400 mt-1">
                            <span>🔥 {snack.calories} แคล</span>
                            <span>•</span>
                            <span>🍭 น้ำตาล {snack.sugar}ก.</span>
                            <span>•</span>
                            <span>🧈 ไขมัน {snack.fat}ก.</span>
                            <span>•</span>
                            <span>🧂 โซเดียม {snack.sodium}มก.</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {getRatingBadge(snack.rating)}
                        <button 
                          onClick={() => handleDeleteSnack(snack.id)}
                          className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-500 transition"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {snacks.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-sm">ไม่มีข้อมูลขนมในฐานข้อมูลเลย! กรุณาเพิ่มที่หน้าฟอร์มซ้ายมือครับ</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLAYING & MANAGEMENT ROOM */}
          {teacherTab === 'room' && (
            <div className="space-y-6">
              
              {/* CASE 1: NO ACTIVE ROOM */}
              {!activeRoom && (
                <div className="bg-slate-800 border border-slate-700 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-xl">
                  <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 text-slate-100">ยังไม่มีการสร้างห้องกิจกรรมใดๆ</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
                    สร้างห้องเกมกระดานสดของคุณครู เพื่อสุ่มห้อง QR Code รวดเร็ว และรองรับเด็กๆ ให้ร่วมล็อกชื่อเข้าร่วมการลุยโรงเรียนของหวานกันทันที!
                  </p>
                  
                  <button
                    onClick={handleCreateRoom}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-extrabold text-base px-8 py-3.5 rounded-2xl transition shadow-lg shadow-amber-500/20"
                  >
                    🚀 สร้างห้องแข่งขันใหม่
                  </button>
                </div>
              )}

              {/* CASE 2: WAITING ROOM FOR STUDENTS TO JOIN */}
              {activeRoom && activeRoom.status === 'waiting' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* ROOM DETAIL & PIN */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 text-center flex flex-col justify-between">
                    <div>
                      <span className="bg-amber-500/10 text-amber-400 font-bold text-xs px-3 py-1 rounded-full border border-amber-500/20">
                        กำลังรอผู้เล่นลงชื่อ...
                      </span>
                      <h3 className="text-lg font-bold text-slate-400 mt-4 uppercase">รหัส PIN เพื่อเข้าร่วม</h3>
                      <div className="text-6xl font-black text-amber-400 tracking-wider my-3 font-mono">
                        {activeRoom.roomId}
                      </div>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                        ให้นักเรียนเลือกเมนู "เข้าร่วมเล่นเกม (นักเรียน)" แล้วกรอกรหัส PIN นี้เพื่อลงทะเบียนมาสคอต
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800">
                      <div className="text-slate-300 text-sm mb-4">
                        เมื่อนักเรียนเข้ามาพร้อมแล้ว กดปุ่มเพื่อเริ่มออกตามล่าหาอาหารสุขสันต์!
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleStartGame}
                          disabled={activeRoom.players.length === 0}
                          className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition shadow-lg ${
                            activeRoom.players.length === 0
                              ? 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black shadow-emerald-500/15'
                          }`}
                        >
                          <Play className="w-4 h-4" />
                          <span>เริ่มเกมแข่งขัน</span>
                        </button>

                        <button
                          onClick={handleRestartGame}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition border border-slate-700"
                        >
                          ล้างห้องเล่นใหม่
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* JOINED STUDENTS */}
                  <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-200">
                        นักเรียนที่เข้าร่วมห้องแล้ว ({activeRoom.players.length} คน)
                      </h3>
                      <span className="bg-slate-900 border border-slate-700 text-amber-400 px-3 py-1 rounded-xl text-xs font-mono font-bold animate-pulse">
                        LIVE REFRESH
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
                      {activeRoom.players.map((p) => (
                        <div 
                          key={p.id} 
                          className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 text-center hover:border-amber-500/40 transition"
                        >
                          <div className={`w-12 h-12 bg-gradient-to-tr ${p.mascot.color} rounded-xl flex items-center justify-center text-3xl mx-auto mb-2`}>
                            {p.mascot.emoji}
                          </div>
                          <div className="font-bold text-slate-200 truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.id}</div>
                        </div>
                      ))}

                      {activeRoom.players.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-500">
                          <Users className="w-12 h-12 mx-auto mb-3 text-slate-600 animate-bounce" />
                          <p className="text-sm">กำลังคอยหนูๆ เข้าแถวมารายงานตัวนะครับ...</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* CASE 3: GAME IS IN PROGRESS */}
              {activeRoom && activeRoom.status === 'playing' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* PLAYING CONTROLLERS */}
                  <div className="bg-gradient-to-br from-orange-600 to-amber-600 text-slate-950 border border-orange-500 rounded-3xl p-8 text-center flex flex-col justify-between shadow-xl">
                    <div>
                      <span className="bg-slate-950 text-amber-400 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                        ⚡ การแข่งขันกำลังดำเนินอยู่ ⚡
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-6 uppercase">รหัสห้องเรียน</h3>
                      <div className="text-5xl font-black tracking-wider my-2 font-mono drop-shadow-sm">
                        {activeRoom.roomId}
                      </div>
                      <p className="text-xs text-slate-900/80 max-w-xs mx-auto leading-relaxed">
                        ขณะนี้หน้าจอมือถือของนักเรียนจะถูกล็อกไม่ให้กดย้อนกลับ นักเรียนสามารถเปิดกล้องสแกนซองขนมเพื่อส่งตรวจสอบได้ต่อเนื่อง!
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-950/20">
                      <div className="text-slate-950 text-xs font-bold mb-4">
                        คุณครูไม่สามารถออกจากหน้าต่างนี้ได้ เมื่อเก็บสถิติเรียบร้อย กรุณากดปุ่มด้านล่างเพื่อประกาศอันดับชัยชนะ!
                      </div>
                      
                      {/* CRITICAL LOCKDOWN COMPLIANCE: ONLY SHOW END GAME BUTTON */}
                      <button
                        onClick={handleEndGame}
                        className="w-full bg-slate-950 hover:bg-slate-900 text-amber-400 font-black py-4 rounded-2xl transition shadow-xl text-base flex items-center justify-center space-x-2 animate-bounce"
                      >
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <span>จบเกมและประมวลผลโพเดียม 🏆</span>
                      </button>
                    </div>
                  </div>

                  {/* REAL-TIME SCOREBOARD */}
                  <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-200">
                        ตารางกระดานจัดอันดับแบบสดๆ ({activeRoom.players.length} ผู้เข้าแข่ง)
                      </h3>
                      <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-1"></span>
                        <span>กำลังอัปเดตข้อมูล</span>
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                      {[...activeRoom.players].sort((a,b) => b.score - a.score).map((p, idx) => (
                        <div 
                          key={p.id} 
                          className="bg-slate-900 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between hover:border-slate-600 transition"
                        >
                          <div className="flex items-center space-x-3.5">
                            <span className="text-lg font-black text-amber-400 font-mono w-6">#{idx + 1}</span>
                            <div className={`w-10 h-10 bg-gradient-to-tr ${p.mascot.color} rounded-xl flex items-center justify-center text-2xl`}>
                              {p.mascot.emoji}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-100 flex items-center space-x-2">
                                <span>{p.name}</span>
                                <span className="bg-slate-800 text-[9px] text-slate-400 font-normal px-1.5 py-0.5 rounded font-mono">ID: {p.id}</span>
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                จำนวนสแกนทั้งสิ้น: <span className="text-amber-400 font-bold">{p.scannedCount} ครั้ง</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-black text-emerald-400 font-mono">{p.score}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">คะแนนรวม</div>
                          </div>
                        </div>
                      ))}

                      {activeRoom.players.length === 0 && (
                        <div className="text-center py-16 text-slate-500">
                          <Users className="w-12 h-12 mx-auto mb-3" />
                          <p className="text-sm">กำลังคอยผู้เข้าแข่งขันลงทะเบียน...</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* CASE 4: GAME ENDED & TOP 5 PODIUM EXHIBITION (WITH LOOPING FANFARE) */}
              {activeRoom && activeRoom.status === 'ended' && (
                <div className="bg-slate-850 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                  
                  {/* CONGRATS HEAD */}
                  <div className="text-center mb-10 relative">
                    <span className="bg-amber-400/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      🏆 พิธีปิดมหาศึกนักล่าของหวานแสนดี 🏆
                    </span>
                    <h3 className="text-4xl font-black mt-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400">
                      ทำเนียบคุณหนูสุดยอดนักสแกนพลังงานวิเศษ!
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
                      ดนตรีและแตรบีทแห่งชัยชนะกำลังหมุนวนเป็นลูปเฉลิมฉลองอย่างครื้นเครง 🎉 คุณครูสามารถมอบรางวัลชมเชยให้แก่เด็กๆ ทั้ง 5 อันดับได้เลยคร้าบ!
                    </p>

                    <div className="mt-4 inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-4 py-1.5 rounded-full text-xs animate-pulse">
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>แตรเฉลิมฉลองกำลังวนซ้ำ... กรุณาเปิดเสียงจากอุปกรณ์</span>
                    </div>
                  </div>

                  {/* CARTOON PODIUM TOP 1-5 (COMPACT BUT EXTREMELY FUN) */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10 pt-16">
                    {activeRoom.players.slice(0, 5).map((player, index) => {
                      // Order mapping for display heights to make the top 3 look like a real podium
                      // 1st (Center), 2nd (Left), 3rd (Right), 4th & 5th smaller
                      const colors = [
                        "border-yellow-400 shadow-yellow-500/10 bg-yellow-950/20 text-yellow-300", // 1st
                        "border-slate-300 shadow-slate-300/10 bg-slate-900/40 text-slate-200",  // 2nd
                        "border-amber-600 shadow-amber-600/10 bg-amber-950/20 text-amber-500",  // 3rd
                        "border-slate-700 bg-slate-900/60 text-slate-400",  // 4th
                        "border-slate-800 bg-slate-900/80 text-slate-500"   // 5th
                      ];

                      const mascotBounceClass = index === 0 
                        ? 'animate-bounce text-6xl' 
                        : index < 3 
                          ? 'animate-pulse text-5xl' 
                          : 'text-4xl';

                      return (
                        <div 
                          key={player.id} 
                          className={`relative border-2 rounded-2xl p-6 text-center shadow-lg transition transform hover:scale-105 ${colors[index]}`}
                        >
                          {/* Rank badge */}
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-slate-950 rounded-full border-2 border-inherit flex items-center justify-center font-black font-mono text-lg shadow-md">
                            {index === 0 && "🥇"}
                            {index === 1 && "🥈"}
                            {index === 2 && "🥉"}
                            {index > 2 && `${index + 1}`}
                          </div>

                          {/* Animated Mascot */}
                          <div className="my-4 h-16 flex items-center justify-center">
                            <span className={`${mascotBounceClass} select-none transform hover:rotate-12 transition duration-150`}>
                              {player.mascot.emoji}
                            </span>
                          </div>

                          <h4 className="font-black text-slate-100 truncate text-base mb-1">{player.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mb-3">{player.mascot.name}</p>

                          <div className="bg-slate-950/80 rounded-xl py-2 px-3 border border-slate-800">
                            <div className="text-2xl font-black font-mono">{player.score}</div>
                            <div className="text-[9px] uppercase tracking-wider font-bold">คะแนนรวม</div>
                          </div>
                        </div>
                      );
                    })}

                    {activeRoom.players.length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                        <p className="text-sm">ไม่มีสถิติคะแนนการแข่งขันที่จะบันทึกโพเดียมเลยครับ</p>
                      </div>
                    )}
                  </div>

                  {/* SCORE TABLE FOR REST OF PLAYERS OR SUMMARIZED RANKS */}
                  {activeRoom.players.length > 5 && (
                    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-8 max-h-[220px] overflow-y-auto">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">ผู้เข้าแข่งขันเพิ่มเติม</h4>
                      <div className="space-y-1.5">
                        {activeRoom.players.slice(5).map((player, idx) => (
                          <div key={player.id} className="flex items-center justify-between text-sm py-2 px-3 bg-slate-850 rounded-lg">
                            <span className="font-bold text-slate-400 font-mono">#{idx + 6} {player.name}</span>
                            <span className="font-mono text-emerald-400 font-bold">{player.score} คะแนน</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOTTOM RESTART CONTROLLERS */}
                  <div className="border-t border-slate-700/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400 text-center sm:text-left">
                      หากต้องการเริ่มการผจญภัยรอบใหม่สำหรับคาบเรียนถัดไป กดปุ่มรีเซ็ตด้านขวามือได้เลยครับ
                    </p>
                    <button
                      onClick={handleRestartGame}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-8 py-3 rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>เริ่มห้องการผจญภัยใหม่ 🚀</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </main>
      )}

      {/* STUDENT PORTAL */}
      {userRole === 'student' && (
        <main className="max-w-2xl mx-auto px-4 py-8">
          
          {/* STEP 1: LOGIN & MASCOT SELECTOR */}
          {!studentJoined && (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="text-center mb-6">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  🧸 ท่าเทียบลงจอดนักล่า
                </span>
                <h3 className="text-2xl font-black text-slate-100 mt-3">เข้าสู่ห้องล่าขนมจอมพลัง</h3>
                <p className="text-xs text-slate-400 mt-1">กรอกข้อมูลและเลือกมาสคอตคู่หูที่จะร่วมเดินทางเก็บแร่ธาตุกับคุณครู</p>
              </div>

              <form onSubmit={handleStudentJoin} className="space-y-6">
                
                {/* ROOM PIN VERIFICATION */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">รหัสพินห้องเรียน (คุณครูฉายขึ้นหน้าจอ)</label>
                  <input 
                    type="number"
                    required
                    placeholder="เช่น 123456"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center text-2xl font-black font-mono focus:outline-none focus:border-emerald-500 text-slate-100 tracking-widest"
                    onChange={(e) => {
                      const inputPin = e.target.value;
                      if (activeRoom && inputPin !== activeRoom.roomId) {
                        // Keep track but show state
                      }
                    }}
                  />
                  {activeRoom && (
                    <p className="text-[10px] text-slate-500 mt-1 text-center">
                      * ระบบตรวจพบห้องทดลองจริงที่สร้างไว้ขณะนี้: <span className="text-emerald-400 font-bold">{activeRoom.roomId}</span>
                    </p>
                  )}
                </div>

                {/* NAME FIELD */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">ชื่อเล่นของคุณหนูๆ</label>
                  <input 
                    type="text" 
                    required
                    maxLength={15}
                    placeholder="เช่น น้องนนท์, ปังปอนด์" 
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-base font-bold focus:outline-none focus:border-emerald-500 text-slate-100"
                  />
                </div>

                {/* MASCOT CHOOSER */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">เลือกมาสคอตนำโชคของคุณ</label>
                  <div className="grid grid-cols-5 gap-2">
                    {MASCOTS.map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => { playSoundEffect('click'); setSelectedMascot(m); }}
                        className={`p-3 rounded-2xl border-2 transition transform hover:scale-110 flex flex-col items-center justify-center ${
                          selectedMascot.name === m.name 
                            ? 'border-emerald-500 bg-emerald-500/10' 
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        <span className="text-3xl mb-1">{m.emoji}</span>
                        <span className="text-[8px] text-slate-400 truncate w-full text-center">{m.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-slate-950 font-black py-3.5 rounded-2xl transition shadow-lg shadow-emerald-500/20 text-base"
                >
                  🚀 เข้าสู่ยานอวกาศ สแกนล่าสมบัติ!
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: ACTIVE GAME INTERFACE FOR STUDENT */}
          {studentJoined && activeRoom && (
            <div className="space-y-6">
              
              {/* USER BRAND CARD */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-tr ${selectedMascot.color} rounded-xl flex items-center justify-center text-3xl animate-pulse`}>
                    {selectedMascot.emoji}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 flex items-center space-x-2">
                      <span>{studentName}</span>
                      <span className="bg-slate-900 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                        {currentStudentId}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">คู่หู: {selectedMascot.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  {/* Real-time score calculated on current room state */}
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    {activeRoom.players.find(p => p.id === currentStudentId)?.score || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">คะแนนสะสม</div>
                </div>
              </div>

              {/* LOCKDOWN NOTIFICATION IF GAME HAS NOT ENDED */}
              {activeRoom.status !== 'ended' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center text-xs text-amber-300">
                  🔒 <span className="font-bold">ระบบกำลังล็อกเอาต์และล็อกปุ่มย้อนกลับ:</span> ห้ามสลับหรือปิดหน้าต่างนะเด็กๆ รอเพื่อรอดูผลประเมินอันดับไปพร้อมๆ กับเพื่อนในห้องเรียนน้า!
                </div>
              )}

              {/* CONDITION A: WAITING GAME START */}
              {activeRoom.status === 'waiting' && (
                <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center shadow-xl">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin text-emerald-400">
                    <RefreshCw className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-200">รอคุณครูกดเริ่มเกมสักครู่นะครับ...</h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    เมื่อคุณครูเปิดระบบการสแกน ห้องแรลลี่โรงเรียนของหวานจะเริ่มขึ้นทันที เตรียมหยิบซองขนมที่พร้อมแล้วรอนะครับเด็กๆ!
                  </p>
                </div>
              )}

              {/* CONDITION B: PLAYING IN PROGRESS */}
              {activeRoom.status === 'playing' && (
                <div className="space-y-6">
                  
                  {/* SCANNING CONTROLLERS & MANUAL ENTRY */}
                  <div className="bg-slate-850 border border-slate-700 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    
                    <h4 className="text-lg font-black text-slate-200 mb-2 flex items-center space-x-2">
                      <Camera className="w-5 h-5 text-emerald-400" />
                      <span>สแกนคิวอาร์โค้ดจากซองขนม</span>
                    </h4>
                    <p className="text-xs text-slate-400 mb-6">
                      เปิดกล้องหลังมือถือส่องโค้ดบนซองขนม หรือกรอกตัวเลขคิวอาร์โค้ดสั้นๆ ตรวจสอบคุณประโยชน์เพื่อชิงคะแนน
                    </p>

                    {/* VIRTUAL QR CAMERA VIEWPORT */}
                    {isCameraActive ? (
                      <div className="bg-slate-950 border-2 border-emerald-500 rounded-2xl p-4 text-center relative overflow-hidden mb-6 h-64 flex flex-col justify-between items-center">
                        <div className="absolute inset-0 bg-slate-900/40 pointer-events-none">
                          <div className="w-48 h-48 border-2 border-dashed border-emerald-400 rounded-2xl mx-auto my-6 animate-pulse flex items-center justify-center">
                            <span className="text-[10px] text-emerald-400 tracking-wider">กำลังเปิดกล้องมือถือ...</span>
                          </div>
                        </div>

                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-bold z-10">
                          📷 กล้องมองหาแถบสแกน
                        </span>

                        <div className="z-10 bg-slate-900/90 border border-slate-700 p-3 rounded-xl max-w-sm w-full">
                          <p className="text-xs text-slate-300 mb-2">เลือกจำลองขนมที่ถืออยู่เพื่อทดสอบสแกน:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {snacks.map((snack) => (
                              <button
                                key={snack.id}
                                type="button"
                                onClick={() => handleSimulateCameraScan(snack.id)}
                                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-1 text-[11px] font-bold truncate text-slate-100 flex items-center justify-center space-x-1"
                              >
                                <span>{snack.image}</span>
                                <span className="truncate">{snack.name}</span>
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleSimulateCameraScan("FAKE-999")}
                              className="bg-red-950/40 hover:bg-red-900/40 border border-red-900/60 rounded-lg p-1 text-[11px] font-bold truncate text-red-300"
                            >
                              ❌ รหัสเสีย/นอกคลัง
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={() => { playSoundEffect('click'); setIsCameraActive(false); }}
                          className="z-10 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs px-4 py-1.5 rounded-lg transition border border-rose-500/20"
                        >
                          ปิดกล้องสแกน
                        </button>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <button
                          onClick={() => { playSoundEffect('click'); setIsCameraActive(true); }}
                          className="w-full bg-slate-900 hover:bg-slate-800 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl py-8 flex flex-col items-center justify-center transition group"
                        >
                          <Camera className="w-10 h-10 text-slate-500 group-hover:text-emerald-400 group-hover:scale-110 transition duration-300 mb-2" />
                          <span className="font-extrabold text-sm text-slate-300 group-hover:text-slate-100">คลิกที่นี่เพื่อเปิดกล้องหน้าจอมือถือ</span>
                          <span className="text-[10px] text-slate-500 mt-1">ใช้ความละเอียดกล้องหลังสแกนคิวอาร์ซองขนมทันที</span>
                        </button>
                      </div>
                    )}

                    {/* QR INPUT FIELD & SUBMIT ACTION (LOCKED - CAN DO NOTHING ELSE TILL SUBMIT) */}
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <input 
                          type="text"
                          placeholder="กรอกรหัสจากซองขนมด้วยมือ (เช่น S001)"
                          value={qrInput}
                          onChange={(e) => setQrInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm focus:outline-none text-slate-100 placeholder:text-slate-500 font-bold"
                        />
                      </div>

                      <button
                        onClick={handleVerifyAndSubmitQr}
                        disabled={!qrInput.trim() || isSubmittingScan}
                        className={`px-6 py-3 rounded-xl font-bold transition flex items-center space-x-2 ${
                          !qrInput.trim() || isSubmittingScan
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black shadow-lg shadow-emerald-500/10'
                        }`}
                      >
                        {isSubmittingScan ? (
                          <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>ส่งข้อมูลสแกน</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* DYNAMIC SCANNED RESULT POP-UP WITH RICH ANIMATION */}
                    {showScanAnimation && (
                      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-6 z-20 transition-all">
                        
                        <div className={`text-center max-w-sm w-full p-6 bg-slate-900 border rounded-3xl transform scale-100 transition shadow-2xl ${
                          isSubmittingScan 
                            ? 'border-slate-800 animate-pulse'
                            : scanResult?.status === 'success'
                              ? 'border-emerald-500 shadow-emerald-500/10 animate-bounce-short'
                              : 'border-rose-500 shadow-rose-500/10 animate-shake'
                        }`}>
                          
                          {/* 1. VERIFYING STATE */}
                          {isSubmittingScan && (
                            <div className="py-8">
                              <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                              <h5 className="font-extrabold text-base text-slate-200">ระบบตรวจสอบฐานข้อมูลอัจฉริยะ</h5>
                              <p className="text-xs text-slate-400 mt-1">กำลังค้นหาความจริงของคุณค่าอาหารขยะ...</p>
                            </div>
                          )}

                          {/* 2. SUCCESS STATE (FOUND FOOD!) */}
                          {!isSubmittingScan && scanResult?.status === 'success' && (
                            <div>
                              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle className="w-10 h-10" />
                              </div>
                              
                              <h5 className="font-black text-xl text-emerald-400">{scanResult.message}</h5>
                              
                              {/* Food detail card inside scanner animation */}
                              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 my-4 text-left">
                                <div className="flex items-center space-x-3">
                                  <span className="text-4xl p-1 bg-slate-900 rounded-lg">{scanResult.data.image}</span>
                                  <div>
                                    <h6 className="font-bold text-slate-100">{scanResult.data.name}</h6>
                                    <div className="mt-1">{getRatingBadge(scanResult.data.rating)}</div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-300">
                                  <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                                    <span className="block text-[10px] text-slate-500 uppercase">แคลอรี</span>
                                    <span className="font-bold text-slate-200">{scanResult.data.calories} Kcal</span>
                                  </div>
                                  <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                                    <span className="block text-[10px] text-slate-500 uppercase">ปริมาณน้ำตาล</span>
                                    <span className="font-bold text-slate-200">{scanResult.data.sugar} กรัม</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-xs text-emerald-300/80 font-bold mb-4">
                                🎉 ได้รับแต้มสะสมเรียบร้อย เพิ่มขึ้นในกระดานครูแล้ว!
                              </div>

                              <button
                                onClick={() => { playSoundEffect('click'); setShowScanAnimation(false); setQrInput(''); }}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2.5 rounded-xl transition"
                              >
                                ยอดเยี่ยม! ไปสแกนต่อกันเลย
                              </button>
                            </div>
                          )}

                          {/* 3. FAILED STATE (NOT FOUND IN DATABASE!) */}
                          {!isSubmittingScan && scanResult?.status === 'failed' && (
                            <div>
                              <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                <XCircle className="w-10 h-10" />
                              </div>
                              
                              <h5 className="font-black text-xl text-rose-400">อุ๊ย! ไม่พบข้อมูลของเล่น</h5>
                              <p className="text-xs text-slate-400 my-3 leading-relaxed">
                                {scanResult.message} ซองขนมชิ้นนี้อาจยังไม่ได้ถูกระบุไว้ในฐานข้อมูลคลังคุณครู ลองปรึกษาและแจ้งให้คุณครูแอดรหัสนี้ดูนะครับ
                              </p>

                              <button
                                onClick={() => { playSoundEffect('click'); setShowScanAnimation(false); }}
                                className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold py-2.5 rounded-xl transition"
                              >
                                ลองกรอกรหัสชิ้นอื่นดูนะ
                              </button>
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                  </div>

                  {/* NO CHEAT: ONLY DISPLAY SNACKS THE STUDENT ACTUALLY SCANNED & CONQUERED! */}
                  <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-base font-black text-slate-200">
                          คลังขนมที่หนูพิชิตได้ ({studentScannedList.length} รายการ)
                        </h4>
                        <p className="text-[10px] text-slate-500">จะแสดงเฉพาะขนมที่คุณหนูๆ สแกนสำเร็จด้วยตัวเองเท่านั้นครับ</p>
                      </div>
                      <span className="bg-slate-900 border border-slate-700 text-amber-400 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold">
                        MY HUNTS
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {studentScannedList.map((snack, idx) => (
                        <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{snack.image}</span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">{snack.name}</h5>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                                <span>🔥 {snack.calories} แคล</span>
                                <span>•</span>
                                <span>🍬 น้ำตาล {snack.sugar}ก.</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            {getRatingBadge(snack.rating)}
                          </div>
                        </div>
                      ))}

                      {studentScannedList.length === 0 && (
                        <div className="text-center py-10 text-slate-600">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                          <p className="text-xs">ยังไม่มีขนมที่สแกนสำเร็จเลย ลองกดสแกนซองขนมชิ้นแรกดูนะเด็กๆ!</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* CONDITION C: GAME ENDED SHOW CONGRATULATORY HERO FOR THIS SPECIFIC USER */}
              {activeRoom.status === 'ended' && (
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                  
                  {/* Visual confetti or energy shine background */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-emerald-500/5 pointer-events-none"></div>

                  <div className="relative z-10">
                    <span className="bg-emerald-400/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                      🏁 สรุปผลการผจญภัยในคาบเรียน 🏁
                    </span>
                    
                    {/* Mascot celebration */}
                    <div className="my-8">
                      <div className={`w-28 h-28 bg-gradient-to-tr ${selectedMascot.color} rounded-3xl flex items-center justify-center text-6xl mx-auto shadow-2xl shadow-emerald-500/10 animate-bounce`}>
                        {selectedMascot.emoji}
                      </div>
                      <h4 className="text-2xl font-black text-slate-100 mt-6">ยินดีด้วยนะคุณหนู {studentName}!</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        เพื่อนยากคู่เดินทางของคุณคือ {selectedMascot.name}
                      </p>
                    </div>

                    {/* Stats panel */}
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                      <div className="bg-slate-950/85 border border-slate-800 rounded-2xl p-4 text-center">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">ผลคะแนนรวมที่ได้</span>
                        <span className="text-3xl font-black text-emerald-400 font-mono">
                          {activeRoom.players.find(p => p.id === currentStudentId)?.score || 0}
                        </span>
                      </div>
                      <div className="bg-slate-950/85 border border-slate-800 rounded-2xl p-4 text-center">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">อันดับชั้นเรียน</span>
                        <span className="text-3xl font-black text-amber-400 font-mono">
                          #{[...activeRoom.players].sort((a,b)=>b.score-a.score).findIndex(p => p.id === currentStudentId) + 1}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      สุดยอดไปเลย! วันนี้เด็กๆ ทุกคนได้เรียนรู้วิธีการคัดกรองขนมที่ปลอดภัยต่อคุณค่าทางอาหารและร่างกาย ขอให้นำเอาความรู้ดีๆ ไปประยุกต์ใช้ในซูเปอร์มาร์เก็ตกันต่อนะคร้าบ! ✨
                    </p>
                  </div>

                </div>
              )}

            </div>
          )}

        </main>
      )}

      {/* FOOTER */}
      <footer className="mt-16 border-t border-slate-800 py-6 text-center text-xs text-slate-600 px-4">
        <p>© 2026 Snack Hunter Edu-Tech Thailand. ออกแบบเพื่อส่งเสริมพฤติกรรมการบริโภคที่ถูกต้องในสถานศึกษา</p>
      </footer>

    </div>
  );
}