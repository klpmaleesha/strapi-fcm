import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Messages from '../admin/src/components/Messages';
import Configure from '../admin/src/components/Settings/Configure';
import PluginIcon from '../admin/src/components/PluginIcon';
import Theme from 'demo-theme';

const Icon = ({ type }) => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{type === 'settings' ? <><circle cx="12" cy="12" r="3"/><path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 3-1 2 2 3-1 1-3 3-1 2-3-2-2 1-3-3-2-3 1-2-2Z"/></> : type === 'image' ? <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/></> : type === 'grid' ? <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 10h18M10 10v11"/></> : <><path d="M5 4h14v16H5zM9 8h6M9 12h6M9 16h4"/></>}</svg>;
function App() {
  const [page, setPage] = useState('plugin');
  const [notice, setNotice] = useState(null);
  const [stats, setStats] = useState({ devices: 1204, messages: 0 });
  const [scenario, setScenario] = useState('mixed');
  const [revision, setRevision] = useState(0);
  const loadStats = () => fetch('/demo/stats').then((r) => r.json()).then(setStats);
  useEffect(() => {
    const receive = (event) => { setNotice(event.detail); loadStats(); };
    window.addEventListener('demo-notice', receive);
    loadStats();
    return () => window.removeEventListener('demo-notice', receive);
  }, []);
  const reset = async (value) => {
    await fetch('/demo/scenario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario: value }) });
    setScenario(value); setNotice(null); setRevision((n) => n + 1); await loadStats();
  };
  return <div className={`shell ${process.env.REAL_STRAPI_UI === '1' ? 'real-strapi-ui' : ''}`}>
    <aside className="sidebar" aria-label="Strapi navigation">
      <a className="brand" href="/"><span className="strapi-mark">S</span><span><b>Strapi Dashboard</b><small>Workplace</small></span></a>
      <div className="sidebar-nav">
        <button className="shell-link" disabled><Icon type="document"/>Content Manager</button>
        <div className="nav-label">Plugins</div>
        <button className="shell-link" disabled><Icon type="grid"/>Content-Type Builder</button>
        <button className="shell-link" disabled><Icon type="image"/>Media Library</button>
        <button className={`shell-link ${page === 'plugin' ? 'active' : ''}`} onClick={() => setPage('plugin')}><PluginIcon/>Strapi FCM</button>
        <div className="nav-label">General</div>
        <button className={`shell-link ${page === 'settings' ? 'active' : ''}`} onClick={() => setPage('settings')}><Icon type="settings"/>Settings</button>
      </div>
      <div className="sidebar-bottom"><span className="avatar">MP</span><span>Maleesha Prabash</span><span className="version">v0.2.0</span></div>
    </aside>
    <main>
      <div className="demo-toolbar"><span className="demo-label">Interactive demo</span><span className="demo-description">Simulated Firebase and Cloudinary · No external uploads</span><span className="demo-devices">{stats.devices.toLocaleString()} sample devices</span></div>
      {notice && <div className={`notice ${notice.type}`} role="alert"><span aria-hidden="true">{notice.type === 'success' ? '✓' : '!'}</span><p>{notice.message}</p><button aria-label="Dismiss notification" onClick={() => setNotice(null)}>×</button></div>}
      <div key={`${page}-${revision}`}>{page === 'plugin' ? <Messages/> : <Configure/>}</div>
      <details className="demo-controls"><summary>Demo scenarios</summary><div className="scenario-content"><label htmlFor="scenario">Sample audience<select id="scenario" value={scenario} onChange={(e) => reset(e.target.value)}><option value="mixed">Mixed results · 1,204 devices</option><option value="healthy">All healthy · 1,204 devices</option><option value="empty">No registered devices</option><option value="outage">Firebase transport error</option></select></label><p>{scenario === 'mixed' ? 'One expired token and two temporary failures. Sending removes the expired token; testing leaves it untouched.' : scenario === 'outage' ? 'Simulates a failed connection to Firebase. The form becomes available again after the error.' : scenario === 'empty' ? 'An empty audience returns a clear result without sending.' : 'All sample devices accept the message.'}<br/>Changing the scenario resets devices and history.</p></div></details>
      <footer>This local demo uses the plugin’s actual screens and server service, with a lightweight Strapi shell and simulated delivery. <a href="https://github.com/klpmaleesha/strapi-fcm" target="_blank" rel="noreferrer">Source code</a></footer>
    </main>
  </div>;
}
createRoot(document.getElementById('root')).render(<Theme><App/></Theme>);
