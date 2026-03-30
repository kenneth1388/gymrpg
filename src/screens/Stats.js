import { useState, useEffect } from 'react';
import {
  getPlayer, getSessions, getPRs, getLevelInfo,
  buildMuscleScores, buildXPHistory, buildDiffBreakdown,
  buildRepHistory, exportAllData,
} from '../utils/storage';
import { BADGES, EXERCISES, MUSCLE_GROUPS, DIFF_LABEL, colors } from '../data/constants';

// ─── Radar ─────────────────────────────────────────────────
function Radar({ scores, size = 280 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.34, n = scores.length;
  const angle = i => (i / n) * 2 * Math.PI - Math.PI / 2;
  const pt    = (i, rr) => ({ x: cx + rr * Math.cos(angle(i)), y: cy + rr * Math.sin(angle(i)) });
  const rings = [0.25, 0.5, 0.75, 1];

  const ringPts = rings.map(f => scores.map((_, i) => { const p = pt(i, r * f); return `${p.x},${p.y}`; }).join(' '));
  const dataPts = scores.map((s, i) => pt(i, r * (s.score / 100)));
  const dataStr = dataPts.map(p => `${p.x},${p.y}`).join(' ');
  const labelPts = scores.map((s, i) => { const p = pt(i, r * 1.26); return { ...p, label: s.label, score: s.score }; });

  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      {ringPts.map((pts, i) => <polygon key={i} points={pts} fill="none" stroke="#2A2A3A" strokeWidth="0.5" />)}
      {scores.map((_, i) => { const to = pt(i, r); return <line key={i} x1={cx} y1={cy} x2={to.x} y2={to.y} stroke="#2A2A3A" strokeWidth="0.5" />; })}
      <polygon points={dataStr} fill="#7C6FF733" stroke="#7C6FF7" strokeWidth="1.5" strokeLinejoin="round" />
      {dataPts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#7C6FF7" />)}
      {labelPts.map((lp, i) => (
        <g key={i}>
          <text x={lp.x} y={lp.y - 6} fontSize="11" fontWeight="500" fill="#8884A8" textAnchor="middle">{lp.label}</text>
          <text x={lp.x} y={lp.y + 7} fontSize="10" fill="#7C6FF7" textAnchor="middle">{lp.score}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── XP Bar Chart ──────────────────────────────────────────
function XPBars({ data, width = 300 }) {
  if (!data.length) return null;
  const h = 130, maxXP = Math.max(...data.map(d => d.xp), 1);
  const bw = (width - 24) / data.length - 5;
  return (
    <svg width={width} height={h} style={{ display: 'block' }}>
      {data.map((d, i) => {
        const bh  = Math.max(2, (d.xp / maxXP) * (h - 36));
        const x   = 12 + i * ((width - 24) / data.length);
        const y   = h - 32 - bh;
        const col = d.hadPR ? '#F5C842' : '#7C6FF7';
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="3" fill={col} opacity="0.85" />
            <text x={x + bw / 2} y={h - 16} fontSize="9" fill="#4A4860" textAnchor="middle">{d.date}</text>
            <text x={x + bw / 2} y={y - 4} fontSize="9" fill={col} textAnchor="middle">{d.xp}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Donut ─────────────────────────────────────────────────
function Donut({ breakdown, size = 120 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.36, sw = size * 0.15;
  const total = breakdown.reduce((a, b) => a + b.count, 0) || 1;
  const circ  = 2 * Math.PI * r;
  const diffColors = { easy: '#3DD68C', ish: '#8884A8', hard: '#F5A623', 'very difficult': '#E85D4A' };
  let offset = 0;
  const segs = breakdown.map(d => {
    const pct = d.count / total, len = pct * circ;
    const seg = { ...d, dasharray: `${len} ${circ - len}`, rotate: offset * 360 - 90, col: diffColors[d.diff] || '#888' };
    offset += pct;
    return seg;
  });
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E1E2A" strokeWidth={sw} />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.col} strokeWidth={sw}
          strokeDasharray={s.dasharray} strokeDashoffset={0}
          transform={`rotate(${s.rotate},${cx},${cy})`} strokeLinecap="butt" />
      ))}
      <text x={cx} y={cy - 5} fontSize="16" fontWeight="700" fill="#F0EFF8" textAnchor="middle">{total}</text>
      <text x={cx} y={cy + 11} fontSize="9" fill="#8884A8" textAnchor="middle">sets</text>
    </svg>
  );
}

// ─── Sparkline ─────────────────────────────────────────────
function Spark({ data, color = '#7C6FF7', width = 280 }) {
  if (data.length < 2) return <div style={{ fontSize: 11, color: 'var(--text-dim)', padding: '8px 0' }}>Need more sessions</div>;
  const h = 50, pad = 8, min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const cw = width - pad * 2;
  const pts = data.map((v, i) => ({ x: pad + (i / (data.length - 1)) * cw, y: h - pad - ((v - min) / range) * (h - pad * 2), v }));
  const polyPts = pts.map(p => `${p.x},${p.y}`).join(' ');
  return (
    <svg width={width} height={h} style={{ display: 'block' }}>
      <polyline points={polyPts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill={color} />
          <text x={p.x} y={p.y - 6} fontSize="9" fill="#8884A8" textAnchor="middle">{p.v}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Main ──────────────────────────────────────────────────
export default function Stats() {
  const [player,    setPlayer]    = useState(null);
  const [sessions,  setSessions]  = useState([]);
  const [prs,       setPRs]       = useState({});
  const [tab,       setTab]       = useState('overview');
  const [exporting, setExporting] = useState(false);
  const [exported,  setExported]  = useState(false);

  useEffect(() => {
    setPlayer(getPlayer());
    setSessions(getSessions());
    setPRs(getPRs());
  }, []);

  if (!player) return null;

  const li            = getLevelInfo(player.totalXP);
  const pct           = Math.min(li.progress * 100, 100).toFixed(1);
  const earnedBadges  = new Set(player.badges);
  const muscleScores  = buildMuscleScores(sessions);
  const xpHistory     = buildXPHistory(sessions);
  const diffBreakdown = buildDiffBreakdown(sessions);

  const handleExport = async () => {
    setExporting(true);
    try {
      const json     = exportAllData();
      const blob     = new Blob([json], { type: 'application/json' });
      const url      = URL.createObjectURL(blob);
      const date     = new Date().toISOString().slice(0, 10);
      const filename = `gymrpg-export-${date}.json`;

      // iOS share sheet via Web Share API if available
      if (navigator.share && navigator.canShare?.({ files: [new File([blob], filename, { type: 'application/json' })] })) {
        await navigator.share({ files: [new File([blob], filename, { type: 'application/json' })], title: filename });
      } else {
        // Fallback: download
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
      }
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch {}
    setExporting(false);
  };

  const TABS = ['overview', 'progress', 'records', 'badges'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="scroll" style={{ padding: '56px 16px 32px' }}>

        {/* Player card */}
        <div className="card" style={{ borderColor: 'var(--primary-dim)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ background: 'var(--primary-dim)', borderRadius: 12, padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-glow)', letterSpacing: 1 }}>LV{li.current.level}</div>
              <div style={{ fontSize: 14, color: 'var(--primary-glow)', opacity: 0.8 }}>{li.current.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{player.totalXP.toLocaleString()} XP</div>
              <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>{player.sessionCount} sessions</div>
            </div>
          </div>
          <div className="xp-track"><div className="xp-fill" style={{ width: `${pct}%` }} /></div>
          <div className="xp-label">{li.xpInto} / {li.xpNeeded} XP</div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 12, padding: 4, marginBottom: 16, border: '0.5px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 9, fontSize: 12, fontWeight: 500,
                background: tab === t ? 'var(--bg-elevated)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text-sec)' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div className="stat-card"><div className="stat-label">Sessions</div><div className="stat-value">{player.sessionCount}</div></div>
              <div className="stat-card"><div className="stat-label">Week streak</div><div className="stat-value" style={{ color: 'var(--gold)' }}>{player.weeklyStreak}w</div></div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Muscle group balance</div>
              <div style={{ fontSize: 11, color: 'var(--text-sec)', marginBottom: 12 }}>Relative volume · last 5 sessions</div>
              <Radar scores={muscleScores} size={Math.min(280, window.innerWidth - 80)} />
            </div>

            {sessions.length > 0 && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Difficulty breakdown</div>
                <div style={{ fontSize: 11, color: 'var(--text-sec)', marginBottom: 12 }}>All sets across all sessions</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Donut breakdown={diffBreakdown} size={120} />
                  <div style={{ flex: 1 }}>
                    {diffBreakdown.map(d => (
                      <div key={d.diff} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: colors[d.diff] || 'var(--text-dim)' }} />
                        <span style={{ flex: 1, fontSize: 12, color: 'var(--text-sec)' }}>{DIFF_LABEL[d.diff]}</span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {xpHistory.length > 1 && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>XP per session</div>
                <div style={{ fontSize: 11, color: 'var(--text-sec)', marginBottom: 12 }}>Gold bar = session with a PR</div>
                <XPBars data={xpHistory} width={Math.min(300, window.innerWidth - 64)} />
              </div>
            )}

            {sessions.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-sec)', fontSize: 13 }}>Log sessions to see stats</div>}
          </>
        )}

        {/* ── Progress ── */}
        {tab === 'progress' && (
          <>
            {EXERCISES.map(ex => {
              const hist  = buildRepHistory(sessions, ex.id);
              if (hist.length < 1) return null;
              const trend = hist.length > 1 ? hist[hist.length - 1] - hist[0] : 0;
              const col   = trend > 0 ? '#3DD68C' : trend < 0 ? '#E85D4A' : '#7C6FF7';
              return (
                <div key={ex.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: col }}>
                      {trend > 0 ? `+${trend}` : trend < 0 ? `${trend}` : '→'} reps
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-sec)', marginBottom: 8 }}>{ex.muscles} · target {ex.repMin}–{ex.repMax} {ex.unit || 'reps'}</div>
                  <Spark data={hist} color={col} width={Math.min(280, window.innerWidth - 64)} />
                </div>
              );
            })}
            {sessions.length < 2 && <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-sec)', fontSize: 13 }}>Need 2+ sessions to show progress charts</div>}
          </>
        )}

        {/* ── Records ── */}
        {tab === 'records' && (
          <>
            <div className="section-label">Personal Records</div>
            {EXERCISES.map(ex => {
              const pr = prs[ex.id];
              return (
                <div key={ex.id} style={{ display: 'flex', alignItems: 'center', paddingBottom: 12, marginBottom: 12, borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>{ex.muscles}</div>
                    {pr?.date && <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{new Date(pr.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: pr ? 'var(--gold)' : 'var(--text-dim)' }}>
                    {pr ? `${pr.best} ${ex.unit || 'reps'}` : '—'}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── Badges ── */}
        {tab === 'badges' && (
          <>
            <div className="section-label">{player.badges.length} / {BADGES.length} unlocked</div>
            {BADGES.map(b => (
              <div key={b.id} className={`badge-chip ${!earnedBadges.has(b.id) ? 'locked' : ''}`}>
                <span className="badge-icon">{b.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="badge-name" style={{ color: !earnedBadges.has(b.id) ? 'var(--text-dim)' : undefined }}>{b.name}</div>
                  <div className="badge-desc">{b.desc}</div>
                </div>
                {!earnedBadges.has(b.id) && <span style={{ fontSize: 14 }}>🔒</span>}
              </div>
            ))}
          </>
        )}

        {/* Export button */}
        <button onClick={handleExport} disabled={exporting}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, padding: 16, borderRadius: 14, border: '0.5px solid var(--border)', background: exported ? '#1A2A1A' : 'var(--bg-card)', opacity: exporting ? 0.6 : 1, transition: 'background 0.3s' }}>
          <span style={{ fontSize: 22 }}>{exported ? '✅' : '📤'}</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: exported ? 'var(--green)' : 'var(--text)' }}>
              {exported ? 'Exported!' : 'Export data'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>JSON · sessions, PRs, stats, badges</div>
          </div>
        </button>

      </div>
    </div>
  );
}
