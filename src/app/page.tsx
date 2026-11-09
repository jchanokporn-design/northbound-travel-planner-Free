import TripSite from '@/components/trip-site';
export default function Home(){ return <TripSite/>; }
import Image from "next/image";
export default function Home() {
  return (
    <main>
      {/* ส่วน Header / Hero Section */}
      <div className="relative w-full h-[400px]">
        <Image
          src="/images/cover-hero.png"
          alt="Header Cover"
          fill
          priority
          className="object-cover"
        />
      </div>
      
      {/* เนื้อหาอื่นๆ ของเว็บ */}
    </main>
  );
}
