import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/StudentList.css';

const StudentList = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/studentlist');
      console.log('API response:', res.data);  // Tingnan sa console kung ano ang format ng data

      // Kung may wrapper object, kunin yung array; kung array na mismo, diretso
      if (Array.isArray(res.data)) {
        setStudents(res.data);
      } else if (Array.isArray(res.data.students)) {
        setStudents(res.data.students);
      } else {
        setStudents([]); // fallback para walang error kahit ibang format
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]); // fallback
    }
  };

  return (
    <div className="student-list-container">
      <h2>Student List</h2>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Student ID</th>
              <th>Course</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.student_id || '-'}</td>
                <td>{student.course || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentList;
