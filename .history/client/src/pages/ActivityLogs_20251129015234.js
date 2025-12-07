import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LoginHistory = () => {
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const [logs, setLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [error, setError] = useState('');

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      axios.get('http://localhost:5000/api/studentlist')
        .then(res => setStudents(res.data))
        .catch(() => {});
    }
    fetchLogs();
    const id = setInterval(fetchLogs, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [selectedStudentId]);

  const fetchLogs = async () => {
    try {
      const params = {
        type: ['login', 'logout']  // <-- ONLY LOGIN & LOGOUT
      };

      if (isAdmin) {
        if (selectedStudentId) params.student_id = selectedStudentId;
      } else {
        params.user_id = user.id;
      }

      const res = await axios.get('http://localhost:5000/api/activity_logs', { params });
      const filtered = (Array.isArray(res.data) ? res.data : [])
        .filter(l => l.type === 'login' || l.type === 'logout');

      setLogs(filtered);
      setError('');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load logs');
    }
  };

  return (
    <div className="attendance-container" style={{ maxWidth: '900px' }}>
      <h2 className="attendance-title">Login / Logout History</h2>

      {isAdmin && (
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          style={{ marginBottom: 12 }}
        >
          <option value="">All Users</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}{s.student_id ? ` - ${s.student_id}` : ''}
            </option>
          ))}
        </select>
      )}

      {error && (
        <div style={{ marginBottom: 12, background: '#fdecea', border: '1px solid #f5c2c7', color: '#842029', padding: 10, borderRadius: 8 }}>
          {error}
        </div>
      )}

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Date/Time</th>
            <th>Action</th>
            <th>User</th> {/* DESCRIPTION → NAME */}
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan={3} style={{ textAlign: 'center', color: '#777' }}>No login/logout history found.</td></tr>
          ) : (
            logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.created_at).toLocaleString()}</td>
                <td>{l.type === 'login' ? 'Login' : 'Logout'}</td>
                <td>{l.description}</td> {/* SHOULD BE USER NAME */}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LoginHistory;
