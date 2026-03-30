import { useState, useEffect } from 'react';
import './index.css';
import { applyDecay } from './utils/storage';
import Home    from './screens/Home';
import Log     from './screens/Log';
import Summary from './screens/Summary';
import Stats   from './screens/Stats';

export default function App() {
  const [screen,      setScreen]      = useState('home'); // home | log | summary | stats
  const [summaryData, setSummaryData] = useState(null);
  const [decayInfo,   setDecayInfo]   = useState({ decayApplied: 0 });
  const [navTab,      setNavTab]      = useState('home');

  useEffect(() => {
    const result = applyDecay();
    setDecayInfo(result);
  }, []);

  const goLog = () => setScreen('log');

  const goSummary = (data) => {
    setSummaryData(data);
    setScreen('summary');
  };

  const goHome = () => {
    setScreen('home');
    setNavTab('home');
    // Re-apply decay on return (noop if already done)
    const result = applyDecay();
    setDecayInfo(result);
  };

  const switchTab = (tab) => {
    setNavTab(tab);
    setScreen(tab);
  };

  const isModal = screen === 'log' || screen === 'summary';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {screen === 'home'    && <Home    decayInfo={decayInfo} onStartSession={goLog} />}
        {screen === 'stats'   && <Stats />}
        {screen === 'log'     && <Log     onFinish={goSummary} onCancel={goHome} />}
        {screen === 'summary' && <Summary data={summaryData}   onDone={goHome} />}
      </div>

      {/* Bottom nav — hidden during modal screens */}
      {!isModal && (
        <nav className="nav">
          <button className={`nav-btn ${navTab === 'home'  ? 'active' : ''}`} onClick={() => switchTab('home')}>
            <span>⚔️</span><small>Dashboard</small>
          </button>
          <button className={`nav-btn ${navTab === 'stats' ? 'active' : ''}`} onClick={() => switchTab('stats')}>
            <span>📊</span><small>Stats</small>
          </button>
        </nav>
      )}
    </div>
  );
}
