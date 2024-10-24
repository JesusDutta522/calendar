import axios from 'axios';

const API_URL = 'https://calendar.free.beeceptor.com';

export const getEvents = async () => {
    return await axios.get(`${API_URL}/events`);
  };
  
  export const addEvent = async (event) => {
    return await axios.post(`${API_URL}/events`, event);
  };
  
  export const editEvent = async (eventId, updatedEvent) => {
    return await axios.put(`${API_URL}/events/${eventId}`, updatedEvent);
  };
  
  export const deleteEvent = async (eventId) => {
    return await axios.delete(`${API_URL}/events/${eventId}`);
  };
