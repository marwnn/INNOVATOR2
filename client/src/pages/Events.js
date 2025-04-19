
import React, { useEffect, useState } from "react";
import axios from "axios";

const Events = () => {
  const [events, setEvents] = useState([]);
 const token = sessionStorage.getItem("token");
   useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/calendar", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched Events:", res.data); // 👈 Check this
      setEvents(
        res.data.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
        }))
      );
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };
  fetchEvents();
}, []);

  return (
    <div className="p-5">
      <h2>Upcoming Events</h2>
      {events.length === 0 ? (
        <p>No events listed.</p>
      ) : (
        <ul>
          {events.map(event => (
            <li key={event.id}>
              <strong>{event.title}</strong> - {new Date(event.start).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Events;
