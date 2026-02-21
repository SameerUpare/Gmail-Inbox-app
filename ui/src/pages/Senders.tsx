import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const SenderRowAction = ({ sender }: { sender: any }) => {
    const [isExecuting, setIsExecuting] = useState(false);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    const executeAction = async (actionType: string) => {
        setIsExecuting(true);
        try {
            await axios.post(`${API_BASE}/plan/execute`, {
                target_email: sender.email,
                action_type: actionType,
                list_unsubscribe: sender.list_unsubscribe
            });
            setActionSuccess(actionType);
        } catch (err) {
            console.error("Failed to execute action", err);
        } finally {
            setIsExecuting(false);
        }
    };

    if (actionSuccess === 'unsubscribe') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>Unsubscribed ✓</span>
                <button
                    className="btn btn-outline"
                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '4px 8px', fontSize: '0.75rem' }}
                    onClick={() => executeAction('delete')}
                    disabled={isExecuting}
                >
                    {isExecuting ? '...' : `Delete ${sender.total_emails} Emails`}
                </button>
            </div>
        );
    }

    if (actionSuccess === 'delete') {
        return <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>Deleted ✓</span>;
    }

    return (
        <button
            className={`btn btn-${sender.suggested_action === 'unsubscribe' ? 'warning' : 'outline'}`}
            style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: isExecuting ? 'default' : 'pointer' }}
            onClick={() => executeAction(sender.suggested_action)}
            disabled={isExecuting}
        >
            {isExecuting ? '...' : sender.suggested_action.toUpperCase()}
        </button>
    );
};

export default function Senders() {
    const [senders, setSenders] = useState<any[]>([]);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const category = searchParams.get('category');
        const queryStr = category ? `?category=${category}` : '';
        axios.get(`${API_BASE}/senders${queryStr}`).then(res => {
            setSenders(res.data.senders || []);
            setNextPageToken(res.data.next_page_token || null);
        });
    }, [location.search]);

    const loadMore = async () => {
        if (!nextPageToken) return;
        setIsLoadingMore(true);
        try {
            const searchParams = new URLSearchParams(location.search);
            const category = searchParams.get('category');
            let queryStr = `?page_token=${encodeURIComponent(nextPageToken)}`;
            if (category) queryStr += `&category=${category}`;

            const res = await axios.get(`${API_BASE}/senders${queryStr}`);
            setSenders(prev => {
                // Remove duplicates by email
                const newMap = new Map();
                [...prev, ...(res.data.senders || [])].forEach(s => newMap.set(s.email, s));
                return Array.from(newMap.values());
            });
            setNextPageToken(res.data.next_page_token || null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Sender Explorer</h1>
                    <p className="page-description">Analyze individual senders and view their engagement metrics.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', gap: '8px', minWidth: '300px' }}>
                        <Search size={18} color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="Search senders..."
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.95rem' }}
                        />
                    </div>
                    <button className="btn btn-primary" disabled>Generate Cleanup Plan</button>
                </div>
            </div>

            <div className="glass-panel step3-target">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Sender Details</th>
                            <th>Total Volume</th>
                            <th>Unread</th>
                            <th>First Seen / Last Opened</th>
                            <th>Labels</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {senders.map(s => (
                            <tr key={s.id}>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{s.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.email}</div>
                                </td>
                                <td><span style={{ fontWeight: 600 }}>{s.total_emails}</span> msgs</td>
                                <td><span style={{ color: s.unread_count > 100 ? 'var(--danger)' : 'var(--text-primary)' }}>{s.unread_count}</span></td>
                                <td>
                                    <div style={{ fontSize: '0.85rem' }}>First: {new Date(s.first_seen_date).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '0.85rem', color: s.last_opened_date ? 'var(--accent)' : 'var(--danger)' }}>
                                        Last: {s.last_opened_date ? new Date(s.last_opened_date).toLocaleDateString() : 'Never Opened'}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {s.labels.map((l: string) => (
                                            <span key={l} className="badge badge-neutral">{l}</span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <SenderRowAction sender={s} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {nextPageToken && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', borderTop: '1px solid var(--border)' }}>
                        <button
                            className="btn btn-outline"
                            onClick={loadMore}
                            disabled={isLoadingMore}
                            style={{ padding: '8px 24px' }}
                        >
                            {isLoadingMore ? 'Scanning older emails...' : 'Load More Senders'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
