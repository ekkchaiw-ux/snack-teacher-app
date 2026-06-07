import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Users, Play, Square, Trophy, Crown, Shield, Star, Medal, QrCode, AlertCircle, ChevronRight, Zap, Camera, Clock, Hourglass, Award } from 'lucide-react';

// ----------------------------------------------------------------------
// 1. Firebase Initialization
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// 1. Firebase Initialization
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
const appId = "test-snack-hunter"; // ใช้ชื่อโปรเจกต์คุณอ้างอิงได้เลยครับ

// ----------------------------------------------------------------------
// 2. ระบบคำนวณแรงค์ (Rank System)
// ----------------------------------------------------------------------
const getRankInfo = (exp, index) => {
  if (exp >= 1000 && index < 50) return { name: "Glorious Ruler", color: "text-rose-600", bg: "bg-rose-100", icon: <Crown size={20} className="text-rose-600 fill-current" /> };
  if (exp >= 800) return { name: "Master", color: "text-purple-600", bg: "bg-purple-100", icon: <Crown size={20} className="text-purple-600" /> };
  if (exp >= 600) return { name: "Conqueror", color: "text-red-500", bg: "bg-red-100", icon: <Shield size={20} className="text-red-500" /> };
  if (exp >= 450) return { name: "Commander", color: "text-indigo-500", bg: "bg-indigo-100", icon: <Star size={20} className="text-indigo-500" /> };
  if (exp >= 300) return { name: "Diamond", color: "text-cyan-500", bg: "bg-cyan-100", icon: <Medal size={20} className="text-cyan-500" /> };
  if (exp >= 200) return { name: "Platinum", color: "text-teal-500", bg: "bg-teal-100", icon: <Trophy size={20} className="text-teal-500" /> };
  if (exp >= 100) return { name: "Gold", color: "text-yellow-600", bg: "bg-yellow-100", icon: <Crown size={20} className="text-yellow-500" /> };
  if (exp >= 50) return { name: "Silver", color: "text-gray-500", bg: "bg-gray-200", icon: <Shield size={20} className="text-gray-500" /> };
  return { name: "Bronze", color: "text-orange-700", bg: "bg-orange-100", icon: <Star size={20} className="text-orange-700" /> };
};

// ----------------------------------------------------------------------
// คอมโพเนนต์เสริม: เอฟเฟกต์ริบบิ้นโปรยปราย (Continuous Ribbons)
// ----------------------------------------------------------------------
const Confetti = () => {
  useEffect(() => {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];

    // สร้างริบบิ้น 200 ชิ้น
    for (let i = 0; i < 200; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 8 + 4,   // ความกว้างของริบบิ้น
        h: Math.random() * 30 + 15, // ความยาวให้ดูเหมือนริบบิ้น
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

        // วนริบบิ้นกลับไปเริ่มตกใหม่จากด้านบนสุด เพื่อให้โปรยตลอดเวลา
        if (p.y > canvas.height + p.h) {
          p.x = Math.random() * canvas.width;
          p.y = -50; 
          p.tiltAngle = 0;
        }

        // วาดริบบิ้นให้พริ้วไหว
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.tiltAngle);
        ctx.fillStyle = p.color;
        // ทำมุมโค้งมนนิดๆ ให้ริบบิ้นดูสมจริง
        ctx.beginPath();
        ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 4);
        ctx.fill();
        ctx.restore();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    // ปรับขนาด Canvas อัตโนมัติเมื่อย่อ/ขยายหน้าจอ
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas id="confetti-canvas" className="absolute inset-0 pointer-events-none z-0 w-full h-full"></canvas>;
};

// ----------------------------------------------------------------------
// 3. Component หลัก: Teacher Dashboard
// ----------------------------------------------------------------------
export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [teacherName, setTeacherName] = useState('');
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // เพิ่ม State สำหรับโหมดจับเวลา
  const [timeLimit, setTimeLimit] = useState(0); // 0 = ไม่จำกัด, 3, 5, 10
  const [timeLeft, setTimeLeft] = useState(null);

  // การเชื่อมต่อ Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error:", err);
        setErrorMsg("ไม่สามารถเชื่อมต่อระบบยืนยันตัวตนได้");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ดึงข้อมูลห้องเรียนแบบ Real-time
  useEffect(() => {
    if (!user || !room?.id) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', room.id);
    const unsubRoom = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        setRoom({ id: docSnap.id, ...docSnap.data() });
      }
    }, (err) => console.error("Room listener error", err));

    return () => unsubRoom();
  }, [user, room?.id]);

  // ดึงข้อมูลนักเรียนทั้งหมดและกรองเฉพาะคนที่อยู่ในห้องนี้แบบ Real-time
  useEffect(() => {
    if (!user || !room?.id) return;
    const playersRef = collection(db, 'artifacts', appId, 'public', 'data', 'players');
    const unsubPlayers = onSnapshot(playersRef, (snapshot) => {
      const allPlayers = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.roomId === room.id) {
          allPlayers.push({ id: doc.id, ...data });
        }
      });
      // จัดเรียงคะแนน (Leaderboard) จากมากไปน้อย
      allPlayers.sort((a, b) => b.exp - a.exp);
      setPlayers(allPlayers);
    }, (err) => console.error("Players listener error", err));

    return () => unsubPlayers();
  }, [user, room?.id]);

  // ระบบนับถอยหลัง (Timer)
  useEffect(() => {
    let interval;
    if (room?.status === 'playing' && room?.duration > 0 && room?.startedAt) {
      interval = setInterval(() => {
        const endTime = room.startedAt + (room.duration * 60 * 1000);
        const remaining = Math.max(0, endTime - Date.now());
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          changeGameStatus('ended'); // หมดเวลา จบเกมอัตโนมัติ
        }
      }, 1000);
    } else {
      setTimeLeft(null);
    }
    return () => clearInterval(interval);
  }, [room?.status, room?.duration, room?.startedAt]);

  // ระบบเล่นเสียงประกาศรางวัลเมื่อจบเกม
  useEffect(() => {
    if (room?.status === 'ended') {
      // เล่นเสียง Fanfare ทันทีที่เปลี่ยนสถานะเป็น Ended
      const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=success-fanfare-trumpets-6185.mp3');
      audio.volume = 0.6;
      audio.play().catch(e => console.log('ระบบบราวเซอร์ป้องกันการเล่นเสียงอัตโนมัติ:', e));
    }
  }, [room?.status]);

  // สร้างห้องใหม่
  const createRoom = async () => {
    if (!teacherName.trim()) {
      setErrorMsg('กรุณาใส่ชื่อคุณครูก่อนสร้างห้องครับ!');
      return;
    }
    if (!user) return;
    
    setErrorMsg('');
    const newPin = Math.floor(100000 + Math.random() * 900000).toString(); // สุ่ม PIN 6 หลัก
    
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', newPin);
      const roomData = {
        teacherName: teacherName,
        status: 'waiting',
        createdAt: new Date().toISOString(),
        pin: newPin,
        duration: timeLimit // เพิ่มการตั้งค่าเวลาเข้าสู่ Database
      };
      await setDoc(roomRef, roomData);
      setRoom({ id: newPin, ...roomData });
    } catch (err) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการสร้างห้อง');
    }
  };

  // เปลี่ยนสถานะเกม
  const changeGameStatus = async (newStatus) => {
    if (!room?.id) return;
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', room.id);
      const updates = { status: newStatus };
      
      // ถ้ากดเริ่มเกม ให้บันทึกเวลาที่เริ่มเพื่อใช้คำนวณการจับเวลา
      if (newStatus === 'playing') {
        updates.startedAt = Date.now();
      }
      
      await updateDoc(roomRef, updates);
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------------------------
  // [DEV TOOLS] ฟังก์ชันจำลองสำหรับทดสอบโดยไม่ต้องใช้แอปเด็ก
  // ----------------------------------------------------------------------
  const simulateJoin = async () => {
    if (!room?.id) return;
    const mockNames = ["ด.ช.มานะ", "ด.ญ.มานี", "ด.ช.ปิติ", "ด.ญ.ชูใจ", "ด.ช.สมคิด", "ด.ญ.สมศรี"];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)] + " " + Math.floor(Math.random() * 99);
    const playerId = `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    try {
      const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', playerId);
      await setDoc(playerRef, {
        roomId: room.id,
        name: randomName,
        exp: 0,
        coins: 0,
        joinedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Mock Join Error:", err);
    }
  };

  const simulateScore = async () => {
    if (players.length === 0) return;
    // สุ่มนักเรียน 1 คนให้ได้คะแนน (จำลองการสแกนเจอขนมดี)
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    const expGained = Math.floor(Math.random() * 50) + 10; // ได้ EXP 10-60
    
    try {
      const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', randomPlayer.id);
      await updateDoc(playerRef, {
        exp: randomPlayer.exp + expGained,
        coins: randomPlayer.coins + Math.floor(expGained / 5)
      });
    } catch (err) {
      console.error("Mock Score Error:", err);
    }
  };

  // ----------------------------------------------------------------------
  // UI RENDERERS
  // ----------------------------------------------------------------------
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-orange-50 font-sans text-orange-600">กำลังเชื่อมต่อฐานข้อมูล...</div>;

  // เพิ่ม CSS สำหรับแอนิเมชันตอนจบ
  const customStyles = `
    @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .anim-podium-1 { animation: slideUp 0.8s ease-out 0.2s both; }
    .anim-podium-2 { animation: slideUp 0.8s ease-out 0.5s both; }
    .anim-podium-3 { animation: slideUp 0.8s ease-out 0.8s both; }
    .anim-fade { animation: fadeIn 1s ease-out 1.2s both; }
  `;

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-800 p-4 md:p-8">
      <style>{customStyles}</style>
      <div className="max-w-4xl mx-auto space-y-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <Camera className="text-orange-500 w-10 h-10 animate-bounce" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500 tracking-tight">
            Snack Hunter <span className="text-xl md:text-2xl text-gray-500 font-normal ml-2">| ระบบคุณครู</span>
          </h1>
        </div>

        {/* แสดงข้อความแจ้งเตือน */}
        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl flex items-center shadow-sm">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errorMsg}
          </div>
        )}

        {/* SCREEN 1: สร้างห้อง (ถ้ายังไม่มีห้อง) */}
        {!room && (
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md mx-auto text-center border-t-8 border-orange-400">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">เตรียมพร้อมการสำรวจ!</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-left text-sm font-semibold text-gray-600 mb-1">ชื่อคุณครูผู้คุมสอบ</label>
                <input 
                  type="text" 
                  placeholder="เช่น ครูใจดี"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 text-lg transition-all"
                />
              </div>

              {/* ส่วนเลือกเวลา */}
              <div className="text-left mt-4 mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center">
                  <Hourglass className="w-4 h-4 mr-1 text-orange-500" /> โหมดเวลาการสำรวจ
                </label>
                <div className="flex gap-2">
                  {[0, 3, 5, 10].map(t => (
                    <button
                      key={t}
                      onClick={() => setTimeLimit(t)}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                        timeLimit === t 
                          ? 'border-orange-500 bg-orange-100 text-orange-700 shadow-sm transform scale-105' 
                          : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {t === 0 ? 'ไม่จำกัด' : `${t} นาที`}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={createRoom}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex justify-center items-center"
              >
                <Zap className="mr-2" /> สร้างห้องเกมเลย!
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2 & 3: ล็อบบี้และขณะเล่นเกม */}
        {room && (
          <div className="space-y-6">
            
            {/* Control Panel (ด้านบน) */}
            <div className="bg-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-center border-l-8 border-orange-500">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">ห้องเรียนของ {room.teacherName}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-mono text-3xl font-black tracking-widest border-2 border-orange-200">
                    {room.pin}
                  </div>
                  {room.status === 'waiting' && (
                    <span className="animate-pulse bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Users className="w-4 h-4 mr-1" /> รอเด็กๆ เข้าห้อง
                    </span>
                  )}
                  {room.status === 'playing' && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Play className="w-4 h-4 mr-1" /> กำลังแข่งขัน!
                    </span>
                  )}
                  {/* แสดงเวลานับถอยหลัง */}
                  {room.status === 'playing' && room.duration > 0 && timeLeft !== null && (
                    <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center font-mono border shadow-sm
                      ${timeLeft <= 60000 ? 'bg-red-100 text-red-600 border-red-300 animate-pulse' : 'bg-orange-100 text-orange-700 border-orange-300'}
                    `}>
                      <Clock className="w-4 h-4 mr-1" /> 
                      {Math.floor(timeLeft / 60000).toString().padStart(2, '0')}:
                      {Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0')}
                    </span>
                  )}
                  {room.status === 'ended' && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Square className="w-4 h-4 mr-1" /> จบเกมแล้ว
                    </span>
                  )}
                </div>
              </div>

              {/* ปุ่มควบคุมเกมของครู */}
              <div className="flex space-x-3">
                {room.status === 'waiting' && (
                  <button 
                    onClick={() => changeGameStatus('playing')}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-md transition-all"
                  >
                    <Play className="mr-2 w-5 h-5" /> เริ่มเกม!
                  </button>
                )}
                {room.status === 'playing' && (
                  <button 
                    onClick={() => changeGameStatus('ended')}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-md transition-all"
                  >
                    <Square className="mr-2 w-5 h-5" /> จบเกมและสรุปผล
                  </button>
                )}
                {room.status === 'ended' && (
                  <button 
                    onClick={() => { setRoom(null); setPlayers([]); }}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-md transition-all"
                  >
                    สร้างห้องใหม่
                  </button>
                )}
              </div>
            </div>

            {/* ส่วนแสดงกระดานคะแนน หรือ แท่นรับรางวัล (Podium) */}
            <div className="w-full">
              {room.status === 'ended' ? (
                /* หน้าจอสรุปผลรางวัลตอนจบเกม (Winners Podium) */
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-400 relative">
                  <Confetti />
                  
                  <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-8 text-center relative z-10">
                    <h2 className="text-4xl font-extrabold text-white mb-2 drop-shadow-md animate-bounce">
                      🎉 สรุปผลการแข่งขัน! 🎉
                    </h2>
                    <p className="text-yellow-100 font-medium text-lg">
                      ขอแสดงความยินดีกับสุดยอดนักสืบโภชนาการ
                    </p>
                  </div>

                  <div className="p-6 md:p-10 bg-gradient-to-b from-orange-50 to-white relative z-10 min-h-[400px]">
                    {players.length === 0 ? (
                      <p className="text-center text-gray-500">ไม่มีผู้เล่นในรอบนี้</p>
                    ) : (
                      <div className="max-w-2xl mx-auto">
                        
                        {/* แท่นรับรางวัล Top 3 */}
                        <div className="flex justify-center items-end h-64 gap-2 md:gap-6 mb-12">
                          
                          {/* อันดับ 2 (ซ้าย) */}
                          {players[1] && (
                            <div className="flex flex-col items-center w-1/3 anim-podium-2">
                              <div className="text-center mb-2">
                                <p className="font-bold text-gray-700 truncate w-full px-2 text-sm md:text-base">{players[1].name}</p>
                                <p className="text-sm text-orange-500 font-bold bg-white/80 px-2 rounded-full inline-block">{players[1].exp} EXP</p>
                              </div>
                              <div className="w-full bg-gradient-to-t from-gray-400 to-gray-200 h-32 rounded-t-xl border-t-4 border-gray-300 shadow-lg flex justify-center pt-4 relative">
                                <div className="absolute -top-6 bg-gray-200 rounded-full p-2 border-4 border-white shadow-md">
                                  <Medal className="text-gray-500 w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <span className="text-4xl font-black text-gray-500/50">2</span>
                              </div>
                            </div>
                          )}

                          {/* อันดับ 1 (ตรงกลาง) */}
                          {players[0] && (
                            <div className="flex flex-col items-center w-1/3 anim-podium-1 z-10">
                              <div className="text-center mb-2">
                                <Crown className="text-yellow-500 w-8 h-8 md:w-10 md:h-10 mx-auto animate-pulse mb-1" />
                                <p className="font-extrabold text-base md:text-lg text-yellow-700 truncate w-full px-1">{players[0].name}</p>
                                <p className="text-md text-orange-600 font-black bg-white/80 px-3 rounded-full inline-block shadow-sm">{players[0].exp} EXP</p>
                              </div>
                              <div className="w-full bg-gradient-to-t from-yellow-500 to-yellow-300 h-44 rounded-t-xl border-t-4 border-yellow-200 shadow-2xl flex justify-center pt-4 relative transform md:scale-110">
                                <div className="absolute -top-8 bg-yellow-100 rounded-full p-3 border-4 border-white shadow-lg">
                                  <Trophy className="text-yellow-500 w-8 h-8 md:w-10 md:h-10" />
                                </div>
                                <span className="text-5xl font-black text-yellow-600/50 mt-2">1</span>
                              </div>
                            </div>
                          )}

                          {/* อันดับ 3 (ขวา) */}
                          {players[2] && (
                            <div className="flex flex-col items-center w-1/3 anim-podium-3">
                              <div className="text-center mb-2">
                                <p className="font-bold text-gray-700 truncate w-full px-2 text-sm md:text-base">{players[2].name}</p>
                                <p className="text-sm text-orange-500 font-bold bg-white/80 px-2 rounded-full inline-block">{players[2].exp} EXP</p>
                              </div>
                              <div className="w-full bg-gradient-to-t from-orange-700 to-orange-400 h-24 rounded-t-xl border-t-4 border-orange-300 shadow-lg flex justify-center pt-4 relative">
                                <div className="absolute -top-6 bg-orange-100 rounded-full p-2 border-4 border-white shadow-md">
                                  <Award className="text-orange-700 w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <span className="text-4xl font-black text-orange-800/50">3</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* อันดับ 4 และ 5 */}
                        {(players[3] || players[4]) && (
                          <div className="space-y-3 mt-8 anim-fade">
                            <h4 className="text-center text-gray-400 font-bold mb-4">🏆 อันดับรองชนะเลิศ</h4>
                            {[players[3], players[4]].map((p, index) => {
                              if (!p) return null;
                              return (
                                <div key={p.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                  <div className="flex items-center space-x-4">
                                    <div className="bg-gray-100 text-gray-500 font-bold w-8 h-8 rounded-full flex justify-center items-center">
                                      {index + 4}
                                    </div>
                                    <p className="font-bold text-gray-700">{p.name}</p>
                                  </div>
                                  <p className="text-orange-500 font-bold">{p.exp} EXP</p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="bg-gray-50 border-b border-gray-100 p-4 md:p-6 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <Trophy className="text-yellow-500 mr-2" /> Live Leaderboard
                    </h3>
                    <span className="text-gray-500 font-semibold bg-white px-3 py-1 rounded-lg border">
                      ผู้เล่น: {players.length} คน
                    </span>
                  </div>
                  
                  <div className="p-4 md:p-6 min-h-[300px]">
                    {players.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                        <QrCode className="w-20 h-20 mb-4 opacity-50" />
                        <p className="text-lg">ให้นักเรียนสแกน QR Code เข้ามาได้เลย!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {players.map((p, index) => {
                          const rankInfo = getRankInfo(p.exp, index);
                          const isTop3 = index < 3 && room.status !== 'waiting';
                          
                          return (
                            <div 
                              key={p.id} 
                              className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-500
                                ${isTop3 ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 shadow-md transform hover:scale-[1.01]' : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'}
                              `}
                            >
                              <div className="flex items-center space-x-4">
                                {/* อันดับ */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                  ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-lg scale-110' : 
                                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md' : 
                                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
                                >
                                  {index + 1}
                                </div>
                                
                                <div>
                                  <p className={`font-bold text-lg ${index === 0 ? 'text-yellow-700' : 'text-gray-800'}`}>{p.name}</p>
                                  {/* ป้าย Rank */}
                                  <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${rankInfo.bg} ${rankInfo.color} mt-1 border border-white/50 shadow-sm`}>
                                    {rankInfo.icon}
                                    <span className="ml-1">{rankInfo.name}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* คะแนน */}
                              <div className="text-right">
                                <p className="text-2xl font-black text-orange-500 flex items-center justify-end">
                                  {p.exp} <span className="text-sm font-normal text-gray-400 ml-1">EXP</span>
                                </p>
                                <p className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">🪙 {p.coins} เหรียญ</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* DEV TOOLS (เครื่องมือจำลองการเล่น สำหรับทดสอบ) */}
            {/* ----------------------------------------------------------------- */}
            <div className="mt-12 border-t-2 border-dashed border-gray-300 pt-6">
              <div className="bg-gray-800 rounded-2xl p-4 text-white shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-500 text-xs font-black px-3 py-1 text-black rounded-bl-lg">
                  DEV TOOLS
                </div>
                <h4 className="font-bold text-sm text-gray-300 mb-3 flex items-center">
                  <ChevronRight className="w-4 h-4 mr-1" /> จำลองการทำงาน (ไม่ต้องใช้แอปเด็ก)
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={simulateJoin}
                    disabled={room.status === 'ended'}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    + จำลองนักเรียนเข้าห้อง
                  </button>
                  <button 
                    onClick={simulateScore}
                    disabled={room.status !== 'playing' || players.length === 0}
                    className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    ⭐ จำลองการสแกนได้คะแนน
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  * ลองกด "จำลองนักเรียนเข้าห้อง" 3-4 คน จากนั้นกดปุ่ม "เริ่มเกม!" ด้านบน แล้วสแปมกด "จำลองการสแกนได้คะแนน" รัวๆ เพื่อดู Leaderboard สลับอันดับและ Rank เปลี่ยนสีแบบ Real-time ครับ
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}