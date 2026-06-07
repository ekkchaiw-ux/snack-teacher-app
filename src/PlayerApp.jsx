import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { ScanLine, Award, Zap, Heart, AlertTriangle, CheckCircle, ArrowRight, X, Trophy, Star, Shield, Play, Volume2, Sparkles, User, Key, RefreshCw, Film } from 'lucide-react';

// ----------------------------------------------------------------------
// 1. Firebase Configuration (ใช้ฐานข้อมูลเดียวกันกับระบบควบคุมคุณครู)
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// 2. ตัวการ์ตูนมาสคอตคู่หู (Inline Cute Cartoon SVGs)
// ----------------------------------------------------------------------
const MASCOTS = [
  {
    id: 'fox',
    name: 'ฟ็อกซี่ (นักสืบจอมฉลาด)',
    avatar: '🦊',
    color: 'from-orange-400 to-amber-500',
    description: 'จิ้งจอกน้อยฉลาดปราดเปรื่อง เก่งเรื่องสแกนฉลากโภชนาการ!',
    svg: (state) => (
      <svg viewBox="0 0 100 100" className="w-32 h-32 animate-bounce">
        <circle cx="50" cy="50" r="45" fill="#FFEEDB" />
        {/* หูจิ้งจอก */}
        <polygon points="25,15 15,40 38,32" fill="#E25822" />
        <polygon points="75,15 85,40 62,32" fill="#E25822" />
        <polygon points="27,20 20,38 35,32" fill="#FF8C00" />
        <polygon points="73,20 80,38 65,32" fill="#FF8C00" />
        {/* โครงหน้า */}
        <path d="M 15 45 C 15 70, 50 85, 50 85 C 50 85, 85 70, 85 45 C 85 30, 15 30, 15 45" fill="#E25822" />
        <path d="M 28 50 C 28 70, 50 80, 50 80 C 50 80, 72 70, 72 50 C 72 40, 28 40, 28 50" fill="#FFFFFF" />
        {/* จมูกและตา */}
        <polygon points="46,72 54,72 50,78" fill="#1A1A1A" />
        <circle cx="38" cy="48" r="5" fill={state === 'sad' ? '#555' : '#1A1A1A'} />
        <circle cx="62" cy="48" r="5" fill={state === 'sad' ? '#555' : '#1A1A1A'} />
        {/* แว่นตาไฮเทค */}
        <rect x="28" y="42" width="44" height="12" rx="3" fill="rgba(0, 191, 255, 0.4)" stroke="#00BFFF" strokeWidth="2" />
        {/* แก้มและปาก */}
        <circle cx="32" cy="56" r="4" fill="#FFB6C1" />
        <circle cx="68" cy="56" r="4" fill="#FFB6C1" />
        <path d="M 47 64 Q 50 68, 53 64" stroke="#1A1A1A" strokeWidth="2" fill="none" />
      </svg>
    )
  },
  {
    id: 'bear',
    name: 'พี่หมีบาร์นีย์ (สายเฮลตี้)',
    avatar: '🐻',
    color: 'from-amber-700 to-amber-900',
    description: 'หมีใจดีรักสุขภาพ เกลียดสารเคมี ชอบกินของออร์แกนิกเป็นที่สุด',
    svg: (state) => (
      <svg viewBox="0 0 100 100" className="w-32 h-32 animate-pulse">
        <circle cx="50" cy="50" r="45" fill="#FDF5E6" />
        {/* หูหมี */}
        <circle cx="25" cy="25" r="14" fill="#8B4513" />
        <circle cx="75" cy="25" r="14" fill="#8B4513" />
        <circle cx="25" cy="25" r="8" fill="#CD853F" />
        <circle cx="75" cy="25" r="8" fill="#CD853F" />
        {/* หัวหมี */}
        <circle cx="50" cy="55" r="32" fill="#8B4513" />
        {/* ตา */}
        <circle cx="40" cy="48" r="4" fill="#1A1A1A" />
        <circle cx="60" cy="48" r="4" fill="#1A1A1A" />
        {/* ปากและจมูกตูมๆ */}
        <ellipse cx="50" cy="62" rx="14" ry="10" fill="#CD853F" />
        <ellipse cx="50" cy="58" rx="6" ry="4" fill="#1A1A1A" />
        {/* รอยยิ้ม */}
        <path d={state === 'sad' ? "M 45 68 Q 50 64, 55 68" : "M 44 64 Q 50 70, 56 64"} stroke="#1A1A1A" strokeWidth="2.5" fill="none" />
      </svg>
    )
  },
  {
    id: 'cat',
    name: 'คิดตี้ (ปั่นท้าแคล)',
    avatar: '🐱',
    color: 'from-pink-400 to-rose-500',
    description: 'เหมียวนักกีฬา คล่องแคล่วว่องไว พร้อมออกวิ่งล่าขนมเพื่อสุขภาพ!',
    svg: (state) => (
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        <circle cx="50" cy="50" r="45" fill="#FFF0F5" />
        {/* หูแมว */}
        <polygon points="15,15 35,35 15,45" fill="#DB7093" />
        <polygon points="85,15 65,35 85,45" fill="#DB7093" />
        {/* หัวแมว */}
        <circle cx="50" cy="55" r="30" fill="#FFC0CB" />
        {/* ตาโตๆ */}
        <circle cx="38" cy="50" r="6" fill="#1A1A1A" />
        <circle cx="62" cy="50" r="6" fill="#1A1A1A" />
        {/* ลูกตาดำประกาย */}
        <circle cx="40" cy="48" r="2" fill="#FFFFFF" />
        <circle cx="64" cy="48" r="2" fill="#FFFFFF" />
        {/* จมูกชมพู */}
        <polygon points="48,58 52,58 50,61" fill="#FF1493" />
        {/* หนวดแมว */}
        <line x1="20" y1="58" x2="32" y2="58" stroke="#1A1A1A" strokeWidth="1.5" />
        <line x1="20" y1="64" x2="30" y2="62" stroke="#1A1A1A" strokeWidth="1.5" />
        <line x1="80" y1="58" x2="68" y2="58" stroke="#1A1A1A" strokeWidth="1.5" />
        <line x1="80" y1="64" x2="70" y2="62" stroke="#1A1A1A" strokeWidth="1.5" />
        {/* ปากกระจับยิ้ม */}
        <path d="M 45 64 Q 50 67, 55 64" stroke="#1A1A1A" strokeWidth="2" fill="none" />
      </svg>
    )
  }
];

// ----------------------------------------------------------------------
// 3. กฎเกณฑ์การประเมินดาว (Nutrition Level Criteria)
// ----------------------------------------------------------------------
const getStars = (val, type) => {
  if (type === 'sugar') {
    if (val <= 6) return 5;
    if (val <= 12) return 4;
    if (val <= 18) return 3;
    if (val <= 24) return 2;
    return 1;
  }
  if (type === 'sodium') {
    if (val <= 120) return 5;
    if (val <= 240) return 4;
    if (val <= 360) return 3;
    if (val <= 480) return 2;
    return 1;
  }
  if (type === 'fat') {
    if (val <= 3) return 5;
    if (val <= 6) return 4;
    if (val <= 9) return 3;
    if (val <= 12) return 2;
    return 1;
  }
  return 5;
};

const getHealthStatus = (starsAvg) => {
  if (starsAvg >= 4.5) return { name: "🟢 ปลอดภัย", bg: "bg-green-100 border-green-300", text: "text-green-700", desc: "ทานได้เลย! ดีต่อสุขภาพร่างกายสุดๆ 🥦", mascotState: 'happy' };
  if (starsAvg >= 3.5) return { name: "🟡 ควรระวัง", bg: "bg-yellow-100 border-yellow-300", text: "text-yellow-700", desc: "ทานได้พอดีๆ แต่อย่าทานบ่อยเกินไปน้า 🍊", mascotState: 'happy' };
  if (starsAvg >= 2.5) return { name: "🟠 เสี่ยง", bg: "bg-orange-100 border-orange-300", text: "text-orange-700", desc: "เริ่มมีปริมาณสารอาหารสูง ระวังสุขภาพด้วยจ้า 🍿", mascotState: 'sad' };
  return { name: "🔴 อันตราย", bg: "bg-red-100 border-red-300", text: "text-red-700", desc: "อันตรายมาก! น้ำตาล/โซเดียม/ไขมัน สูงเกินโควต้า ❌", mascotState: 'sad' };
};

// ----------------------------------------------------------------------
// 4. Component หลัก: Player App
// ----------------------------------------------------------------------
export default function PlayerApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // สเตจสถานะหน้าจอ: 'login' -> 'lobby' -> 'playing' -> 'scanning' -> 'result' -> 'gameover'
  const [screen, setScreen] = useState('login');

  // ข้อมูลห้องและการเข้าร่วม
  const [roomPin, setRoomPin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedMascot, setSelectedMascot] = useState(MASCOTS[0]);
  const [roomData, setRoomData] = useState(null);
  const [playerData, setPlayerData] = useState(null);

  // ระบบสแกน
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedSnack, setScannedSnack] = useState(null);
  const [databaseSnacks, setDatabaseSnacks] = useState([]);
  const [scanError, setScanError] = useState('');
  
  // ระบบวิดีโอแอนิเมชันป๊อปอัพ
  const [showVideo, setShowVideo] = useState(false);

  // โหลด Firebase Auth แบบไม่ระบุชื่อ
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        await signInAnonymously(auth);
      }
    });
    return () => unsubAuth();
  }, []);

  // ดึงรายการขนมในคลังมาสำรองเพื่อการทดสอบ/สแกน
  useEffect(() => {
    if (!user) return;
    const snacksRef = collection(db, 'artifacts', appId, 'public', 'data', 'snacks');
    const unsub = onSnapshot(snacksRef, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setDatabaseSnacks(list);
    });
    return () => unsub();
  }, [user]);

  // เฝ้าฟังสถานะการสลับห้องเรียนของเด็ก (เมื่อครูกดเริ่มเกม / จบเกม)
  useEffect(() => {
    if (!roomPin) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomPin);
    const unsubRoom = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoomData(data);
        if (data.status === 'playing') {
          setScreen('playing');
        } else if (data.status === 'ended') {
          setScreen('gameover');
        } else if (data.status === 'waiting') {
          setScreen('lobby');
        }
      } else {
        setRoomPin('');
        alert('ห้องเรียนนี้ไม่พบในระบบ หรือถูกปิดไปแล้วครับ');
        setScreen('login');
      }
    });
    return () => unsubRoom();
  }, [roomPin]);

  // เฝ้าฟังความเปลี่ยนแปลงคะแนนของเด็กคนนี้แบบ Real-time
  useEffect(() => {
    if (!roomPin || !playerName) return;
    const playerDocId = `${roomPin}_${playerName}`;
    const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', playerDocId);
    const unsubPlayer = onSnapshot(playerRef, (docSnap) => {
      if (docSnap.exists()) {
        setPlayerData(docSnap.data());
      }
    });
    return () => unsubPlayer();
  }, [roomPin, playerName]);

  // ฟังก์ชันเข้าร่วมห้องเกม
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomPin.trim() || !playerName.trim()) return alert('กรุณากรอกรหัสห้องและชื่อเล่นครับ');

    setLoading(true);
    try {
      // ตรวจเช็คก่อนว่าห้องเรียนนี้มีอยู่จริงหรือไม่
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomPin.trim());
      const roomSnap = await getDocs(query(collection(db, 'artifacts', appId, 'public', 'data', 'rooms'), where("pin", "==", roomPin.trim())));
      
      if (roomSnap.empty) {
        alert('ไม่พบรหัสห้องเรียนนี้ กรุณาลองตรวจสอบใหม่อีกครั้งครับ');
        setLoading(false);
        return;
      }

      const activeRoom = roomSnap.docs[0].data();
      setRoomData(activeRoom);

      // สร้างประวัติเด็กใน Database
      const playerDocId = `${roomPin.trim()}_${playerName.trim()}`;
      const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', playerDocId);
      
      const newPlayerData = {
        roomId: roomPin.trim(),
        name: playerName.trim(),
        avatar: selectedMascot.avatar,
        mascotId: selectedMascot.id,
        exp: 0,
        coins: 0,
        scannedBarcodes: [],
        joinedAt: new Date().toISOString()
      };

      await setDoc(playerRef, newPlayerData);
      setPlayerData(newPlayerData);

      // สลับหน้าจอไปที่ Lobby รอคุณครูเริ่มเกม
      setScreen('lobby');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อห้องเรียน');
    }
    setLoading(false);
  };

  // ฟังก์ชันค้นหาและประเมินผลขนมที่เด็กสแกน
  const handleScanSnack = async (barcode) => {
    setScanError('');
    if (!barcode.trim()) return;

    // ค้นหาจากฐานข้อมูลอาหารใน Firebase
    const matched = databaseSnacks.find(s => s.barcode === barcode.trim());
    
    if (matched) {
      setScannedSnack(matched);
      setScreen('result');
    } else {
      setScanError('🕵️‍♂️ ไม่พบรหัสขนมชิ้นนี้ในระบบ! ลองสแกนห่ออื่น หรือทักทายให้คุณครูแอดมินช่วยแอดข้อมูลให้หน่อยนะ');
    }
  };

  // รับรางวัล EXP และ Coin เข้าสู่ตัวละคร
  const claimRewards = async () => {
    if (!playerData || !scannedSnack) return;

    // เช็คก่อนว่าเคยสแกนขนมชิ้นนี้ไปหรือยัง (ระบบความปลอดภัยเพื่อป้องกันการแฮกคะแนนสแกนซ้ำ)
    const alreadyScanned = playerData.scannedBarcodes || [];
    if (alreadyScanned.includes(scannedSnack.barcode)) {
      alert('🔒 มาสคอตเตือน: น้องเคยได้คะแนนจากขนมห่อนี้แล้วจ้า! ลองเดินไปตามหาสำรวจซองรสชาติอื่นๆ ดูกันเถอะ!');
      setScreen('playing');
      return;
    }

    try {
      const playerDocId = `${roomPin}_${playerName}`;
      const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', playerDocId);

      const updatedBarcodes = [...alreadyScanned, scannedSnack.barcode];
      
      await updateDoc(playerRef, {
        exp: playerData.exp + scannedSnack.expReward,
        coins: playerData.coins + scannedSnack.coinReward,
        scannedBarcodes: updatedBarcodes
      });

      // ดนตรีเสร็จสิ้น (ถ้าเชื่อมต่อเสียงประกอบ)
      setScreen('playing');
      setScannedSnack(null);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกรางวัล');
    }
  };

  // ดึงลิงก์ YouTube Embed แบบแปลง ID อัตโนมัติ เพื่อให้แสดงหน้ากล่องแอนิเมชันน่ารักๆ
  const getEmbedVideoUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  };

  // ----------------------------------------------------------------------
  // UI RENDER: สรุปหน้าจอปุ่มลัด/บานควบคุมต่างๆ
  // ----------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-100 font-sans text-sky-600">
        <Sparkles className="w-12 h-12 animate-spin text-sky-500 mb-2" />
        <p className="font-bold">กำลังเตรียมอุปการณ์แกดเจ็ตนักสืบ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0F2FE] font-sans text-slate-800 flex justify-center py-4 px-2">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-sky-300 flex flex-col relative">
        
        {/* แถบด้านบน: สเตตัสทั่วไปในห้องเกม */}
        <header className="bg-sky-500 p-4 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🕵️‍♂️</span>
            <span className="font-black text-xl tracking-tight">Snack Hunter</span>
          </div>
          {roomPin && (
            <span className="bg-white/20 text-white font-mono px-3 py-1 rounded-full font-bold text-sm">
              PIN: {roomPin}
            </span>
          )}
        </header>

        {/* SCREEN 1: ล็อกอินเข้าร่วมห้อง */}
        {screen === 'login' && (
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* แนะนำมาสคอตคู่หู */}
              <div className="text-center">
                <h2 className="text-2xl font-black text-sky-600 mb-1">ยินดีต้อนรับนักสืบจิ๋ว!</h2>
                <p className="text-xs text-gray-500">พิมพ์รหัสเพื่อเริ่มออกปฏิบัติภารกิจในโรงเรียน</p>
              </div>

              {/* เลือกตัวละครคู่หู */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2 text-center">เลือกการ์ตูนคู่หูนำโชคประจำตัว 💖</label>
                <div className="flex justify-center gap-3">
                  {MASCOTS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMascot(m)}
                      className={`p-3 rounded-2xl border-4 transition-all flex flex-col items-center w-24 ${
                        selectedMascot.id === m.id 
                          ? 'border-sky-500 bg-sky-50 transform scale-110 shadow-md' 
                          : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-4xl mb-1">{m.avatar}</span>
                      <span className="text-xs font-bold text-gray-700 truncate w-full text-center">{m.id.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
                {/* อธิบายความเจ๋งของคู่หู */}
                <div className="bg-sky-50 p-3 rounded-xl border border-sky-100 mt-4 text-center">
                  <p className="text-xs font-bold text-sky-700 mb-1">✨ {selectedMascot.name}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{selectedMascot.description}</p>
                </div>
              </div>

              {/* ฟอร์มกรอกชื่อและรหัสห้อง */}
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center">
                    <Key className="w-3.5 h-3.5 mr-1" /> รหัสห้องเรียน 6 หลัก (PIN)
                  </label>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    maxLength="6"
                    required
                    placeholder="ป้อนรหัสห้องที่คุณครูเปิด"
                    value={roomPin}
                    onChange={(e) => setRoomPin(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl font-mono text-center text-xl font-black focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" /> ชื่อเล่นของคุณหนูๆ
                  </label>
                  <input
                    type="text"
                    maxLength="12"
                    required
                    placeholder="เช่น น้องนนท์"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-center text-md font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl active:translate-y-0.5 transition-all flex justify-center items-center"
                >
                  ออกล่าขนมกันเลย! <ArrowRight className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SCREEN 2: หน้าห้องล็อบบี้รอคุณครูเริ่มเกม */}
        {screen === 'lobby' && roomData && (
          <div className="flex-1 p-6 flex flex-col justify-between items-center text-center">
            <div className="space-y-6 w-full">
              <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 flex items-center justify-between">
                <span className="text-sm font-bold text-sky-700">ชื่อครูผู้สอน:</span>
                <span className="font-extrabold text-sky-800 text-md">{roomData.teacherName}</span>
              </div>

              {/* การ์ตูนคู่หูดุ๊กดิ๊ก */}
              <div className="py-6 flex flex-col items-center">
                {selectedMascot.svg('happy')}
                <h3 className="text-lg font-black text-slate-700 mt-4">เตรียมพร้อมค้นหาโภชนาการ!</h3>
                <p className="text-sm text-gray-500 mt-1">คู่หู {selectedMascot.name} พร้อมช่วยสแกนแล้วจ้า</p>
              </div>

              {/* แถบรอสัญญาณเริ่มเกม */}
              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-2xl flex flex-col items-center space-y-2">
                <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-yellow-800 text-sm">กำลังยืนหยัดรอคุณครูโบกธงเปิดสัญญาณเกม...</p>
                <p className="text-xs text-yellow-600">เมื่อคุณครูกดเริ่มเกม หน้าจอจะพาไปลุยอัตโนมัติครับ</p>
              </div>
            </div>
            
            {/* รายชื่อและตัวละครของเรา */}
            <div className="w-full bg-gray-50 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">{selectedMascot.avatar}</span>
                <span className="font-extrabold text-gray-700">{playerName}</span>
              </div>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-500 font-bold">สเตตัส: ลงทะเบียนสำเร็จ</span>
            </div>
          </div>
        )}

        {/* SCREEN 3: หน้ากระดานแข่งขันของนักเรียน (Core Loop) */}
        {screen === 'playing' && playerData && (
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* แดชบอร์ดตัวละครผู้เล่น */}
              <div className={`bg-gradient-to-br ${selectedMascot.color} p-5 rounded-3xl text-white shadow-lg relative overflow-hidden`}>
                <div className="absolute top-0 right-0 opacity-10 font-bold text-8xl mr-[-20px] mt-[-20px] pointer-events-none">
                  {selectedMascot.avatar}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2 rounded-2xl shadow-inner w-16 h-16 flex items-center justify-center">
                    {selectedMascot.svg('happy')}
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{playerName}</h3>
                    <p className="text-xs opacity-90 font-medium">คู่หูติดตัว: {selectedMascot.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                    <span className="text-xs opacity-80 block font-semibold">ประสบการณ์สะสม</span>
                    <span className="text-2xl font-black flex items-center">
                      <Star className="w-5 h-5 fill-current text-yellow-300 mr-1" /> {playerData.exp || 0} EXP
                    </span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                    <span className="text-xs opacity-80 block font-semibold">เหรียญสะสม</span>
                    <span className="text-2xl font-black flex items-center">
                      🪙 {playerData.coins || 0} Coins
                    </span>
                  </div>
                </div>
              </div>

              {/* แถบปุ่มเริ่มปฏิบัติภารกิจสแกนเนอร์ */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-1">เครื่องตรวจวิเคราะห์อาหารพกพา</p>
                  <h4 className="text-md font-bold text-gray-700">สแกนซองขนมเพื่อวิเคราะห์เกรด</h4>
                </div>

                {/* ปุ่มควบคุมจำลองและสแกนเนอร์ */}
                <div className="bg-sky-50 p-4 rounded-3xl border-2 border-sky-100 space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ป้อนรหัสบาร์โค้ดสากล..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className="flex-1 p-3 border rounded-xl text-center font-bold text-gray-700 focus:outline-none focus:border-sky-500 shadow-inner"
                    />
                    <button
                      onClick={() => handleScanSnack(barcodeInput)}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-4 py-3 rounded-xl shadow-md transition-all flex items-center"
                    >
                      <ScanLine className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {scanError && (
                    <div className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded-lg flex items-center border border-red-200">
                      <AlertTriangle className="w-4 h-4 mr-1 text-red-500 flex-shrink-0" />
                      {scanError}
                    </div>
                  )}

                  {/* เมนูลัดทดสอบเร็ว ดึงข้อมูลขนมจริงจากฐานข้อมูลครู */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2">💡 ตารางขนมรอบตัว (กดจำลองสแกนรวดเร็ว):</label>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {databaseSnacks.map(s => (
                        <button
                          key={s.barcode}
                          onClick={() => {
                            setBarcodeInput(s.barcode);
                            handleScanSnack(s.barcode);
                          }}
                          className="bg-white border border-gray-200 hover:border-sky-300 hover:bg-sky-50 text-xs px-2.5 py-1.5 rounded-lg font-bold text-gray-700 shadow-sm transition-colors"
                        >
                          🍬 {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* รายการของที่สแกนไปแล้ว */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400">📊 บันทึกประวัติการสแกนรอบนี้ ({playerData.scannedBarcodes?.length || 0} ชนิด)</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {(playerData.scannedBarcodes || []).map(b => {
                    const snk = databaseSnacks.find(x => x.barcode === b);
                    return (
                      <div key={b} className="bg-white border p-2.5 rounded-xl flex-shrink-0 text-center w-24 shadow-sm">
                        <span className="text-xl block">🍪</span>
                        <span className="text-xs font-bold text-gray-700 block truncate">{snk ? snk.name : b}</span>
                        <span className="text-[10px] text-green-500 font-bold">สแกนแล้ว ✓</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SCREEN 4: แสดงผลลัพธ์การประเมินดาว และเปิด VDO แอนิเมชัน */}
        {screen === 'result' && scannedSnack && (
          <div className="flex-1 p-6 flex flex-col justify-between relative overflow-y-auto max-h-[85vh]">
            <div className="space-y-5">
              
              {/* แถบตัวมาสคอตคู่หูแสดงท่าทาง */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  {selectedMascot.svg(getHealthStatus((getStars(scannedSnack.nutrition?.sugar, 'sugar') + getStars(scannedSnack.nutrition?.sodium, 'sodium') + getStars(scannedSnack.nutrition?.fat, 'fat')) / 3).mascotState)}
                </div>
                <h3 className="text-2xl font-black text-gray-800">{scannedSnack.name}</h3>
                <span className="text-xs text-gray-400 font-mono">รหัสสินค้า: {scannedSnack.barcode}</span>
              </div>

              {/* โซนคะแนนและสีสุขภาพแบบ 5 ดาว */}
              {(() => {
                const sugarStars = getStars(scannedSnack.nutrition?.sugar, 'sugar');
                const sodiumStars = getStars(scannedSnack.nutrition?.sodium, 'sodium');
                const fatStars = getStars(scannedSnack.nutrition?.fat, 'fat');
                const starsAvg = Number(((sugarStars + sodiumStars + fatStars) / 3).toFixed(2));
                const status = getHealthStatus(starsAvg);

                return (
                  <div className="space-y-4">
                    {/* การจัดเกรดรวม */}
                    <div className={`p-4 rounded-2xl border-2 ${status.bg} text-center space-y-2`}>
                      <span className={`text-xl font-black uppercase tracking-wider ${status.text}`}>{status.name}</span>
                      <div className="flex justify-center text-yellow-400 text-xl font-black">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-6 h-6 ${i < Math.round(starsAvg) ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-gray-500">{status.desc}</p>
                    </div>

                    {/* รายละเอียดดาว 3 สารอาหารหลัก */}
                    <div className="bg-gray-50 p-4 rounded-2xl border space-y-3 shadow-inner">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-600">🍬 ปริมาณน้ำตาล ({scannedSnack.nutrition?.sugar} กรัม):</span>
                        <span className="text-yellow-500">{"★".repeat(sugarStars)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-600">🧂 ปริมาณโซเดียม ({scannedSnack.nutrition?.sodium} มก.):</span>
                        <span className="text-yellow-500">{"★".repeat(sodiumStars)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-600">🥩 ปริมาณไขมัน ({scannedSnack.nutrition?.fat} กรัม):</span>
                        <span className="text-yellow-500">{"★".repeat(fatStars)}</span>
                      </div>
                    </div>

                    {/* ปุ่มเปิดวิดีโอแอนิเมชันน่ารักๆ */}
                    {scannedSnack.vdoUrl && (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold py-3.5 rounded-2xl shadow-md flex justify-center items-center gap-2 transition-all active:scale-95"
                      >
                        <Film className="w-5 h-5 animate-pulse" /> กดดู VDO แอนิเมชันการ์ตูนน้า! 🎬
                      </button>
                    )}

                    {/* ตารางของรางวัล */}
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-orange-700 block uppercase">รางวัลที่จะได้รับ</span>
                        <span className="text-2xl font-black text-orange-600 flex items-center">
                          +{scannedSnack.expReward} EXP
                        </span>
                      </div>
                      <span className="text-4xl">🎁</span>
                    </div>
                  </div>
                );
              })()}

              {/* ปุ่มยอมรับคะแนน / ยกเลิก */}
              <div className="flex gap-2">
                <button
                  onClick={() => setScreen('playing')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3.5 rounded-xl transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={claimRewards}
                  className="flex-[2] bg-green-500 hover:bg-green-600 text-white font-black py-3.5 rounded-xl shadow-lg shadow-green-100 flex justify-center items-center gap-1.5 transition-all active:scale-95"
                >
                  <CheckCircle className="w-5 h-5" /> บันทึกการสำรวจ!
                </button>
              </div>

            </div>
          </div>
        )}

        {/* SCREEN 5: จบเกมโดยคุณครู (Game Over) */}
        {screen === 'gameover' && playerData && (
          <div className="flex-1 p-6 flex flex-col justify-between items-center text-center">
            <div className="space-y-6 w-full">
              <div className="flex justify-center">
                <Trophy className="text-yellow-400 w-20 h-20 animate-bounce" />
              </div>
              <h2 className="text-3xl font-black text-slate-700">การสำรวจเสร็จสมบูรณ์!</h2>
              <p className="text-sm text-gray-500">คุณครูได้สั่งสิ้นสุดภารกิจของวันนี้เรียบร้อยครับ</p>

              {/* สรุปคะแนนสุดท้าย */}
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300 p-6 rounded-3xl space-y-4">
                <p className="font-extrabold text-yellow-800 text-lg">📊 ผลงานของคุณหนู {playerName}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <span className="text-xs text-gray-400 block font-bold">คะแนน EXP</span>
                    <span className="text-2xl font-black text-orange-500">{playerData.exp || 0}</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <span className="text-xs text-gray-400 block font-bold">จำนวนห่อที่พบ</span>
                    <span className="text-2xl font-black text-sky-500">{(playerData.scannedBarcodes || []).length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-sky-50 border p-4 rounded-2xl">
                <p className="text-xs text-gray-500 leading-relaxed font-bold">
                  🌟 อย่าลืมล้อมวงไปดูหน้าจอของคุณครูเพื่อร่วมยินดีกับเพื่อนๆ ที่ได้อันดับ Top 5 ของวันนี้นะคร้าบ!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setRoomPin('');
                setPlayerName('');
                setScreen('login');
              }}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-extrabold py-4 rounded-xl shadow-md transition-all mt-4"
            >
              ออกเพื่อเริ่มใหม่
            </button>
          </div>
        )}

      </div>

      {/* 🎬 ป๊อปอัพตัวเล่น VDO แอนิเมชันคุณหนูๆ (แววตาระยิบระยับ) */}
      {showVideo && scannedSnack && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg relative border-4 border-blue-400">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-full z-50 hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 bg-blue-500 text-white font-bold text-center">
              🎬 การ์ตูนคู่หูแอนิเมชันโภชนาการ: {scannedSnack.name}
            </div>
            <div className="aspect-video w-full bg-black">
              {scannedSnack.vdoUrl ? (
                <iframe
                  className="w-full h-full"
                  src={getEmbedVideoUrl(scannedSnack.vdoUrl)}
                  title="Cartoon Animation Playback"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="h-full flex items-center justify-center text-white/50 text-sm">
                  ไม่มีข้อมูลวิดีโอแอนิเมชันสำหรับรายการนี้
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 text-xs text-gray-500 font-bold text-center">
              * เรียนรู้โภชนาการผ่านวิดีโออนิเมชันแสนสนุก
            </div>
          </div>
        </div>
      )}

    </div>
  );
}