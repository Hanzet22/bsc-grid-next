'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { fmtPrice, fmtCompact, fmtChg } from '@/lib/format';
import styles from './DetailPanel.module.css';

const TF_LIST = [
  { key: '1', label: '1 Hari (5 menit/tick)' },
  { key: '0.25', label: '6 Jam' },
  { key: '0.04', label: '1 Jam' },
  { key: '0.02', label: '30 Menit' },
];

export default function DetailPanel({ coin }) {
  const [activeTf, setActiveTf] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const loadChart = useCallback(
    async (days) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `/api/bsc/chart?id=${encodeURIComponent(coin.id)}&days=${days}`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

        const points = (data.prices || []).map((p) => ({ x: p[0], y: p[1] }));
        drawChart(points);
      } catch (e) {
        setError(`Gagal narik chart detail — ${e.message}`);
      } finally {
        setLoading(false);
      }
    },
    [coin.id]
  );

  function drawChart(points) {
    if (!canvasRef.current) return;
    const up = points.length > 1 ? points[points.length - 1].y >= points[0].y : true;
    const color = up ? '#33e08a' : '#ff4d5e';

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type: 'line',
      data: {
        datasets: [
          {
            data: points,
            borderColor: color,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: color,
            tension: 0.25,
            fill: true,
            backgroundColor: (ctx) => {
              const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 320);
              g.addColorStop(0, color + '2e');
              g.addColorStop(1, color + '00');
              return g;
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0c0f16',
            borderColor: '#1e2531',
            borderWidth: 1,
            titleColor: '#8891a3',
            bodyColor: '#eef1f6',
            titleFont: { family: 'JetBrains Mono', size: 10 },
            bodyFont: { family: 'JetBrains Mono', size: 12, weight: '700' },
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (ctx) =>
                '$' + Number(ctx.parsed.y).toLocaleString('en-US', { maximumFractionDigits: 6 }),
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            grid: { color: '#161b26' },
            ticks: { color: '#4d5566', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 7 },
          },
          y: {
            position: 'right',
            grid: { color: '#161b26' },
            ticks: {
              color: '#4d5566',
              font: { family: 'JetBrains Mono', size: 9 },
              callback: (v) =>
                '$' + Number(v).toLocaleString('en-US', { maximumFractionDigits: v < 1 ? 4 : 2 }),
            },
          },
        },
      },
    });
  }

  useEffect(() => {
    loadChart(activeTf);
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.id, activeTf]);

  const chg24h = coin.price_change_percentage_24h_in_currency;
  const chg1h = coin.price_change_percentage_1h_in_currency;

  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <div className={styles.detailTitle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coin.image} alt={coin.symbol} />
          <div>
            <div className={styles.sym}>
              {coin.symbol?.toUpperCase()}{' '}
              <span style={{ color: 'var(--txt-2)', fontWeight: 400, fontSize: 13 }}>/ USD</span>
            </div>
            <div className={styles.full}>
              {coin.name} · rank #{coin.market_cap_rank ?? '--'}
            </div>
          </div>
        </div>
        <div className={styles.detailPrice}>
          <div className={`${styles.p} mono`}>{fmtPrice(coin.current_price)}</div>
          <div
            className={`${styles.cardChg} ${chg24h >= 0 ? styles.up : styles.down}`}
            style={{ justifyContent: 'flex-end' }}
          >
            {fmtChg(chg24h)} (24H)
          </div>
        </div>
      </div>

      <div className={styles.rail}>
        <span className={styles.railLabel}>TIMEFRAME</span>
        {TF_LIST.map((tf) => (
          <button
            key={tf.key}
            className={`${styles.tfBtn} ${activeTf === tf.key ? styles.active : ''}`}
            onClick={() => setActiveTf(tf.key)}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {error && <div className={styles.err}>{error}</div>}

      <div
        className={styles.detailChart}
        style={{ opacity: loading ? 0.4 : 1, transition: 'opacity .15s' }}
      >
        <canvas ref={canvasRef} />
      </div>

      <div className={styles.statStrip}>
        <Stat k="MARKET CAP" v={fmtCompact(coin.market_cap)} />
        <Stat k="VOLUME 24H" v={fmtCompact(coin.total_volume)} />
        <Stat k="1H CHANGE" v={fmtChg(chg1h)} tone={chg1h >= 0 ? 'up' : 'down'} />
        <Stat k="24H HIGH" v={fmtPrice(coin.high_24h)} />
        <Stat k="24H LOW" v={fmtPrice(coin.low_24h)} />
        <Stat k="SUPPLY" v={fmtCompact(coin.circulating_supply)} />
      </div>
    </div>
  );
}

function Stat({ k, v, tone }) {
  return (
    <div className={styles.stat}>
      <div className={styles.k}>{k}</div>
      <div className={`${styles.v} ${tone ? styles[tone] : ''}`}>{v}</div>
    </div>
  );
}
