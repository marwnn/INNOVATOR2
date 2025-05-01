import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Attendance.css'; 

const Attendance = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const [attendance, setAttendance] = useState([]);
  const [newRecord, setNewRecord] = useState({
    student_id: '',
    date: '',
    status: '',
  });
  const [editRecordId, setEditRecordId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance');
      setAttendance(res.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const handleAdd = async () => {
    if (!newRecord.student_id || !newRecord.date || !newRecord.status) {
      alert('All fields are required');
      return;
    }

    const dayOfWeek = new Date(newRecord.date).toLocaleDateString('en-US', { weekday: 'long' });

    try {
      await axios.post('http://localhost:5000/api/attendance', {
        ...newRecord,
        day_of_week: dayOfWeek,
      });
      fetchAttendance();
      setNewRecord({ student_id: '', date: '', status: '' });
    } catch (err) {
      console.error('Add Error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/attendance/${id}`);
      fetchAttendance();
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  const handleEdit = (record) => {
    setEditRecordId(record.id);
    setEditStatus(record.status);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/attendance/${id}`, { status: editStatus });
      setEditRecordId(null);
      setEditStatus('');
      fetchAttendance();
    } catch (err) {
      console.error('Update Error:', err);
    }
  };

  return (
    <div className="attendance-container">
      <h2>Attendance</h2>

      {user.role === 'admin' && (
        <div className="add-form">
          <input
            type="text"
            placeholder="Student ID"
            value={newRecord.student_id}
            onChange={(e) => setNewRecord({ ...newRecord, student_id: e.target.value })}
          />
          <input
            type="date"
            value={newRecord.date}
            onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
          />
          <select
            value={newRecord.status}
            onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value })}
          >
            <option value="">Select Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Excused">Excused</option>
          </select>
          <button onClick={handleAdd}>Add Record</button>
        </div>
      )}

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Date</th>
            <th>Day</th>
            <th>Status</th>
            {user.role === 'admin' && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => (
            <tr key={record.id}>
              <td>{record.student_id}</td>
              <td>{record.student_name}</td>
              <td>{record.date}</td>
              <td>{record.day_of_week}</td>
              <td>
                {editRecordId === record.id ? (
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Excused">Excused</option>
                  </select>
                ) : (
                  record.status
                )}
              </td>
              {user.role === 'admin' && (
                <td>
                  {editRecordId === record.id ? (
                    <>
                      <div style={{display:"flex"}}>
                      <button onClick={() => handleUpdate(record.id)} style={{ marginRight: '5px', color: 'green' }}>Save</button>
                        <button onClick={() => setEditRecordId(null)} style={{ color: 'gray' }}>Cancel</button>
                        </div>
                    </>
                  ) : (
                      <>
                        <div style={{display:"flex"}}>
                      <button onClick={() => handleEdit(record)} style={{ marginRight: '5px' }}>Edit</button>
                          <button onClick={() => handleDelete(record.id)} style={{ color: 'red' }}>Delete</button>
                          </div>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
