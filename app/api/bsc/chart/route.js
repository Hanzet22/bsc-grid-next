import { NextResponse } from 'next/server';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export const revalidate = 30;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const days = searchParams.get('days') || '1';

  if (!id) {
    return NextResponse.json({ error: 'Missing coin id' }, { status: 400 });
  }

  try {
    const url = `${COINGECKO_BASE}/coins/${encodeURIComponent(
      id
    )}/market_chart?vs_currency=usd&days=${encodeURIComponent(days)}`;

    const res = await fetch(url, {
      next: { revalidate: 30 },
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `CoinGecko responded ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || 'Unknown fetch error' },
      { status: 500 }
    );
  }
}
