import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 86400;

function cleanText(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

/**
 * Free, keyless image lookup using Wikimedia Commons' public MediaWiki API.
 * Results are community-uploaded photographs; availability and exact location match vary.
 */
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim();
  if (!query) return NextResponse.json({ error: 'missing_query' }, { status: 400 });

  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} Thailand`,
    gsrnamespace: '6',
    gsrlimit: '8',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1400',
    format: 'json',
  });

  try {
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { 'User-Agent': 'NorthboundTravelPlanner/1.0 (personal travel planner)' },
      next: { revalidate: 86400 },
    });
    if (!response.ok) return NextResponse.json({ error: 'commons_search_failed' }, { status: 502 });
    const data = await response.json();
    const pages = Object.values(data.query?.pages ?? {}) as Array<any>;
    const candidate = pages.find((page) => {
      const info = page.imageinfo?.[0];
      const url = info?.thumburl || info?.url;
      return url && /\.(jpe?g|png|webp)$/i.test(url.split('?')[0]);
    });
    const info = candidate?.imageinfo?.[0];
    if (!info) return NextResponse.json({ error: 'photo_not_found' }, { status: 404 });

    const metadata = info.extmetadata ?? {};
    const artist = cleanText(metadata.Artist?.value || metadata.Credit?.value || 'Wikimedia Commons contributor');
    const license = cleanText(metadata.LicenseShortName?.value || 'ดูเงื่อนไขใน Wikimedia Commons');
    return NextResponse.json({
      photoUri: info.thumburl || info.url,
      credit: artist,
      license,
      sourceUrl: info.descriptionurl,
      title: candidate.title,
    }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
  } catch {
    return NextResponse.json({ error: 'unexpected_error' }, { status: 500 });
  }
}
