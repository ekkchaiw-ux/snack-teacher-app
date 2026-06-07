import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, getDocs, query, where, deleteDoc, addDoc } from 'firebase/firestore';
import { Gamepad2, GraduationCap, ArrowRight, ShieldCheck, ScanLine, Award, Zap, Heart, AlertTriangle, CheckCircle, X, Trophy, Star, Shield, Play, Volume2, Sparkles, User, Key, RefreshCw, Film, Users, PlayCircle, StopCircle, LogOut, Copy, Database, Plus, Trash2, Package, Video, Edit, ChevronRight, Crown, Clock, Hourglass } from 'lucide-react';

// ----------------------------------------------------------------------
// 1. Firebase Configuration (ใช้ฐานข้อมูลเดียวกันทั้งระบบ)
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
        <polygon points="25,15 15,40 38,32" fill="#E25822" />
        <polygon points="75,15 85,40 62,32" fill="#E25822" />
        <polygon points="27,20 20,38 35,32" fill="#FF8C00" />
        <polygon points="73,20 80,38 65,32" fill="#FF8C00" />
        <path d="M 15 45 C 15 70, 50 85, 50 85 C 50 85, 85 70, 85 45 C 85 30, 15 30, 15 45" fill="#E25822" />
        <path d="M 28 50 C 28 70, 50 80, 50 80 C 50 80, 72 70, 72 50 C 72 40, 28 40, 28 50" fill="#FFFFFF" />
        <polygon points="46,72 54,72 50,78" fill="#1A1A1A" />
        <circle cx="38" cy="48" r="5" fill={state === 'sad' ? '#555' : '#1A1A1A'} />
        <circle cx="62" cy="48" r="5" fill={state === 'sad' ? '#555' : '#1A1A1A'} />
        <rect x="28" y="42" width="44" height="12" rx="3" fill="rgba(0, 191, 255, 0.4)" stroke="#00BFFF" strokeWidth="2" />
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
        <circle cx="25" cy="25" r="14" fill="#8B4513" />
        <circle cx="75" cy="25" r="14" fill="#8B4513" />
        <circle cx="25" cy="25" r="8" fill="#CD853F" />
        <circle cx="75" cy="25" r="8" fill="#CD853F" />
        <circle cx="50" cy="55" r="32" fill="#8B4513" />
        <circle cx="40" cy="48" r="4" fill="#1A1A1A" />
        <circle cx="60" cy="48" r="4" fill="#1A1A1A" />
        <ellipse cx="50" cy="62" rx="14" ry="10" fill="#CD853F" />
        <ellipse cx="50" cy="58" rx="6" ry="4" fill="#1A1A1A" />
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
        <polygon points="15,15 35,35 15,45" fill="#DB7093" />
        <polygon points="85,15 65,35 85,45" fill="#DB7093" />
        <circle cx="50" cy="55" r="30" fill="#FFC0CB" />
        <circle cx="38" cy="50" r="6" fill="#1A1A1A" />
        <circle cx="62" cy="50" r="6" fill="#1A1A1A" />
        <circle cx="40" cy="48" r="2" fill="#FFFFFF" />
        <circle cx="64" cy="48" r="2" fill="#FFFFFF" />
        <polygon points="48,58 52,58 50,61" fill="#FF1493" />
        <line x1="20" y1="58" x2="32" y2="58" stroke="#1A1A1A" strokeWidth="1.5" />
        <line x1="20" y1="64" x2="30" y2="62" stroke="#1A1A1A" strokeWidth="1.5" />
        <line x1="80" y1="58" x2="68" y2="58" stroke="#1A1A1A" strokeWidth="1.5" />
        <line x1="80" y1="64" x2="70" y2="62" stroke="#1A1A1A" strokeWidth="1.5" />
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

const getRank = (exp) => {
  if (exp >= 150) return { name: "Gold", color: "text-yellow-500", bg: "bg-yellow-100", icon: <Trophy size={20} className="text-yellow-500" /> };
  if (exp >= 50) return { name: "Silver", color: "text-gray-500", bg: "bg-gray-200", icon: <Shield size={20} className="text-gray-500" /> };
  return { name: "Bronze", color: "text-orange-700", bg: "bg-orange-100", icon: <Star size={20} className="text-orange-700" /> };
};

// ----------------------------------------------------------------------
// 4. เอฟเฟกต์ริบบิ้นโปรยปราย (Continuous Confetti)
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
// 5. Component: Snack Database Manager (ระบบจัดการคลังข้อมูลอาหารของคุณครู)
// ----------------------------------------------------------------------
function SnackDatabaseManager({ user }) {
  const [snacks, setSnacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Custom dialog confirmations instead of window.confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    type: 'snack',
    calories: '',
    sugar: '',
    sodium: '',
    fat: '',
    vdoUrl: ''
  });

  useEffect(() => {
    if (!user) return;
    const snacksRef = collection(db, 'artifacts', appId, 'public', 'data', 'snacks');
    const unsub = onSnapshot(snacksRef, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setSnacks(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleClearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleClearMessages();

    if (!formData.barcode.trim() || !formData.name.trim()) {
      setErrorMessage('⚠️ กรุณากรอกรหัสบาร์โค้ดและชื่ออาหารด้วยครับ');
      return;
    }

    const totalBadStats = Number(formData.sugar || 0) + Number(formData.sodium || 0) / 10 + Number(formData.fat || 0);
    let expReward = 10;
    if (totalBadStats < 15) expReward = 30;
    else if (totalBadStats < 30) expReward = 20;

    const snackData = {
      barcode: formData.barcode.trim(),
      name: formData.name.trim(),
      type: formData.type,
      vdoUrl: formData.vdoUrl.trim(),
      nutrition: {
        calories: Number(formData.calories || 0),
        sugar: Number(formData.sugar || 0),
        sodium: Number(formData.sodium || 0),
        fat: Number(formData.fat || 0),
      },
      expReward,
      coinReward: Math.floor(expReward / 2)
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'snacks', editingId), snackData);
        setSuccessMessage('🎉 อัปเดตข้อมูลอาหารเรียบร้อยแล้ว!');
        setEditingId(null);
      } else {
        snackData.createdAt = new Date().toISOString();
        const snacksRef = collection(db, 'artifacts', appId, 'public', 'data', 'snacks');
        await addDoc(snacksRef, snackData);
        setSuccessMessage('🎉 บันทึกอาหารใหม่เข้าคลังเรียบร้อย!');
      }

      setFormData({
        barcode: '',
        name: '',
        type: 'snack',
        calories: '',
        sugar: '',
        sodium: '',
        fat: '',
        vdoUrl: ''
      });
    } catch (err) {
      console.error(err);
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูลครับ');
    }
  };

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

  const cancelEdit = () => {
    setFormData({
      barcode: '',
      name: '',
      type: 'snack',
      calories: '',
      sugar: '',
      sodium: '',
      fat: '',
      vdoUrl: ''
    });
    setEditingId(null);
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'snacks', id));
      setSuccessMessage('🗑️ ลบอาหารออกจากคลังเรียบร้อยครับ');
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      setErrorMessage('เกิดข้อผิดพลาดในการลบข้อมูลอาหาร');
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center">
          <Database className="text-blue-500 w-8 h-8 mr-3" />
          <div>
            <h2 className="text-2xl font-black text-slate-800">แฟ้มคลังข้อมูลโภชนาการ (Snack DB)</h2>
            <p className="text-xs text-gray-400 font-bold">จัดการฐานข้อมูลสำหรับใช้สแกนในโรงเรียน</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-4 flex justify-between items-center border border-red-100">
          <span className="font-bold flex items-center text-sm"><AlertTriangle className="mr-2 w-4 h-4" /> {errorMessage}</span>
          <button onClick={handleClearMessages} className="text-red-500 hover:text-red-700"><X size={18} /></button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl mb-4 flex justify-between items-center border border-green-100 animate-pulse">
          <span className="font-bold flex items-center text-sm"><CheckCircle className="mr-2 w-4 h-4" /> {successMessage}</span>
          <button onClick={handleClearMessages} className="text-green-500 hover:text-green-700"><X size={18} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* คอลัมน์ด้านซ้าย: ฟอร์มเพิ่ม/แก้ไข */}
        <div className={`p-6 rounded-3xl border-2 transition-all ${editingId ? 'bg-orange-50/50 border-orange-200' : 'bg-blue-50/30 border-blue-100'}`}>
          <h3 className={`text-lg font-black mb-4 flex items-center ${editingId ? 'text-orange-700' : 'text-blue-700'}`}>
            {editingId ? <><Edit className="w-5 h-5 mr-2" /> แก้ไขอาหารในคลัง</> : <><Plus className="w-5 h-5 mr-2" /> เพิ่มอาหารใหม่</>}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">รหัสบาร์โค้ด / รหัสสมมุติ (ใช้พิมพ์ในเกม)</label>
              <input
                type="text"
                required
                placeholder="เช่น 885012345678"
                value={formData.barcode}
                onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full p-3 border rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ชื่ออาหาร / ขนม / นม</label>
              <input
                type="text"
                required
                placeholder="เช่น เลย์รสเกลือเค็มน้อย"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">หมวดหมู่</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 border rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="snack">🍿 ขนมขบเคี้ยว</option>
                <option value="drink">🥤 เครื่องดื่ม / นม</option>
                <option value="bakery">🍰 เบเกอรี่ / ขนมปัง</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ลิงก์ VDO อนิเมชัน YouTube (ถ้ามี)</label>
              <input
                type="text"
                placeholder="เช่น https://www.youtube.com/watch?v=..."
                value={formData.vdoUrl}
                onChange={e => setFormData({ ...formData, vdoUrl: e.target.value })}
                className="w-full p-3 border rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-3 border-t">
              <span className="block text-xs font-black text-slate-700 mb-3">คุณค่าทางโภชนาการ (ต่อซอง)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-0.5">พลังงาน (kcal)</label>
                  <input type="number" placeholder="เช่น 140" value={formData.calories} onChange={e => setFormData({ ...formData, calories: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-0.5">น้ำตาล (กรัม)</label>
                  <input type="number" placeholder="เช่น 4" value={formData.sugar} onChange={e => setFormData({ ...formData, sugar: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-0.5">โซเดียม (มก.)</label>
                  <input type="number" placeholder="เช่น 110" value={formData.sodium} onChange={e => setFormData({ ...formData, sodium: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-0.5">ไขมัน (กรัม)</label>
                  <input type="number" placeholder="เช่น 6" value={formData.fat} onChange={e => setFormData({ ...formData, fat: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className={`flex-1 font-black py-3 rounded-xl shadow-md text-white transition-transform active:scale-95 text-sm ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editingId ? 'บันทึกการแก้ไข' : 'บันทึกของเข้าคลัง'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold py-3 rounded-xl text-sm">
                  ยกเลิก
                </button>
              )}
            </div>
          </form>
        </div>

        {/* คอลัมน์ด้านขวา: รายการสินค้าทั้งหมด */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-black text-slate-700 text-md flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-500" /> คลังอาหารที่ตรวจพบ ({snacks.length} รายการ)
            </h4>
          </div>

          <div className="bg-slate-50 rounded-3xl border overflow-hidden max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="text-center p-12 text-gray-400 font-bold">กำลังโหลดรายการอาหาร...</div>
            ) : snacks.length === 0 ? (
              <div className="text-center p-12 text-gray-400 font-bold flex flex-col items-center justify-center">
                <Package className="w-16 h-16 opacity-30 mb-2" />
                <span>ยังไม่มีข้อมูลขนมในระบบ</span>
                <p className="text-xs text-gray-400 font-medium mt-1">กรอกข้อมูลที่ฟอร์มด้านซ้ายเพื่อสร้างคลังได้เลยครับ</p>
              </div>
            ) : (
              <div className="divide-y">
                {snacks.map((s) => {
                  const isConfirmingDelete = deleteConfirmId === s.id;
                  return (
                    <div key={s.id} className="p-4 bg-white flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-700 text-md flex items-center">
                          {s.name}
                          {s.vdoUrl && <Video className="w-4 h-4 ml-2 text-blue-500" title="มีวิดีโอแอนิเมชันประกอบ" />}
                        </div>
                        <div className="flex gap-4 text-xs font-bold text-gray-400 font-mono">
                          <span>บาร์โค้ด: {s.barcode}</span>
                          <span>พลังงาน: {s.nutrition?.calories || 0} kcal</span>
                        </div>
                        <div className="flex gap-2 text-[10px] font-bold text-gray-400">
                          <span>🍬 น้ำตาล {s.nutrition?.sugar || 0}g</span>
                          <span>🧂 โซเดียม {s.nutrition?.sodium || 0}mg</span>
                          <span>🥩 ไขมัน {s.nutrition?.fat || 0}g</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isConfirmingDelete ? (
                          <div className="bg-red-50 p-2 rounded-xl flex items-center space-x-1 border border-red-200">
                            <span className="text-[10px] font-black text-red-600">ลบจริง?</span>
                            <button onClick={() => handleDeleteConfirm(s.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">ยืนยัน</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold">ไม่</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(s)} className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => setDeleteConfirmId(s.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. Component: Teacher Dashboard (ระบบสร้างและคุมห้องเรียนของคุณครู)
// ----------------------------------------------------------------------
function TeacherDashboard({ user }) {
  const [teacherName, setTeacherName] = useState('');
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) await signInAnonymously(auth);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!room) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'players'), where("roomId", "==", room.pin));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => b.exp - a.exp);
      setPlayers(list);
    });
    return () => unsub();
  }, [room]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!teacherName.trim()) {
      setErrorMessage('⚠️ กรุณาระบุชื่อคุณครูผู้สอนเพื่อเริ่มเปิดห้องครับ');
      return;
    }
    
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', pin);
    
    const newRoom = {
      pin,
      teacherName: teacherName.trim(),
      status: 'waiting',
      createdAt: new Date().toISOString()
    };
    
    try {
      await setDoc(roomRef, newRoom);
      setRoom(newRoom);
    } catch (err) {
      console.error(err);
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อเปิดห้องครับ');
    }
  };

  const updateRoomStatus = async (status) => {
    if (!room) return;
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', room.pin);
      await updateDoc(roomRef, { status });
      setRoom({ ...room, status });
    } catch (err) {
      console.error(err);
    }
  };

  // 🛠️ จำลองข้อมูลเพื่อใช้ในการทดสอบ
  const simulateJoin = async () => {
    if (!room) return;
    const names = ['น้องภีม', 'น้องเนย', 'น้องพี', 'น้องมิ้นต์', 'น้องออสก้า', 'น้องมิกกี้'];
    const selectedName = names[Math.floor(Math.random() * names.length)] + ' ' + Math.floor(Math.random() * 90 + 10);
    const mockMascot = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    const playerDocId = `${room.pin}_${selectedName}`;
    const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', playerDocId);

    await setDoc(playerRef, {
      roomId: room.pin,
      name: selectedName,
      avatar: mockMascot.avatar,
      mascotId: mockMascot.id,
      exp: 0,
      coins: 0,
      scannedBarcodes: [],
      joinedAt: new Date().toISOString()
    });
  };

  const simulateScore = async () => {
    if (players.length === 0) return;
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    const playerDocId = `${room.pin}_${randomPlayer.name}`;
    const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', playerDocId);
    
    const addedExp = Math.floor(Math.random() * 20) + 10;
    await updateDoc(playerRef, {
      exp: randomPlayer.exp + addedExp,
      coins: randomPlayer.coins + Math.floor(addedExp / 2)
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {room && room.status === 'ended' && <Confetti />}

      {errorMessage && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-4 border border-red-100 flex items-center font-bold text-sm">
          <AlertTriangle className="mr-2" /> {errorMessage}
        </div>
      )}

      {!room ? (
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md mx-auto text-center border-4 border-sky-100 mt-10">
          <div className="bg-sky-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-sky-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">เปิดพอร์ทัลห้องเรียนใหม่</h2>
          <p className="text-gray-500 mb-6 font-medium text-sm">ให้นักเรียนสแกนคิวอาร์โค้ด หรือป้อน PIN ตัวเลข 6 หลักเพื่อเชื่อมต่อ</p>
          
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <input
              type="text"
              placeholder="ชื่อคุณครูคุมการแข่งขัน"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              required
              className="w-full p-4 border-2 border-gray-200 rounded-xl font-bold text-lg text-center focus:border-sky-500 focus:outline-none"
            />
            <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-4 rounded-xl shadow-lg transition-all text-lg flex items-center justify-center">
              <Play className="w-5 h-5 mr-2" /> เริ่มเปิดรหัสห้องเกม
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-6">
              <div className="text-center bg-sky-50 px-6 py-3 rounded-2xl border-2 border-sky-200">
                <span className="block text-sky-600 font-bold text-xs uppercase tracking-widest mb-1">รหัสห้อง (PIN)</span>
                <span className="block text-4xl font-black text-sky-700 font-mono tracking-widest">{room.pin}</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">ห้องเรียนของครู {room.teacherName}</h2>
                <p className="text-sm font-bold text-gray-500 flex items-center mt-1">
                  <Users className="w-4 h-4 mr-1"/> นักสำรวจร่วมสนุกแล้ว: <span className="text-sky-600 ml-1">{players.length} คน</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {room.status === 'waiting' && (
                <button onClick={() => updateRoomStatus('playing')} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-black shadow-lg flex items-center transition-transform active:scale-95 text-sm">
                  <PlayCircle className="w-5 h-5 mr-2" /> เริ่มเกมเลย!
                </button>
              )}
              {room.status === 'playing' && (
                <button onClick={() => updateRoomStatus('ended')} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-black shadow-lg flex items-center transition-transform active:scale-95 text-sm">
                  <StopCircle className="w-5 h-5 mr-2" /> จบการแข่งขัน
                </button>
              )}
              {room.status === 'ended' && (
                <span className="bg-gray-800 text-white px-6 py-3 rounded-xl font-black shadow-lg flex items-center text-sm">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" /> สิ้นสุดการแข่งขัน
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-slate-100 p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-black text-slate-700 text-md flex items-center">
                    <Award className="w-5 h-5 mr-2 text-orange-500" /> ตารางอันดับนักสืบ (Live Update)
                  </h3>
                  {room.status === 'waiting' && <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full animate-pulse">กำลังรอนักเรียนเข้าเรียน...</span>}
                </div>
                
                <div className="p-0">
                  {players.length === 0 ? (
                    <div className="text-center p-12 text-gray-400 font-bold">
                      ยังไม่มีนักเรียนลงทะเบียนในห้องนี้...
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 text-xs font-bold border-b">
                          <th className="p-4 w-16 text-center">อันดับ</th>
                          <th className="p-4">ผู้เล่น</th>
                          <th className="p-4 text-center">ระดับ</th>
                          <th className="p-4 text-center">สแกนไป</th>
                          <th className="p-4 text-right text-orange-600">EXP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map((p, index) => {
                          const rank = getRank(p.exp);
                          return (
                            <tr key={p.id} className="hover:bg-sky-50/50 transition-colors border-b last:border-0">
                              <td className="p-4 text-center font-black text-slate-400">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <span className="text-2xl">{p.avatar}</span>
                                  <span className="font-extrabold text-slate-700">{p.name}</span>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${rank.bg} ${rank.color}`}>
                                  {rank.icon} <span className="ml-1">{rank.name}</span>
                                </div>
                              </td>
                              <td className="p-4 text-center font-bold text-gray-500 text-sm">
                                {(p.scannedBarcodes || []).length} ชิ้น
                              </td>
                              <td className="p-4 text-right font-black text-xl text-orange-500">
                                {p.exp}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* บานจำลองข้อมูลเพื่อตรวจสอบ */}
            <div className="bg-purple-50 rounded-3xl p-6 border-2 border-purple-200 border-dashed space-y-4">
              <span className="text-xs font-black text-purple-700 block uppercase tracking-wide text-center">🛠️ แผงสำหรับทดลองสร้างเหตุการณ์</span>
              <p className="text-[11px] text-purple-600 font-medium text-center">หากไม่มีหน้าจอมือถือจำลอง ลองกดปุ่มด้านล่างเพื่อสุ่มจำลองความเคลื่อนไหวได้ครับ</p>
              
              <div className="space-y-2">
                <button
                  onClick={simulateJoin}
                  disabled={room.status === 'ended'}
                  className="w-full bg-white hover:bg-purple-100 text-purple-700 border-2 border-purple-200 font-black py-3 rounded-xl transition-all disabled:opacity-50 text-xs shadow-sm"
                >
                  ➕ จำลองนักเรียนเข้าร่วมห้อง
                </button>
                <button
                  onClick={simulateScore}
                  disabled={room.status !== 'playing' || players.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl transition-all disabled:opacity-50 text-xs shadow-md"
                >
                  ⚡ จำลองนักเรียนสแกนและได้คะแนน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 7. Component: Player App (ระบบนักเรียน)
// ----------------------------------------------------------------------
function PlayerApp({ onGoBack }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('login');

  const [roomPin, setRoomPin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedMascot, setSelectedMascot] = useState(MASCOTS[0]);
  const [roomData, setRoomData] = useState(null);
  const [playerData, setPlayerData] = useState(null);

  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedSnack, setScannedSnack] = useState(null);
  const [databaseSnacks, setDatabaseSnacks] = useState([]);
  const [scanError, setScanError] = useState('');
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) await signInAnonymously(auth);
    });
    return () => unsubAuth();
  }, []);

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

  useEffect(() => {
    if (!roomPin) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomPin);
    const unsubRoom = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoomData(data);
        if (data.status === 'playing') setScreen('playing');
        else if (data.status === 'ended') setScreen('gameover');
        else if (data.status === 'waiting') setScreen('lobby');
      } else {
        setRoomPin('');
        setScreen('login');
      }
    });
    return () => unsubRoom();
  }, [roomPin]);

  useEffect(() => {
    if (!roomPin || !playerName) return;
    const playerDocId = `${roomPin}_${playerName}`;
    const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', playerDocId);
    const unsubPlayer = onSnapshot(playerRef, (docSnap) => {
      if (docSnap.exists()) setPlayerData(docSnap.data());
    });
    return () => unsubPlayer();
  }, [roomPin, playerName]);

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomPin.trim() || !playerName.trim()) return;

    setLoading(true);
    try {
      const roomSnap = await getDocs(query(collection(db, 'artifacts', appId, 'public', 'data', 'rooms'), where("pin", "==", roomPin.trim())));
      if (roomSnap.empty) {
        setScanError('❌ ไม่พบรหัสห้องนี้ กรุณาตรวจสอบกับทางคุณครูอีกครั้งครับ');
        setLoading(false);
        return;
      }

      const activeRoom = roomSnap.docs[0].data();
      setRoomData(activeRoom);

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
      setScreen('lobby');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleScanSnack = async (barcode) => {
    setScanError('');
    if (!barcode.trim()) return;

    const matched = databaseSnacks.find(s => s.barcode === barcode.trim());
    if (matched) {
      setScannedSnack(matched);
      setScreen('result');
    } else {
      setScanError('🕵️‍♂️ ไม่พบรหัสอาหารชิ้นนี้ในระบบ! ลองพิมพ์รหัสอื่นที่มีนะครับ');
    }
  };

  const claimRewards = async () => {
    if (!playerData || !scannedSnack) return;

    const alreadyScanned = playerData.scannedBarcodes || [];
    if (alreadyScanned.includes(scannedSnack.barcode)) {
      setScanError('🔒 น้องได้เคยบันทึกค่าและรับคะแนนจากอาหารชิ้นนี้ไปแล้วจ้า!');
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

      setScreen('playing');
      setScannedSnack(null);
      setBarcodeInput('');
    } catch (err) {
      console.error(err);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-100 font-sans text-sky-600">
        <Sparkles className="w-12 h-12 animate-spin mb-2 text-sky-500" />
        <p className="font-bold">กำลังเตรียมอุปการณ์แกดเจ็ตนักสืบ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0F2FE] font-sans text-slate-800 flex justify-center py-4 px-2">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-sky-300 flex flex-col relative">
        
        {/* Header */}
        <header className="bg-sky-500 p-4 text-white flex justify-between items-center shadow-md relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-2xl cursor-pointer" onClick={onGoBack}>
              <ArrowRight className="rotate-180 w-6 h-6"/>
            </span>
            <span className="font-black text-xl tracking-tight">Snack Hunter Mobile</span>
          </div>
          {roomPin && (
            <span className="bg-white/20 text-white font-mono px-3 py-1 rounded-full font-bold text-sm">
              PIN: {roomPin}
            </span>
          )}
        </header>

        {/* SCREEN 1: Login */}
        {screen === 'login' && (
          <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-black text-sky-600 mb-1">ยินดีต้อนรับนักสืบจิ๋ว!</h2>
                <p className="text-xs text-gray-500">พิมพ์รหัสและเลือกตัวละครของคุณเพื่อเริ่ม</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2 text-center">เลือกการ์ตูนคู่หูประจำตัว 💖</label>
                <div className="flex justify-center gap-3">
                  {MASCOTS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMascot(m)}
                      className={`p-3 rounded-2xl border-4 transition-all flex flex-col items-center w-24 ${
                        selectedMascot.id === m.id ? 'border-sky-500 bg-sky-50 transform scale-105 shadow-md' : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-4xl mb-1">{m.avatar}</span>
                      <span className="text-[10px] font-bold text-gray-700 truncate w-full text-center">{m.id.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
                <div className="bg-sky-50 p-3 rounded-xl border border-sky-100 mt-4 text-center">
                  <p className="text-xs font-bold text-sky-700 mb-1">✨ {selectedMascot.name}</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{selectedMascot.description}</p>
                </div>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-4">
                {scanError && (
                  <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200">
                    {scanError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center">
                    <Key className="w-3.5 h-3.5 mr-1" /> รหัสห้องเรียนของคุณครู (PIN)
                  </label>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    maxLength="6"
                    required
                    value={roomPin}
                    onChange={(e) => setRoomPin(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl font-mono text-center text-xl font-black focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" /> ชื่อเล่นของคุณหนูๆ
                  </label>
                  <input
                    type="text"
                    maxLength="12"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-center text-md font-bold focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-4 rounded-2xl text-lg shadow-lg flex justify-center items-center">
                  ออกล่าขนมกันเลย! <ArrowRight className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SCREEN 2: Lobby */}
        {screen === 'lobby' && roomData && (
          <div className="flex-1 p-6 flex flex-col justify-between items-center text-center">
            <div className="space-y-6 w-full">
              <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 flex justify-between">
                <span className="text-sm font-bold text-sky-700">ครูผู้สอน:</span>
                <span className="font-extrabold text-sky-800 text-md">{roomData.teacherName}</span>
              </div>
              <div className="py-6 flex flex-col items-center">
                {selectedMascot.svg('happy')}
                <h3 className="text-lg font-black text-slate-700 mt-4">เตรียมพร้อมค้นหาโภชนาการ!</h3>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-2xl flex flex-col items-center">
                <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="font-bold text-yellow-800 text-sm">รอคุณครูโบกธงสัญญาณเปิดเกม...</p>
              </div>
            </div>
            <div className="w-full bg-gray-50 p-4 rounded-xl flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">{selectedMascot.avatar}</span>
                <span className="font-extrabold text-gray-700">{playerName}</span>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">พร้อมลุย ✓</span>
            </div>
          </div>
        )}

        {/* SCREEN 3: Playing */}
        {screen === 'playing' && playerData && (
          <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              
              <div className={`bg-gradient-to-br ${selectedMascot.color} p-5 rounded-3xl text-white shadow-lg relative overflow-hidden`}>
                <div className="absolute top-0 right-0 opacity-10 text-8xl -mt-5 -mr-5">{selectedMascot.avatar}</div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2 rounded-2xl w-16 h-16 flex items-center justify-center">
                    {selectedMascot.svg('happy')}
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{playerName}</h3>
                    <p className="text-xs opacity-90 font-medium">{selectedMascot.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                    <span className="text-[10px] opacity-80 block font-semibold">EXP</span>
                    <span className="text-xl font-black flex items-center"><Star className="w-4 h-4 fill-current text-yellow-300 mr-1" /> {playerData.exp}</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                    <span className="text-[10px] opacity-80 block font-semibold">Coins</span>
                    <span className="text-xl font-black flex items-center">🪙 {playerData.coins}</span>
                  </div>
                </div>
              </div>

              <div className="bg-sky-50 p-4 rounded-3xl border-2 border-sky-100 space-y-4">
                <div className="text-center">
                  <h4 className="text-sm font-bold text-gray-700">สแกนซองขนม / ค้นหาอาหาร</h4>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ใส่บาร์โค้ดที่ต้องการสแกน..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="flex-1 p-3 border rounded-xl text-center font-bold text-gray-700 focus:outline-none focus:border-sky-500"
                  />
                  <button onClick={() => handleScanSnack(barcodeInput)} className="bg-sky-600 text-white px-4 py-3 rounded-xl shadow-md flex items-center">
                    <ScanLine className="w-5 h-5" />
                  </button>
                </div>
                {scanError && <div className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg">{scanError}</div>}
                
                {/* ปุ่มลัดเพื่ออำนวยความสะดวกในการจำลองผล */}
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">💡 รายการขนมรอบตัว (กดแทนการสแกน):</label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {databaseSnacks.map(s => (
                      <button key={s.barcode} onClick={() => { setBarcodeInput(s.barcode); handleScanSnack(s.barcode); }} className="bg-white border text-[10px] px-2 py-1 rounded-md font-bold shadow-sm hover:bg-sky-100 transition-colors">
                        🍬 {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ประวัติการสแกนรอบนี้ */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400">ประวัติที่ค้นพบ ({playerData.scannedBarcodes?.length || 0} ชิ้น)</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {(playerData.scannedBarcodes || []).map(b => {
                    const snk = databaseSnacks.find(x => x.barcode === b);
                    return (
                      <div key={b} className="bg-white border p-2 rounded-xl flex-shrink-0 text-center w-24 shadow-sm">
                        <span className="text-lg block">🍪</span>
                        <span className="text-[10px] font-bold text-gray-700 block truncate">{snk ? snk.name : b}</span>
                        <span className="text-[8px] text-green-500 font-bold block mt-0.5">บันทึกแล้ว</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 4: Scan Result */}
        {screen === 'result' && scannedSnack && (
          <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {selectedMascot.svg(getHealthStatus((getStars(scannedSnack.nutrition?.sugar, 'sugar') + getStars(scannedSnack.nutrition?.sodium, 'sodium') + getStars(scannedSnack.nutrition?.fat, 'fat')) / 3).mascotState)}
                </div>
                <h3 className="text-2xl font-black text-gray-800">{scannedSnack.name}</h3>
              </div>

              {(() => {
                const sugarStars = getStars(scannedSnack.nutrition?.sugar, 'sugar');
                const sodiumStars = getStars(scannedSnack.nutrition?.sodium, 'sodium');
                const fatStars = getStars(scannedSnack.nutrition?.fat, 'fat');
                const starsAvg = (sugarStars + sodiumStars + fatStars) / 3;
                const status = getHealthStatus(starsAvg);

                return (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border-2 ${status.bg} text-center`}>
                      <span className={`text-xl font-black ${status.text}`}>{status.name}</span>
                      <p className="text-[10px] font-bold text-gray-500 mt-1">{status.desc}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-2xl border space-y-2">
                      <div className="flex justify-between text-xs font-bold"><span className="text-gray-600">น้ำตาล ({scannedSnack.nutrition?.sugar}g):</span><span className="text-yellow-500">{"★".repeat(sugarStars)}</span></div>
                      <div className="flex justify-between text-xs font-bold"><span className="text-gray-600">โซเดียม ({scannedSnack.nutrition?.sodium}mg):</span><span className="text-yellow-500">{"★".repeat(sodiumStars)}</span></div>
                      <div className="flex justify-between text-xs font-bold"><span className="text-gray-600">ไขมัน ({scannedSnack.nutrition?.fat}g):</span><span className="text-yellow-500">{"★".repeat(fatStars)}</span></div>
                    </div>

                    {scannedSnack.vdoUrl && (
                      <button onClick={() => setShowVideo(true)} className="w-full bg-blue-500 text-white font-bold py-3 rounded-2xl flex justify-center items-center gap-2">
                        <Film className="w-4 h-4 animate-bounce" /> ดู VDO การ์ตูนโภชนาการ 🎬
                      </button>
                    )}

                    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-3 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-orange-700 block">รางวัลผู้ค้นพบ</span>
                        <span className="text-xl font-black text-orange-600">+{scannedSnack.expReward} EXP</span>
                      </div>
                      <span className="text-2xl">🎁</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-2">
                <button onClick={() => setScreen('playing')} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl">ยกเลิก</button>
                <button onClick={claimRewards} className="flex-[2] bg-green-500 text-white font-black py-3 rounded-xl flex justify-center items-center gap-1.5">
                  <CheckCircle className="w-5 h-5" /> บันทึกการตรวจสารอาหาร
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 5: Game Over */}
        {screen === 'gameover' && playerData && (
          <div className="flex-1 p-6 flex flex-col justify-between items-center text-center">
            <div className="space-y-6 w-full">
              <Trophy className="text-yellow-400 w-20 h-20 animate-bounce mx-auto" />
              <h2 className="text-3xl font-black text-slate-700">สิ้นสุดการสำรวจ!</h2>
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300 p-6 rounded-3xl">
                <p className="font-extrabold text-yellow-800">ผลงานสุดยอดของ {playerName}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl">
                    <span className="text-[10px] text-gray-400 font-bold">EXP ทั้งหมด</span>
                    <span className="block text-2xl font-black text-orange-500">{playerData.exp}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <span className="text-[10px] text-gray-400 font-bold">อาหารที่วิเคราะห์</span>
                    <span className="block text-2xl font-black text-sky-500">{(playerData.scannedBarcodes || []).length} ชิ้น</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => { setRoomPin(''); setPlayerName(''); setScreen('login'); }} className="w-full bg-gray-800 text-white font-extrabold py-4 rounded-xl mt-4">
              กลับสู่การล่ารอบใหม่
            </button>
          </div>
        )}

      </div>

      {/* VDO Modal */}
      {showVideo && scannedSnack && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-lg relative border-4 border-blue-400">
            <button onClick={() => setShowVideo(false)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full z-50">
              <X className="w-4 h-4" />
            </button>
            <div className="aspect-video w-full bg-black">
              {scannedSnack.vdoUrl ? (
                <iframe className="w-full h-full" src={getEmbedVideoUrl(scannedSnack.vdoUrl)} title="Video" allowFullScreen></iframe>
              ) : (
                <div className="h-full flex items-center justify-center text-white/50 text-sm">ไม่มีข้อมูลวิดีโอแอนิเมชันสำหรับชิ้นนี้</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------------------------
// 8. หน้าจอหลักรวมศูนย์ (Main App Layout)
// ----------------------------------------------------------------------
export default function App() {
  const [currentView, setCurrentView] = useState(null); // 'student', 'teacher-portal' หรือ null
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' (คุมห้อง) หรือ 'snackdb' (จัดการอาหาร)
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) await signInAnonymously(auth);
    });
    return () => unsubAuth();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-sky-600 bg-sky-50">
        <Sparkles className="animate-spin mr-2"/> กำลังเชื่อมโยงระบบความปลอดภัย...
      </div>
    );
  }

  // แยกระบบตาม View ที่ผู้ใช้คลิกเลือก
  if (currentView === 'student') {
    return <PlayerApp onGoBack={() => setCurrentView(null)} />;
  }

  if (currentView === 'teacher-portal') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between">
        {/* แถบนำทางหลังบ้าน (Admin Navigation Bar) */}
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🕵️‍♂️</span>
                <span className="font-black text-lg text-sky-700 tracking-tight">Snack Hunter <span className="text-gray-400 font-bold">Portal</span></span>
              </div>
              <div className="flex space-x-1 sm:space-x-2 items-center">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-black text-xs sm:text-sm transition-colors flex items-center
                    ${activeTab === 'dashboard' ? 'bg-sky-100 text-sky-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Users className="w-4 h-4 mr-1.5" /> กระดานคุมห้องเรียน
                </button>
                <button 
                  onClick={() => setActiveTab('snackdb')}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-black text-xs sm:text-sm transition-colors flex items-center
                    ${activeTab === 'snackdb' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Database className="w-4 h-4 mr-1.5" /> จัดการคลังข้อมูลอาหาร
                </button>
                <button 
                  onClick={() => setCurrentView(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-gray-600 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-colors flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" /> ออก
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* พื้นที่แสดงเนื้อหา */}
        <div className="p-4 md:p-8 flex-1">
          {activeTab === 'dashboard' ? <TeacherDashboard user={user} /> : <SnackDatabaseManager user={user} />}
        </div>
      </div>
    );
  }

  // หน้าจอ Landing Page (หน้าแรกที่เด็กและครูสแกน QR เข้ามาเจอ)
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-100 to-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">🍎</div>
      <div className="absolute bottom-20 right-10 text-6xl opacity-20 animate-pulse">🥦</div>
      <div className="absolute top-40 right-20 text-5xl opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>🥛</div>

      <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border-4 border-white max-w-lg w-full text-center relative z-10">
        
        <div className="mb-8">
          <div className="bg-sky-500 text-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-200 border-4 border-white">
            <span className="text-5xl">🕵️‍♂️</span>
          </div>
          <h1 className="text-4xl font-black text-sky-800 tracking-tight mb-2">Snack Hunter</h1>
          <p className="text-gray-500 font-bold">แอปพลิเคชันเกมนักสืบโภชนาการพิทักษ์สุขภาพ!</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => setCurrentView('student')}
            className="w-full group bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-between border-b-4 border-orange-600"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black tracking-wide">เข้าสู่สมรภูมิเกม</h2>
                <p className="text-orange-100 text-xs font-bold">สำหรับนักเรียน (วิเคราะห์สแกนซองขนม)</p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>

          <div className="flex items-center py-2 opacity-50">
            <div className="flex-1 border-t-2 border-gray-300"></div>
            <span className="px-4 text-xs font-bold text-gray-400 uppercase">ระบบโฮสต์หลัก</span>
            <div className="flex-1 border-t-2 border-gray-300"></div>
          </div>

          <button 
            onClick={() => setCurrentView('teacher-portal')}
            className="w-full group bg-white hover:bg-sky-50 text-slate-700 p-4 rounded-2xl shadow-sm border-2 border-slate-200 hover:border-sky-400 transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-sky-100 transition-colors">
                <ShieldCheck className="w-6 h-6 text-slate-500 group-hover:text-sky-500" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-extrabold text-slate-800">ระบบจัดการสำหรับคุณครู</h2>
                <p className="text-gray-400 text-xs font-bold">แดชบอร์ดสร้างห้องเรียน & จัดการคลังข้อมูลอาหาร</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

      </div>
    </div>
  );
}