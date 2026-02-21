import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, BookOpen, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = 'http://localhost:8000';

export default function Dashboard() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState<any>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [authRequired, setAuthRequired] = useState(false);
    const [showUnreadModal, setShowUnreadModal] = useState(false);
    const [wipingCategory, setWipingCategory] = useState<string | null>(null);

    const handleWipeCategory = async (category: string) => {
        if (!confirm(`Are you sure you want to permanently delete up to 1000 emails in ${category}?`)) return;
        setWipingCategory(category);
        try {
            await axios.delete(`${API_BASE}/categories/${category}`);
            // Force a refresh of the dashboard
            const sumRes = await axios.get(`${API_BASE}/scan/summary`);
            setSummary(sumRes.data);
        } catch (err) {
            console.error("Failed to wipe category", err);
        } finally {
            setWipingCategory(null);
        }
    };

    useEffect(() => {
        async function checkAuthAndFetchData() {
            try {
                // Must pass credentials for cookie session tracking
                axios.defaults.withCredentials = true;

                const authRes = await axios.get(`${API_BASE}/oauth/me`);
                if (!authRes.data.authenticated) {
                    setAuthRequired(true);
                    return;
                }

                const [sumRes, canRes] = await Promise.all([
                    axios.get(`${API_BASE}/scan/summary`),
                    axios.get(`${API_BASE}/insights/unsubscribe-candidates`)
                ]);
                setSummary(sumRes.data);
                setCandidates(canRes.data);
            } catch (err) {
                console.error(err);
            }
        }
        checkAuthAndFetchData();
    }, []);

    const handleGoogleConnect = () => {
        window.location.href = `${API_BASE}/oauth/login`;
    };

    if (authRequired) {
        return (
            <div className="animate-fade-in" style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-panel step1-target" style={{ padding: '48px', textAlign: 'center', maxWidth: '400px' }}>
                    <h2 style={{ marginBottom: '16px' }}>Connect Your Gmail</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        To generate authentic intelligence metrics, securely connect your Google account.
                    </p>
                    <button className="btn btn-primary" onClick={handleGoogleConnect} style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Mail size={18} /> Connect via Google OAuth
                    </button>
                </div>
            </div>
        );
    }

    const chartData = [...candidates]
        .sort((a, b) => b.total_emails - a.total_emails)
        .slice(0, 5)
        .map(c => ({
            name: c.name,
            volume: c.total_emails,
        }));

    const unreadByCategory = summary?.unread_by_category || {};

    if (!summary) return <div className="animate-fade-in" style={{ padding: '2rem' }}>Loading intelligence data...</div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Intelligence Dashboard</h1>
                <p className="page-description">Overview of inbox scan insights and recommended actions.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div className="glass-panel step2-target" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--accent)' }}>
                        <Mail size={24} />
                        <h3 style={{ margin: 0 }}>Total Scanned</h3>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{summary.total_emails_scanned.toLocaleString()}</div>
                </div>

                <div
                    className="glass-panel"
                    style={{ padding: '24px', cursor: 'pointer' }}
                    onClick={() => setShowUnreadModal(true)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--warning)' }}>
                        <BookOpen size={24} />
                        <h3 style={{ margin: 0 }}>Total Unread</h3>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{summary.total_unread.toLocaleString()}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Click to view by category</div>
                </div>

                <div
                    className="glass-panel"
                    style={{ padding: '24px', cursor: 'pointer' }}
                    onClick={() => navigate('/senders')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--danger)' }}>
                        <Trash2 size={24} />
                        <h3 style={{ margin: 0 }}>Never Read</h3>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{candidates.filter(c => c.unread_count === c.total_emails && c.total_emails > 0).length} Senders</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className="glass-panel step2-target" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Top Senders by Volume</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'var(--bg-surface-hover)' }} contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                <Bar dataKey="volume" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Top Unsubscribe Candidates</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Sender</th>
                                <th>Volume</th>
                                <th>Unread</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.slice(0, 5).map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{c.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.email}</div>
                                    </td>
                                    <td>{c.total_emails}</td>
                                    <td>{c.unread_count}</td>
                                    <td>
                                        <span
                                            className="badge badge-warning"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/senders/${c.id}`)}
                                        >
                                            Review
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showUnreadModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowUnreadModal(false)}>
                    <div className="glass-panel" style={{ width: '400px', padding: '32px', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BookOpen size={24} color="var(--warning)" /> Unread by Category
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            {Object.entries(unreadByCategory).sort(([, a], [, b]) => Number(b) - Number(a)).map(([category, count]) => (
                                <div
                                    key={category}
                                    style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}
                                >
                                    <div
                                        style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        onClick={() => {
                                            setShowUnreadModal(false);
                                            navigate(`/senders?category=${category}`);
                                        }}
                                    >
                                        <span style={{ fontWeight: 500 }}>{category}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{Number(count).toLocaleString()}</span>
                                        <button
                                            className="btn btn-outline"
                                            style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '4px 8px', fontSize: '0.75rem' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleWipeCategory(category);
                                            }}
                                            disabled={wipingCategory === category}
                                        >
                                            {wipingCategory === category ? 'Wiping...' : 'Wipe Clean'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setShowUnreadModal(false)}>Close Breakdown</button>
                    </div>
                </div>
            )}
        </div>
    );
}
