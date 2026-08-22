'use client';

import { useEffect, useState, useCallback } from 'react';
import CoinCard from './CoinCard';
import DetailPanel from './DetailPanel';
import styles from './BscBoard.module.css';

const REFRESH_MS = 45000;

export default function BscBoard() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [now, setNow] = useState(new Date());

  const fetchMarkets = useCallback(async () => {
    try {
      setError('');
      const res = await fetch('/api/bsc/markets', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      setCoins(data);
      setLastFetch(new Date());

      setSelected((prevSelected) => {
        if (prevSelected) {
          const refreshed = data.find((c) => c.id === prevSelected.id);
          return refreshed || prevSelected;
        }
        return data[0] || null;
      });
    } catch (e) {
      setError(
        `Gagal narik data dari CoinGecko lek — bisa kena rate limit atau network. (${e.message})`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    const t = setInterval(fetchMarkets, REFRESH_MS);
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(t);
      clearInterval(clock);
    };
  }, [fetchMarkets]);

  const secsAgo = lastFetch
    ? Math.max(0, Math.floor((now - lastFetch) / 1000))
    : null;

  return (
    <>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <span>戦</span>
          </div>
          <div>
            <h1>
              BSC <em>GRID</em>
            </h1>
            <small>LIVE CHAIN BOARD // BNB SMART CHAIN ECOSYSTEM</small>
          </div>
        </div>
        <div className={styles.statusCluster}>
          <div className={styles.liveLabel}>
            <span className={styles.liveDot} />
            LIVE {secsAgo !== null ? `· ${secsAgo}s lalu` : ''}
          </div>
          <div className={`${styles.clock} mono`}>
            {now.toLocaleTimeString('id-ID', { hour12: false })}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.boardHead}>
          <div>
            <h2>Top BSC Coins</h2>
            <div className={styles.sub}>
              source: coingecko.com/api · category=binance-smart-chain-ecosystem
            </div>
          </div>
          <div className={styles.refreshNote}>
            auto-refresh tiap <b>45s</b> · via server proxy Next.js
          </div>
        </div>

        {error && (
          <div className={styles.err}>
            {error}
            <br />
            <button onClick={fetchMarkets}>COBA LAGI</button>
          </div>
        )}

        {!error && loading && coins.length === 0 && (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div className={styles.skel} key={i} />
            ))}
          </div>
        )}

        {!error && coins.length > 0 && (
          <div className={styles.grid}>
            {coins.map((c, idx) => (
              <CoinCard
                key={c.id}
                coin={c}
                rank={idx + 1}
                selected={selected?.id === c.id}
                onSelect={() => setSelected(c)}
              />
            ))}
          </div>
        )}

        {!loading && !error && coins.length === 0 && (
          <div className={styles.empty}>
            Gak ada data coin BSC yang ketarik lek.
          </div>
        )}

        {selected && <DetailPanel coin={selected} />}
      </main>

      <footer className={styles.footer}>
        <span className={styles.flag}>▲</span> DATA BY COINGECKO PUBLIC API ·
        NOT FINANCIAL ADVICE · BUILT FOR HYPERGARUDA
      </footer>
    </>
  );
}
