import { useState, useEffect } from 'react';
import { getPlayer, getSessions, getLevelInfo, daysUntilNextDecay } from '../utils/storage';
import { BADGES } from '../data/constants';

export default function Home({ decayInfo, onStartSession }) {
  const [player,   setPlayer]   = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    setPlayer(getPlayer());
    setSessions(getSessions());
  }, []);

  if (!player) return <div style={{ flex: 1 }} />;

  const li            = getLevelInfo(player.totalXP);
  const lastSession   = sessions[0];
  const daysSinceLast = lastSession ? Math.floor((Date.now() - new Date(lastSession.date)) / 86400000) : null;
  const nextDecay     = daysUntilNextDecay(player.lastSessionDate);
  const decayDanger   = nextDecay !== null && nextDecay <= 1 && decayInfo.decayApplied === 0;
  const pct           = Math.min(li.progress * 100, 100).toFixed(1);

  return (
    <div className="scroll" style={{ padding: '16px 16px 24px' }}>

      {/* Decay banner */}
      {decayInfo.decayApplied > 0 && (
        <div style={{ background: '#2A1515', border: '0.5px solid #E85D4A66', borderRadius: 12, padding: '12px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>💀</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>−{decayInfo.decayApplied} XP decay applied</div>
            <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>Next penalty in {nextDecay ?? 3}d · get to the gym</div>
          </div>
        </div>
      )}

      {/* Decay warning */}
      {decayDanger && (
        <div style={{ background: '#2A200A', border: '0.5px solid #F5A62366', borderRadius: 12, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>⚠️</span>
          <span style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 500 }}>
            Decay in {nextDecay === 0 ? 'less than a day' : `${nextDecay}d`} — get to the gym
          </span>
        </div>
      )}

      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg,#1A1830,#0F0F14)', border: '0.5px solid var(--primary-dim)', borderRadius: 16, padding: 20, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ background: 'var(--primary-dim)', borderRadius: 12, padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-glow)', letterSpacing: 1 }}>LV{li.current.level}</div>
            <div style={{ fontSize: 14, color: 'var(--primary-glow)', opacity: 0.8 }}>{li.current.name}</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{player.totalXP.toLocaleString()} XP</div>
        </div>
        <div className="xp-track">
          <div className="xp-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="xp-label">{li.xpInto} / {li.xpNeeded} XP{li.next ? ` · ${li.xpNeeded - li.xpInto} to ${li.next.name}` : ''}</div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Sessions</div>
          <div className="stat-value">{player.sessionCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Week streak</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{player.weeklyStreak}w</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Last session</div>
          <div className="stat-value" style={{ fontSize: 16, paddingTop: 4, color: decayDanger ? 'var(--red)' : daysSinceLast !== null && daysSinceLast <= 2 ? 'var(--green)' : undefined }}>
            {daysSinceLast === null ? '—' : daysSinceLast === 0 ? 'Today' : `${daysSinceLast}d ago`}
          </div>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={onStartSession}
        style={{
          width: '100%', padding: '18px', borderRadius: 14, marginBottom: 24,
          background: 'linear-gradient(90deg,var(--primary),#5A52D5)',
          color: '#fff', fontSize: 17, fontWeight: 700, letterSpacing: 0.5,
        }}
      >
        ⚔️  Start Session
      </button>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <>
          <div className="section-label">Recent Sessions</div>
          {sessions.slice(0, 5).map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', borderRadius: 12, padding: 14, marginBottom: 8, border: '0.5px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {new Date(s.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>
                  {s.exercises?.length || 0} exercises{s.newPRs?.length > 0 ? `  ·  🏆 ${s.newPRs.length} PR` : ''}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>+{s.xpEarned} XP</div>
            </div>
          ))}
        </>
      )}

      {sessions.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚔️</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>No sessions yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>Log your first session to start earning XP</div>
        </div>
      )}
    </div>
  );
}
