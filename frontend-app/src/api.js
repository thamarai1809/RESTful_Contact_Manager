import axios from "axios";

const API_URL = "http://localhost:5000/api/contacts";

export const getContacts = () => axios.get(API_URL);
export const addContact = (data) => axios.post(API_URL, data);
export const deleteContact = (id) => axios.delete(`${API_URL}/${id}`);
