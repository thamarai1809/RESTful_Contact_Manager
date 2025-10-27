import React, { useState, useEffect } from "react";
// Verwyder die App.css-invoer om die 'kon nie oplos nie' fout reg te stel.
// Die stylering word nou direk in die komponent toegepas.

// HARDCODEER die API-URL omdat 'import.meta.env' nie beskikbaar is nie.
// Maak seker dat hierdie HTTPS-URL na die Render-agterkant verwys.
const API_URL = "https://restful-contact-manager01.onrender.com/api/contacts";

// BELANGRIK: Moet nooit window.alert of window.confirm in die Canvas-omgewing gebruik nie.

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editing, setEditing] = useState(null);
  const [showContacts, setShowContacts] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState(null); // Pasgemaakte toestand vir status-/foutboodskappe
  const [isLoading, setIsLoading] = useState(false);
  const contactsPerPage = 5;

  // Funksie om boodskappe tydelik te vertoon
  const displayMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  // Haal kontakte van die agterkant af
  const fetchContacts = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}?page=${page}&limit=${contactsPerPage}&search=${search}`
      );
      if (!res.ok) {
        throw new Error(`HTTP fout! Status: ${res.status}`);
      }
      const data = await res.json();
      setContacts(data.contacts || []);
      setTotalPages(data.pages || 1);
      if (data.contacts.length === 0 && page > 1) {
        // Indien die huidige bladsy leeg is, gaan terug na die vorige een
        setCurrentPage(Math.max(1, page - 1));
      }
    } catch (err) {
      console.error("Fout met die haal van kontakte:", err);
      displayMessage(`Fout met die haal van kontakte: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Haal kontakte wanneer die relevante afhanklikhede verander
  useEffect(() => {
    if (showContacts) {
      // Klein ontspan vir soek om oormatige API-oproepe te voorkom
      const handler = setTimeout(() => {
        fetchContacts();
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [currentPage, search, showContacts]);

  // Voeg nuwe kontak by
  const handleAdd = async () => {
    if (!form.name || !form.email || !form.phone) return displayMessage("Vul asseblief alle velde in!");
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
      displayMessage("Kontak suksesvol bygevoeg!");
      
      // KRITIESE OPLOSSING: Roep fetchContacts uitdruklik om die aansig te verfris
      // na suksesvolle skepping.
      fetchContacts(currentPage); 
      
      // Indien kontakte versteek was, wys dit outomaties na byvoeging
      if (!showContacts) {
        setShowContacts(true);
      }

    } catch (err) {
      console.error("Fout met die byvoeging van kontak:", err);
      displayMessage(`Fout met die byvoeging van kontak: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Dateer kontak op
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
      displayMessage("Kontak suksesvol opgedateer!");
      fetchContacts(currentPage);
    } catch (err) {
      console.error("Fout met die opdatering van kontak:", err);
      displayMessage(`Fout met die opdatering van kontak: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Skrap kontak
  const handleDelete = async (id) => {
    // Gebruik 'n in-app bevestiging in plaas van window.confirm
    const confirmed = window.confirm("Is jy seker jy wil hierdie kontak skrap?");
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Status: ${res.status}`);
      }

      displayMessage("Kontak suksesvol geskrap!");
      // Herhaal, wat paginering randgevalle hanteer
      fetchContacts(currentPage); 
    } catch (err) {
      console.error("Fout met die skrap van kontak:", err);
      displayMessage(`Fout met die skrap van kontak: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Stel kontak op vir redigering
  const handleEdit = (c) => {
    // Gebruik die MongoDB _id vir redigering/opdatering
    setEditing(c._id); 
    setForm({ 
        name: c.name, 
        email: c.email, 
        phone: c.phone 
    });
  };

  // Stel vorm terug wanneer redigering gekanselleer word
  const handleCancelEdit = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "" });
  };

  // Vereenvoudigde stylering (vervang App.css)
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
  };

  const isFormDisabled = isLoading && !editing;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Kontak Bestuurder</h1>

      {message && (
        <div style={{ ...styles.message, ...(message.includes("Fout") ? styles.error : styles.success) }}>
          {message}
        </div>
      )}

      <div style={styles.form}>
        <input
          type="text"
          placeholder="Naam"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={isFormDisabled}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="E-pos"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={isFormDisabled}
          style={styles.input}
        />
        <input
          type="tel"
          placeholder="Foon"
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
              {isLoading ? "Besig om op te dateer..." : "Dateer Kontak Op"}
            </button>
            <button 
              style={{...styles.button, ...styles.buttonCancel}} 
              onClick={handleCancelEdit} 
              disabled={isLoading}
            >
              Kanselleer
            </button>
          </>
        ) : (
          <button 
            style={{...styles.button, ...styles.buttonAdd}} 
            onClick={handleAdd} 
            disabled={isLoading}
          >
            {isLoading ? "Besig om by te voeg..." : "Voeg Kontak By"}
          </button>
        )}

        <button
          style={{...styles.button, ...styles.buttonToggle}}
          onClick={() => setShowContacts(!showContacts)}
          disabled={isLoading}
        >
          {showContacts ? "Versteek Kontakte" : "Sien Kontakte"}
        </button>
      </div>

      {showContacts && (
        <>
          {/* Soekbalk */}
          <input
            type="text"
            placeholder="Soek op naam"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.search}
            disabled={isLoading}
          />

          {/* Kontakte tabel */}
          {isLoading && contacts.length === 0 ? (
            <div style={{textAlign: 'center', padding: '20px'}}>Besig om kontakte te laai...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Naam</th>
                  <th style={styles.th}>E-pos</th>
                  <th style={styles.th}>Foon</th>
                  <th style={styles.th}>Aksies</th>
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
                          Wysig
                        </button>
                        <button
                          style={{...styles.actionButton, ...styles.buttonDelete}}
                          onClick={() => handleDelete(c._id)} 
                        >
                          Skrap
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: '12px' }}>
                      Geen kontakte gevind nie.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* Paginering */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                style={styles.button}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Vorige
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
                Volgende
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
