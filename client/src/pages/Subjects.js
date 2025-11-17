import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/StudentList.css';

const Subjects = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ subject_code: '', subject_title: '', term: '', units: '' });
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/subjects');
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setSubjects([]);
    }
  };

  const handleInputChange = (e) => {
    setNewSubject({ ...newSubject, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditingSubject({ ...editingSubject, [e.target.name]: e.target.value });
  };

  const addSubject = async () => {
    if (user.role !== 'admin') return;

    if (!newSubject.subject_code.trim() || !newSubject.subject_title.trim() || !newSubject.term.trim() || !newSubject.units.trim()) {
      alert('Please fill all fields');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/subjects', newSubject);
      setNewSubject({ subject_code: '', subject_title: '', term: '', units: '' });
      fetchSubjects();
    } catch (err) {
      console.error('Error adding subject:', err);
      alert(err.response?.data?.error || 'Failed to add subject');
    }
  };

  const updateSubject = async () => {
    if (user.role !== 'admin') return;

    if (!editingSubject.subject_code.trim() || !editingSubject.subject_title.trim() || !editingSubject.term.trim() || !editingSubject.units.trim()) {
      alert('Please fill all fields');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/subjects/${editingSubject.id}`, editingSubject);
      setEditingSubject(null);
      fetchSubjects();
    } catch (err) {
      console.error('Error updating subject:', err);
      alert(err.response?.data?.error || 'Failed to update subject');
    }
  };

  const deleteSubject = async (id) => {
    if (user.role !== 'admin') return;

    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      console.error('Error deleting subject:', err);
      alert(err.response?.data?.error || 'Failed to delete subject');
    }
  };

  return (
    <div className="student-list-container" style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <h2>Subject List</h2>

      {/* Only admin can add new subject */}
      {user.role === 'admin' && (
        <div className="student-form" style={{ marginBottom: '20px' }}>
          <input
            name="subject_code"
            placeholder="Subject Code"
            value={newSubject.subject_code}
            onChange={handleInputChange}
            style={{ marginRight: '10px' }}
          />
          <input
            name="subject_title"
            placeholder="Subject Title"
            value={newSubject.subject_title}
            onChange={handleInputChange}
            style={{ marginRight: '10px' }}
          />
          <input
            name="term"
            placeholder="Term"
            value={newSubject.term}
            onChange={handleInputChange}
            style={{ marginRight: '10px' }}
          />
          <input
            name="units"
            placeholder="Units"
            value={newSubject.units}
            onChange={handleInputChange}
            style={{ marginRight: '10px' }}
          />
          <button onClick={addSubject}>Add Subject</button>
        </div>
      )}

      {subjects.length === 0 ? (
        <p>No subjects found.</p>
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
              <th>Subject Code</th>
              <th>Subject Title</th>
              <th>Term</th>
              <th>Units</th>
              {user.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td>{subject.id}</td>

                <td>
                  {editingSubject?.id === subject.id ? (
                    user.role === 'admin' ? (
                      <input
                        name="subject_code"
                        value={editingSubject.subject_code}
                        onChange={handleEditChange}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      subject.subject_code
                    )
                  ) : (
                    subject.subject_code
                  )}
                </td>

                <td>
                  {editingSubject?.id === subject.id ? (
                    user.role === 'admin' ? (
                      <input
                        name="subject_title"
                        value={editingSubject.subject_title}
                        onChange={handleEditChange}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      subject.subject_title
                    )
                  ) : (
                    subject.subject_title
                  )}
                </td>

                <td>
                  {editingSubject?.id === subject.id ? (
                    user.role === 'admin' ? (
                      <input
                        name="term"
                        value={editingSubject.term}
                        onChange={handleEditChange}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      subject.term || '-'
                    )
                  ) : (
                    subject.term || '-'
                  )}
                </td>

                <td>
                  {editingSubject?.id === subject.id ? (
                    user.role === 'admin' ? (
                      <input
                        name="units"
                        value={editingSubject.units}
                        onChange={handleEditChange}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      subject.units || '-'
                    )
                  ) : (
                    subject.units || '-'
                  )}
                </td>

                {user.role === 'admin' && (
                  <td>
                    {editingSubject?.id === subject.id ? (
                      <>
                        <button onClick={updateSubject} style={{ marginRight: '5px' }} className="save-btn">
                          Save
                        </button>
                        <button onClick={() => setEditingSubject(null)} className="cancel-btn">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingSubject(subject)} style={{ marginRight: '5px' }} className="edit-btn">
                          Edit
                        </button>
                        <button onClick={() => deleteSubject(subject.id)} className="delete-btn">Delete</button>
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

export default Subjects;

