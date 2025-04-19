import React, { useEffect, useState } from 'react';
import axios from 'axios';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const Schedule = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [schedule, setSchedule] = useState([]);
  const [newRow, setNewRow] = useState({
    time_slot: '',
    monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {}, saturday: {},
  });

  useEffect(() => {
    fetchSchedule();
  }, []);

  const safeParse = (str) => {
    try {
      return str ? JSON.parse(str) : {};
    } catch (err) {
      console.error("JSON parse error:", str, err);
      return {};
    }
  };

  const fetchSchedule = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/schedule');
      const formatted = res.data.map(row => ({
        ...row,
        monday: safeParse(row.monday),
        tuesday: safeParse(row.tuesday),
        wednesday: safeParse(row.wednesday),
        thursday: safeParse(row.thursday),
        friday: safeParse(row.friday),
        saturday: safeParse(row.saturday),
      }));
      setSchedule(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/schedule', newRow);
      fetchSchedule();
      setNewRow({
        time_slot: '',
        monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {}, saturday: {}
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/schedule/${id}`);
      fetchSchedule();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCellChange = (day, field, value) => {
    setNewRow(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Class Schedule</h2>

      {user.role === 'admin' && (
        <form onSubmit={handleAdd} className="mb-6 space-y-2">
          <div>
            <input
              type="text"
              placeholder="Time Slot (e.g. 8:00 AM - 9:00 AM)"
              value={newRow.time_slot}
              onChange={(e) => setNewRow({ ...newRow, time_slot: e.target.value })}
              className="border p-1 w-full"
            />
          </div>

          <div className="grid grid-cols-6 gap-2">
            {days.map(day => (
              <div key={day}>
                <label className="capitalize text-sm">{day}</label>
                <input
                  type="text"
                  placeholder="Code"
                  className="border p-1 w-full mb-1"
                  onChange={(e) => handleCellChange(day, 'subject_code', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Title"
                  className="border p-1 w-full mb-1"
                  onChange={(e) => handleCellChange(day, 'subject_title', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Professor"
                  className="border p-1 w-full"
                  onChange={(e) => handleCellChange(day, 'professor', e.target.value)}
                />
              </div>
            ))}
          </div>

          <button type="submit" className="mt-2 bg-blue-600 text-white px-4 py-1 rounded">
            Add Row
          </button>
        </form>
      )}

      <table className="w-full table-auto border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Time</th>
            {days.map(day => (
              <th key={day} className="border p-2 capitalize">{day}</th>
            ))}
            {user.role === 'admin' && <th className="border p-2">Action</th>}
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => (
            <tr key={row.id}>
              <td className="border p-2">{row.time_slot}</td>
              {days.map(day => (
                <td key={day} className="border p-2 text-sm align-top w-48 max-w-[12rem] break-words">
                  <div className="font-semibold">{row[day]?.subject_code || ''}</div>
                  <div>{row[day]?.subject_title || ''}</div>
                  <div className="text-xs italic">{row[day]?.professor || ''}</div>
                </td>
              ))}
              {user.role === 'admin' && (
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
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

export default Schedule;
