import { useState } from 'react';
import { commitSession } from '../utils/storage';
import { EXERCISES, DIFFICULTIES, DIFF_LABEL, colors } from '../data/constants';

function buildState() {
  return EXERCISES.map(ex => ({
    exerciseId: ex.id, name: ex.name, muscles: ex.muscles,
    unit: ex.unit || 'reps', note: ex.note, repMin: ex.repMin, repMax: ex.repMax,
    sets: Array.from({ length: ex.sets }, (_, i) => ({ setNum: i + 1, reps: ex.target, difficulty: 'hard' })),
  }));
}

function SetRow({ set, idx, repMin, repMax, unit, onChange }) {
  const atMax  = set.reps >= repMax;
  const belMin = set.reps < repMin;
  const bColor = atMax ? colors.gold : belMin ? colors.red + '88' : 'transparent';

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>SET {idx + 1}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Rep counter */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', borderRadius: 10, border: `1px solid ${bColor}`, overflow: 'hidden' }}>
          <button onClick={() => onChange({ ...set, reps: Math.max(0, set.reps - 1) })}
            style={{ padding: '8px 16px', fontSize: 20, color: 'var(--primary)', fontWeight: 300 }}>−</button>
          <input
            type="number" value={set.reps} min="0"
            onChange={e => onChange({ ...set, reps: parseInt(e.target.value) || 0 })}
            style={{ width: 44, textAlign: 'center', background: 'none', color: 'var(--text)', fontSize: 18, fontWeight: 600, border: 'none', outline: 'none', padding: '8px 0' }}
          />
          <button onClick={() => onChange({ ...set, reps: set.reps + 1 })}
            style={{ padding: '8px 16px', fontSize: 20, color: 'var(--primary)', fontWeight: 300 }}>+</button>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{unit}</span>

        {/* Difficulty pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DIFFICULTIES.map(d => {
            const col = colors[d] || colors.textSecondary;
            const sel = set.difficulty === d;
            return (
              <button key={d} onClick={() => onChange({ ...set, difficulty: d })}
                className="diff-pill"
                style={{ borderColor: col, color: sel ? col : 'var(--text-sec)', background: sel ? col + '33' : 'transparent' }}>
                {DIFF_LABEL[d]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ExCard({ ex, idx, onChange }) {
  const [open, setOpen] = useState(idx === 0);
  const onTarget = ex.sets.every(s => s.reps >= ex.repMin);
  const updateSet = (si, updated) => { const sets = [...ex.sets]; sets[si] = updated; onChange({ ...ex, sets }); };

  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, textAlign: 'left' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{ex.name}</span>
            {onTarget && <span style={{ color: 'var(--green)', fontSize: 13 }}>✓</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>{ex.muscles}</div>
          {ex.note && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>{ex.note}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: 'var(--text-sec)', fontWeight: 500 }}>
            {ex.repMin}–{ex.repMax} {ex.unit || 'reps'}
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div style={{ marginTop: 14, borderTop: '0.5px solid var(--border)', paddingTop: 14 }}>
          {ex.sets.map((s, i) => (
            <SetRow key={i} set={s} idx={i} repMin={ex.repMin} repMax={ex.repMax} unit={ex.unit || 'reps'} onChange={u => updateSet(i, u)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Log({ onFinish, onCancel }) {
  const [exercises, setExercises] = useState(buildState);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const updateEx = (i, updated) => { const ex = [...exercises]; ex[i] = updated; setExercises(ex); };

  const handleFinish = () => {
    const total = exercises.flatMap(e => e.sets).reduce((a, s) => a + s.reps, 0);
    if (total === 0) { setError('Log at least one rep before finishing.'); return; }
    setSaving(true);
    try {
      const session = { date: new Date().toISOString(), exercises: exercises.map(ex => ({ exerciseId: ex.exerciseId, name: ex.name, sets: ex.sets })) };
      const result = commitSession(session);
      onFinish({ result, session });
    } catch (e) {
      setError('Could not save. Try again.');
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '56px 16px 12px', borderBottom: '0.5px solid var(--border)' }}>
        <button onClick={onCancel} style={{ fontSize: 15, color: 'var(--text-sec)', padding: 4 }}>Cancel</button>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Session</span>
        <button onClick={handleFinish} disabled={saving}
          style={{ background: saving ? 'var(--primary-dim)' : 'var(--primary)', color: '#fff', padding: '7px 16px', borderRadius: 20, fontSize: 14, fontWeight: 600 }}>
          {saving ? 'Saving…' : 'Finish'}
        </button>
      </div>

      {error && <div style={{ background: '#2A1515', color: 'var(--red)', fontSize: 13, padding: '8px 16px', textAlign: 'center' }}>{error}</div>}

      <div className="scroll" style={{ padding: '10px 16px 32px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', marginBottom: 12 }}>
          Tap to expand · gold border = at target · red = below minimum
        </div>
        {exercises.map((ex, i) => <ExCard key={ex.exerciseId} ex={ex} idx={i} onChange={u => updateEx(i, u)} />)}
      </div>
    </div>
  );
}
