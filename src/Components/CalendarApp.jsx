import React, { useState, useEffect } from "react";
import { getEvents, addEvent, editEvent, deleteEvent } from "../services/Api.js";
import './CalendarApp.css';

const CalendarApp = () => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthsOfYear = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventTime, setEventTime] = useState({ hours: "00", minutes: "00" });
  const [eventText, setEventText] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [notification, setNotification] = useState("");
  const [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => {
    loadEvents();
  }, [currentMonth, currentYear]);

  const loadEvents = async () => {
    try {
      const response = await getEvents();
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setNotification("Error fetching events. Please try again.");
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handleDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    setSelectedDay(clickedDate);
    setSelectedDate(clickedDate);
    setEventTime({ hours: "00", minutes: "00" });
    setEventText("");
    setEditingEvent(null);
  };

  const handleEventSubmit = async () => {
    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      date: selectedDate.toISOString().split('T')[0],
      time: `${eventTime.hours.padStart(2, "0")}:${eventTime.minutes.padStart(2, "0")}`,
      text: eventText,
    };

    try {
      if (editingEvent) {
        await editEvent(editingEvent.id, newEvent);
        const updatedEvents = events.map((event) =>
          event.id === editingEvent.id ? newEvent : event
        );
        setEvents(updatedEvents);
        setNotification("Event updated successfully!");
      } else {
        await addEvent(newEvent);
        setEvents((prevEvents) => [...prevEvents, newEvent]);
        setNotification("Event added successfully!");
      }
      setShowEventPopup(false);
    } catch (error) {
      console.error("Error saving event:", error);
      setNotification("Error saving event. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      const updatedEvents = events.filter((event) => event.id !== eventId);
      setEvents(updatedEvents);
      setNotification("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      setNotification("Error deleting event. Please try again.");
    }
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setEventTime((prevTime) => ({
      ...prevTime,
      [name]: value.padStart(2, "0"),
    }));
  };

  const getDayEvents = (date) => {
    return events.filter(event => new Date(event.date).toDateString() === date.toDateString());
  };

  return (
    <div className="calendar-app">
      <header className="app-header">
        <button className="menu-button"><i className="bx bx-menu"></i></button>
        <h1>{monthsOfYear[currentMonth]}</h1>
      </header>

      {notification && <div className="notification">{notification}</div>}

      <div className="calendar-view">
        <div className="weekdays">
          {daysOfWeek.map((day) => (
            <span key={day}>{day[0]}</span>
          ))}
        </div>
        <div className="days">
          {[...Array(firstDayOfMonth).keys()].map((_, index) => (
            <span key={`empty-${index}`} className="empty-day" />
          ))}
          {[...Array(daysInMonth).keys()].map((day) => {
            const currentDay = new Date(currentYear, currentMonth, day + 1);
            const isActive = events.some((event) => event.date === currentDay.toISOString().split('T')[0]);
            const isToday = currentDay.toDateString() === new Date().toDateString();
            const isSelected = currentDay.toDateString() === selectedDay.toDateString();

            return (
              <span
                key={day + 1}
                className={`day ${isActive ? "active" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                onClick={() => handleDayClick(day + 1)}
              >
                {day + 1}
                {isActive && <span className="event-dot"></span>}
              </span>
            );
          })}
        </div>
      </div>

      <div className="day-view">
        <h2>{selectedDay.getDate()} {daysOfWeek[selectedDay.getDay()]}</h2>
        <p>{getDayEvents(selectedDay).length} events and 3 tasks</p>
        <div className="events-list">
          {getDayEvents(selectedDay).map((event, index) => (
            <div key={event.id} className="event-item" style={{backgroundColor: index % 2 === 0 ? '#4a90e2' : '#f4b400'}}>
              <span className="event-time">{event.time}</span>
              <span className="event-text">{event.text}</span>
            </div>
          ))}
        </div>
        <div className="tasks-list">
          <div className="task-item">
            <span className="task-dot"></span>
            <span className="task-text">Call Jennifer for asking her about work</span>
          </div>
          <div className="task-item">
            <span className="task-dot"></span>
            <span className="task-text">Update phone (urgent)</span>
          </div>
          <div className="task-item">
            <span className="task-dot"></span>
            <span className="task-text">Text mum to organize dinner</span>
          </div>
        </div>
      </div>

      <button className="add-button" onClick={() => setShowEventPopup(true)}>+</button>

      {showEventPopup && (
        <div className="event-popup">
          <h3>{editingEvent ? "Edit Event" : "Add Event"}</h3>
          <div className="event-form">
            <div className="time-input">
              <input
                type="number"
                name="hours"
                min={0}
                max={23}
                value={eventTime.hours}
                onChange={handleTimeChange}
                placeholder="HH"
              />
              <span>:</span>
              <input
                type="number"
                name="minutes"
                min={0}
                max={59}
                value={eventTime.minutes}
                onChange={handleTimeChange}
                placeholder="MM"
              />
            </div>
            <textarea
              placeholder="Event description"
              value={eventText}
              onChange={(e) => setEventText(e.target.value)}
              maxLength={60}
            />
            <div className="event-actions">
              <button onClick={handleEventSubmit}>{editingEvent ? "Update" : "Add"}</button>
              <button onClick={() => setShowEventPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarApp;