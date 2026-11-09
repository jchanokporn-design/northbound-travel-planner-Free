'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, Clock3, ExternalLink, Mountain, Navigation, Route, Wallet, Search, ChevronRight, X, ChevronLeft, ZoomIn, ZoomOut } from 'lucide-react';
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
function LinkPill({ url }: { url: string }) { const map = /maps\.app|google\.com\/maps/i.test(url); return <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-[#d6e1d9] bg-[#f5f7f2] px-3 py-1.5 text-[11px] font-semibold text-[#285c52] hover:bg-[#e8f0e9]">{map ? <Navigation size={12} /> : <ExternalLink size={12} />} {map ? 'แผนที่' : 'เว็บ'}</a>; }

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
  const percent = Math.round(checks.length / totalItems * 100);

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

  return <main className="min-h-screen bg-[#f7f5ef] text-[#173d39]">
    <header className="sticky top-0 z-40 border-b border-[#e7e3d9] bg-[#fbfaf6]/95 backdrop-blur">
      <div className="mx-auto flex h-[60px] md:h-[68px] max-w-[1440px] items-center justify-between px-4 md:px-10">
        <a href="#home" onClick={() => setSelected(null)} className="flex items-center gap-2 md:gap-3">
          <span className="grid h-8 w-8 md:h-10 md:w-10 place-items-center rounded-xl bg-[#244e47] text-white"><Mountain size={20} className="md:w-6 md:h-6" /></span>
          <span className="leading-none"><b className="font-display text-lg md:text-[25px] tracking-tight">Northbound</b><small className="block pt-0.5 text-[8px] md:text-[9px] tracking-[.28em]">TRAVEL PLANNER</small></span>
        </a>
        <nav className="hidden items-center gap-8 text-[13px] font-medium md:flex">
          <a href="#home" onClick={() => setSelected(null)} className="navlink">หน้าแรก</a>
          <a href="#roadmap" onClick={() => setSelected(null)} className="navlink">แผนที่เส้นทาง</a>
          <a href="#days" onClick={() => setSelected(null)} className="navlink">รายละเอียดรายวัน</a>
          <a href="#budget" onClick={() => setSelected(null)} className="navlink">ค่าใช้จ่าย</a>
          <a href="#checklist" onClick={() => setSelected(null)} className="navlink">เช็กลิสต์</a>
        </nav>
        <a href="#roadmap" onClick={() => setSelected(null)} className="flex items-center gap-1.5 rounded-full bg-[#285c52] px-3 py-1.5 md:px-4 md:py-2.5 text-xs text-white"><Route size={14} /> Road Trip</a>
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
            <Image src={dayCoverImages[detail.day] || '/images/cover-hero.png'} alt={detail.route} fill priority className="object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102e2c]/90 via-[#102e2c]/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white md:left-10 md:bottom-10">
              <p className="text-[10px] md:text-xs tracking-[.25em] opacity-90">{detail.heading}</p>
              <h1 className="mt-1 md:mt-2 max-w-4xl font-display text-xl sm:text-3xl font-semibold md:text-5xl">{detail.route}</h1>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 md:p-10">
            {/* 1. แกลเลอรีรูปภาพพร้อมฟังก์ชัน Pop-up Modal */}
            {currentGallery.length > 0 && (
              <div className="mb-8">
                <p className="eyebrow mb-3 text-xs md:text-sm">GALLERY · ภาพบรรยากาศสถานที่ ({currentGallery.length} ภาพ)</p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                  {currentGallery.map((imgSrc, imgIdx) => (
                    <div 
                      key={imgIdx} 
                      onClick={() => { setLightboxIndex(imgIdx); setIsZoomed(false); }} 
                      className="group relative h-32 sm:h-40 md:h-48 w-full cursor-pointer overflow-hidden rounded-xl md:rounded-2xl shadow-sm bg-gray-100"
                    >
                      <Image src={imgSrc} alt={`${detail.route} image ${imgIdx + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ZoomIn size={22} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e6de] pb-4">
              <div>
                <p className="eyebrow text-xs">DAY {String(detail.day).padStart(2, '0')} · DAILY JOURNEY</p>
                <p className="mt-1 text-xs md:text-sm text-[#71817b]">{detail.items.length} ช่วงกิจกรรม · แผนเดินทางตามข้อมูลต้นฉบับ</p>
              </div>
              <a href={searchUrl(places[detail.day - 1][0])} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#285c52] px-3.5 py-2 text-xs font-semibold text-white">
                <Search size={13} /> ดูเพิ่ม
              </a>
            </div>
            
            <div className="mt-3">
              {detail.items.map((it: Item, i: number) => {
                const urls = [...linksIn(it.activity), ...linksIn(it.notes), ...(it.gps ? [it.gps] : [])];
                const cleanNotes = it.notes.replace(/https?:\/\/[^\s)]+/g, '').trim();
                return (
                  <div key={i} className="grid gap-2 border-b border-dashed border-[#e3e4dc] py-4 last:border-0 md:grid-cols-[145px_1fr_190px]">
                    <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold tabular-nums text-[#b47b2f]"><Clock3 size={15} />{it.time}</div>
                    <div>
                      <h3 className="text-sm md:text-base font-semibold leading-6">{it.activity}</h3>
                      {cleanNotes && <p className="mt-1 whitespace-pre-line text-xs md:text-sm leading-6 md:leading-7 text-[#71817b]">{cleanNotes}</p>}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <a href={searchUrl(it.activity)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-[#e2d6bd] bg-[#faf6eb] px-2.5 py-1 text-[10px] md:text-[11px] font-semibold text-[#98713a]"><Search size={11} /> ดูเพิ่ม</a>
                        {[...new Set(urls)].map((u: string) => <LinkPill key={u} url={u} />)}
                      </div>
                    </div>
                    <div className="flex items-start md:justify-end">
                      <span className="rounded-full bg-[#f0eee5] px-2.5 py-1 text-[10px] md:text-[11px] text-[#6d7c74]">{it.distance || '—'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {detail.notes?.length > 0 && (
              <div className="mt-5 rounded-xl bg-[#f7f0df] p-3.5 text-xs md:text-sm leading-6 md:leading-7 text-[#80602e]">
                {detail.notes.map((n: string, i: number) => <p key={i}>✦ {n}</p>)}
              </div>
            )}
            
            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button disabled={detail.day === 1} onClick={() => goDay(detail.day - 1)} className="rounded-full border border-[#d6e1d9] px-4 py-2 text-xs md:text-sm disabled:opacity-30">← วันก่อนหน้า</button>
              <button disabled={detail.day === 11} onClick={() => goDay(detail.day + 1)} className="rounded-full bg-[#285c52] px-4 py-2 text-xs md:text-sm text-white disabled:opacity-30">วันถัดไป →</button>
            </div>
          </div>
        </div>
      </section>
    ) : (
      /* หน้าหลักเว็บไซต์ */
      <>
        {/* 2. ปรับปรุง HERO COVER ให้เห็นภาพเต็มบนทุกขนาดหน้าจอ */}
        <section id="home" className="relative isolate min-h-[420px] sm:min-h-[520px] md:min-h-[640px] overflow-hidden">
          <Image src="/images/cover-hero.png" alt="Cover Hero" fill priority className="absolute inset-0 -z-20 object-cover object-top sm:object-center" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102e2c]/85 via-[#173b37]/50 to-transparent" />
          <div className="mx-auto flex min-h-[420px] sm:min-h-[520px] md:min-h-[640px] max-w-[1440px] items-center px-5 sm:px-8 md:px-16 py-12 md:py-16">
            <div className="max-w-2xl text-white">
              <div className="mb-3 md:mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs tracking-widest backdrop-blur"><Mountain size={13} /> NORTHERN THAILAND · ROAD TRIP</div>
              <p className="font-display text-4xl sm:text-6xl md:text-8xl font-semibold leading-[.95]">ทริปเหนือ</p>
              <p className="mt-2 md:mt-3 font-display text-2xl sm:text-4xl md:text-6xl italic">Road Trip <span className="font-sans text-xl sm:text-3xl not-italic font-light">11 วัน 10 คืน</span></p>
              <div className="mt-5 md:mt-7 flex flex-wrap items-center gap-2 md:gap-3"><span className="rounded-full bg-[#e4b66c] px-3.5 py-1.5 md:px-5 md:py-2.5 text-xs md:text-sm font-semibold text-[#233f39]">19 – 29 ธันวาคม 2569</span><span className="text-xs md:text-sm text-white/80">Bangkok → North → Bangkok</span></div>
              <p className="mt-4 md:mt-7 max-w-md text-xs md:text-sm leading-6 md:leading-7 text-white/85">เก็บทุกเส้นทาง สร้างทุกความทรงจำ<br />11 วันแห่งภูเขา สายหมอก และการเดินทาง</p>
              <a href="#roadmap" className="mt-6 md:mt-9 inline-flex items-center gap-2 md:gap-3 rounded-full bg-white px-5 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-semibold text-[#214a43]">สำรวจแผนการเดินทาง <ArrowRight size={16} /></a>
            </div>
          </div>
        </section>

        {/* 3. แผนที่เส้นทาง รองรับ Responsive */}
        <section id="roadmap" className="mx-auto max-w-[1440px] px-4 py-10 md:px-10 md:py-20">
          <div className="mb-5 md:mb-7"><p className="eyebrow text-xs">THE JOURNEY</p><h2 className="section-title text-xl md:text-3xl">Roadmap <span>เส้นทางทริป 11 วัน 10 คืน</span></h2></div>
          <div className="relative overflow-hidden rounded-[20px] md:rounded-[28px] bg-[#dbe7df] shadow-[0_20px_60px_rgba(35,68,57,.12)]">
            <Image src="/images/cover-hero.png" alt="Roadmap Background" fill className="absolute inset-0 opacity-20 object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#edf0e7]/85 via-[#e7eee7]/70 to-[#b6cbbd]/80" />
            <div className="relative p-4 md:p-9">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div><p className="font-display text-2xl md:text-3xl italic text-[#244e47]">The Northern Journey</p><p className="mt-1 text-[10px] md:text-xs tracking-widest text-[#71847a]">BANGKOK · 19—29 DECEMBER 2026</p></div>
                <p className="text-[10px] md:text-xs text-[#526d62]">11 DAYS · APPROX. 2,400 KM</p>
              </div>
              <div className="overflow-x-auto">
                <svg viewBox="0 0 1100 330" className="mb-4 h-auto w-full min-w-[700px]" role="img" aria-label="เส้นทางการเดินทาง 11 วัน จากกรุงเทพฯ ขึ้นภาคเหนือและกลับกรุงเทพฯ"><path d="M45 255 C110 220 125 90 220 90 S330 240 405 210 S510 60 590 100 S710 250 785 205 S900 65 1045 100" fill="none" stroke="#fff" strokeWidth="18" strokeLinecap="round" /><path d="M45 255 C110 220 125 90 220 90 S330 240 405 210 S510 60 590 100 S710 250 785 205 S900 65 1045 100" fill="none" stroke="#315f53" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" />{trip.days.map((d: Day, i: number) => { const pts = [[45, 255], [135, 140], [220, 90], [310, 145], [405, 210], [500, 155], [590, 100], [690, 150], [785, 205], [900, 65], [1045, 100]]; const [x, y] = pts[i]; return <g key={d.day} onClick={() => goDay(d.day)} className="cursor-pointer"><circle cx={x} cy={y} r="19" fill="#f8f5ec" stroke="#315f53" strokeWidth="3" /><text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#244e47">{d.day}</text><text x={x} y={y + (i % 2 === 0 ? 37 : -30)} textAnchor="middle" fontSize="12" fontWeight="600" fill="#244e47">{['เขาหน่อ', 'เขาหลวง', 'เชียงใหม่', 'เชียงใหม่', 'เชียงดาว', 'ฝาง', 'ฝาง', 'วัดร่องขุ่น', 'ดอยช้าง', 'เขาโมอาย', 'ตาก'][i]}</text></g>; })}</svg>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {trip.days.map((d: Day, i: number) => <button key={d.day} onClick={() => goDay(d.day)} className="group rounded-xl border border-white/90 bg-white/85 p-2.5 md:p-3 text-left shadow-sm transition hover:-translate-y-1 hover:bg-white"><span className="text-[9px] md:text-[10px] font-bold tracking-widest text-[#b17a2d]">DAY {String(d.day).padStart(2, '0')}</span><span className="mt-0.5 block text-xs font-semibold leading-5 text-[#31584f]">{places[i][0]}</span><span className="mt-1 flex items-center gap-1 text-[9px] md:text-[10px] text-[#78877e]">ดูรายละเอียด <ChevronRight size={11} /></span></button>)}
              </div>
            </div>
            <div className="relative border-t border-white/70 bg-white/65 px-4 md:px-6 py-3 md:py-4 text-xs text-[#3d5d54]"><Route className="mr-2 inline" size={15} />{trip.route}<span className="float-right font-semibold">{trip.distance}</span></div>
          </div>
        </section>

        {/* รายละเอียดการเดินทางรายวัน */}
        <section id="days" className="bg-[#eeece4] px-4 py-10 md:px-10 md:py-20">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-6 md:mb-8"><p className="eyebrow text-xs">DAY BY DAY</p><h2 className="section-title text-xl md:text-3xl">รายละเอียดการเดินทาง <span>เลือกวันเพื่อเปิดแผนรายวัน</span></h2></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {trip.days.map((d: Day, i: number) => (
                <article key={d.day} className="overflow-hidden rounded-2xl border border-[#e1dfd6] bg-[#fbfaf6] shadow-sm transition hover:-translate-y-1">
                  <div className="relative h-40 sm:h-48">
                    <Image src={dayCoverImages[d.day] || '/images/cover-hero.png'} alt={places[i][0]} fill className="object-cover object-top" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-[#285c52] px-3 py-1 font-display text-base md:text-lg italic text-white">Day {String(d.day).padStart(2, '0')}</span>
                  </div>
                  <div className="p-4">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-[#9b7540]"><CalendarDays size={13} />{d.heading.replace(/.*—/, '').trim()}</div>
                    <h3 className="min-h-[44px] text-sm md:text-[15px] font-semibold leading-5 md:leading-6">{places[i][0]}</h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#71817b]">{d.route}</p>
                    <button onClick={() => goDay(d.day)} className="mt-3 flex w-full items-center justify-between border-t border-[#e9e6dc] pt-2.5 text-xs font-semibold text-[#2b5d52]">ดูรายละเอียด <ArrowUpRight size={14} /></button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ค่าใช้จ่าย */}
        <section id="budget" className="mx-auto max-w-[1440px] px-4 py-10 md:px-10 md:py-20">
          <div className="rounded-[20px] md:rounded-[26px] border border-[#e3e0d6] bg-white p-4 sm:p-6 md:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow text-xs">BUDGET PLANNER</p><h2 className="mt-1 text-xl md:text-2xl font-semibold">รายละเอียดค่าใช้จ่ายทริป</h2></div><Wallet size={24} className="text-[#b17a36]" /></div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-[#234f47] p-4 md:p-5 text-white md:col-span-2"><p className="text-[10px] md:text-xs tracking-widest text-[#c5d8c9]">TOTAL ESTIMATED TRIP COST</p><p className="mt-1 md:mt-2 text-2xl sm:text-3xl md:text-4xl font-semibold tabular-nums">{money(26741.08)} ฿</p><p className="mt-1 text-[11px] md:text-xs text-white/70">ยอดรวมค่าใช้จ่ายทั้งหมดโดยประมาณ</p></div>
              <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#f2f0e8] p-3.5"><p className="text-[11px] text-[#77877e]">Paid / recorded</p><b className="mt-1 block text-base md:text-xl">{money(5341.08)} ฿</b></div><div className="rounded-2xl bg-[#f8f2e5] p-3.5"><p className="text-[11px] text-[#98713a]">Estimate</p><b className="mt-1 block text-base md:text-xl">{money(19700)} ฿</b></div></div>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[650px] border-collapse text-left text-xs md:text-sm">
                <thead><tr className="border-b border-[#e8e6de] text-[11px] md:text-xs text-[#829089]"><th className="px-2.5 py-2.5">หมวด</th><th className="px-2.5 py-2.5">รายการ</th><th className="px-2.5 py-2.5">Paid by</th><th className="px-2.5 py-2.5">สถานะ</th><th className="px-2.5 py-2.5 text-right">จำนวนเงิน</th></tr></thead>
                <tbody>{expenseRows.map((r, i) => <tr key={i} className="border-b border-[#efede6] last:border-0"><td className="px-2.5 py-2.5 font-medium">{r.category}</td><td className="px-2.5 py-2.5 text-[#64786f]">{r.item}</td><td className="px-2.5 py-2.5 text-[#64786f]">{r.paidBy}</td><td className="px-2.5 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[9px] md:text-[10px] font-semibold ${r.status === 'Paid' ? 'bg-[#e6f0e8] text-[#356b4d]' : r.status === 'Pending' ? 'bg-[#fbefdc] text-[#9a6b22]' : 'bg-[#edf0f2] text-[#64727a]'}`}>{r.status}</span></td><td className="px-2.5 py-2.5 text-right font-semibold tabular-nums">{money(r.amount)} ฿</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>

        {/* เช็กลิสต์ */}
        <section id="checklist" className="bg-[#e8ece4] px-4 py-10 md:px-10 md:py-20">
          <div className="mx-auto max-w-[1440px]">
            <p className="eyebrow text-xs">BEFORE YOU GO</p>
            <h2 className="section-title text-xl md:text-3xl">เช็กลิสต์เตรียมตัว <span>พร้อมแล้ว {checks.length} / {totalItems} รายการ ({percent}%)</span></h2>
            <div className="mt-4 md:mt-6 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#2c6659] transition-all" style={{ width: `${percent}%` }} /></div>
            <div className="mt-5 md:mt-7 grid gap-4 md:grid-cols-2">
             {categories.map((cat) => (
  <div key={cat.title} className="rounded-2xl border border-white bg-[#fbfaf6] p-4 md:p-5 shadow-sm">
    <h3 className="text-base md:text-lg font-semibold text-[#31594f]">{cat.title}</h3>
    {cat.sub && <p className="mt-0.5 text-xs text-[#8a968e]">{cat.sub}</p>}
    <div className="mt-3 space-y-2">
      {cat.items.map((x) => {
        const isChecked = checks.includes(x);
        return (
          <label
            key={x}
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 md:p-3 text-xs md:text-sm transition ${
              isChecked ? 'border-[#a8c5b3] bg-[#dce9df] text-[#688076]' : 'border-[#eeece4] bg-white text-[#34584f]'
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                const checked = e.target.checked;
                setChecks((old) => (checked ? [...old, x] : old.filter((y) => y !== x)));
              }}
              className="h-3.5 w-3.5 md:h-4 md:w-4 accent-[#285c52]"
            />
            <span className={isChecked ? 'line-through' : ''}>{x}</span>
            {isChecked && <Check size={14} className="ml-auto" strokeWidth={2.5} />}
          </label>
        );
      })}
    </div>
  </div>
))}
          </div>
        </section>
      </>
    )}

    {/* Pop-up Lightbox Modal สำหรับขยายรูปภาพและกดสไลด์ */}
    {lightboxIndex !== null && currentGallery.length > 0 && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-sm">
        {/* ปุ่มปิด */}
        <button 
          onClick={() => setLightboxIndex(null)} 
          className="absolute top-4 right-4 z-50 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition"
        >
          <X size={24} />
        </button>

        {/* ปุ่มซูม */}
        <button 
          onClick={() => setIsZoomed(!isZoomed)} 
          className="absolute top-4 right-16 z-50 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition"
        >
          {isZoomed ? <ZoomOut size={24} /> : <ZoomIn size={24} />}
        </button>

        {/* ปุ่มเลื่อนซ้าย (ก่อนหน้า) */}
        {currentGallery.length > 1 && (
          <button 
            onClick={handlePrevImage} 
            className="absolute left-2 sm:left-4 z-50 rounded-full bg-white/20 p-2 sm:p-3 text-white hover:bg-white/40 transition"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* ตัวรูปภาพหลัก */}
        <div className="relative h-[75vh] w-[90vw] max-w-5xl overflow-auto flex items-center justify-center">
          <div className={`relative transition-all duration-300 ${isZoomed ? 'w-[140%] h-[140%]' : 'w-full h-full'}`}>
            <Image 
              src={currentGallery[lightboxIndex]} 
              alt={`Gallery preview ${lightboxIndex + 1}`} 
              fill 
              className="object-contain"
            />
          </div>
        </div>

        {/* ปุ่มเลื่อนขวา (ถัดไป) */}
        {currentGallery.length > 1 && (
          <button 
            onClick={handleNextImage} 
            className="absolute right-2 sm:right-4 z-50 rounded-full bg-white/20 p-2 sm:p-3 text-white hover:bg-white/40 transition"
          >
            <ChevronRight size={28} />
          </button>
        )}

        {/* ตัวระบุลำดับภาพ */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-white">
          {lightboxIndex + 1} / {currentGallery.length}
        </div>
      </div>
    )}

    <footer className="bg-[#1e4841] px-4 py-6 md:px-10 text-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
        <div className="font-display text-xl md:text-2xl italic">Northbound <span className="ml-2 font-sans text-[9px] md:text-[10px] tracking-[.2em] not-italic">TRAVEL PLANNER</span></div>
        <p className="text-[11px] md:text-xs text-white/65">Good Vibes · Great Journey · Better Together</p>
        <button onClick={() => { setSelected(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-1.5 text-xs text-white/80">กลับหน้าแรก <ArrowUpRight size={14} /></button>
      </div>
    </footer>
  </main>;
}
