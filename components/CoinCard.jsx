'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { fmtPrice, fmtCompact, fmtChg } from '@/lib/format';
import styles from './CoinCard.module.css';

export default function CoinCard({ coin, rank, selected, onSelect }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const prices = coin.sparkline_in_7d?.price || [];
    const up = prices.length > 1 ? prices[prices.length - 1] >= prices[0] : true;
    const color = up ? '#33e08a' : '#ff4d5e';

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: prices.map((_, i) => i),
        datasets: [
          {
            data: prices,
            borderColor: color,
            borderWidth: 1.6,
            pointRadius: 0,
            tension: 0.3,
            fill: true,
            backgroundColor: (ctx) => {
              const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 52);
              g.addColorStop(0, color + '33');
              g.addColorStop(1, color + '00');
              return g;
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        elements: { point: { radius: 0 } },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [coin.sparkline_in_7d]);

  const chg24h = coin.price_change_percentage_24h_in_currency;

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' ? onSelect() : null)}
    >
      <div className={styles.rank}>#{rank}</div>
      <div className={styles.cardTop}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coin.image} alt={coin.symbol} loading="lazy" />
        <div className={styles.cardName}>
          <div className={styles.sym}>{coin.symbol?.toUpperCase()}</div>
          <div className={styles.full}>{coin.name}</div>
        </div>
      </div>
      <div className={`${styles.cardPrice} mono`}>{fmtPrice(coin.current_price)}</div>
      <div className={`${styles.cardChg} ${chg24h >= 0 ? styles.up : styles.down}`}>
        {fmtChg(chg24h)} · 24H
      </div>
      <div className={styles.spark}>
        <canvas ref={canvasRef} />
      </div>
      <div className={styles.cardFoot}>
        <span>MCAP {fmtCompact(coin.market_cap)}</span>
        <span>VOL {fmtCompact(coin.total_volume)}</span>
      </div>
    </div>
  );
}
