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
    student_id: "",
    date: "",
    status: "",
  });
  const [editRecordId, setEditRecordId] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [qrSession, setQrSession] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  useEffect(() => {
    fetchAttendance();
    const stored = sessionStorage.getItem("qrSession");
    if (stored) {
      try { setQrSession(JSON.parse(stored)); } catch {}
    }
    if (user.role === "admin") {
      axios
        .get("http://localhost:5000/api/subjects")
        .then((res) => setSubjects(res.data))
        .catch(() => {});
    }
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attendance", {
        params: user.role !== "admin" ? { user_id: user.id } : {},
      });
      setAttendance(res.data || []);
    } catch (err) {
      // Silently handle fetch errors
    }
  };

  const handleAdd = async () => {
    if (!newRecord.student_id || !newRecord.date || !newRecord.status) {
      alert("All fields are required");
      return;
    }
    const dayOfWeek = new Date(newRecord.date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    try {
      await axios.post("http://localhost:5000/api/attendance", {
        ...newRecord,
        day_of_week: dayOfWeek,
      });
      fetchAttendance();
      setNewRecord({ student_id: "", date: "", status: "" });
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
    } catch (err) {
      alert("Failed to start session: " + (err.response?.data?.error || err.message));
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
    const d = r.date;
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

  return (
    <div className="attendance-container">
      <h2 className="attendance-title">Attendance</h2>

      {user.role === "admin" && (
        <div className="add-form">
          <input
            type="text"
            placeholder="Student ID"
            value={newRecord.student_id}
            onChange={(e) =>
              setNewRecord({ ...newRecord, student_id: e.target.value })
            }
          />
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
        <h3 className="charts-title">Attendance Trends</h3>
        <div className="chart-grid">
          <div className="chart-card">
            <h4>Daily Status Counts</h4>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
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
        </div>
      </div>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Subject</th>
            <th>Date</th>
            <th>Day</th>
            <th>Status</th>
            {user.role === "admin" && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {attendance.map((r) => (
            <tr key={r.id}>
              <td>{r.student_id}</td>
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
