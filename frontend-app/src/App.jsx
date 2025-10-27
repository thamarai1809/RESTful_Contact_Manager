import React, { useState, useEffect } from "react";

// The environment variable 'import.meta.env.VITE_API_URL' is not available in this target environment.
// We are hardcoding the confirmed Render URL to resolve the error.
const API_URL = "https://restful-contact-manager01.onrender.com/api/contacts";

// Helper components for icons (mimicking Lucide Icons for aesthetic reasons)
const Search = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>);
const Trash2 = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M13 6V4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2"/></svg>);
const Edit = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>);


export default function App() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editing, setEditing] = useState(null); // Holds the _id of the contact being edited
  const [showContacts, setShowContacts] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState(null); // Custom state for status/error messages
  const [isLoading, setIsLoading] = useState(false);
  const contactsPerPage = 5;

  // Function to temporarily display messages
  const displayMessage = (msg, type = 'success') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Function to fetch contacts from the backend
  const fetchContacts = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}?page=${page}&limit=${contactsPerPage}&search=${search}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setContacts(data.contacts || []);
      setTotalPages(data.pages || 1);
      if (data.contacts.length === 0 && page > 1) {
        // If the current page is empty, go back to the previous one
        setCurrentPage(Math.max(1, page - 1));
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      displayMessage(`Error fetching contacts: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch contacts when relevant dependencies change
  useEffect(() => {
    if (showContacts) {
      // Small debouncing for search to prevent excessive API calls
      const handler = setTimeout(() => {
        fetchContacts();
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [currentPage, search, showContacts]);

  // Add new contact
  const handleAdd = async () => {
    if (!form.name || !form.email || !form.phone) return displayMessage("Please fill in all fields!", 'warning');
    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Status: ${res.status}`);
      }

      setForm({ name: "", email: "", phone: "" });
      displayMessage("Contact successfully added!");
      
      // CRITICAL FIX: Explicitly call fetchContacts to refresh the view
      fetchContacts(currentPage); 
      
      // If contacts were hidden, show them automatically after adding
      if (!showContacts) {
        setShowContacts(true);
      }

    } catch (err) {
      console.error("Error adding contact:", err);
      displayMessage(`Error adding contact: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Update contact
  const handleUpdate = async () => {
    if (!editing) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Status: ${res.status}`);
      }

      setForm({ name: "", email: "", phone: "" });
      setEditing(null);
      displayMessage("Contact successfully updated!");
      fetchContacts(currentPage);
    } catch (err) {
      console.error("Error updating contact:", err);
      displayMessage(`Error updating contact: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete contact
  const handleDelete = async (id) => {
    // NOTE: Using window.confirm as a temporary in-app confirmation mechanism
    // In a production app, this should be replaced by a custom modal UI.
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Status: ${res.status}`);
      }

      displayMessage("Contact successfully deleted!");
      // Re-fetch, which handles page edge cases
      fetchContacts(currentPage); 
    } catch (err) {
      console.error("Error deleting contact:", err);
      displayMessage(`Error deleting contact: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Set contact up for editing
  const handleEdit = (c) => {
    // Use the MongoDB _id for editing/updating
    setEditing(c._id); 
    setForm({ 
        name: c.name, 
        email: c.email, 
        phone: c.phone 
    });
  };

  // Reset form when editing is canceled
  const handleCancelEdit = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "" });
  };

  // Tailwind CSS Class Definitions for Aesthetics
  const containerClasses = "max-w-4xl mx-auto p-4 md:p-8 bg-gray-100 rounded-2xl shadow-2xl mt-10 font-sans";
  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150";
  const buttonClasses = "w-full py-3 mt-4 text-white rounded-lg transition duration-200 shadow-md flex items-center justify-center";
  const isFormDisabled = isLoading && !editing;
  
  // Styles for the message box
  const getMessageClasses = (type) => {
    switch (type) {
        case 'error':
            return "bg-red-100 border-red-400 text-red-700";
        case 'warning':
            return "bg-yellow-100 border-yellow-400 text-yellow-700";
        case 'success':
        default:
            return "bg-green-100 border-green-400 text-green-700";
    }
  };


  return (
    <div className={containerClasses}>
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8 tracking-wider">
        CONTACT MANAGER
      </h1>

      {/* Message Display */}
      {message && (
        <div className={`border px-4 py-3 rounded relative mb-4 ${getMessageClasses(message.type)}`} role="alert">
            <p className="font-bold">
              {message.type === 'error' ? 'Error:' : message.type === 'warning' ? 'Warning:' : 'Success:'}
            </p>
            <span className="block sm:inline ml-2">{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClasses}
          disabled={isFormDisabled}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClasses}
          disabled={isFormDisabled}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={inputClasses}
          disabled={isFormDisabled}
        />

        {editing ? (
          <div className="flex space-x-4">
            <button 
                className={`${buttonClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 w-1/2`} 
                onClick={handleUpdate} 
                disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : "Update Contact"}
            </button>
            <button 
                className={`${buttonClasses} bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 w-1/2`} 
                onClick={handleCancelEdit} 
                disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            className={`${buttonClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500`} 
            onClick={handleAdd} 
            disabled={isLoading}
          >
            {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : "Add Contact"}
          </button>
        )}

        <button
          className={`${buttonClasses} bg-blue-800 hover:bg-blue-900 focus:ring-blue-600`}
          onClick={() => setShowContacts(!showContacts)}
          disabled={isLoading}
        >
          {showContacts ? "Hide Contacts" : "View Contacts"}
        </button>
      </div>

      {showContacts && (
        <div className="mt-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Name"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClasses} pl-10`}
              disabled={isLoading}
            />
          </div>

          {/* Contacts Table */}
          <div className="overflow-x-auto shadow-xl rounded-lg">
            {isLoading && contacts.length === 0 ? (
                <div className="text-center py-6 text-gray-500 bg-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 inline-block mr-2"></div>
                    Loading contacts...
                </div>
            ) : (
                <table className="min-w-full bg-white border-collapse">
                    <thead>
                      <tr className="bg-gray-800 text-white text-left text-sm font-semibold tracking-wider">
                        <th className="p-4 rounded-tl-lg">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4 rounded-tr-lg text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.length > 0 ? (
                        contacts.map((c) => (
                          // Use Mongoose _id for key and operations
                          <tr key={c._id} className="border-t border-gray-200 hover:bg-gray-50 transition duration-150"> 
                            <td className="p-4">{c.name}</td>
                            <td className="p-4">{c.email}</td>
                            <td className="p-4">{c.phone}</td>
                            <td className="p-4 text-center whitespace-nowrap">
                              <button 
                                onClick={() => handleEdit(c)}
                                className="text-blue-600 hover:text-blue-800 transition duration-150 mr-3 p-1 rounded hover:bg-blue-100"
                                title="Edit"
                              >
                                <Edit className="inline-block" />
                              </button>
                              <button
                                onClick={() => handleDelete(c._id)} // Use _id here
                                className="text-red-600 hover:text-red-800 transition duration-150 p-1 rounded hover:bg-red-100"
                                title="Delete"
                              >
                                <Trash2 className="inline-block" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-6 text-gray-500">
                            No contacts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
                  }`}
                  disabled={isLoading}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
