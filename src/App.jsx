import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { Users, Play, Square, Trophy, Crown, Shield, Star, Medal, QrCode, AlertCircle, ChevronRight, Zap, Camera, Clock, Hourglass, Award, Database, Plus, Trash2, Package, Video, Edit } from 'lucide-react';

// ----------------------------------------------------------------------
// 1. Firebase Initialization (ใช้ค่าของคุณ aekg_ เรียบร้อยแล้ว)
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
// ระบบคำนวณแรงค์ (Rank System)
// ----------------------------------------------------------------------
const getRankInfo = (exp, rankIndex) => {
  if (rankIndex === 0 && exp > 0) return { name: "Champion", color: "text-yellow-600", bg: "bg-yellow-100", icon: <Crown size={20} className="text-yellow-500" /> };
  if (exp >= 100) return { name: "Gold", color: "text-amber-600", bg: "bg-amber-100", icon: <Trophy size={20} className="text-amber-500" /> };
  if (exp >= 50) return { name: "Silver", color: "text-gray-500", bg: "bg-gray-200", icon: <Shield size={20} className="text-gray-500" /> };
  return { name: "Bronze", color: "text-orange-700", bg: "bg-orange-100", icon: <Star size={20} className="text-orange-700" /> };
};

// ----------------------------------------------------------------------
// Component 1: เอฟเฟกต์ริบบิ้นโปรยปราย (Continuous Ribbons)
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

// ----------------------------------------------------------------------
// Component 2: ฐานข้อมูลขนม (Snack Database Manager)
// ----------------------------------------------------------------------
const SnackDatabaseManager = ({ user }) => {
  const [snacks, setSnacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // เพิ่ม State สำหรับเก็บ ID ขนมที่กำลังแก้ไข
  
  // Form State เพิ่มฟิลด์ vdoUrl
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    type: 'snack', // snack, drink, bakery
    calories: '',
    sugar: '',
    sodium: '',
    fat: '',
    vdoUrl: '' 
  });

  // ดึงข้อมูลขนมทั้งหมดจาก Firestore
  useEffect(() => {
    if (!user) return;
    const snacksRef = collection(db, 'artifacts', appId, 'public', 'data', 'snacks');
    const unsub = onSnapshot(snacksRef, (snapshot) => {
      const allSnacks = [];
      snapshot.forEach(doc => allSnacks.push({ id: doc.id, ...doc.data() }));
      setSnacks(allSnacks);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // ฟังก์ชันบันทึกข้อมูลขนม (รองรับทั้งเพิ่มใหม่และแก้ไข)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.barcode || !formData.name) return alert('กรุณากรอกรหัสและชื่อขนมครับ');
    
    // คำนวณรางวัล EXP และ Coin จากความเฮลตี้ (ยิ่งน้ำตาล/โซเดียมน้อย ยิ่งได้คะแนนเยอะ)
    const totalBadStats = Number(formData.sugar || 0) + Number(formData.sodium || 0)/10 + Number(formData.fat || 0);
    let expReward = 10;
    if (totalBadStats < 15) expReward = 30; // ขนมสุขภาพดีได้ EXP เยอะ
    else if (totalBadStats < 30) expReward = 20;

    const snackData = {
      barcode: formData.barcode,
      name: formData.name,
      type: formData.type,
      vdoUrl: formData.vdoUrl,
      nutrition: {
        calories: Number(formData.calories || 0),
        sugar: Number(formData.sugar || 0),
        sodium: Number(formData.sodium || 0),
        fat: Number(formData.fat || 0),
      },
      expReward: expReward,
      coinReward: Math.floor(expReward / 2)
    };

    try {
      if (editingId) {
        // โหมดแก้ไข: อัปเดตข้อมูลเดิมใน Firebase
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'snacks', editingId), snackData);
        setEditingId(null);
      } else {
        // โหมดเพิ่มใหม่: สร้างข้อมูลใหม่ใน Firebase
        snackData.createdAt = new Date().toISOString();
        const snacksRef = collection(db, 'artifacts', appId, 'public', 'data', 'snacks');
        await addDoc(snacksRef, snackData);
      }
      
      // ล้างฟอร์ม (รวมถึง vdoUrl ด้วย)
      setFormData({ barcode: '', name: '', type: 'snack', calories: '', sugar: '', sodium: '', fat: '', vdoUrl: '' });
    } catch (err) {
      console.error("Error saving snack:", err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  // ฟังก์ชันดึงข้อมูลมาใส่ฟอร์มเพื่อแก้ไข
  const handleEdit = (snack) => {
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
  };

  // ฟังก์ชันยกเลิกการแก้ไข
  const cancelEdit = () => {
    setFormData({ barcode: '', name: '', type: 'snack', calories: '', sugar: '', sodium: '', fat: '', vdoUrl: '' });
    setEditingId(null);
  };

  // ฟังก์ชันลบขนม
  const handleDelete = async (id) => {
    if(window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลขนมชิ้นนี้?')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'snacks', id));
      } catch (err) {
        console.error("Error deleting snack:", err);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 mt-6 max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Database className="text-blue-500 w-8 h-8 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">แฟ้มข้อมูลขนม (Snack Database)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* คอลัมน์ซ้าย: ฟอร์มเพิ่ม/แก้ไขข้อมูล */}
        <div className={`md:col-span-1 p-6 rounded-2xl border ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-100'}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center ${editingId ? 'text-orange-800' : 'text-blue-800'}`}>
            {editingId ? <><Edit className="w-5 h-5 mr-1" /> แก้ไขข้อมูลขนม</> : <><Plus className="w-5 h-5 mr-1" /> เพิ่มขนมใหม่</>}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">รหัสบาร์โค้ด / QR (สำคัญมาก)</label>
              <input type="text" required placeholder="เช่น 8850123456789" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full p-2 border rounded-lg" />
              <p className="text-xs text-gray-500 mt-1">* ให้นักเรียนกรอกรหัสนี้ตอนสแกน</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อขนม/เครื่องดื่ม</label>
              <input type="text" required placeholder="เช่น เลย์ รสมันฝรั่งแท้" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ประเภท</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded-lg">
                <option value="snack">ขนมขบเคี้ยว</option>
                <option value="drink">เครื่องดื่ม</option>
                <option value="bakery">เบเกอรี่ / ขนมปัง</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ลิงก์ VDO แอนิเมชัน (ถ้ามี)</label>
              <input type="text" placeholder="เช่น https://youtube.com/..." value={formData.vdoUrl} onChange={e => setFormData({...formData, vdoUrl: e.target.value})} className="w-full p-2 border rounded-lg" />
              <p className="text-xs text-gray-500 mt-1">* วิดีโอจะเล่นตอนที่เด็กสแกนเจอขนมชิ้นนี้</p>
            </div>
            
            <div className="pt-4 border-t border-blue-200">
              <label className="block text-sm font-bold text-blue-800 mb-2">ข้อมูลโภชนาการ (ต่อ 1 หน่วยบริโภค)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">พลังงาน (kcal)</label>
                  <input type="number" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">น้ำตาล (กรัม)</label>
                  <input type="number" value={formData.sugar} onChange={e => setFormData({...formData, sugar: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">โซเดียม (มิลลิกรัม)</label>
                  <input type="number" value={formData.sodium} onChange={e => setFormData({...formData, sodium: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">ไขมัน (กรัม)</label>
                  <input type="number" value={formData.fat} onChange={e => setFormData({...formData, fat: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button type="submit" className={`flex-1 font-bold py-3 rounded-xl transition-colors ${editingId ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {editingId ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลขนม'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors border border-gray-300">
                  ยกเลิก
                </button>
              )}
            </div>
          </form>
        </div>

        {/* คอลัมน์ขวา: รายการขนม */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">รายการขนมในระบบ ({snacks.length})</h3>
          </div>
          
          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden h-[500px] overflow-y-auto">
            {loading ? (
              <p className="text-center p-8 text-gray-500">กำลังโหลดข้อมูล...</p>
            ) : snacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Package className="w-16 h-16 mb-2 opacity-50" />
                <p>ยังไม่มีข้อมูลขนมในระบบ</p>
                <p className="text-sm">เพิ่มข้อมูลจากฟอร์มด้านซ้ายได้เลยครับ</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">รหัส/ชื่อ</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">โภชนาการ</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">รางวัล</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {snacks.map((snack) => (
                    <tr key={snack.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-800 flex items-center">
                          {snack.name}
                          {snack.vdoUrl && <Video className="w-4 h-4 ml-1 text-blue-500" title="มี VDO" />}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">ID: {snack.barcode}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        <div>น้ำตาล: <span className={snack.nutrition.sugar > 20 ? 'text-red-500 font-bold' : ''}>{snack.nutrition.sugar}g</span></div>
                        <div>โซเดียม: <span className={snack.nutrition.sodium > 200 ? 'text-red-500 font-bold' : ''}>{snack.nutrition.sodium}mg</span></div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800">
                          {snack.expReward} EXP
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleEdit(snack)} className="text-orange-400 hover:text-orange-600 p-2 mr-1" title="แก้ไขข้อมูล">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(snack.id)} className="text-red-400 hover:text-red-600 p-2" title="ลบข้อมูล">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Component 3: กระดานคุมสอบ (Teacher Dashboard - ของเดิม)
// ----------------------------------------------------------------------
const TeacherDashboard = ({ user }) => {
  const [teacherName, setTeacherName] = useState('');
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLimit, setTimeLimit] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(null);

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
      allPlayers.sort((a, b) => b.exp - a.exp);
      setPlayers(allPlayers);
    });
    return () => unsubPlayers();
  }, [user, room?.id]);

  useEffect(() => {
    let interval;
    if (room?.status === 'playing' && room?.duration > 0 && room?.startedAt) {
      interval = setInterval(() => {
        const endTime = room.startedAt + (room.duration * 60 * 1000);
        const remaining = Math.max(0, endTime - Date.now());
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          changeGameStatus('ended'); 
        }
      }, 1000);
    } else {
      setTimeLeft(null);
    }
    return () => clearInterval(interval);
  }, [room?.status, room?.duration, room?.startedAt]);

  const createRoom = async () => {
    if (!teacherName.trim()) return setErrorMsg('กรุณาใส่ชื่อคุณครูก่อนสร้างห้องครับ!');
    if (!user) return;
    setErrorMsg('');
    const newPin = Math.floor(100000 + Math.random() * 900000).toString(); 
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', newPin);
      const roomData = {
        teacherName: teacherName,
        status: 'waiting',
        createdAt: new Date().toISOString(),
        pin: newPin,
        duration: timeLimit 
      };
      await setDoc(roomRef, roomData);
      setRoom({ id: newPin, ...roomData });
    } catch (err) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการสร้างห้อง');
    }
  };

  const changeGameStatus = async (newStatus) => {
    if (!room?.id) return;
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', room.id);
      const updates = { status: newStatus };
      if (newStatus === 'playing') updates.startedAt = Date.now();
      await updateDoc(roomRef, updates);
      setRoom(prev => ({...prev, status: newStatus}));
    } catch (err) {
      console.error(err);
    }
  };

  // โค้ดสำหรับจำลองข้อมูล
  const simulatePlayerJoin = async () => {
    if (!room?.id) return;
    const dummyNames = ["น้องสมชาย", "น้องสมหญิง", "น้องมานี", "น้องปิติ", "น้องชูใจ", "น้องวีระ", "น้องเพชร"];
    const randomName = dummyNames[Math.floor(Math.random() * dummyNames.length)] + " " + Math.floor(Math.random() * 99);
    const newPlayerId = "dummy_" + Date.now();
    try {
      const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', newPlayerId);
      await setDoc(playerRef, {
        roomId: room.id,
        name: randomName,
        exp: 0,
        coins: 0,
        scannedItems: [],
        joinedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const simulateScoreUpdate = async () => {
    if (players.length === 0) return;
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    const gainedExp = Math.floor(Math.random() * 30) + 10; 
    try {
      const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', randomPlayer.id);
      await updateDoc(playerRef, {
        exp: randomPlayer.exp + gainedExp,
        coins: randomPlayer.coins + Math.floor(gainedExp / 2)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const customStyles = `
    @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .anim-podium-1 { animation: slideUp 0.8s ease-out 0.2s both; }
    .anim-podium-2 { animation: slideUp 0.8s ease-out 0.5s both; }
    .anim-podium-3 { animation: slideUp 0.8s ease-out 0.8s both; }
    .anim-fade { animation: fadeIn 1s ease-out 1.2s both; }
  `;

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative mt-6">
      <style>{customStyles}</style>
      
      {!room ? (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white text-center relative overflow-hidden">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 relative z-10 drop-shadow-md">Snack Hunter</h1>
            <p className="text-orange-100 text-lg relative z-10">ระบบสร้างห้องเรียนนักสืบโภชนาการ</p>
          </div>
          <div className="p-8 md:p-12">
            {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center"><AlertCircle className="w-5 h-5 mr-2" />{errorMsg}</div>}
            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">ชื่อคุณครูผู้คุมสอบ</label>
                <input type="text" placeholder="เช่น ครูใจดี" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 text-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center"><Hourglass className="w-4 h-4 mr-1 text-orange-500" /> โหมดเวลา</label>
                <div className="flex gap-2">
                  {[0, 3, 5, 10].map(t => (
                    <button key={t} onClick={() => setTimeLimit(t)} className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm ${timeLimit === t ? 'border-orange-500 bg-orange-100 text-orange-700' : 'border-gray-200 text-gray-500'}`}>
                      {t === 0 ? 'ไม่จำกัด' : `${t} นาที`}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={createRoom} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg flex justify-center items-center"><Zap className="mr-2" /> สร้างห้องเกมเลย!</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 text-center relative overflow-hidden">
              <p className="text-gray-500 font-semibold mb-1">รหัสเข้าห้อง (PIN)</p>
              <h2 className="text-5xl md:text-6xl font-black text-orange-500 tracking-wider mb-4 drop-shadow-sm">{room.pin}</h2>
              <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-gray-200 mb-4">
                <QrCode className="w-24 h-24 text-gray-800 mb-2" />
                <p className="text-xs text-gray-500 font-medium">สแกนเพื่อเข้าห้อง</p>
              </div>
              {room.status === 'playing' && room.duration > 0 && timeLeft !== null && (
                <div className={`px-4 py-3 rounded-xl text-xl font-bold flex justify-center items-center font-mono border shadow-sm ${timeLeft <= 60000 ? 'bg-red-100 text-red-600 border-red-300 animate-pulse' : 'bg-orange-100 text-orange-700 border-orange-300'}`}>
                  <Clock className="w-5 h-5 mr-2" /> 
                  {Math.floor(timeLeft / 60000).toString().padStart(2, '0')}:{Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0')}
                </div>
              )}
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-3 text-center">ครูควบคุมการเล่น</h3>
              <div className="space-y-3">
                {room.status === 'waiting' && <button onClick={() => changeGameStatus('playing')} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center"><Play className="w-5 h-5 mr-2" /> เริ่มเกมเลย!</button>}
                {room.status === 'playing' && <button onClick={() => changeGameStatus('ended')} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center"><Square className="w-5 h-5 mr-2" /> จบเกมและสรุปผล</button>}
                {room.status === 'ended' && <button onClick={() => window.location.reload()} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center"><Users className="w-5 h-5 mr-2" /> สร้างห้องใหม่</button>}
              </div>
            </div>

            <div className="bg-purple-50 p-5 rounded-3xl shadow-sm border border-purple-200 border-dashed">
              <h3 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-3 text-center">🔧 DEV TOOLS (สำหรับทดสอบ)</h3>
              <div className="space-y-2">
                <button onClick={simulatePlayerJoin} disabled={room.status === 'ended'} className="w-full bg-purple-200 hover:bg-purple-300 text-purple-800 font-semibold py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-50">จำลองนักเรียนเข้าห้อง</button>
                <button onClick={simulateScoreUpdate} disabled={room.status !== 'playing' || players.length === 0} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-50">จำลองนักเรียนได้คะแนน</button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {room.status === 'ended' ? (
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-400 relative">
                <Confetti />
                <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-8 text-center relative z-10">
                  <h2 className="text-4xl font-extrabold text-white mb-2 animate-bounce">🎉 สรุปผลการแข่งขัน! 🎉</h2>
                </div>
                <div className="p-6 md:p-10 bg-gradient-to-b from-orange-50 to-white relative z-10 min-h-[400px]">
                  {players.length === 0 ? <p className="text-center text-gray-500">ไม่มีผู้เล่นในรอบนี้</p> : (
                    <div className="max-w-2xl mx-auto">
                      <div className="flex justify-center items-end h-64 gap-2 md:gap-6 mb-12">
                        {players[1] && (
                          <div className="flex flex-col items-center w-1/3 anim-podium-2">
                            <div className="text-center mb-2"><p className="font-bold text-gray-700 truncate w-full">{players[1].name}</p><p className="text-sm text-orange-500 font-bold bg-white/80 px-2 rounded-full inline-block">{players[1].exp} EXP</p></div>
                            <div className="w-full bg-gradient-to-t from-gray-400 to-gray-200 h-32 rounded-t-xl shadow-lg flex justify-center pt-4 relative"><span className="text-4xl font-black text-gray-500/50">2</span></div>
                          </div>
                        )}
                        {players[0] && (
                          <div className="flex flex-col items-center w-1/3 anim-podium-1 z-10">
                            <div className="text-center mb-2"><Crown className="text-yellow-500 w-8 h-8 mx-auto animate-pulse" /><p className="font-extrabold text-lg text-yellow-700 truncate w-full">{players[0].name}</p><p className="text-md text-orange-600 font-black bg-white/80 px-3 rounded-full inline-block">{players[0].exp} EXP</p></div>
                            <div className="w-full bg-gradient-to-t from-yellow-500 to-yellow-300 h-44 rounded-t-xl shadow-2xl flex justify-center pt-4 relative transform md:scale-110"><span className="text-5xl font-black text-yellow-600/50 mt-2">1</span></div>
                          </div>
                        )}
                        {players[2] && (
                          <div className="flex flex-col items-center w-1/3 anim-podium-3">
                            <div className="text-center mb-2"><p className="font-bold text-gray-700 truncate w-full">{players[2].name}</p><p className="text-sm text-orange-500 font-bold bg-white/80 px-2 rounded-full inline-block">{players[2].exp} EXP</p></div>
                            <div className="w-full bg-gradient-to-t from-orange-700 to-orange-400 h-24 rounded-t-xl shadow-lg flex justify-center pt-4 relative"><span className="text-4xl font-black text-orange-800/50">3</span></div>
                          </div>
                        )}
                      </div>
                      {(players[3] || players[4]) && (
                        <div className="space-y-3 mt-8 anim-fade">
                          <h4 className="text-center text-gray-400 font-bold mb-4">🏆 อันดับรองชนะเลิศ</h4>
                          {[players[3], players[4]].map((p, index) => {
                            if (!p) return null;
                            return (
                              <div key={p.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border"><div className="flex items-center space-x-4"><div className="bg-gray-100 text-gray-500 font-bold w-8 h-8 rounded-full flex justify-center items-center">{index + 4}</div><p className="font-bold text-gray-700">{p.name}</p></div><p className="text-orange-500 font-bold">{p.exp} EXP</p></div>
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
                  <h3 className="text-xl font-bold text-gray-800 flex items-center"><Trophy className="text-yellow-500 mr-2" /> Live Leaderboard</h3>
                  <span className="text-gray-500 font-semibold bg-white px-3 py-1 rounded-lg border">ผู้เล่น: {players.length} คน</span>
                </div>
                <div className="p-4 md:p-6 min-h-[300px]">
                  {players.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12"><QrCode className="w-20 h-20 mb-4 opacity-50" /><p className="text-lg">ให้นักเรียนสแกน QR Code เข้ามาได้เลย!</p></div>
                  ) : (
                    <div className="space-y-3">
                      {players.map((p, index) => {
                        const rankInfo = getRankInfo(p.exp, index);
                        return (
                          <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{index + 1}</div>
                              <div><p className="font-bold text-lg text-gray-800">{p.name}</p></div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-orange-500">{p.exp} <span className="text-sm font-normal text-gray-400">EXP</span></p>
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
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// Main App Component (ตัวควบคุมหลัก)
// ----------------------------------------------------------------------
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' หรือ 'snackdb'

  // การเชื่อมต่อ Auth เริ่มต้น
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">กำลังเชื่อมต่อฐานข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* แถบเมนูนำทาง (Navigation Bar) */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🕵️‍♂️</span>
              <span className="font-black text-xl text-orange-600 tracking-tight">Snack<span className="text-gray-800">Hunter</span> Admin</span>
            </div>
            <div className="flex space-x-2 items-center">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center
                  ${activeTab === 'dashboard' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Trophy className="w-4 h-4 mr-2" /> กระดานคุมสอบ
              </button>
              <button 
                onClick={() => setActiveTab('snackdb')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center
                  ${activeTab === 'snackdb' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Database className="w-4 h-4 mr-2" /> ฐานข้อมูลขนม
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* พื้นที่แสดงเนื้อหา */}
      <div className="p-4 md:p-8">
        {activeTab === 'dashboard' ? <TeacherDashboard user={user} /> : <SnackDatabaseManager user={user} />}
      </div>
    </div>
  );
}