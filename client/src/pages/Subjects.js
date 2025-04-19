import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Subjects = () => {
   const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ subject_code: '', subject_title: '' });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.subject_code || !newSubject.subject_title) return;

    try {
      await axios.post('http://localhost:5000/api/subjects', newSubject);
      fetchSubjects();
      setNewSubject({ subject_code: '', subject_title: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Subjects List</h2>

      {user.role === 'admin' && (
        <form onSubmit={handleAddSubject} className="mb-4 space-x-2">
          <input
            type="text"
            placeholder="Subject Code"
            value={newSubject.subject_code}
            onChange={(e) => setNewSubject({ ...newSubject, subject_code: e.target.value })}
            className="border p-1"
          />
          <input
            type="text"
            placeholder="Subject Title"
            value={newSubject.subject_title}
            onChange={(e) => setNewSubject({ ...newSubject, subject_title: e.target.value })}
            className="border p-1"
          />
          <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
            Add Subject
          </button>
        </form>
      )}

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Code</th>
            <th className="border p-2">Title</th>
            {user.role === 'admin' && <th className="border p-2">Action</th>}
          </tr>
        </thead>
        <tbody>
          {subjects.map((subj) => (
            <tr key={subj.id}>
              <td className="border p-2">{subj.subject_code}</td>
              <td className="border p-2">{subj.subject_title}</td>
              {user.role === 'admin' && (
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleDelete(subj.id)}
                    className="text-red-500 hover:underline"
                  >
                    🗑 Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Subjects;
