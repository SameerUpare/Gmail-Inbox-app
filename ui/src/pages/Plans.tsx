import { useState } from 'react';
import axios from 'axios';
import { Play, RotateCcw, ShieldAlert, Cpu } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function Plans() {
    const [plan, setPlan] = useState<any>(null);
    const [simulation, setSimulation] = useState<any>(null);

    const generatePlan = async () => {
        const res = await axios.post(`${API_BASE}/plan/generate`);
        setPlan(res.data);
    };

    const simulatePlan = async () => {
        const res = await axios.post(`${API_BASE}/plan/simulate`);
        setSimulation(res.data);
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Cleanup Plans & Simulation</h1>
                    <p className="page-description">Generate rules, simulate impact, and trigger controlled executions.</p>
                </div>
                <button className="btn btn-primary" onClick={generatePlan}><Cpu size={18} /> Generate Plan</button>
            </div>

            {!plan && (
                <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Click "Generate Plan" to create a new deterministic cleanup rule based on intelligence data.
                </div>
            )}

            {plan && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div className="glass-panel step4-target" style={{ padding: '24px' }}>
                            <h3 style={{ marginBottom: '16px' }}>Plan Review (ID: {plan.plan_id})</h3>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Target Sender</th>
                                        <th>Affected</th>
                                        <th>Action</th>
                                        <th>Confidence</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plan.senders.map((s: any, i: number) => (
                                        <tr key={i}>
                                            <td>{s.sender}</td>
                                            <td>{s.emails_affected}</td>
                                            <td><span className="badge badge-warning">{s.recommended_action}</span></td>
                                            <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>{(s.confidence * 100).toFixed(0)}%</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShieldAlert size={20} color="var(--warning)" />
                                    Dry-Run Simulation
                                </h3>
                                <button className="btn btn-outline" onClick={simulatePlan}><Play size={16} /> Run Simulation</button>
                            </div>

                            {!simulation ? (
                                <div style={{ padding: '24px', background: 'var(--bg-surface)', borderRadius: '8px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                    Awaiting simulation trigger...
                                </div>
                            ) : (
                                <div style={{ padding: '24px', background: 'var(--bg-surface)', borderRadius: '8px', color: 'var(--success)', fontFamily: 'monospace' }}>
                                    [SIMULATION ONLY] No Gmail Endpoints Modified<br /><br />
                                    Affected Emails: {simulation.affected_emails}<br />
                                    Target Labels: {simulation.labels_created.join(', ')}<br /><br />
                                    Mocked API Calls:<br />
                                    {simulation.mock_api_calls.map((call: string, i: number) => (
                                        <div key={i} style={{ color: 'var(--accent)', marginTop: '4px' }}>&gt; {call}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="glass-panel step4-target" style={{ padding: '24px' }}>
                            <h3 style={{ marginBottom: '16px' }}>Impact Summary</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Total Emails Processed</span>
                                <span style={{ fontWeight: 600 }}>{plan.summary.total_emails}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Est. Cleanup Impact</span>
                                <span style={{ fontWeight: 600, color: 'var(--success)' }}>{plan.summary.estimated_cleanup_percent}% inbox reduction</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Risk Score</span>
                                <span style={{ fontWeight: 600, color: 'var(--success)' }}>Low Risk ({(plan.senders[0].risk_score * 100).toFixed(0)}%)</span>
                            </div>
                        </div>

                        <div className="glass-panel step5-target" style={{ padding: '24px', border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
                            <h3 style={{ color: 'var(--danger)', marginBottom: '16px' }}>Controlled Execution</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                                Executing will apply labels and mark items for unsubscription via the backend. Proceed with caution.
                            </p>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <input type="checkbox" id="confirm" style={{ accentColor: 'var(--danger)' }} />
                                <label htmlFor="confirm" style={{ fontSize: '0.8rem', userSelect: 'none' }}>I understand this modifies my Gmail.</label>
                            </div>
                            <button className="btn btn-danger" style={{ width: '100%' }} disabled>Execute Pipeline</button>
                        </div>

                        <div className="glass-panel step5-target" style={{ padding: '16px' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <RotateCcw size={16} />
                                Undo System (Phase 3)
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Recent executions can be reverted within 1 hr. Active: 0</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
