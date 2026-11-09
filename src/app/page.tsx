import TripSite from '@/components/trip-site';
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-screen">
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

      {/* เนื้อหาหลักของเว็บไซต์ */}
      <TripSite />
    </main>
  );
}
