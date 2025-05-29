import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/StudentList.css';

const StudentList = () => {
  // Change to 'student' to test non-admin view
  const [userRole] = useState('admin'); // or 'student'

  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: '', student_id: '', course: '' });
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/studentlist');
      setStudents(Array.isArray(res.data) ? res.data : res.data.students || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    }
  };

  const handleInputChange = (e) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditingStudent({ ...editingStudent, [e.target.name]: e.target.value });
  };

  const addStudent = async () => {
    if (userRole !== 'admin') return;

    if (!newStudent.name.trim() || !newStudent.student_id.trim() || !newStudent.course.trim()) {
      alert('Please fill all fields');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/studentlist', newStudent);
      setNewStudent({ name: '', student_id: '', course: '' });
      fetchStudents();
    } catch (err) {
      console.error('Error adding student:', err);
    }
  };

  const updateStudent = async () => {
    if (userRole !== 'admin') return;

    if (!editingStudent.name.trim() || !editingStudent.student_id.trim() || !editingStudent.course.trim()) {
      alert('Please fill all fields');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/studentlist/${editingStudent.id}`, editingStudent);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      console.error('Error updating student:', err);
    }
  };

  const deleteStudent = async (id) => {
    if (userRole !== 'admin') return;

    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/studentlist/${id}`);
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  return (
    <div className="student-list-container" style={{ maxWidth: '700px', margin: 'auto', padding: '20px' }}>
      <h2>Student List</h2>

      {/* Only admin can add new student */}
      {userRole === 'admin' && (
        <div className="student-form" style={{ marginBottom: '20px' }}>
          <input
            name="name"
            placeholder="Name"
            value={newStudent.name}
            onChange={handleInputChange}
            style={{ marginRight: '10px' }}
          />
          <input
            name="student_id"
            placeholder="Student ID"
            value={newStudent.student_id}
            onChange={handleInputChange}
            style={{ marginRight: '10px' }}
          />
          <input
            name="course"
            placeholder="Course"
            value={newStudent.course}
            onChange={handleInputChange}
            style={{ marginRight: '10px' }}
          />
          <button onClick={addStudent}>Add Student</button>
        </div>
      )}

      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          cellSpacing="0"
          style={{ width: '100%', borderCollapse: 'collapse' }}
        >
          <thead>
            <tr style={{ backgroundColor: '#eee' }}>
              <th>ID</th>
              <th>Name</th>
              <th>Student ID</th>
              <th>Course</th>
              {userRole === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>

                <td>
                  {editingStudent?.id === student.id ? (
                    userRole === 'admin' ? (
                      <input
                        name="name"
                        value={editingStudent.name}
                        onChange={handleEditChange}
                      />
                    ) : (
                      student.name
                    )
                  ) : (
                    student.name
                  )}
                </td>

                <td>
                  {editingStudent?.id === student.id ? (
                    userRole === 'admin' ? (
                      <input
                        name="student_id"
                        value={editingStudent.student_id}
                        onChange={handleEditChange}
                      />
                    ) : (
                      student.student_id || '-'
                    )
                  ) : (
                    student.student_id || '-'
                  )}
                </td>

                <td>
                  {editingStudent?.id === student.id ? (
                    userRole === 'admin' ? (
                      <input
                        name="course"
                        value={editingStudent.course}
                        onChange={handleEditChange}
                      />
                    ) : (
                      student.course || '-'
                    )
                  ) : (
                    student.course || '-'
                  )}
                </td>

                {userRole === 'admin' && (
                  <td>
                    {editingStudent?.id === student.id ? (
                      <>
                        <button onClick={updateStudent} style={{ marginRight: '5px' }}>
                          Save
                        </button>
                        <button onClick={() => setEditingStudent(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingStudent(student)} style={{ marginRight: '5px' }}>
                          Edit
                        </button>
                        <button onClick={() => deleteStudent(student.id)}>Delete</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentList;
