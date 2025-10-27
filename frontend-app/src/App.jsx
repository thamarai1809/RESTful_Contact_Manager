import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editing, setEditing] = useState(null);
  const [showContacts, setShowContacts] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const contactsPerPage = 5;

  // Fetch contacts from backend
  const fetchContacts = async (page = currentPage) => {
    try {
      const res = await fetch(
        `${API_URL}?page=${page}&limit=${contactsPerPage}&search=${search}`
      );
      const data = await res.json();
      setContacts(data.contacts);
      setTotalPages(data.pages);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  useEffect(() => {
    if (showContacts) fetchContacts();
  }, [currentPage, search, showContacts]);

  // Add new contact
  const handleAdd = async () => {
    if (!form.name || !form.email || !form.phone) return alert("Fill all fields!");
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ name: "", email: "", phone: "" });
      fetchContacts(currentPage);
    } catch (err) {
      console.error("Error adding contact:", err);
    }
  };

  // Update contact
  const handleUpdate = async () => {
    try {
      await fetch(`${API_URL}/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ name: "", email: "", phone: "" });
      setEditing(null);
      fetchContacts(currentPage);
    } catch (err) {
      console.error("Error updating contact:", err);
    }
  };

  // Delete contact
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchContacts(currentPage);
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  // Edit contact
  const handleEdit = (c) => {
    setEditing(c.id);
    setForm(c);
  };

  return (
    <div className="container">
      <h1>Contact Manager</h1>

      <div className="form">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        {editing ? (
          <button className="btn update" onClick={handleUpdate}>
            Update Contact
          </button>
        ) : (
          <button className="btn add" onClick={handleAdd}>
            Add Contact
          </button>
        )}

        <button
          className="btn toggle"
          onClick={() => setShowContacts(!showContacts)}
        >
          {showContacts ? "Hide Contacts" : "View Contacts"}
        </button>
      </div>

      {showContacts && (
        <>
          {/* Search bar */}
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="search"
          />

          {/* Contacts table */}
          <table className="contact-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length > 0 ? (
                contacts.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>
                      <button className="edit" onClick={() => handleEdit(c)}>
                        Edit
                      </button>
                      <button
                        className="delete"
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "active" : ""}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
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
