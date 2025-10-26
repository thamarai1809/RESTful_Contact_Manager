import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/contacts";

function ContactList({ refresh, search }) {
  const [contacts, setContacts] = useState([]);

  const fetchContacts = async () => {
  try {
    const res = await axios.get(API_URL);
    let filtered = res.data || []; // <-- fix here
    if (search.trim()) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.toLowerCase().includes(search.toLowerCase())
      );
    }
    setContacts(filtered);
  } catch (err) {
    console.error("Error fetching contacts:", err);
  }
};


  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchContacts();
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [refresh, search]);

  return (
    <ul className="space-y-3">
      {contacts.length === 0 ? (
        <p className="text-gray-500 text-center">No contacts found.</p>
      ) : (
        contacts.map((c) => (
          <li
            key={c.id}
            className="flex justify-between items-center bg-gray-100 p-3 rounded shadow-sm"
          >
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-gray-600">{c.email}</p>
              <p className="text-sm text-gray-600">{c.phone}</p>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))
      )}
    </ul>
  );
}

export default ContactList;

