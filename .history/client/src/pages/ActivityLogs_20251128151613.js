import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ActivityLogs = () => {
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const [logs, setLogs] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [error, setError] = useState('');

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      axios.get('http://localhost:5000/api/students')
        .then(res => setStudents(res.data))
        .catch(() => {});
    }
    fetchLogs();
    const id = setInterval(fetchLogs, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, selectedStudentId]);

  const fetchLogs = async () => {
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (isAdmin) {
        if (selectedStudentId) params.student_id = selectedStudentId;
      } else {
        params.user_id = user.id;
      }
      const res = await axios.get('http://localhost:5000/api/activity-logs', { params });
      setLogs(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to load logs');
    }
  };

  return (
    <div className="attendance-container" style={{ maxWidth: '1200px' }}>
      <h2 className="attendance-title">Activity Logs</h2>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="attendance_add">Attendance Add</option>
          <option value="attendance_update">Attendance Update</option>
          <option value="attendance_delete">Attendance Delete</option>
          <option value="qr_checkin">QR Check-in</option>
          <option value="qr_mark_absent">QR Mark Absent</option>
          <option value="message_send">Message Sent</option>
          <option value="message_receive">Message Received</option>
        </select>

        {isAdmin && (
          <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
            <option value="">All Students</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}{s.student_id ? ` - ${s.student_id}` : ''}</option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div style={{ marginBottom: 12, background: '#fdecea', border: '1px solid #f5c2c7', color: '#842029', padding: 10, borderRadius: 8 }}>
          {error}
        </div>
      )}

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Date/Time</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan={3} style={{ textAlign: 'center', color: '#777' }}>No activity found.</td></tr>
          ) : (
            logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.created_at).toLocaleString()}</td>
                <td>{l.type}</td>
                <td>{l.description}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLogs;

