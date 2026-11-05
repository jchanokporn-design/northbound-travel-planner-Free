'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const fallbacks: Record<number,string> = {
  1:'photo-1500530855697-b586d89ba3ee', 2:'photo-1464822759023-fed622ff2c3b',
  3:'photo-1519608487953-e999c86e7455', 4:'photo-1500534623283-312a48b',
  5:'photo-1464278533981-50106e6176b1', 6:'photo-1591081658714-f576fb7eab7f',
  7:'photo-1500534314209-a25fda', 8:'photo-1500534623283-312a48b',
  9:'photo-1470770841072-f978cf4d019e', 10:'photo-1500530855697-b586d89ba3ee',
  11:'photo-1470770841072-f978cf4d019e'
};

type PhotoResult = { photoUri: string; credit: string; license: string; sourceUrl: string };

export function PlacePhoto({ query, day, className = '' }: { query:string; day:number; className?:string }) {
  const [photo,setPhoto] = useState<PhotoResult|null>(null);
  const [ready,setReady] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setReady(true); observer.disconnect(); }
    }, { rootMargin: '250px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!ready) return;
    let live = true;
    fetch(`/api/place-photo?q=${encodeURIComponent(query)}`)
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (live && data?.photoUri) setPhoto(data); })
      .catch(() => {});
    return () => { live = false; };
  }, [query,ready]);

  const fallback = `https://images.unsplash.com/${fallbacks[day] || 'photo-1464822759023-fed622ff2c3b'}?auto=format&fit=crop&w=1400&q=85`;
  return <div ref={host} className={`relative overflow-hidden ${className}`}>
    <Image src={photo?.photoUri || fallback} alt={query} fill unoptimized className="object-cover transition-transform duration-700 hover:scale-105" sizes="(max-width:768px) 100vw, 50vw" />
    {photo && <a href={photo.sourceUrl} target="_blank" rel="noreferrer" title={`${photo.credit} · ${photo.license}`} className="absolute bottom-2 right-2 max-w-[85%] truncate rounded-full bg-black/55 px-2 py-1 text-[9px] text-white hover:bg-black/75">ภาพ: {photo.credit} · {photo.license}</a>}
  </div>;
}
