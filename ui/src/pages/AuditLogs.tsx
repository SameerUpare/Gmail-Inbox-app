import { useEffect, useState } from 'react';
import axios from 'axios';
import { Server, Key, Activity } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function AuditLogs() {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        axios.get(`${API_BASE}/audit/logs`).then(res => setLogs(res.data));
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'token_validation': return <Key size={16} color="var(--success)" />;
            case 'scan_run': return <Server size={16} color="var(--accent)" />;
            default: return <Activity size={16} color="var(--warning)" />;
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Audit Logs</h1>
                <p className="page-description">Immutable record of system access, scans, and simulation events.</p>
            </div>

            <div className="glass-panel step6-target">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Log Event Type</th>
                            <th>Details</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                        {getIcon(log.event_type)}
                                        {log.event_type.toUpperCase()}
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-secondary)' }}>{log.details}</td>
                                <td><span className="badge badge-success">OK / RO</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
