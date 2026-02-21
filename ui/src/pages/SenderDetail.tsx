import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Mail, ShieldAlert, Tag, CalendarClock } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function SenderDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [sender, setSender] = useState<any>(null);
    const [error, setError] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    const executeAction = async (actionType: string) => {
        setIsExecuting(true);
        try {
            await axios.post(`${API_BASE}/plan/execute`, {
                target_email: sender.email,
                action_type: actionType
            });
            setActionSuccess(actionType);
        } catch (err) {
            console.error("Failed to execute action", err);
        } finally {
            setIsExecuting(false);
        }
    };

    useEffect(() => {
        axios.get(`${API_BASE}/senders/${id}`)
            .then(res => setSender(res.data))
            .catch(() => setError('Sender not found or API error.'));
    }, [id]);

    if (error) return <div className="animate-fade-in" style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;
    if (!sender) return <div className="animate-fade-in" style={{ padding: '2rem' }}>Loading sender details...</div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    className="btn btn-outline"
                    style={{ padding: '8px', border: 'none' }}
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="page-title">Sender Analysis</h1>
                    <p className="page-description">Deep dive into {sender.name}'s engagement metrics.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
                {/* Profile Card */}
                <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={24} color="var(--accent)" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{sender.name}</h2>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{sender.email}</span>
                        </div>
                    </div>

                    <hr style={{ borderColor: 'var(--border)', margin: 0 }} />

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            <ShieldAlert size={16} /> Recommended Action
                        </div>

                        {actionSuccess === 'unsubscribe' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="badge badge-success" style={{ fontSize: '1.2rem', padding: '12px 16px', display: 'flex', alignItems: 'center', width: 'fit-content' }}>
                                    Unsubscribed Successfully ✓
                                </div>
                                <div style={{ padding: '24px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--danger)' }}>
                                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--danger)', fontSize: '1.1rem' }}>Delete Historical Emails</h4>
                                    <p style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                                        Would you also like to delete all {sender.total_emails} historical emails from this sender?
                                    </p>
                                    <button
                                        className="btn btn-outline"
                                        style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '10px 20px', fontSize: '1rem' }}
                                        onClick={() => executeAction('delete')}
                                        disabled={isExecuting}
                                    >
                                        {isExecuting ? 'Deleting...' : 'Delete All Emails'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {actionSuccess === 'delete' && (
                            <div className="badge badge-success" style={{ fontSize: '1.2rem', padding: '12px 16px', display: 'flex', alignItems: 'center', width: 'fit-content' }}>
                                Deleted Successfully ✓
                            </div>
                        )}

                        {!actionSuccess && (
                            <button
                                className={`btn btn-${sender.suggested_action === 'unsubscribe' ? 'warning' : 'outline'}`}
                                style={{ fontSize: '1rem', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: isExecuting ? 'default' : 'pointer', width: 'fit-content' }}
                                onClick={() => executeAction(sender.suggested_action)}
                                disabled={isExecuting}
                            >
                                {isExecuting ? 'Processing...' : sender.suggested_action.toUpperCase()}
                            </button>
                        )}
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            <Tag size={16} /> Assigned Labels
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {sender.labels.length > 0 ? sender.labels.map((l: string) => (
                                <span key={l} className="badge badge-neutral">{l}</span>
                            )) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>None</span>}
                        </div>
                    </div>
                </div>

                {/* Metrics Card */}
                <div className="glass-panel" style={{ padding: '32px' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={20} color="var(--accent)" /> Engagement Metrics
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                        <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Volume</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{sender.total_emails}</div>
                        </div>
                        <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Unread Count</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: sender.unread_count > 0 ? 'var(--warning)' : 'inherit' }}>{sender.unread_count}</div>
                        </div>
                    </div>

                    <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CalendarClock size={20} color="var(--accent)" /> Timeline
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>First Seen</span>
                            <span>{new Date(sender.first_seen_date).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Last Opened</span>
                            <span>{sender.last_opened_date ? new Date(sender.last_opened_date).toLocaleString() : 'Never'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
