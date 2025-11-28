import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "../styles/Grades.css";

const Grades = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [grades, setGrades] = useState([]);
  const [newGrade, setNewGrade] = useState({
    student_id: '',
    school_year: '',
    subject_code: '',
    subject_title: '',
    midterm: '',
    finals: '',
    grade: '',
    units: ''
  });
  const [editGrade, setEditGrade] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [studentFilterId, setStudentFilterId] = useState('');
  const [needsSelfSelect, setNeedsSelfSelect] = useState(false);

  const computeFinal = (m, f) => {
    const mid = parseFloat(m);
    const fin = parseFloat(f);
    if (isNaN(mid) && isNaN(fin)) return '';
    const mm = isNaN(mid) ? 0 : mid;
    const ff = isNaN(fin) ? 0 : fin;
    const divisor = (isNaN(mid) || isNaN(fin)) ? 1 : 2;
    return ((mm + ff) / divisor).toFixed(2);
  };

  const computeGWA = (rows) => {
    const items = rows.filter(r => r.grade && r.units && !isNaN(parseFloat(r.grade)) && !isNaN(parseFloat(r.units)));
    const totalUnits = items.reduce((sum, r) => sum + parseFloat(r.units), 0);
    if (!totalUnits) return '';
    const weighted = items.reduce((sum, r) => sum + parseFloat(r.grade) * parseFloat(r.units), 0);
    return (weighted / totalUnits).toFixed(2);
  };

  const fetchGrades = () => {
    if (user.role !== 'admin') {
      // Ask backend to resolve using user_id for stronger mapping
      axios
        .get('http://localhost:5000/api/grades', { params: { user_id: user.id } })
        .then(res => setGrades(res.data))
        .catch(err => console.error(err));
      return;
    }
    axios
      .get('http://localhost:5000/api/grades')
      .then(res => setGrades(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (user.role === 'admin') {
      fetchGrades();
      axios.get('http://localhost:5000/api/studentlist')
        .then(res => setStudents(res.data))
        .catch(err => console.error(err));
      axios.get('http://localhost:5000/api/subjects')
        .then(res => setSubjects(res.data))
        .catch(err => console.error(err));
    } else {
      // Try stored mapping first
      const stored = localStorage.getItem('selfStudentId');
      if (stored) {
        setStudentFilterId(String(stored));
      }
      // resolve this user's student record by exact name match
      axios.get('http://localhost:5000/api/studentlist')
        .then(res => {
          setStudents(res.data);
          if (!stored) {
            const match = res.data.find(s => (s.name || '').trim().toLowerCase() === (user.name || '').trim().toLowerCase());
            if (match) {
              setStudentFilterId(String(match.id));
              localStorage.setItem('selfStudentId', String(match.id));
            } else {
              setNeedsSelfSelect(true);
            }
          }
        })
        .catch(err => console.error(err));
      axios.get('http://localhost:5000/api/subjects')
        .then(res => setSubjects(res.data))
        .catch(err => console.error(err));
    }
  }, []);

  useEffect(() => {
    if (user.role !== 'admin' && studentFilterId) {
      fetchGrades();
    }
  }, [studentFilterId]);

  const handleAdd = () => {
    const payload = {
      ...newGrade,
      student_id: selectedStudentId || newGrade.student_id,
    };
    axios
      .post('http://localhost:5000/api/grades', payload)
      .then((res) => {
        // Optimistic update so admin sees immediately
        const createdId = res?.data?.id;
        const student = students.find(s => String(s.id) === String(payload.student_id));
        const created = {
          id: createdId || Math.random(),
          ...payload,
          student_name: student ? student.name : '',
          student_code: student ? student.student_id : undefined,
        };
        setGrades(prev => [created, ...prev]);

        fetchGrades();
        setNewGrade({
          student_id: '',
          school_year: '',
          subject_code: '',
          subject_title: '',
          midterm: '',
          finals: '',
          grade: '',
          units: ''
        });
        setSelectedStudentId('');
        setSelectedSubjectId('');
      })
      .catch(err => console.error(err));
  };

  const handleEdit = (grade) => {
    setEditGrade(grade);
    setNewGrade({
      student_id: grade.student_id,
      school_year: grade.school_year,
      subject_code: grade.subject_code,
      subject_title: grade.subject_title,
      midterm: '',
      finals: '',
      grade: grade.grade,
      units: grade.units
    });
    setSelectedStudentId(String(grade.student_id));
    const subj = subjects.find(s => s.subject_code === grade.subject_code && s.subject_title === grade.subject_title);
    setSelectedSubjectId(subj ? String(subj.id) : '');
  };

  const handleUpdate = () => {
    if (editGrade) {
      axios
        .put(`http://localhost:5000/api/grades/${editGrade.id}`, newGrade)
        .then(() => {
          fetchGrades();
          setEditGrade(null);
          setNewGrade({
            student_id: '',
            school_year: '',
            subject_code: '',
            subject_title: '',
            midterm: '',
            finals: '',
            grade: '',
            units: ''
          });
        })
        .catch(err => console.error(err));
    }
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/api/grades/${id}`)
      .then(() => fetchGrades())
      .catch(err => console.error(err));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Y Grades", 14, 10);
    const tableColumn = ["Student ID", "Student Name", "School Year", "Subject Code", "Subject Title", "Grade", "Units"];
    const tableRows = grades.map(grade => ([
      grade.student_code || grade.student_id,
      grade.student_name,
      grade.school_year,
      grade.subject_code,
      grade.subject_title,
      grade.grade,
      grade.units
    ]));

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    const gwa = computeGWA(grades);
    const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 30;
    if (user.role !== 'admin') {
      doc.text(`Final GWA: ${gwa || 'N/A'}`, 14, finalY + 10);
    }

    doc.save("grades.pdf");
  };

  return (
    <div className="grades-container">
      <h2>Grades</h2>


      {user.role !== 'admin' && needsSelfSelect && (
        <div style={{ marginBottom: '12px', background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '10px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            We couldn't automatically match your student record. Please select your name to view your grades.
          </div>
          <div>
            <select
              value={studentFilterId}
              onChange={(e) => {
                const val = e.target.value;
                setStudentFilterId(val);
                if (val) {
                  localStorage.setItem('selfStudentId', String(val));
                  setNeedsSelfSelect(false);
                  fetchGrades();
                }
              }}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #a5d6a7' }}
            >
              <option value="">Select your name</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}{s.student_id ? ` - ${s.student_id}` : ''}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button onClick={exportToPDF} className="export-btn">
        Export to PDF
      </button>

      {user.role === 'admin' && (
        <div className="grade-form">
          <div className="grades-form-grid">
            <div>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setNewGrade({ ...newGrade, student_id: e.target.value });
                }}
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}{s.student_id ? ` - ${s.student_id}` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <input
                placeholder="School Year"
                value={newGrade.school_year}
                onChange={(e) => setNewGrade({ ...newGrade, school_year: e.target.value })}
              />
            </div>
            <div>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedSubjectId(val);
                  const subj = subjects.find(x => String(x.id) === String(val));
                  if (subj) {
                    setNewGrade({
                      ...newGrade,
                      subject_code: subj.subject_code,
                      subject_title: subj.subject_title,
                      units: subj.units || newGrade.units,
                    });
                  }
                }}
              >
                <option value="">Select Subject</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.subject_code} - {sub.subject_title}</option>
                ))}
              </select>
            </div>
>
            <div>
              <input
                placeholder="Units"
                value={newGrade.units}
                onChange={(e) => setNewGrade({ ...newGrade, units: e.target.value })}
              />
            </div>
            <div>
              <input
                placeholder="Midterm"
                value={newGrade.midterm}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewGrade(prev => {
                    const updated = { ...prev, midterm: val };
                    const final = computeFinal(updated.midterm, updated.finals);
                    return { ...updated, grade: final };
                  });
                }}
              />
            </div>
            <div>
              <input
                placeholder="Finals"
                value={newGrade.finals}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewGrade(prev => {
                    const updated = { ...prev, finals: val };
                    const final = computeFinal(updated.midterm, updated.finals);
                    return { ...updated, grade: final };
                  });
                }}
              />
            </div>
            <div>
              <input
                placeholder="Final Grade"
                value={newGrade.grade}
                readOnly
              />
            </div>
            <div>
              <input
                placeholder="Subject Code"
                value={newGrade.subject_code}
                readOnly
              />
            </div>
            <div>
              <input
                placeholder="Subject Title"
                value={newGrade.subject_title}
                readOnly
              />
            </div>
          </div>
          {editGrade ? (
            <button onClick={handleUpdate}>Update Grade</button>
          ) : (
            <button onClick={handleAdd}>Add Grade</button>
          )}
        </div>
      )}

      {grades.length === 0 && (
        <div style={{ marginTop: '12px', color: '#555' }}>No grades found.</div>
      )}

      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>School Year</th>
            <th>Subject Code</th>
            <th>Subject Title</th>
            <th>Grade</th>
            <th>Units</th>
            {user.role === 'admin' && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {grades.map((g) => (
            <tr key={g.id}>
              <td>{g.student_code || g.student_id}</td>
              <td>{g.student_name}</td>
              <td>{g.school_year}</td>
              <td>{g.subject_code}</td>
              <td>{g.subject_title}</td>
              <td>{g.grade}</td>
              <td>{g.units}</td>
              {user.role === 'admin' && (
                <td>
                  <div className='action-buttons'>
                    <button onClick={() => handleEdit(g)}>Edit</button>
                    <button onClick={() => handleDelete(g.id)}>Delete</button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {user.role !== 'admin' && (
        <div className="gwa-footer">
          <div className="gwa-box">Final GWA: {computeGWA(grades) || 'N/A'}</div>
        </div>
      )}
    </div>
  );
};

export default Grades;
