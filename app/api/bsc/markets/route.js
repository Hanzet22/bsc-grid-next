import { NextResponse } from 'next/server';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// This route runs on the server (Vercel Edge/Node function), so the browser
// never talks to CoinGecko directly for the list endpoint. Cached briefly to
// stay polite to the free-tier rate limit when multiple visitors hit at once.
export const revalidate = 30; // seconds

export async function GET() {
  try {
    const url =
      `${COINGECKO_BASE}/coins/markets` +
      `?vs_currency=usd` +
      `&category=binance-smart-chain-ecosystem` +
      `&order=market_cap_desc` +
      `&per_page=24` +
      `&page=1` +
      `&sparkline=true` +
      `&price_change_percentage=1h,24h`;

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
