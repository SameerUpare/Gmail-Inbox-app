import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Mail, LayoutDashboard, Send, ShieldAlert, ListChecks } from 'lucide-react';
import { useState, useRef } from 'react';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [demoStep, setDemoStep] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const navItems = [
        { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { to: '/senders', label: 'Sender Explorer', icon: <Send size={20} /> },
        { to: '/plans', label: 'Cleanup Plans', icon: <ListChecks size={20} /> },
        { to: '/audit', label: 'Audit Logs', icon: <ShieldAlert size={20} /> },
    ];

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const time = audioRef.current.currentTime;
        let step = 0;

        // Adjusted timings based on generated TTS length (approx ~35-40s)
        if (time > 0 && time < 8.5) { step = 1; if (location.pathname !== '/') navigate('/'); } // Welcome & Safety
        else if (time >= 8.5 && time < 15) { step = 2; if (location.pathname !== '/') navigate('/'); } // Dashboard metrics
        else if (time >= 15 && time < 20.5) { step = 3; if (location.pathname !== '/senders') navigate('/senders'); } // Senders Table
        else if (time >= 20.5 && time < 28.5) { step = 4; if (location.pathname !== '/plans') navigate('/plans'); } // Plan generation & sim
        else if (time >= 28.5 && time < 34) { step = 5; if (location.pathname !== '/plans') navigate('/plans'); } // Exec & Undo
        else if (time >= 34 && time < 45) { step = 6; if (location.pathname !== '/audit') navigate('/audit'); } // Audit Logs

        if (step !== demoStep) {
            setDemoStep(step);
            document.body.className = `demo-step-${step}`;
        }
    };

    const handleEnded = () => {
        setDemoStep(0);
        document.body.className = "demo-step-0";
    };

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Mail color="var(--accent)" size={28} />
                    <h2>Antigravity</h2>
                </div>

                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: '16px', background: 'var(--bg-surface-hover)', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Interactive Audio Demo</div>
                    <audio
                        ref={audioRef}
                        controls
                        src="/demo_audio.mp3"
                        style={{ width: '100%', height: '36px' }}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                        onPause={() => { document.body.className = "demo-step-0"; setDemoStep(0); }}
                    ></audio>
                </div>

                <div className="glass-panel step1-target" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>SYSTEM ACTIVE</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Mode: <strong>READ-ONLY</strong><br />
                        Enforcement: <strong style={{ color: 'var(--danger)' }}>OFF</strong>
                    </p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
