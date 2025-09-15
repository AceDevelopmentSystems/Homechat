
import React, { useEffect, useState } from 'react';

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [banning, setBanning] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const fetchReports = (jwt) => {
    setLoading(true);
    fetch('http://localhost:5000/admin/reports', {
      headers: { Authorization: `Bearer ${jwt || token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setReports(data);
        setLoading(false);
        setError('');
      })
      .catch(() => {
        setError('Invalid admin session');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) fetchReports();
  }, [token]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    fetch('http://localhost:5000/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setToken(data.token);
        fetchReports(data.token);
        setError('');
      })
      .catch(() => setError('Invalid admin password'));
  };

  const banUser = (id) => {
    setBanning(id);
    fetch('http://localhost:5000/admin/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id })
    }).then(() => {
      setBanning(null);
      fetchReports();
    });
  };

  const clearReports = () => {
    setClearing(true);
    fetch('http://localhost:5000/admin/clear-reports', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setClearing(false);
        fetchReports();
      });
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: '64px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 24 }}>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: 12 }}
          />
          <button type="submit" style={{ width: '100%' }}>Login</button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    );
  }

  if (loading) return <div>Loading reports...</div>;
  return (
    <div style={{ maxWidth: 600, margin: '32px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 16 }}>
      <h2>User Reports</h2>
      <button onClick={clearReports} disabled={clearing} style={{ float: 'right', marginBottom: 8 }}>
        {clearing ? 'Clearing...' : 'Clear Reports'}
      </button>
      {!reports.length ? <div>No reports found.</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Reporter</th>
              <th>Reported</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td>{r.time}</td>
                <td>{r.reporterUsername}</td>
                <td>{r.reportedUsername}</td>
                <td>{r.reason}</td>
                <td>
                  <button onClick={() => banUser(r.reportedId)} disabled={banning === r.reportedId}>
                    {banning === r.reportedId ? 'Banning...' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminReports;
