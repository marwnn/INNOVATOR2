import React, { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { Scanner } from "@yudiel/react-qr-scanner";
import "../styles/Attendance.css";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const Attendance = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [attendance, setAttendance] = useState([]);
  const [newRecord, setNewRecord] = useState({
    date: "",
    status: "",
  });
  const [editRecordId, setEditRecordId] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [qrSession, setQrSession] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterBy, setFilterBy] = useState("");
  const [dateOrder, setDateOrder] = useState("desc");
  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [qrError, setQrError] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [activityLogs, setActivityLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(true);

  useEffect(() => {
    fetchAttendance();
    fetchLogs();
    const stored = sessionStorage.getItem("qrSession");
    if (stored) {
      try { setQrSession(JSON.parse(stored)); } catch {}
    }
    if (user.role === "admin") {
      axios
        .get("http://localhost:5000/api/subjects")
        .then((res) => setSubjects(res.data))
        .catch(() => {});
      axios
        .get("http://localhost:5000/api/studentlist")
        .then((res) => setStudents(res.data))
        .catch(() => {});
    }
    const id = setInterval(fetchAttendance, 2000);
    const lid = setInterval(fetchLogs, 3000);
    return () => {
      clearInterval(id);
      clearInterval(lid);
    };
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attendance", {
        params: user.role !== "admin" ? { user_id: user.id } : {},
      });
      setAttendance(res.data || []);
      setFetchError("");
    } catch (err) {
      setFetchError(err.response?.data?.error || err.message || "Failed to load attendance");
    }
  };

  const fetchLogs = async () => {
    try {
      const params = user.role !== "admin"
        ? { user_id: user.id }
        : (selectedStudentId ? { student_id: selectedStudentId } : {});
      const res = await axios.get("http://localhost:5000/api/activity-logs", { params });
      setActivityLogs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {}
  };

  useEffect(() => {
    if (user.role === "admin") fetchLogs();
  }, [selectedStudentId]);

  const handleAdd = async () => {
    if (!selectedStudentId || !newRecord.date || !newRecord.status) {
      alert("All fields are required");
      return;
    }
    const dayOfWeek = new Date(newRecord.date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    try {
      await axios.post("http://localhost:5000/api/attendance", {
        student_id: selectedStudentId,
        date: newRecord.date,
        status: newRecord.status,
        day_of_week: dayOfWeek,
      });
      fetchAttendance();
      setNewRecord({ date: "", status: "" });
      setSelectedStudentId("");
    } catch (err) {
      // Handle add error silently
    }
  };

  const handleEdit = (record) => {
    setEditRecordId(record.id);
    setEditStatus(record.status);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/attendance/${id}`, {
        status: editStatus,
      });
      setEditRecordId(null);
      fetchAttendance();
    } catch (err) {
      // Handle update error silently
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/attendance/${id}`);
      fetchAttendance();
    } catch (err) {
      // Handle delete error silently
    }
  };

  const startQrSession = async () => {
    if (!selectedSubjectId) {
      alert("Please select a subject first");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/api/attendance/qr-session",
        { subject_id: selectedSubjectId, expiresInMinutes: 15 }
      );
      setQrSession(res.data);
      sessionStorage.setItem("qrSession", JSON.stringify(res.data));
      setQrError("");
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to start session";
      setQrError(msg.includes("already been generated")
        ? "QR already used today. Try again tomorrow"
        : msg);
    }
  };

  const stopQrSession = async () => {
    if (!qrSession?.token) return;
    try {
      await axios.post(
        `http://localhost:5000/api/attendance/qr-session/${qrSession.token}/mark-absent`
      );
      await axios.post(
        `http://localhost:5000/api/attendance/qr-session/${qrSession.token}/deactivate`
      );
      alert("Session ended and absentees marked.");
      fetchAttendance();
    } catch (err) {
      // Handle error silently
    }
    sessionStorage.removeItem("qrSession");
    setQrSession(null);
    setSelectedSubjectId("");
  };

  const onScanResult = async (scanPayload) => {
    const token =
      typeof scanPayload === "string"
        ? scanPayload
        : scanPayload?.[0]?.rawValue || scanPayload?.rawValue || "";
    if (!token) return;

    try {
      await axios.post("http://localhost:5000/api/attendance/qr-checkin", {
        token,
        user_id: user.id,
      });
      setScanning(false);
      fetchAttendance();
      alert("Attendance recorded successfully!");
    } catch (err) {
      // Handle QR check-in error silently
      alert(err.response?.data?.error || "Check-in failed");
    }
  };

  const isAdmin = user.role === "admin";
  const filteredAttendance = attendance.filter((r) =>
    isAdmin && selectedSubjectId ? String(r.subject_id) === String(selectedSubjectId) : true
  );
  const byDate = {};
  filteredAttendance.forEach((r) => {
    const raw = r.date;
    const d = raw ? (String(raw).includes('T') ? String(raw).split('T')[0] : String(raw)) : '';
    if (!d) return;
    if (!byDate[d]) byDate[d] = { date: d, Present: 0, Absent: 0, Excused: 0, Total: 0 };
    byDate[d][r.status] = (byDate[d][r.status] || 0) + 1;
    byDate[d].Total += 1;
  });
  const lineData = Object.values(byDate).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  function weekKey(dateStr) {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const week = Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
    return `${year}-W${String(week).padStart(2, "0")}`;
  }
  const byWeek = {};
  filteredAttendance.forEach((r) => {
    const key = weekKey(r.date);
    if (!byWeek[key]) byWeek[key] = { week: key, present: 0, total: 0 };
    if (r.status === "Present") byWeek[key].present += 1;
    byWeek[key].total += 1;
  });
  const barData = Object.values(byWeek)
    .map((w) => ({ week: w.week, rate: w.total ? Math.round((w.present / w.total) * 100) : 0 }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const totals = { Present: 0, Absent: 0, Excused: 0 };
  filteredAttendance.forEach((r) => {
    if (totals[r.status] !== undefined) totals[r.status] += 1;
  });
  const pieData = Object.entries(totals).map(([name, value]) => ({ name, value }));
  const pieColors = ["#27ae60", "#c0392b", "#f1c40f"];
  const subjectOptions = Array.from(new Set(attendance.map((r) => `${r.subject_id}|${r.subject_code} - ${r.subject_title}`)))
    .filter(Boolean)
    .map((s) => { const [id, label] = s.split('|'); return { id, label }; });
  const displayRecords = (() => {
    let rows = [...attendance];
    if (filterBy === 'subject' && filterSubjectId) {
      rows = rows.filter((r) => String(r.subject_id) === String(filterSubjectId));
    } else if (filterBy === 'name') {
      rows.sort((a, b) => String(a.student_name || '').localeCompare(String(b.student_name || '')));
    } else if (filterBy === 'date') {
      rows.sort((a, b) => (dateOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)));
    }
    return rows;
  })();

  return (
    <div className="attendance-container">
      <h2 className="attendance-title">Attendance</h2>

      {user.role === "admin" && (
        <div className="add-form">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.student_id ? ` - ${s.student_id}` : ""}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={newRecord.date}
            onChange={(e) =>
              setNewRecord({ ...newRecord, date: e.target.value })
            }
          />
          <select
            value={newRecord.status}
            onChange={(e) =>
              setNewRecord({ ...newRecord, status: e.target.value })
            }
          >
            <option value="">Select Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Excused">Excused</option>
             
          </select>
          <button className="btn btn-primary" onClick={handleAdd}>
            Add Record
          </button>
        </div>
      )}

      {user.role === "admin" && (
        <div style={{ marginBottom: 16 }}>
          {!qrSession ? (
            <div style={{ display: "flex", gap: "10px" }}>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subject_code} - {s.subject_title}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                onClick={startQrSession}
                disabled={!selectedSubjectId}
              >
                Start QR Session
              </button>
              {qrError && (
                <div style={{ color: "#c0392b", fontWeight: 600 }}>
                  {qrError}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "#fff", padding: 8 }}>
                <QRCode value={qrSession.token} size={96} />
              </div>
              <div>
                <p>
                  <strong>Expires:</strong>{" "}
                  {new Date(qrSession.expiresAt).toLocaleString()}
                </p>
                <button className="btn btn-delete" onClick={stopQrSession}>
                  End Session & Mark Absent
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {user.role !== "admin" && (
        <div style={{ marginBottom: 16 }}>
          {!scanning ? (
            <button
              className="btn btn-primary"
              onClick={() => setScanning(true)}
            >
              Scan QR to Check-in
            </button>
          ) : (
            <div>
              <Scanner
                onScan={(result) => onScanResult(result)}
                onError={() => {}}
                constraints={{ facingMode: "environment" }}
                style={{ width: 240, height: 240 }}
              />
              <button
                className="btn btn-cancel"
                onClick={() => setScanning(false)}
                style={{ marginTop: 8 }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <div className="charts-section">
        <h3 className="charts-title">Attendance Records</h3>
        {fetchError && (
          <div style={{ marginBottom: 12, background: "#fdecea", border: "1px solid #f5c2c7", color: "#842029", padding: 10, borderRadius: 8 }}>
            {fetchError}
          </div>
        )}
        <div className="chart-grid">
          <div className="chart-card">
            <h4>Daily Status Counts</h4>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lineData} margin={{ bottom: 36 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 8 }} />
                <Line type="monotone" dataKey="Present" stroke="#27ae60" />
                <Line type="monotone" dataKey="Absent" stroke="#c0392b" />
                <Line type="monotone" dataKey="Excused" stroke="#f1c40f" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h4>Weekly Attendance Rate (%)</h4>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="rate" fill="#2ecc71" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h4>Status Distribution</h4>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        
     
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => setShowFilter((v) => !v)}>Filter by</button>
        {showFilter && (
          <>
            <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
              <option value="">Select</option>
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="subject">Subject</option>
            </select>
            {filterBy === 'date' && (
              <select value={dateOrder} onChange={(e) => setDateOrder(e.target.value)}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            )}
            {filterBy === 'subject' && (
              <select value={filterSubjectId} onChange={(e) => setFilterSubjectId(e.target.value)}>
                <option value="">Select Subject</option>
                {subjectOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            )}
          </>
        )}
      </div>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Subject</th>
            <th>Date</th>
            <th>Day</th>
            <th>Status</th>
            {user.role === "admin" && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {displayRecords.map((r) => (
            <tr key={r.id}>
              <td>{r.student_name || "N/A"}</td>
              <td>
                {r.subject_code ? `${r.subject_code} - ${r.subject_title}` : "N/A"}
              </td>
              <td>{(r.date && String(r.date).includes('T')) ? String(r.date).split('T')[0] : r.date}</td>
              <td>{r.day_of_week}</td>
              <td>
                {editRecordId === r.id ? (
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Excused">Excused</option>
                  </select>
                ) : (
                  r.status
                )}
              </td>
              {user.role === "admin" && (
                <td>
                  {editRecordId === r.id ? (
                    <>
                      <button onClick={() => handleUpdate(r.id)}>Save</button>
                      <button onClick={() => setEditRecordId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(r)}>Edit</button>
                      <button onClick={() => handleDelete(r.id)}>Delete</button>
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
