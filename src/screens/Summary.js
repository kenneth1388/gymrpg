import { useEffect, useState } from 'react';
import { getLevelInfo } from '../utils/storage';
import { BADGES, EXERCISES, colors } from '../data/constants';

export default function Summary({ data, onDone }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  if (!data) return null;
  const { result, session } = data;
  const { xpEarned, newPRs, newlyEarned, player } = result;
  const li          = getLevelInfo(player.totalXP);
  const pct         = Math.min(li.progress * 100, 100).toFixed(1);
  const badgeLookup = Object.fromEntries(BADGES.map(b => [b.id, b]));
  const exLookup    = Object.fromEntries(EXERCISES.map(e => [e.id, e.name]));

  return (
    <div className="scroll" style={{ padding: '56px 16px 48px', opacity: visible ? 1 : 0, transform: `translateY(${visible ? 0 : 24}px)`, transition: 'all 0.4s ease' }}>

      {/* XP burst */}
      <div style={{ background: 'linear-gradient(160deg,#1A1830,#0F0F14)', border: '0.5px solid var(--primary-dim)', borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: 1 }}>Session Complete</div>
        <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--primary)', margin: '4px 0 14px' }}>+{xpEarned} XP</div>
        <div style={{ background: 'var(--primary-dim)', borderRadius: 12, padding: '8px 16px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-glow)', letterSpacing: 1 }}>LV{li.current.level}</div>
          <div style={{ fontSize: 14, color: 'var(--primary-glow)', opacity: 0.8 }}>{li.current.name}</div>
        </div>
        <div className="xp-track"><div className="xp-fill" style={{ width: `${pct}%` }} /></div>
        <div className="xp-label">{li.xpInto} / {li.xpNeeded} XP{li.next ? ` · ${li.xpNeeded - li.xpInto} to ${li.next.name}` : ''}</div>
      </div>

      {/* PRs */}
      {newPRs.length > 0 && (
        <>
          <div className="section-label">🏆 Personal Records</div>
          <div className="card">
            {newPRs.map((pr, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? '0.5px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{exLookup[pr.exerciseId] || pr.exerciseId}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>{pr.reps} reps</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Badges */}
      {newlyEarned.length > 0 && (
        <>
          <div className="section-label">🎖 Badges Unlocked</div>
          {newlyEarned.map(id => {
            const b = badgeLookup[id]; if (!b) return null;
            return (
              <div key={id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 28 }}>{b.icon}</span>
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</div><div style={{ fontSize: 12, color: 'var(--text-sec)' }}>{b.desc}</div></div>
              </div>
            );
          })}
        </>
      )}

      {/* Session log */}
      <div className="section-label">Session Log</div>
      {session.exercises.map((ex, i) => (
        <div key={i} className="card" style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{ex.name}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ex.sets.map((s, j) => (
              <div key={j} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{s.reps}</div>
                <div style={{ fontSize: 10, marginTop: 2, color: colors[s.difficulty] || 'var(--text-sec)' }}>
                  {s.difficulty === 'very difficult' ? 'v.hard' : s.difficulty}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={onDone}
        style={{ width: '100%', marginTop: 24, padding: 16, borderRadius: 14, background: 'var(--bg-card)', border: '0.5px solid var(--border)', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
        Back to Dashboard
      </button>
    </div>
  );
}
