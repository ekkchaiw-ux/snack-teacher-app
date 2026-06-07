import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, addDoc, getDocs, query, where } from 'firebase/firestore';
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
  AlertCircle,
  Video,
  Edit,
  Star,
  Shield,
  Crown,
  Lock
} from 'lucide-react';

// ======================================================================
// 1. FIREBASE CONFIGURATION
// ======================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBWdzYxIf1IsWjbQSrq5bodPOmZBENzNxw",
  authDomain: "test-snack-hunter.firebaseapp.com",
  projectId: "test-snack-hunter",
  storageBucket: "test-snack-hunter.firebasestorage.app",
  messagingSenderId: "427661696811",
  appId: "1:427661696811:web:310c612c47b5ae95422f6e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "test-snack-hunter";

// ======================================================================
// 2. CARTOON MASCOTS (INLINE VECTOR ANIMATION)
// ======================================================================
const MASCOTS = [
  {
    id: 'fox',
    name: 'น้องฟ็อกซี่ (นักสืบจอมฉลาด)',
    emoji: '🦊',
    color: 'from-orange-400 to-amber-500',
    description: 'จิ้งจอกน้อยแสนกล เก่งเรื่องแกะรหัสลับโภชนาการ!',
    svg: (state) => (
      <svg viewBox="0 0 100 100" className={`w-20 h-20 ${state === 'happy' ? 'animate-bounce' : 'animate-pulse'}`}>
        <circle cx="50" cy="50" r="45" fill="#FFEEDB" />
        <polygon points="25,15 15,40 38,32" fill="#E25822" />
        <polygon points="75,15 85,40 62,32" fill="#E25822" />
        <path d="M 15 45 C 15 70, 50 85, 50 85 C 50 85, 85 70, 85 45 C 85 30, 15 30, 15 45" fill="#E25822" />
        <path d="M 28 50 C 28 70, 50 80, 50 80 C 50 80, 72 70, 72 50 C 72 40, 28 40, 28 50" fill="#FFFFFF" />
        <circle cx="38" cy="48" r="5" fill="#1A1A1A" />
        <circle cx="62" cy="48" r="5" fill="#1A1A1A" />
        {state === 'happy' && <circle cx="41" cy="46" r="1.5" fill="#FFF" />}
        {state === 'happy' && <circle cx="65" cy="46" r="1.5" fill="#FFF" />}
        <polygon points="46,72 54,72 50,78" fill="#1A1A1A" />
        <circle cx="32" cy="56" r="4" fill="#FFB6C1" />
        <circle cx="68" cy="56" r="4" fill="#FFB6C1" />
        <path d="M 45 64 Q 50 69, 55 64" stroke="#1A1A1A" strokeWidth="2" fill="none" />
      </svg>
    )
  },
  {
    id: 'bear',
    name: 'พี่หมีบาร์นีย์ (สายเฮลตี้)',
    emoji: '🐻',
    color: 'from-amber-500 to-orange-600',
    description: 'หมีใหญ่ใจดี รักผักและผลไม้ เกลียดสารกันบูดที่สุด!',
    svg: (state) => (
      <svg viewBox="0 0 100 100" className={`w-20 h-20 ${state === 'happy' ? 'animate-bounce' : 'animate-pulse'}`}>
        <circle cx="50" cy="50" r="45" fill="#FDF5E6" />
        <circle cx="25" cy="25" r="14" fill="#8B4513" />
        <circle cx="75" cy="25" r="14" fill="#8B4513" />
        <circle cx="25" cy="25" r="8" fill="#CD853F" />
        <circle cx="75" cy="25" r="8" fill="#CD853F" />
        <circle cx="50" cy="55" r="32" fill="#8B4513" />
        <circle cx="38" cy="48" r="4" fill="#1A1A1A" />
        <circle cx="60" cy="48" r="4" fill="#1A1A1A" />
        <ellipse cx="50" cy="62" rx="14" ry="10" fill="#CD853F" />
        <ellipse cx="50" cy="58" rx="6" ry="4" fill="#1A1A1A" />
        <path d="M 44 64 Q 50 70, 56 64" stroke="#1A1A1A" strokeWidth="2.5" fill="none" />
      </svg>
    )
  },
  {
    id: 'cat',
    name: 'น้องคิตตี้ (ปั่นท้าแคล)',
    emoji: '🐱',
    color: 'from-pink-400 to-rose-500',
    description: 'เหมียวชมพูแสนซน คล่องแคล่วว่องไวพร้อมออกตามหาอาหารแสนปลอดภัย!',
    svg: (state) => (
      <svg viewBox="0 0 100 100" className={`w-20 h-20 ${state === 'happy' ? 'animate-bounce' : 'animate-pulse'}`}>
        <circle cx="50" cy="50" r="45" fill="#FFF0F5" />
        <polygon points="15,15 35,35 15,45" fill="#DB7093" />
        <polygon points="85,15 65,35 85,45" fill="#DB7093" />
        <circle cx="50" cy="55" r="30" fill="#FFC0CB" />
        <circle cx="38" cy="50" r="6" fill="#1A1A1A" />
        <circle cx="62" cy="50" r="6" fill="#1A1A1A" />
        <circle cx="40" cy="48" r="2" fill="#FFFFFF" />
        <circle cx="64" cy="48" r="2" fill="#FFFFFF" />
        <path d="M 45 64 Q 50 67, 55 64" stroke="#1A1A1A" strokeWidth="2" fill="none" />
      </svg>
    )
  }
];

// ======================================================================
// 3. CONFETTI BURST COMPONENT
// ======================================================================
const Confetti = () => {
  useEffect(() => {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];

    for (let i = 0; i < 200; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 30 + 15,
        dx: Math.random() * 2 - 1,
        dy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleInc: (Math.random() * 0.05) + 0.02,
        tiltAngle: 0
      });
    }

    let animationFrameId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(p.tiltAngle) + 1 + p.dy) / 2;
        p.x += Math.sin(p.tiltAngle) * 2;

        if (p.y > canvas.height + p.h) {
          p.x = Math.random() * canvas.width;
          p.y = -50; 
          p.tiltAngle = 0;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.tiltAngle);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 4);
        ctx.fill();
        ctx.restore();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas id="confetti-canvas" className="absolute inset-0 pointer-events-none z-0 w-full h-full"></canvas>;
};

// ======================================================================
// MAIN APPLICATION COMPONENT
// ======================================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // 'teacher' | 'student' | null
  const [teacherTab, setTeacherTab] = useState('database'); // 'database' | 'room'
  const [isSoundOn, setIsSoundOn] = useState(true);

  // === DATA STATES ===
  const [snacks, setSnacks] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [players, setPlayers] = useState([]);

  // === FORMS & INPUTS ===
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    type: 'snack', // snack | drink | bakery
    calories: '',
    sugar: '',
    sodium: '',
    fat: '',
    vdoUrl: ''
  });

  const [teacherName, setTeacherName] = useState('');
  const [timeLimit, setTimeLimit] = useState(0);

  // === STUDENT STATES ===
  const [enteredPin, setEnteredPin] = useState('');
  const [studentName, setStudentName] = useState('');
  const [selectedMascot, setSelectedMascot] = useState(MASCOTS[0]);
  const [currentStudentId, setCurrentStudentId] = useState('');
  const [studentJoined, setStudentJoined] = useState(false);
  const [studentScannedList, setStudentScannedList] = useState([]);

  // === DISCOVERY & RESULT POPUP ===
  const [qrInput, setQrInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showScanAnimation, setShowScanAnimation] = useState(false);
  const [isSubmittingScan, setIsSubmittingScan] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { status: 'success' | 'failed', data?: Snack, message: string }

  // === AUDIO CONTROL SYNTH REF ===
  const audioContextRef = useRef(null);
  const victoryIntervalRef = useRef(null);

  // Initialize Web Anonymous Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth initialization failed:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen for global snacks from Firestore
  useEffect(() => {
    if (!user) return;
    const snacksRef = collection(db, 'artifacts', appId, 'public', 'data', 'snacks');
    const unsub = onSnapshot(snacksRef, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setSnacks(list);
    });
    return () => unsub();
  }, [user]);

  // Real-time synchronization for active room
  useEffect(() => {
    if (!enteredPin) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', enteredPin);
    const unsub = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActiveRoom({ id: enteredPin, ...data });
        
        // Handle student page transition automatically based on server room status
        if (userRole === 'student') {
          if (data.status === 'ended') {
            stopVictorySoundLoop();
            startVictorySoundLoop();
          }
        }
      } else {
        if (studentJoined) {
          alert('ห้องเรียนนี้ไม่พบในระบบ หรือถูกยุบไปแล้วครับ');
          handleResetStudentState();
        }
      }
    });
    return () => unsub();
  }, [enteredPin, userRole, studentJoined]);

  // Real-time score reader for the room
  useEffect(() => {
    if (!activeRoom?.id) return;
    const playersRef = collection(db, 'artifacts', appId, 'public', 'data', 'players');
    const unsub = onSnapshot(playersRef, (snapshot) => {
      const allPlayers = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.roomId === activeRoom.id) {
          allPlayers.push({ id: doc.id, ...data });
        }
      });
      allPlayers.sort((a, b) => b.score - a.score);
      setPlayers(allPlayers);
    });
    return () => unsub();
  }, [activeRoom?.id]);

  // Sound Synth controllers
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
    } catch (e) {}
  };

  const playSoundEffect = (type) => {
    if (!isSoundOn) return;
    try {
      if (type === 'success') {
        playSynthNote(523.25, 0.1, 'square'); 
        setTimeout(() => playSynthNote(659.25, 0.1, 'square'), 100); 
        setTimeout(() => playSynthNote(783.99, 0.3, 'square'), 200); 
      } else if (type === 'fail') {
        playSynthNote(330, 0.15, 'sawtooth'); 
        setTimeout(() => playSynthNote(220, 0.3, 'sawtooth'), 150); 
      } else if (type === 'click') {
        playSynthNote(600, 0.05, 'sine');
      }
    } catch (e) {}
  };

  const startVictorySoundLoop = () => {
    stopVictorySoundLoop();
    initAudio();
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; 
    let index = 0;
    
    victoryIntervalRef.current = setInterval(() => {
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

  // === CRUDS SYSTEM ===
  const handleSubmitSnack = async (e) => {
    e.preventDefault();
    if (!formData.barcode || !formData.name) return alert('กรุณากรอกรหัสและชื่อขนมครับ');

    const totalBadStats = Number(formData.sugar || 0) + Number(formData.sodium || 0)/10 + Number(formData.fat || 0);
    let rating = 'good';
    if (totalBadStats < 15) rating = 'excellent';
    else if (totalBadStats < 30) rating = 'good';
    else if (totalBadStats < 60) rating = 'caution';
    else rating = 'bad';

    const itemData = {
      barcode: formData.barcode,
      name: formData.name,
      type: formData.type,
      vdoUrl: formData.vdoUrl,
      nutrition: {
        calories: Number(formData.calories || 0),
        sugar: Number(formData.sugar || 0),
        sodium: Number(formData.sodium || 0),
        fat: Number(formData.fat || 0)
      },
      rating: rating,
      image: formData.type === 'drink' ? '🥛' : formData.type === 'bakery' ? '🍩' : '🍿'
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'snacks', editingId), itemData);
        setEditingId(null);
      } else {
        const snacksRef = collection(db, 'artifacts', appId, 'public', 'data', 'snacks');
        await addDoc(snacksRef, itemData);
      }
      playSoundEffect('success');
      setFormData({ barcode: '', name: '', type: 'snack', calories: '', sugar: '', sodium: '', fat: '', vdoUrl: '' });
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการบันทึกฐานข้อมูล');
    }
  };

  const handleEditSnack = (snack) => {
    setFormData({
      barcode: snack.barcode || '',
      name: snack.name || '',
      type: snack.type || 'snack',
      calories: snack.nutrition?.calories || '',
      sugar: snack.nutrition?.sugar || '',
      sodium: snack.nutrition?.sodium || '',
      fat: snack.nutrition?.fat || '',
      vdoUrl: snack.vdoUrl || ''
    });
    setEditingId(snack.id);
    playSoundEffect('click');
  };

  const handleDeleteSnack = async (id) => {
    if (window.confirm('คุณต้องการลบข้อมูลขนมชิ้นนี้ใช่หรือไม่?')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'snacks', id));
        playSoundEffect('click');
      } catch (e) {}
    }
  };

  // === ROOM CONTROLS ===
  const handleCreateRoom = async () => {
    if (!teacherName.trim()) return alert('กรุณาระบุชื่อของคุณครูผู้ควบคุมครับ!');
    
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', newPin);
    const roomData = {
      teacherName: teacherName.trim(),
      status: 'waiting',
      createdAt: new Date().toISOString(),
      pin: newPin,
      duration: timeLimit
    };

    try {
      await setDoc(roomRef, roomData);
      setEnteredPin(newPin);
      setActiveRoom({ id: newPin, ...roomData });
      setTeacherTab('room');
      playSoundEffect('success');
    } catch (e) {
      alert('เกิดปัญหาในการสร้างห้องเรียน');
    }
  };

  const handleStartGame = async () => {
    if (!activeRoom?.id) return;
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', activeRoom.id);
      await updateDoc(roomRef, { 
        status: 'playing',
        startedAt: Date.now()
      });
      playSoundEffect('success');
    } catch (e) {}
  };

  const handleEndGame = async () => {
    if (!activeRoom?.id) return;
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', activeRoom.id);
      await updateDoc(roomRef, { status: 'ended' });
      playSoundEffect('success');
      startVictorySoundLoop();
    } catch (e) {}
  };

  const handleRestartRoom = async () => {
    stopVictorySoundLoop();
    setActiveRoom(null);
    setEnteredPin('');
    setTeacherTab('database');
    setPlayers([]);
    playSoundEffect('click');
  };

  const handleResetStudentState = () => {
    setStudentJoined(false);
    setStudentName('');
    setEnteredPin('');
    setStudentScannedList([]);
    stopVictorySoundLoop();
  };

  // === STUDENT ENGINE ===
  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!enteredPin.trim() || !studentName.trim()) return alert('กรุณากรอกข้อมูลให้ครบถ้วนด้วยจ้า!');

    try {
      const roomSnap = await getDocs(query(collection(db, 'artifacts', appId, 'public', 'data', 'rooms'), where("pin", "==", enteredPin.trim())));
      if (roomSnap.empty) {
        return alert('ไม่พบรหัสห้องเรียนนี้ในระบบ คอนเฟิร์มกับคุณครูอีกครั้งนะคร้าบ');
      }

      const roomData = roomSnap.docs[0].data();
      if (roomData.status !== 'waiting') {
        return alert('ห้องเรียนนี้ไม่ได้อยู่ในสถานะเปิดรับสมัคร (อาจจะเริ่มหรือจบลงไปแล้วครับ)');
      }

      const playerDocId = `${enteredPin.trim()}_${studentName.trim()}`;
      const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', playerDocId);
      
      const newPlayer = {
        roomId: enteredPin.trim(),
        name: studentName.trim(),
        avatar: selectedMascot.emoji,
        mascotId: selectedMascot.id,
        score: 0,
        scannedBarcodes: [],
        joinedAt: new Date().toISOString()
      };

      await setDoc(playerRef, newPlayer);
      setCurrentStudentId(playerDocId);
      setStudentJoined(true);
      playSoundEffect('success');
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเข้าร่วมห้องเรียน');
    }
  };

  const handleSimulateCameraScan = (scannedCode) => {
    setQrInput(scannedCode);
    setIsCameraActive(false);
    playSoundEffect('click');
  };

  const handleVerifyBarcodeAndSubmit = async () => {
    if (!qrInput.trim() || !activeRoom?.id) return;

    setIsSubmittingScan(true);
    setShowScanAnimation(true);
    setScanResult(null);

    setTimeout(async () => {
      const matched = snacks.find(s => s.barcode.toLowerCase() === qrInput.trim().toLowerCase());

      if (matched) {
        playSoundEffect('success');
        setScanResult({
          status: 'success',
          data: matched,
          message: `ตรวจพบพลังวิเศษใน "${matched.name}"!`
        });

        const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', currentStudentId);
        const alreadyScanned = studentScannedList.map(s => s.barcode);
        const isDuplicate = alreadyScanned.includes(matched.barcode);
        
        let scoreGain = 50;
        if (matched.rating === 'excellent') scoreGain = 100;
        else if (matched.rating === 'good') scoreGain = 80;
        else if (matched.rating === 'caution') scoreGain = 30;
        else if (matched.rating === 'bad') scoreGain = 10;

        if (!isDuplicate) {
          const updatedList = [matched, ...studentScannedList];
          setStudentScannedList(updatedList);
          
          const currentScore = players.find(p => p.id === currentStudentId)?.score || 0;
          await updateDoc(playerRef, {
            score: currentScore + scoreGain,
            scannedBarcodes: updatedList.map(s => s.barcode)
          });
        }
      } else {
        playSoundEffect('fail');
        setScanResult({
          status: 'failed',
          message: `ไม่พบคุณค่าในรหัส "${qrInput}" เลยครับ!`
        });
      }
      setIsSubmittingScan(false);
    }, 1200);
  };

  const getHealthBadge = (rating) => {
    switch (rating) {
      case 'excellent': return <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-black shadow-sm">🟢 ปลอดภัย ยอดเยี่ยม! 🌟</span>;
      case 'good': return <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-black shadow-sm">🟢 มีประโยชน์ ทานได้ 👍</span>;
      case 'caution': return <span className="bg-yellow-500 text-slate-900 text-xs px-3 py-1 rounded-full font-black shadow-sm">🟡 ควรระวัง อย่ายกซดเยอะนะ ⚠️</span>;
      case 'bad': return <span className="bg-rose-500 text-white text-xs px-3 py-1 rounded-full font-black shadow-sm">🔴 หลีกเลี่ยง พลังงานล้นแล้วจ้า! 🚫</span>;
      default: return null;
    }
  };

  // Determine lockdowns
  const isTeacherLocked = activeRoom && (activeRoom.status === 'waiting' || activeRoom.status === 'playing');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-500 to-orange-600 font-sans text-white">
        <Sparkles className="w-16 h-16 animate-spin text-yellow-300 mb-4" />
        <h2 className="text-2xl font-black tracking-wide">กำลังติดต่อไปที่ฐานยานแม่... 🚀</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100/40 text-slate-800 font-sans flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-30 bg-orange-500 text-white border-b-4 border-orange-600 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => !isTeacherLocked && setUserRole(null)}>
          <div className="p-2 bg-yellow-400 rounded-2xl shadow-md border-2 border-white transform hover:rotate-6 transition duration-150">
            <Gamepad2 className="w-6 h-6 text-orange-600 font-black" />
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tight text-yellow-300 drop-shadow-md">
              SNACK HUNTER
            </h1>
            <p className="text-[10px] text-orange-100 font-bold uppercase tracking-wider">ระบบการศึกษาแบบบูรณาการ 2026</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSoundOn(!isSoundOn)} 
            className={`p-2 rounded-xl transition transform hover:scale-105 border-2 ${isSoundOn ? 'bg-yellow-400 text-orange-600 border-white' : 'bg-orange-600 text-orange-300 border-orange-700'}`}
          >
            {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {userRole && !isTeacherLocked && (
            <button 
              onClick={() => { playSoundEffect('click'); setUserRole(null); }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 border-2 border-rose-600 text-white rounded-xl text-xs font-black shadow-md transition transform hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกระบบ</span>
            </button>
          )}
        </div>
      </header>

      {/* PORTAL SELECTOR */}
      {!userRole && (
        <main className="max-w-4xl mx-auto px-4 py-12 md:py-24 flex-1 flex flex-col justify-center">
          <div className="text-center mb-12">
            <span className="bg-orange-100 text-orange-600 border-2 border-orange-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
              ✨ มิติการเรียนรู้วิเศษระดับชั้นเรียน ✨
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-6 mb-4 tracking-tight leading-tight text-orange-600">
              วิเคราะห์พลังอาหารจานยักษ์ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-600 drop-shadow-sm">
                ผจญภัยแสนวิเศษในอาณาจักรโภชนาการ!
              </span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base font-medium">
              ส่องสมาร์ทโฟนวิเคราะห์บาร์โค้ด เรียนรู้ปริมาณน้ำตาล โซเดียม ไขมัน และประลองคะแนนสนุกๆ ไปพร้อมกันครับ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
            <button 
              onClick={() => { playSoundEffect('click'); setUserRole('teacher'); setTeacherTab('database'); }}
              className="group bg-white hover:bg-orange-50 border-4 border-orange-400 rounded-3xl p-8 text-left transition duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-400/25 transform hover:-translate-y-1"
            >
              <div className="bg-orange-100 p-3.5 rounded-2xl w-fit mb-4">
                <Users className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-2xl font-black mb-2 text-orange-600 group-hover:text-orange-700">
                ระบบจัดการสำหรับคุณครู
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-semibold">
                จัดการสร้างห้องเรียน ลุยประเมินอันดับสแกนบาร์โค้ด ตรวจสอบข้อมูลขนมขยะ และสรุปโพเดียมคะแนนสด
              </p>
            </button>

            <button 
              onClick={() => { playSoundEffect('click'); setUserRole('student'); }}
              className="group bg-white hover:bg-amber-50 border-4 border-amber-400 rounded-3xl p-8 text-left transition duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-400/25 transform hover:-translate-y-1"
            >
              <div className="bg-amber-100 p-3.5 rounded-2xl w-fit mb-4">
                <Gamepad2 className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black mb-2 text-amber-600 group-hover:text-amber-700">
                เข้าร่วมเล่นเกม (นักเรียน)
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-semibold">
                พิมพ์รหัสพินห้องเรียนที่ครูกำหนด เลือกสแกนเนอร์สแกนซองขนมเพื่อชิงประเมินและสะสมค่า EXP
              </p>
            </button>
          </div>
        </main>
      )}

      {/* TEACHER PORTAL */}
      {userRole === 'teacher' && (
        <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
          
          {/* HEADER CONTROL BAR */}
          <div className="bg-white border-4 border-orange-400 rounded-3xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
            <div>
              <span className="text-xs text-orange-600 font-black tracking-wider uppercase bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                Teacher Control Panel
              </span>
              <h2 className="text-2xl font-black mt-2 text-slate-800">ฐานควบคุมวิเศษของคุณครู</h2>
              <p className="text-xs text-gray-500 font-bold mt-1">
                {isTeacherLocked 
                  ? "🔒 ระบบกำลังประลองเกมอยู่ เพื่อความต่อเนื่องระบบได้ทำการล็อกเอาท์พอร์ทัลชั่วคราวจนกว่าจะกดจบเกม"
                  : "คุณครูสามารถเข้าไปแอด/ลบ/แก้ไข คลังบาร์โค้ดขนม หรือเปิดตารางคะแนนสดได้ที่นี่"
                }
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                disabled={isTeacherLocked}
                onClick={() => { playSoundEffect('click'); setTeacherTab('database'); }}
                className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-black transition-all border-2 ${
                  teacherTab === 'database' 
                    ? 'bg-orange-500 text-white border-orange-600 shadow-md' 
                    : isTeacherLocked 
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white hover:bg-orange-50 text-orange-600 border-orange-400'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>คลังวิเศษจัดการขนม</span>
              </button>

              <button
                disabled={isTeacherLocked && activeRoom?.status === 'ended'}
                onClick={() => { playSoundEffect('click'); setTeacherTab('room'); }}
                className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-black transition-all border-2 ${
                  teacherTab === 'room' 
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md' 
                    : isTeacherLocked && activeRoom?.status === 'ended'
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white hover:bg-amber-50 text-amber-600 border-amber-400'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>กระดานคะแนนห้องเรียน</span>
              </button>
            </div>
          </div>

          {/* WARNING WHEN LOCKED */}
          {isTeacherLocked && (
            <div className="bg-amber-100 border-4 border-amber-300 text-amber-800 rounded-3xl p-4 mb-6 flex items-center space-x-3 text-sm font-bold animate-pulse shadow-md">
              <AlertCircle className="w-6 h-6 flex-shrink-0 text-amber-600" />
              <div>
                ล็อกข้อมูลป้องกันแอปพัง: ระหว่างเกมดำเนินอยู่ แท็บการแอดขนมจะล็อกเพื่อเสถียรภาพสูงสุดครับ
              </div>
            </div>
          )}

          {/* TAB 1: SNACK DATABASE */}
          {teacherTab === 'database' && !isTeacherLocked && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ADD/EDIT FORM */}
              <div className="bg-white border-4 border-orange-400 rounded-3xl p-6 shadow-md h-fit">
                <h3 className="text-xl font-black mb-4 flex items-center space-x-2 text-orange-600">
                  {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  <span>{editingId ? 'แก้ไขข้อมูลขนมเดิม' : 'เพิ่มขนมเข้าระบบใหม่'}</span>
                </h3>

                <form onSubmit={handleSubmitSnack} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">รหัสบาร์โค้ด / ID คิวอาร์</label>
                    <input 
                      type="text" 
                      required
                      placeholder="เช่น S001, 885..." 
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-orange-300 focus:border-orange-500 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">ชื่อของกิน / ขนม</label>
                    <input 
                      type="text" 
                      required
                      placeholder="เช่น เลย์ซองแบนรสเกลือ" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-orange-300 focus:border-orange-500 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1">ประเภท</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-orange-300 focus:border-orange-500 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
                      >
                        <option value="snack">🍿 ขนมขบเคี้ยว</option>
                        <option value="drink">🥤 เครื่องดื่ม</option>
                        <option value="bakery">🍰 เบเกอรี่</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1">แคลอรี (Kcal)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={formData.calories}
                        onChange={(e) => setFormData({...formData, calories: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-orange-300 focus:border-orange-500 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1">น้ำตาล (ก.)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={formData.sugar}
                        onChange={(e) => setFormData({...formData, sugar: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-orange-300 focus:border-orange-500 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1">ไขมัน (ก.)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={formData.fat}
                        onChange={(e) => setFormData({...formData, fat: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-orange-300 focus:border-orange-500 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-1">โซเดียม (มก.)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={formData.sodium}
                        onChange={(e) => setFormData({...formData, sodium: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-orange-300 focus:border-orange-500 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">ลิงก์ VDO แอนิเมชัน (ถ้ามี)</label>
                    <input 
                      type="text" 
                      placeholder="เช่น https://youtube.com/..." 
                      value={formData.vdoUrl}
                      onChange={(e) => setFormData({...formData, vdoUrl: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-orange-300 focus:border-orange-500 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button 
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3 rounded-xl shadow-md transition transform hover:scale-102 text-sm"
                    >
                      {editingId ? 'บันทึกแก้ไขทับ' : 'เพิ่มเข้าระบบ'}
                    </button>
                    {editingId && (
                      <button 
                        type="button"
                        onClick={() => { setEditingId(null); setFormData({ barcode: '', name: '', type: 'snack', calories: '', sugar: '', sodium: '', fat: '', vdoUrl: '' }); }}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 rounded-xl text-sm"
                      >
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* LIST OF SNACKS */}
              <div className="lg:col-span-2 bg-white border-4 border-orange-400 rounded-3xl p-6 shadow-md">
                <h3 className="text-xl font-black mb-4 text-slate-800">รายการคลังข้อมูลของว่าง ({snacks.length} ชิ้น)</h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {snacks.map((snack) => (
                    <div 
                      key={snack.id} 
                      className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:border-orange-300 transition"
                    >
                      <div className="flex items-center space-x-3.5">
                        <span className="text-3xl p-2 bg-white rounded-2xl shadow-inner">{snack.image}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-black text-slate-800">{snack.name}</h4>
                            <span className="bg-orange-100 text-orange-600 text-[10px] px-2.5 py-0.5 rounded-full font-black border border-orange-200">
                              ID: {snack.barcode}
                            </span>
                            {snack.vdoUrl && <Video className="w-4 h-4 text-orange-500" />}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1 font-bold">
                            <span>🔥 {snack.nutrition?.calories || 0} Kcal</span>
                            <span>•</span>
                            <span>🍭 น้ำตาล {snack.nutrition?.sugar || 0}ก.</span>
                            <span>•</span>
                            <span>🧂 โซเดียม {snack.nutrition?.sodium || 0}มก.</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getRatingBadge(snack.rating)}
                        <button 
                          onClick={() => handleEditSnack(snack)}
                          className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl transition"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSnack(snack.id)}
                          className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl transition"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {snacks.length === 0 && (
                    <div className="text-center py-16 text-gray-400 font-bold">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                      <p>ยังไม่มีคลังข้อมูลโภชนาการ แอดขนมด้านซ้ายมือได้เลยครับ!</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ROOM MANAGEMENT */}
          {teacherTab === 'room' && (
            <div className="space-y-6">
              
              {/* CASE 1: NO ACTIVE ROOM */}
              {!activeRoom && (
                <div className="bg-white border-4 border-orange-400 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-xl">
                  <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-orange-200 animate-bounce">
                    <Trophy className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black mb-3 text-slate-800">ยังไม่มีห้องประลองที่เริ่มทำงาน</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mb-8 font-semibold">
                    ป้อนชื่อเล่นของคุณครู เพื่อสุ่มสร้างพิน 6 หลัก มอบประสบการณ์โภชนาการแบบเกมประลองความตื่นเต้น!
                  </p>

                  <div className="max-w-xs mx-auto space-y-4 mb-6">
                    <input 
                      type="text"
                      placeholder="ป้อนชื่อเล่นคุณครู (เช่น ครูจอย)"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-orange-300 focus:border-orange-500 rounded-xl px-4 py-3 text-center font-bold text-base shadow-inner focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleCreateRoom}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/25 transition transform hover:scale-105"
                  >
                    🚀 สุ่มและสร้างรหัสห้องประลองเลย!
                  </button>
                </div>
              )}

              {/* CASE 2: WAITING PLAYERS */}
              {activeRoom && activeRoom.status === 'waiting' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* DETAIL BOX */}
                  <div className="bg-white border-4 border-orange-400 rounded-3xl p-8 text-center flex flex-col justify-between shadow-lg">
                    <div>
                      <span className="bg-orange-100 text-orange-600 border border-orange-200 font-black text-xs px-4 py-1.5 rounded-full">
                        กำลังรอผู้กล้าเข้าร่วม...
                      </span>
                      <h3 className="text-lg font-black text-gray-500 mt-6 uppercase">รหัส PIN เพื่อเข้าร่วม</h3>
                      <div className="text-6xl font-black text-orange-500 tracking-wider my-4 font-mono drop-shadow-sm">
                        {activeRoom.roomId}
                      </div>
                      <p className="text-xs text-gray-500 font-bold max-w-xs mx-auto leading-relaxed">
                        ให้นักเรียนส่องลิงก์เดียวกันในมือถือ กรอกพินนี้เพื่อเลือกมาสคอตคู่หูได้เลยครับ
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t-2 border-slate-100">
                      <p className="text-sm font-bold text-slate-700 mb-4">เมื่อนักเรียนเข้ามากันแล้ว กดปุ่มลุยศึก!</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleStartGame}
                          disabled={players.length === 0}
                          className={`w-full py-3.5 rounded-xl font-black text-sm shadow-md transition transform hover:scale-102 ${
                            players.length === 0
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600 text-white border-2 border-green-600'
                          }`}
                        >
                          เริ่มประลองเกม 🎮
                        </button>
                        <button
                          onClick={handleRestartRoom}
                          className="w-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-sm"
                        >
                          สลายห้องเล่น
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE PLAYERS LIST */}
                  <div className="lg:col-span-2 bg-white border-4 border-orange-400 rounded-3xl p-6 shadow-md">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-800">
                        ผู้กล้าที่ร่วมสำรวจขณะนี้ ({players.length} คน)
                      </h3>
                      <span className="bg-orange-100 text-orange-600 font-black text-xs px-3 py-1 rounded-full animate-pulse border border-orange-200">
                        LIVE REFRESH
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[380px] overflow-y-auto pr-1">
                      {players.map((p) => (
                        <div 
                          key={p.id}
                          className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-4 text-center hover:border-orange-400 transition"
                        >
                          <span className="text-4xl block mb-2">{p.avatar}</span>
                          <span className="font-black text-slate-800 block truncate">{p.name}</span>
                          <span className="text-[9px] text-gray-400 font-mono font-bold block mt-1">{p.id.split('_')[1]}</span>
                        </div>
                      ))}

                      {players.length === 0 && (
                        <div className="col-span-full py-16 text-center text-gray-400 font-bold">
                          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-orange-400 animate-bounce" />
                          <p>กำลังคอยเด็ก ๆ ลงสนามรายงานตัวครับน้า...</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* CASE 3: GAME RUNNING */}
              {activeRoom && activeRoom.status === 'playing' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* CONTROLLERS DURING GAME */}
                  <div className="bg-gradient-to-br from-orange-500 to-amber-500 border-4 border-orange-600 rounded-3xl p-8 text-center flex flex-col justify-between shadow-xl text-white">
                    <div>
                      <span className="bg-yellow-400 text-orange-600 font-black text-xs px-4 py-1.5 rounded-full border-2 border-white animate-pulse">
                        🔥 กำลังดวลการสแกนสด 🔥
                      </span>
                      <h3 className="text-lg font-black text-orange-100 mt-6 uppercase">รหัสพินห้องเรียน</h3>
                      <div className="text-5xl font-black tracking-wider my-3 font-mono drop-shadow-md">
                        {activeRoom.id}
                      </div>
                      <p className="text-xs text-orange-100 font-bold max-w-xs mx-auto leading-relaxed">
                        ขณะนี้หน้าจอนักเรียนจะถูกล็อกไม่ให้กดย้อนกลับ บังคับให้เปิดสแกนซองขนมที่แอดไว้เท่านั้น
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-orange-400">
                      <p className="text-xs font-black text-yellow-300 mb-4 animate-pulse">🚨 กดปุ่มนี้เมื่อหมดเวลาประลอง:</p>
                      
                      <button
                        onClick={handleEndGame}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-orange-600 font-black py-4 rounded-2xl shadow-lg border-2 border-white text-base transition transform hover:scale-105 animate-bounce-short"
                      >
                        🏁 จบเกมและแสดงโพเดียมแชมป์ 🏁
                      </button>
                    </div>
                  </div>

                  {/* REAL-TIME SCORES LIST */}
                  <div className="lg:col-span-2 bg-white border-4 border-orange-400 rounded-3xl p-6 shadow-md">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-800">
                        ตารางอันดับด่วนแบบ Real-time
                      </h3>
                      <span className="bg-green-100 text-green-600 font-black text-xs px-3 py-1 rounded-full animate-pulse flex items-center border border-green-200">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1.5 animate-ping"></span>
                        <span>กำลังอัปเดตข้อมูล</span>
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {players.map((p, idx) => (
                        <div 
                          key={p.id}
                          className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:border-orange-300 transition"
                        >
                          <div className="flex items-center space-x-3.5">
                            <span className="text-lg font-black text-orange-500 font-mono w-6">#{idx + 1}</span>
                            <span className="text-3xl">{p.avatar}</span>
                            <div>
                              <h4 className="font-black text-slate-800">{p.name}</h4>
                              <p className="text-xs text-gray-400 font-bold mt-0.5">
                                สแกนสะสมแล้ว: <span className="text-orange-500">{(p.scannedBarcodes || []).length} ชิ้น</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-black text-emerald-500 font-mono">{p.score}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">EXP</div>
                          </div>
                        </div>
                      ))}

                      {players.length === 0 && (
                        <div className="text-center py-16 text-gray-400 font-bold">
                          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                          <p>ไม่มีรายชื่อนักเรียนในตารางการแข่งขันครับ</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* CASE 4: TOP 5 PODIUM EXIBITION */}
              {activeRoom && activeRoom.status === 'ended' && (
                <div className="bg-white border-4 border-yellow-400 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  <Confetti />

                  {/* CEREMONY HEAD */}
                  <div className="text-center mb-10 relative z-10">
                    <span className="bg-yellow-100 text-orange-600 border border-yellow-200 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
                      🏁 พิธีปิดการประลองล่าขนมสุขสันต์ 🏁
                    </span>
                    <h3 className="text-4xl font-black mt-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600 drop-shadow-md">
                      ทำเนียบมาสคอตพิทักษ์โลก 5 อันดับแรก!
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 font-semibold">
                      แตรชัยชนะแบบวนลูปกำลังก้องกังวาล 🎉 มอบรางวัลความรู้ที่ดีที่สุดให้แก่เด็ก ๆ กันได้เลยน้า!
                    </p>
                  </div>

                  {/* CARTOON PODIUM TOP 5 */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10 pt-16 relative z-10">
                    {players.slice(0, 5).map((player, index) => {
                      const heights = [
                        "border-yellow-400 bg-gradient-to-b from-yellow-50 to-white shadow-yellow-200", // 1st
                        "border-slate-300 bg-gradient-to-b from-slate-50 to-white shadow-slate-200",  // 2nd
                        "border-amber-600 bg-gradient-to-b from-amber-50 to-white shadow-amber-200",  // 3rd
                        "border-slate-200 bg-slate-50 shadow-slate-100",  // 4th
                        "border-slate-100 bg-slate-100 shadow-slate-50"   // 5th
                      ];

                      const bounceStyle = index === 0 
                        ? 'animate-bounce text-6xl' 
                        : index < 3 
                          ? 'animate-pulse text-5xl' 
                          : 'text-4xl';

                      return (
                        <div 
                          key={player.id}
                          className={`relative border-4 rounded-3xl p-6 text-center shadow-lg transition transform hover:scale-105 ${heights[index]}`}
                        >
                          {/* Rank badge */}
                          <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white rounded-full border-4 border-inherit flex items-center justify-center font-black text-xl shadow-md">
                            {index === 0 && "🥇"}
                            {index === 1 && "🥈"}
                            {index === 2 && "🥉"}
                            {index > 2 && `${index + 1}`}
                          </div>

                          <div className="my-4 h-16 flex items-center justify-center">
                            <span className={`${bounceStyle} select-none`}>
                              {player.avatar}
                            </span>
                          </div>

                          <h4 className="font-black text-slate-800 truncate text-base mb-1">{player.name}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">Mascot Hunter</p>

                          <div className="bg-white rounded-2xl py-2 px-3 border-2 border-slate-100">
                            <div className="text-2xl font-black font-mono text-orange-500">{player.score}</div>
                            <div className="text-[9px] text-gray-400 font-bold">EXP POINTS</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTTOM RESTART */}
                  <div className="border-t-2 border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                    <p className="text-xs text-gray-400 text-center sm:text-left font-bold">
                      หากต้องการเริ่มการจัดกิจกรรมรอบถัดไปสำหรับห้องเรียนถัดไป กดรีสตาร์ทขวาได้เลยครับ
                    </p>
                    <button
                      onClick={handleRestartRoom}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/25 transition flex items-center space-x-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>เริ่มห้องการประลองรอบใหม่ 🚀</span>
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
        <main className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full flex flex-col justify-center">
          
          {/* STEP 1: JOINING PAGE */}
          {!studentJoined && (
            <div className="bg-white border-4 border-amber-400 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="text-center mb-6">
                <span className="bg-amber-100 text-amber-600 border border-amber-200 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                  🧸 แฟนเพจลงทะเบียนด่วน
                </span>
                <h3 className="text-3xl font-black text-slate-800 mt-4">เข้าสู่สมรภูมิตามล่าของหวาน</h3>
                <p className="text-xs text-gray-500 font-bold mt-1">กรอกพินและป้อนชื่อเล่นเพื่อจับคู่น้องมาสคอตวิเศษ!</p>
              </div>

              <form onSubmit={handleJoinGame} className="space-y-6">
                
                {/* ROOM PIN INPUT */}
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-1">รหัสห้องเรียน 6 หลัก (ครูฉายขึ้นกระดาน)</label>
                  <input 
                    type="number"
                    required
                    maxLength={6}
                    placeholder="ป้อนตัวเลข 6 หลัก"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    className="w-full bg-slate-50 border-4 border-amber-300 focus:border-amber-500 rounded-2xl px-4 py-3 text-center text-3xl font-black font-mono tracking-widest focus:outline-none focus:ring-0"
                  />
                  {activeRoom && (
                    <p className="text-[10px] text-green-600 font-bold mt-1.5 text-center animate-pulse">
                      * ค้นพบห้องประลองจริงของคุณครู: <span className="font-black">{activeRoom.teacherName}</span>
                    </p>
                  )}
                </div>

                {/* NICKNAME */}
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-1">ชื่อเล่นของคุณหนูๆ</label>
                  <input 
                    type="text" 
                    required
                    maxLength={15}
                    placeholder="เช่น น้องนนท์, ปลามังกร" 
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-amber-300 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-center text-lg font-black focus:outline-none"
                  />
                </div>

                {/* MASCOT CHOOSE */}
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-2">เลือกคู่หูมาสคอตคู่เดินทาง</label>
                  <div className="grid grid-cols-3 gap-3">
                    {MASCOTS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { playSoundEffect('click'); setSelectedMascot(m); }}
                        className={`p-3.5 rounded-3xl border-4 transition transform hover:scale-105 flex flex-col items-center justify-center ${
                          selectedMascot.id === m.id 
                            ? 'border-orange-500 bg-orange-50 shadow-md' 
                            : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-4xl mb-1.5">{m.emoji}</span>
                        <span className="text-xs font-black text-slate-700 truncate w-full text-center">{m.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-500/20 text-lg transition transform hover:scale-102"
                >
                  🚀 เข้าสู่กระดานท้าทายกันเลย!
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: ACTIVE GAME INTERFACE FOR STUDENTS */}
          {studentJoined && activeRoom && (
            <div className="space-y-6">
              
              {/* STATUS CARD */}
              <div className="bg-white border-4 border-amber-400 rounded-3xl p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-14 h-14 bg-gradient-to-tr ${selectedMascot.color} rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-white animate-pulse`}>
                    {selectedMascot.emoji}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 flex items-center space-x-1.5">
                      <span>{studentName}</span>
                      <span className="bg-slate-100 text-amber-600 text-[9px] px-2 py-0.5 rounded-full font-mono font-black border border-slate-200">
                        {currentStudentId.split('_')[1]}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 font-bold">คู่หู: {selectedMascot.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-500 font-mono">
                    {players.find(p => p.id === currentStudentId)?.score || 0}
                  </div>
                  <div className="text-[10px] text-gray-400 font-black uppercase">EXP TOTAL</div>
                </div>
              </div>

              {/* LOCK LOCK LOCK */}
              {activeRoom.status !== 'ended' && (
                <div className="bg-orange-100 border-4 border-orange-300 rounded-2xl p-3 text-center text-xs text-orange-700 font-black flex items-center justify-center space-x-1.5 shadow-sm">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <span>ห้ามเปลี่ยนหน้าเว็บ เพื่อป้องการความสูญหายคะแนนประลองสดครับน้า</span>
                </div>
              )}

              {/* COND 1: WAITING */}
              {activeRoom.status === 'waiting' && (
                <div className="bg-white border-4 border-amber-400 rounded-3xl p-8 text-center shadow-lg">
                  <div className="w-16 h-16 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin text-amber-500">
                    <RefreshCw className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-800">ยืนแถวรอสัญญาณธงปล่อยจากคุณครูนะคร้าบ...</h4>
                  <p className="text-xs text-gray-400 mt-2 font-semibold">
                    เมื่อคุณครูกดเริ่มแข่งขัน มือถือจะแสดงปุ่มเปิดกล้องให้พร้อมสแกนคิวอาร์ของจริงทันทีเลยครับ!
                  </p>
                </div>
              )}

              {/* COND 2: PLAYING ACTIVE */}
              {activeRoom.status === 'playing' && (
                <div className="space-y-6">
                  
                  {/* SCANNING BOX */}
                  <div className="bg-white border-4 border-amber-400 rounded-3xl p-6 shadow-lg relative overflow-hidden">
                    <h4 className="text-xl font-black text-slate-800 mb-2 flex items-center space-x-2">
                      <Camera className="w-5 h-5 text-orange-500 animate-pulse" />
                      <span>สแกนบาร์โค้ด / คิวอาร์</span>
                    </h4>
                    <p className="text-xs text-gray-400 mb-6 font-bold">
                      เลือกจำลองบาร์โค้ด หรือส่องกล้องจากซองขนมที่คุณครูแอดเก็บไว้ เพื่อวิเคราะห์ผลลัพธ์
                    </p>

                    {/* VIRTUAL QR VIEWPORT */}
                    {isCameraActive ? (
                      <div className="bg-slate-950 border-4 border-orange-400 rounded-3xl p-4 text-center relative overflow-hidden mb-6 h-64 flex flex-col justify-between items-center">
                        <div className="absolute inset-0 bg-slate-900/40 pointer-events-none">
                          <div className="w-48 h-48 border-4 border-dashed border-orange-400 rounded-3xl mx-auto my-6 animate-pulse flex items-center justify-center">
                            <span className="text-[10px] text-orange-400 font-bold tracking-wider">กำลังจับภาพช่องสแกน...</span>
                          </div>
                        </div>

                        <span className="bg-orange-500/20 text-orange-300 text-[10px] px-3 py-1 rounded-full font-black z-10 border border-orange-500/20">
                          📷 กล้องมองหลังตรวจจับรหัสซองขนม
                        </span>

                        <div className="z-10 bg-slate-900/90 border-2 border-slate-700 p-3 rounded-2xl max-w-sm w-full">
                          <p className="text-xs text-slate-300 mb-2 font-bold">เลือกจำลองของจริงรอบตัว:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {snacks.map((snack) => (
                              <button
                                key={snack.id}
                                type="button"
                                onClick={() => handleSimulateCameraScan(snack.barcode)}
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
                              ❌ รหัสเสียนอกคลัง
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={() => { playSoundEffect('click'); setIsCameraActive(false); }}
                          className="z-10 bg-rose-500 hover:bg-rose-600 border border-rose-600 text-white text-xs px-4 py-1.5 rounded-lg transition"
                        >
                          ปิดกล้อง
                        </button>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <button
                          onClick={() => { playSoundEffect('click'); setIsCameraActive(true); }}
                          className="w-full bg-slate-50 hover:bg-orange-50/50 border-4 border-dashed border-orange-300 hover:border-orange-500 rounded-3xl py-10 flex flex-col items-center justify-center transition group shadow-inner"
                        >
                          <Camera className="w-12 h-12 text-orange-400 group-hover:scale-110 transition duration-300 mb-2" />
                          <span className="font-black text-sm text-slate-700">คลิกที่นี่เพื่อเรียกใช้ "กล้องหลังสมาร์ทโฟน"</span>
                          <span className="text-[10px] text-gray-400 font-bold mt-1">ตรวจจับบาร์โค้ดแบบอัตโนมัติรวดเร็ว</span>
                        </button>
                      </div>
                    )}

                    {/* INPUTS FIELD */}
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <input 
                          type="text"
                          placeholder="พิมพ์รหัสบนบาร์โค้ดที่ต้องการสแกน"
                          value={qrInput}
                          onChange={(e) => setQrInput(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm focus:outline-none text-slate-800 placeholder:text-gray-400 font-bold"
                        />
                      </div>

                      <button
                        onClick={handleVerifyBarcodeAndSubmit}
                        disabled={!qrInput.trim() || isSubmittingScan}
                        className={`px-6 py-3 rounded-2xl font-black transition flex items-center space-x-2 border-2 ${
                          !qrInput.trim() || isSubmittingScan
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600 shadow-md'
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
                        
                        <div className={`text-center max-w-sm w-full p-6 bg-white border-4 rounded-3xl transform scale-100 transition shadow-2xl ${
                          isSubmittingScan 
                            ? 'border-slate-800 animate-pulse'
                            : scanResult?.status === 'success'
                              ? 'border-emerald-500 shadow-emerald-500/10 animate-bounce'
                              : 'border-rose-500 shadow-rose-500/10 animate-shake'
                        }`}>
                          
                          {/* 1. VERIFYING STATE */}
                          {isSubmittingScan && (
                            <div className="py-8">
                              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                              <h5 className="font-extrabold text-base text-slate-700">ระบบตรวจสอบคลังวิเศษ...</h5>
                              <p className="text-xs text-slate-400 mt-1">กำลังค้นหาข้อมูลคุณค่าโภชนาการจริงในขนมห่อนี้</p>
                            </div>
                          )}

                          {/* 2. SUCCESS STATE */}
                          {!isSubmittingScan && scanResult?.status === 'success' && (
                            <div>
                              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle className="w-10 h-10" />
                              </div>
                              
                              <h5 className="font-black text-xl text-emerald-600">{scanResult.message}</h5>
                              
                              {/* Food detail card inside scanner animation */}
                              <div className="bg-slate-50 border-2 border-slate-150 rounded-2xl p-4 my-4 text-left">
                                <div className="flex items-center space-x-3">
                                  <span className="text-4xl p-1 bg-white rounded-lg shadow-inner">{scanResult.data.image}</span>
                                  <div>
                                    <h6 className="font-black text-slate-800 text-base">{scanResult.data.name}</h6>
                                    <div className="mt-1">{getHealthBadge(scanResult.data.rating)}</div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-bold text-gray-500">
                                  <div className="bg-white p-2 rounded-xl border border-slate-100 text-center shadow-sm">
                                    <span className="block text-[10px] text-slate-400 uppercase">แคลอรี</span>
                                    <span className="font-black text-slate-800 text-sm">{scanResult.data.nutrition?.calories || 0} Kcal</span>
                                  </div>
                                  <div className="bg-white p-2 rounded-xl border border-slate-100 text-center shadow-sm">
                                    <span className="block text-[10px] text-slate-400 uppercase">ปริมาณน้ำตาล</span>
                                    <span className="font-black text-slate-800 text-sm">{scanResult.data.nutrition?.sugar || 0} กรัม</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-xs text-emerald-600 font-bold mb-4 animate-pulse">
                                🎉 คุณค่าและ EXP ถูกโอนส่งเข้าแผ่นกระดานครูแล้ว!
                              </div>

                              <button
                                onClick={() => { playSoundEffect('click'); setShowScanAnimation(false); setQrInput(''); }}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 border-2 border-emerald-600 text-white font-black py-3 rounded-xl transition"
                              >
                                ยอดเยี่ยม! ไปหาขนมห่ออื่นกัน
                              </button>
                            </div>
                          )}

                          {/* 3. FAILED STATE */}
                          {!isSubmittingScan && scanResult?.status === 'failed' && (
                            <div>
                              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                                <XCircle className="w-10 h-10" />
                              </div>
                              
                              <h5 className="font-black text-xl text-rose-600">อุ๊ย! ไม่พบคลังข้อมูลของชิ้นนี้</h5>
                              <p className="text-xs text-gray-500 my-4 leading-relaxed font-bold">
                                {scanResult.message} ขนมชนิดนี้ยังไม่ได้รับการบันทึกข้อมูลโภชนาการจากคุณครู ปรึกษาแจ้งให้คุณครูแอดรหัสรวดเร็วได้เลยครับ!
                              </p>

                              <button
                                onClick={() => { playSoundEffect('click'); setShowScanAnimation(false); }}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-3 rounded-xl transition"
                              >
                                ลองวิเคราะห์ซองอื่นดูนะ
                              </button>
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                  </div>

                  {/* NO CHEAT: ONLY DISPLAY SNACKS THE STUDENT ACTUALLY SCANNED & CONQUERED! */}
                  <div className="bg-white border-4 border-amber-400 rounded-3xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-base font-black text-slate-800">
                          คลังขนมที่หนูพิชิตได้ ({studentScannedList.length} รายการ)
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold">จะแสดงเฉพาะขนมที่คุณหนูๆ สแกนสำเร็จด้วยตัวเองเท่านั้นครับ</p>
                      </div>
                      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black border border-orange-200 shadow-sm">
                        MY HUNTS
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {studentScannedList.map((snack, idx) => (
                        <div key={idx} className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl p-1.5 bg-white rounded-xl shadow-inner">{snack.image}</span>
                            <div>
                              <h5 className="text-sm font-black text-slate-800">{snack.name}</h5>
                              <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold mt-0.5">
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
                        <div className="text-center py-10 text-gray-400 font-bold">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                          <p className="text-xs">ยังไม่มีขนมที่สแกนสำเร็จเลย ลองกดสแกนซองขนมชิ้นแรกดูนะเด็กๆ!</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* COND 3: END GAME SPECIFIC USER RESULT */}
              {activeRoom.status === 'ended' && (
                <div className="bg-white border-4 border-yellow-400 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-orange-500/5 pointer-events-none"></div>

                  <div className="relative z-10">
                    <span className="bg-yellow-100 text-orange-600 border border-yellow-200 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider animate-pulse shadow-sm">
                      🏁 สรุปผลการผจญภัยในคาบเรียน 🏁
                    </span>
                    
                    <div className="my-8">
                      <div className={`w-28 h-28 bg-gradient-to-tr ${selectedMascot.color} rounded-3xl flex items-center justify-center text-6xl mx-auto shadow-2xl border-4 border-white animate-bounce`}>
                        {selectedMascot.emoji}
                      </div>
                      <h4 className="text-2xl font-black text-slate-800 mt-6">ยินดีด้วยนะคุณหนู {studentName}!</h4>
                      <p className="text-xs text-gray-400 font-bold mt-1">
                        เพื่อนยากคู่เดินทางของคุณคือ {selectedMascot.name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                      <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-center shadow-sm">
                        <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">ผลคะแนนรวมที่ได้</span>
                        <span className="text-3xl font-black text-emerald-500 font-mono">
                          {players.find(p => p.id === currentStudentId)?.score || 0}
                        </span>
                      </div>
                      <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-center shadow-sm">
                        <span className="block text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">อันดับชั้นเรียน</span>
                        <span className="text-3xl font-black text-amber-500 font-mono">
                          #{[...players].findIndex(p => p.id === currentStudentId) + 1}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed font-bold">
                      สุดยอดไปเลย! วันนี้เด็กๆ ทุกคนได้เรียนรู้วิธีการคัดกรองขนมที่ปลอดภัยต่อคุณค่าทางอาหารและร่างกาย ขอให้นำเอาความรู้ดีๆ ไปประยุกต์ใช้ในชีวิตประจำวันต่อนะคร้าบ! ✨
                    </p>
                  </div>

                </div>
              )}

            </div>
          )}

        </main>
      )}

      {/* FOOTER */}
      <footer className="mt-16 border-t-2 border-orange-200/40 py-6 text-center text-xs text-orange-600/60 font-bold px-4">
        <p>© 2026 Snack Hunter Edu-Tech Thailand. ออกแบบสไตล์เกมการเรียนรู้สำหรับเด็กประถมศึกษาอย่างเป็นทางการ</p>
      </footer>

    </div>
  );
}