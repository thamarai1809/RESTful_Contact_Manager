import axios from "axios";

// FIX: Update to the live, secure URL of your deployed Render backend.
const API_URL = "https://restful-contact-manager01.onrender.com/api/contacts";

export const getContacts = () => axios.get(API_URL);
export const addContact = (data) => axios.post(API_URL, data);
export const deleteContact = (id) => axios.delete(`${API_URL}/${id}`);
export const updateContact = (id, data) => axios.put(`${API_URL}/${id}`, data); // Added missing update function
