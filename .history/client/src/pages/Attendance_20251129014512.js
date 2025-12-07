import React, { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { Scanner } from "@yudiel/react-qr-scanner";
import "../styles/Attendance.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

const Attendance = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [attendance, setAttendance] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" },   { value: 4, label: "April" },
    { value: 5, label: "May" },     { value: 6, label: "June" },
    { value: 7, label: "July" },    { value: 8, label: "August" },
    { value: 9, label: "September" },{ value: 10, label: "October" },
    { value: 11, label: "November" },{ value: 12, label: "December" }
  ];

  const years = [2023, 2024, 2025, 2026];

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8081/attendance?user_id=${user.id}`
      );
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScan = async (result) => {
    if (!result) return;

    setScanning(false);
    const scannedCode = result[0]?.rawValue;

    try {
      await axios.post(`http://localhost:8081/attendance/scan`, {
        student_id: user.id,
        qr_value: scannedCode,
      });

      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAttendance = attendance.filter((row) => {
    const date = new Date(row.date);
    const monthMatch = selectedMonth ? date.getMonth() + 1 === Number(selectedMonth) : true;
    const yearMatch = selectedYear ? date.getFullYear() === Number(selectedYear) : true;
    return monthMatch && yearMatch;
  });

  return (
    <div className="attendance-container">

      <h1 className="title">Attendance</h1>

      {/* QR Generator */}
      <div className="qr-section">
        <h3>Your QR Code</h3>
        <QRCode value={user.student_id || "unknown"} size={170} />
      </div>

      {/* Scanner */}
      <div className="scan-section">
        <button className="scan-btn" onClick={() => setScanning(true)}>
          Scan Attendance
        </button>

        {scanning && (
          <div className="scanner-box">
            <Scanner
              onScan={handleScan}
              onError={(err) => console.error(err)}
            />
            <button className="close-scan" onClick={() => setScanning(false)}>
              Close
            </button>
          </div>
        )}
      </div>

      {/* FILTERS */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowFilter((v) => !v)}
        >
          Filter by
        </button>

        {showFilter && (
          <>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-select"
            >
              <option value="">Filter by Month</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="form-select"
            >
              <option value="">Filter by Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* TABLE */}
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time In</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredAttendance.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No attendance found
              </td>
            </tr>
          ) : (
            filteredAttendance.map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.date).toLocaleDateString()}</td>
                <td>{row.time_in}</td>
                <td>{row.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
