'use client';
import { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, Clock3, 
  ExternalLink, Mountain, Navigation, Route, Wallet, Search, 
  ChevronRight, X, ChevronLeft, ZoomIn, ZoomOut 
} from 'lucide-react';
import Image from 'next/image';
import data from '@/lib/itinerary.json';

type Item = { time: string; activity: string; distance: string; notes: string; gps: string };
type Day = { day: number; heading: string; route: string; items: Item[]; notes: string[]; mapLinks: string[] };
const trip = data as any;

// รูปภาพหน้าปกประจำวัน (Day 1 - 11)
const dayCoverImages: Record<number, string> = {
  1: '/images/day-01-khao-no-01.png',
  2: '/images/day-02-khao-luang-01.png',
  3: '/images/day-03-chiang-mai-01.png',
  4: '/images/day-04-doi-suthep-01.png',
  5: '/images/day-05-doi-luang-chiang-dao-01.png',
  6: '/images/day-06-suan-som-na-rin-01.png',
  7: '/images/day-07-fang-ang-kang-01.png',
  8: '/images/day-08-doi-chang-01.png',
  9: '/images/day-09-doi-saket-01.png',
  10: '/images/day-10-mae-ngad-dam-01.png',
  11: '/images/day-11-ping-river-tak-01.png',
};

// รูปภาพแกลเลอรีทั้งหมดแยกตามวัน
const dayGalleryImages: Record<number, string[]> = {
  1: ['/images/day-01-khao-no-01.png', '/images/day-01-khao-no-02.png'],
  2: ['/images/day-02-khao-luang-01.png', '/images/day-02-khao-luang-02.png'],
  3: ['/images/day-03-chiang-mai-01.png', '/images/day-03-chiang-mai-02.png', '/images/day-03-chiang-mai-03.png', '/images/day-03-chiang-mai-04.png'],
  4: ['/images/day-04-doi-suthep-01.png', '/images/day-04-doi-suthep-02.png', '/images/day-04-doi-kam-03.png'],
  5: ['/images/day-05-doi-luang-chiang-dao-01.png'],
  6: ['/images/day-06-suan-som-na-rin-01.png', '/images/day-06-suan-som-na-rin-02.png', '/images/day-06-suan-som-na-rin-03.png', '/images/day-06-suan-som-na-rin.png'],
  7: ['/images/day-07-fang-ang-kang-01.png', '/images/day-07-fang-ang-kang-02.png', '/images/day-07-fang-hot-spring-01.png', '/images/day-07-fang-hot-spring-02.png'],
  8: ['/images/day-08-doi-chang-01.png', '/images/day-08-doi-chang-02.png'],
  9: ['/images/day-09-doi-saket-01.png', '/images/day-09-doi-saket-02.png', '/images/day-09-doi-saket-03.png'],
  10: ['/images/day-10-mae-ngad-dam-01.png', '/images/day-10-mae-ngad-dam-02.png', '/images/day-10-mae-ngad-dam-03.png', '/images/day-10-mae-ngad-dam-04.png', '/images/day-10-mae-ngad-dam-05.png'],
  11: ['/images/day-11-ping-river-tak-01.png', '/images/day-11-ping-river-tak-02.png', '/images/day-11-ping-river-tak-03.png'],
};

const places = [
  ['เขาหน่อ · นครสวรรค์', 'Khao No mountain Nakhon Sawan Thailand'],
  ['เขาหลวง · สุโขทัย', 'Khao Luang Ramkhamhaeng National Park Sukhothai Thailand'],
  ['เชียงใหม่', 'Chiang Mai old city Thailand'],
  ['เชียงใหม่ · ดอยสุเทพ', 'Doi Suthep Chiang Mai Thailand'],
  ['ดอยหลวงเชียงดาว', 'Doi Luang Chiang Dao mountain Thailand'],
  ['สวนส้ม ณ รินทร์ · ฝาง', 'สวนส้ม ณ รินทร์ อำเภอฝาง เชียงใหม่'],
  ['โป่งน้ำร้อนฝาง · อ่างขาง', 'Fang hot spring Doi Ang Khang Thailand'],
  ['วัดร่องขุ่น · ดอยช้าง', 'Wat Rong Khun Doi Chang Chiang Rai Thailand'],
  ['ดอยช้าง · ดอยสะเก็ด · พร้าว', 'Doi Chang Chiang Rai Thailand'],
  ['เขาโมอาย · อ่างเก็บน้ำแม่งัด', 'Mae Ngat Dam Thailand'],
  ['แม่น้ำปิง · ตาก', 'Ping River Tak Thailand']
];

const money = (n: number) => new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const searchUrl = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q + ' Thailand')}`;
function linksIn(text: string) { return [...text.matchAll(/https?:\/\/[^\s)]+/g)].map(m => m[0].replace(/[.,]$/, '')); }
function LinkPill({ url }: { url: string }) { 
  const map = /maps\.app|google\.com\/maps/i.test(url); 
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-[#d6e1d9] bg-[#f5f7f2] px-3 py-1.5 text-[11px] font-semibold text-[#285c52] hover:bg-[#e8f0e9]">
      {map ? <Navigation size={12} /> : <ExternalLink size={12} />} {map ? 'แผนที่' : 'เว็บ'}
    </a>
  ); 
}

export default function TripSite() {
  const [selected, setSelected] = useState<number | null>(null);
  const [checks, setChecks] = useState<string[]>([]);
  
  // State สำหรับ Lightbox Pop-up
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const categories = [
    { title: '⛰️ เดินป่า & ปีนเขา', sub: 'เขาหน่อ / เขาหลวง / เขาโมอาย', items: ['รองเท้าเดินป่าพื้นยึดเกาะดี', 'ถุงเท้าสำรองและเสื้อผ้าแห้งเร็ว', 'ไฟฉายคาดศีรษะและถ่านสำรอง', 'ไม้ Trekking Pole', 'ถุงมือผ้าสำหรับจับบันไดเหล็ก', 'น้ำดื่มและเกลือแร่', 'ยาคลายกล้ามเนื้อและพลาสเตอร์'] },
    { title: '⛺ แคมป์ปิ้ง & ลานกางเต็นท์', items: ['เต็นท์ / ตรวจสอบรายการเช่าเต็นท์', 'ถุงนอนและแผ่นรองนอน', 'ไฟฉายและโคมไฟแคมป์', 'Power bank', 'ผ้าเช็ดตัวและชุดเปลี่ยน', 'ถุงกันน้ำและถุงขยะ'] },
    { title: '🚗 เตรียมรถยนต์', sub: 'ระยะทางประมาณ 2,400 กม.', items: ['ตรวจเช็กยางและแรงดันลมยาง', 'ตรวจระบบเบรกและน้ำมันเบรก', 'ตรวจน้ำมันเครื่องและน้ำหล่อเย็น', 'ตรวจแบตเตอรี่และไฟส่องสว่าง', 'ยางอะไหล่ / แม่แรง / ประแจ', 'ประกันภัย / พ.ร.บ. / ใบขับขี่', 'เติมน้ำมันและวางแผนจุดพัก'] },
    { title: '🧳 ของใช้ทั่วไป & ยาประจำตัว', items: ['บัตรประชาชนและเอกสารจองที่พัก', 'ยาประจำตัวและชุดปฐมพยาบาล', 'เสื้อกันหนาวและเสื้อกันฝน', 'หมวก แว่นกันแดด และครีมกันแดด', 'สายชาร์จและอะแดปเตอร์', 'เงินสดและบัตรชำระเงิน'] }
  ];
  const totalItems = categories.reduce((n, c) => n + c.items.length, 0);
  const percent = Math.round((checks.length / totalItems) * 100);

  const expenseRows = [
    { category: 'ที่พัก', item: 'The Room Hotel กำแพงเพชร', paidBy: 'SCB-Card', status: 'Paid', amount: 473.68 },
    { category: 'กิจกรรม', item: 'เครื่องนอน / อุปกรณ์เขาหลวง', paidBy: 'Kept', status: 'Paid', amount: 180 },
    { category: 'ที่พัก', item: 'เต็นท์เช่า อุทยานเขาหลวง', paidBy: 'Kept', status: 'Paid', amount: 225 },
    { category: 'ที่พัก', item: 'ชิล โฮเทล ช้างเผือก', paidBy: 'SCB-Card', status: 'Paid', amount: 2090.81 },
    { category: 'ที่พัก', item: 'กระท่อมดอยหลวง เชียงดาว', paidBy: 'SCB-Card', status: 'Paid', amount: 645.73 },
    { category: 'ที่พัก', item: 'สวนส้ม ณ รินทร์ ฝาง', paidBy: '—', status: 'Paid', amount: 0 },
    { category: 'ที่พัก', item: 'แสนเจริญ Camping ดอยช้าง', paidBy: 'Kept', status: 'Paid', amount: 800 },
    { category: 'ที่พัก', item: 'ภูผาโฮมสเตย์ พร้าว', paidBy: 'Kept', status: 'Paid', amount: 400 },
    { category: 'กิจกรรม', item: 'ล่องเรือและกิจกรรมเขาโมอาย (700 + 1,000 บาท)', paidBy: 'ก่อนขึ้น', status: 'Pending', amount: 1700 },
    { category: 'ที่พัก', item: 'โรงแรมสวนสิน ล้านนา ตาก', paidBy: 'SCB-Card', status: 'Paid', amount: 525.86 },
    { category: 'น้ำมัน', item: 'น้ำมัน Gasohol 95 ตลอดทริป', paidBy: '—', status: 'Estimate', amount: 8400 },
    { category: 'ทางด่วน', item: 'ค่าทางด่วนตลอดทริป', paidBy: '—', status: 'Estimate', amount: 300 },
    { category: 'อาหารและเครื่องดื่ม', item: 'ประมาณ 11 วัน × 1,000 บาท', paidBy: '—', status: 'Estimate', amount: 11000 }
  ];

  const detail = trip.days.find((d: Day) => d.day === selected) as Day | undefined;
  const goDay = (n: number) => { setSelected(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const currentGallery = detail ? (dayGalleryImages[detail.day] || []) : [];

  const handlePrevImage = () => {
    if (lightboxIndex !== null && currentGallery.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + currentGallery.length) % currentGallery.length);
      setIsZoomed(false);
    }
  };

  const handleNextImage = () => {
    if (lightboxIndex !== null && currentGallery.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % currentGallery.length);
      setIsZoomed(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#173d39]">
      <header className="sticky top-0 z-40 border-b border-[#e7e3d9] bg-[#fbfaf6]/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] md:h-[68px] max-w-[1440px] items-center justify-between px-4 md:px-10">
          <a href="#home" onClick={() => setSelected(null)} className="flex items-center gap-2 md:gap-3">
            <span className="grid h-8 w-8 md:h-10 md:w-10 place-items-center rounded-xl bg-[#244e47] text-white">
              <Mountain size={20} className="md:w-6 md:h-6" />
            </span>
            <span className="leading-none">
              <b className="font-display text-lg md:text-[25px] tracking-tight">Northbound</b>
              <small className="block pt-0.5 text-[8px] md:text-[9px] tracking-[.28em]">TRAVEL PLANNER</small>
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-[13px] font-medium md:flex">
            <a href="#home" onClick={() => setSelected(null)} className="navlink">หน้าแรก</a>
            <a href="#roadmap" onClick={() => setSelected(null)} className="navlink">แผนที่เส้นทาง</a>
            <a href="#days" onClick={() => setSelected(null)} className="navlink">รายละเอียดรายวัน</a>
            <a href="#budget" onClick={() => setSelected(null)} className="navlink">ค่าใช้จ่าย</a>
            <a href="#checklist" onClick={() => setSelected(null)} className="navlink">เช็กลิสต์</a>
          </nav>
          <a href="#roadmap" onClick={() => setSelected(null)} className="flex items-center gap-1.5 rounded-full bg-[#285c52] px-3 py-1.5 md:px-4 md:py-2.5 text-xs text-white">
            <Route size={14} /> Road Trip
          </a>
        </div>
      </header>

      {detail ? (
        /* หน้ารายละเอียดประจำวัน */
        <section className="mx-auto max-w-[1200px] px-4 py-6 md:px-10 md:py-12">
          <button onClick={() => setSelected(null)} className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full border border-[#d7ded5] bg-white px-3.5 py-2 text-xs md:text-sm font-medium text-[#285c52] hover:bg-[#eef2eb]">
            <ArrowLeft size={16} /> กลับไปหน้าแผนการเดินทาง
          </button>
          <div className="overflow-hidden rounded-[20px] md:rounded-[28px] bg-white shadow-sm">
            <div className="relative h-[220px] sm:h-[300px] md:h-[400px]">
              <Image 
                src={dayCoverImages[detail.day] || '/images/cover-hero.png'} 
                alt={detail.route} 
                fill 
                priority 
                className="object-cover object-top" 
              />
