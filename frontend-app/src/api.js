import axios from "axios";

// Set the base URL for the deployed RESTful contact manager backend.
const API_URL = "https://restful-contact-manager01.onrender.com/api/contacts";

// --- API Functions (Axios) ---
// Note: These functions assume contact data is passed directly in the data/config objects.

/**
 * Retrieves all contacts. 
 * If search/pagination are needed, update the signature to: 
 * export const getContacts = (config) => axios.get(API_URL, config);
 */
export const getContacts = () => axios.get(API_URL);

// Creates a new contact
export const addContact = (data) => axios.post(API_URL, data);

// Deletes a contact by its MongoDB _id
export const deleteContact = (id) => axios.delete(`${API_URL}/${id}`);

// Updates an existing contact by its MongoDB _id
export const updateContact = (id, data) => axios.put(`${API_URL}/${id}`, data);
