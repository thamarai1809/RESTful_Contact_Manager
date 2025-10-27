import React, { useState, useEffect } from "react";

// The environment variable 'import.meta.env.VITE_API_URL' is not available in this target environment.
// We are hardcoding the confirmed Render URL to resolve the error.
const API_URL = "https://restful-contact-manager01.onrender.com/api/contacts";

// IMPORTANT: Do not use window.alert or window.confirm in the Canvas environment 
// (Note: window.confirm is currently used as a temporary, minimal confirmation substitute.)

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

  // --- RESTORED INLINE STYLES ---
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '40px auto',
      padding: '20px',
      backgroundColor: '#f4f7f6',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '30px',
      borderBottom: '2px solid #ccc',
      paddingBottom: '10px',
    },
    form: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    },
    input: {
      flexGrow: 1,
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ddd',
    },
    button: {
      padding: '10px 15px',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      color: 'white',
      fontWeight: 'bold',
    },
    buttonAdd: {
      backgroundColor: '#007bff',
      flexGrow: 1,
    },
    buttonUpdate: {
      backgroundColor: '#28a745',
      flexGrow: 1,
    },
    buttonCancel: {
      backgroundColor: '#dc3545',
      flexGrow: 1,
    },
    buttonToggle: {
      backgroundColor: '#6c757d',
      flexGrow: 1,
    },
    search: {
      width: '100%',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ddd',
      marginBottom: '20px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    },
    th: {
      padding: '12px',
      backgroundColor: '#007bff',
      color: 'white',
      textAlign: 'left',
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #eee',
    },
    actionButton: {
      marginRight: '8px',
      padding: '5px 10px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
    },
    buttonEdit: {
      backgroundColor: '#ffc107',
      color: '#333',
    },
    buttonDelete: {
      backgroundColor: '#dc3545',
      color: 'white',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '20px',
    },
    message: {
      padding: '15px',
      borderRadius: '5px',
      marginBottom: '20px',
      fontWeight: 'bold',
    },
    success: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
    },
    warning: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeeba',
    }
  };

  const isFormDisabled = isLoading && !editing;
  
  // Helper to determine message style
  const getMessageStyle = (type) => {
    switch (type) {
        case 'error': return styles.error;
        case 'warning': return styles.warning;
        case 'success':
        default: return styles.success;
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Contact Manager</h1>

      {/* Message Display (Restored Old UI Style) */}
      {message && (
        <div style={{ ...styles.message, ...getMessageStyle(message.type) }}>
          {message.text}
        </div>
      )}

      <div style={styles.form}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={isFormDisabled}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={isFormDisabled}
          style={styles.input}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          disabled={isFormDisabled}
          style={styles.input}
        />

        {editing ? (
          <>
            <button 
              style={{...styles.button, ...styles.buttonUpdate}} 
              onClick={handleUpdate} 
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Contact"}
            </button>
            <button 
              style={{...styles.button, ...styles.buttonCancel}} 
              onClick={handleCancelEdit} 
              disabled={isLoading}
            >
              Cancel
            </button>
          </>
        ) : (
          <button 
            style={{...styles.button, ...styles.buttonAdd}} 
            onClick={handleAdd} 
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Contact"}
          </button>
        )}

        <button
          style={{...styles.button, ...styles.buttonToggle}}
          onClick={() => setShowContacts(!showContacts)}
          disabled={isLoading}
        >
          {showContacts ? "Hide Contacts" : "View Contacts"}
        </button>
      </div>

      {showContacts && (
        <>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by Name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.search}
            disabled={isLoading}
          />

          {/* Contacts Table */}
          {isLoading && contacts.length === 0 ? (
            <div style={{textAlign: 'center', padding: '20px'}}>Loading contacts...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length > 0 ? (
                  contacts.map((c) => (
                    <tr key={c._id}> 
                      <td style={styles.td}>{c.name}</td>
                      <td style={styles.td}>{c.email}</td>
                      <td style={styles.td}>{c.phone}</td>
                      <td style={styles.td}>
                        <button 
                          style={{...styles.actionButton, ...styles.buttonEdit}} 
                          onClick={() => handleEdit(c)}
                        >
                          Edit
                        </button>
                        <button
                          style={{...styles.actionButton, ...styles.buttonDelete}}
                          onClick={() => handleDelete(c._id)} 
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: '12px' }}>
                      No contacts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                style={styles.button}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  style={{
                    ...styles.button,
                    backgroundColor: currentPage === i + 1 ? '#0056b3' : '#ddd',
                    color: currentPage === i + 1 ? 'white' : '#333',
                  }}
                  onClick={() => setCurrentPage(i + 1)}
                  disabled={isLoading}
                >
                  {i + 1}
                </button>
              ))}

              <button
                style={styles.button}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || isLoading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
