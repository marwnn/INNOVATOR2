import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Attendance.css'; // Optional CSS file for styling

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Attendance = () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
  const [students, setStudents] = useState([]); // student list if needed
  const [attendance, setAttendance] = useState([]);
  const [newRecord, setNewRecord] = useState({
    student_id: '',
    date: '',
    day_of_week: '',
    status: '',
  });

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
    if (!newRecord.student_id || !newRecord.date || !newRecord.day_of_week || !newRecord.status) {
      alert('All fields required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/attendance', newRecord);
      fetchAttendance();
      setNewRecord({ student_id: '', date: '', day_of_week: '', status: '' });
    } catch (err) {
      console.error('Add Error:', err);
    }
  };

  const handleUpdate = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/attendance${id}`, { status: newStatus });
      fetchAttendance();
    } catch (err) {
      console.error('Update Error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/attendance${id}`);
      fetchAttendance();
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  return (
    <div className="attendance-container">
      <h2>Attendance </h2>

      {user.role === 'admin' && <div className="add-form">
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
          value={newRecord.day_of_week}
          onChange={(e) => setNewRecord({ ...newRecord, day_of_week: e.target.value })}
        >
          <option value="">Select Day</option>
          {daysOfWeek.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
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
      </div>}

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Date</th>
            <th>Day</th>
            <th>Status</th>
            {user.role === 'admin' &&
              <th>Delete</th>}
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => (
            <tr key={record.id}>
              <td>{record.student_id}</td>
              <td>{record.date}</td>
              <td>{record.day_of_week}</td>
              <td>{record.status}</td>
              <td>
                
              </td>
              <td>
                {user.role === 'admin' && <button onClick={() => handleDelete(record.id)}>🗑️</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
