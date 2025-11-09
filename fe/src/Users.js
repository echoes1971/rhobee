import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { app_cfg } from "./app.cfg";
import { ThemeContext } from "./ThemeContext";

function Users() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null); // utente in modifica
  const { dark, themeClass } = useContext(ThemeContext);
  const endpoint = app_cfg.endpoint;
  console.log("Using endpoint:", endpoint);

    // Carica tutti gli utenti all'inizio
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (search = "") => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        search
          ? endpoint + `/users?search=${encodeURIComponent(search)}`
          : endpoint + "/users",
        { headers: { Authorization: `Bearer ${token}` }, }
      );
      setUsers(res.data); // supponendo che l'API restituisca un array
    } catch (err) {
      alert("Errore caricamento utenti"+err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(query);
  };

  const handleEditClick = (user) => {
    // alert("Editing user="+user.Login);
    setEditingUser({ ...user }); // copia per non modificare direttamente
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    // alert(name+"="+value);
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      if (!editingUser.ID) {
        // Nuovo utente
        await axios.post(
          endpoint + `/users`,
          editingUser,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingUser(null);
        fetchUsers();
        return;
      }
      // Utente esistente
      await axios.put(
        endpoint + `/users/${editingUser.ID}`,
        editingUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert("Errore salvataggio utente");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure to delete this user?")) {
      const token = localStorage.getItem("token");
      await axios.delete(endpoint + `/users/${editingUser.ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingUser(null);
      fetchUsers();
    }
  };

  return (
    <div className={`container mt-3 ${themeClass}`}>
      <h2 className={dark ? "text-light" : "text-dark"}>Users</h2>

      {/* Form di ricerca */}
      {!editingUser && (
        <form className="d-flex mb-3" onSubmit={handleSearch}>
          <input
            type="text"
            className={`form-control me-2 ${dark ? "bg-secondary text-light" : ""}`}
            placeholder="Cerca utente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary">Search</button>
        </form>
      )}

      {!editingUser && (
        <button
          className="btn btn-success mb-3"
          onClick={() => setEditingUser({ ID: "", Login: "", Fullname: "", GroupID: "" })}
        >
          New User
        </button>
      )}

      {!editingUser && (
        <table 
        className={`table ${dark ? "table-dark" : "table-striped"} table-hover`}
        >
          <thead>
            <tr><th>ID</th><th>Login</th><th>Fullname</th><th>Group</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.ID}>
                <td>{u.ID}</td>
                <td>{u.Login}</td>
                <td>{u.Fullname}</td>
                <td>{u.GroupID}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleEditClick(u)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Form di editing */}
      {editingUser && (
        <div className={`card p-3 mt-3 ${dark ? "bg-dark text-light" : "bg-light text-dark" }`}>
          <h4>{editingUser.ID>'' ? "Modify" : "Create"} User</h4>
          <input
            className={`form-control mb-2 ${dark ? "bg-secondary text-light" : ""}`}
            name="ID"
            title="ID"
            value={editingUser.ID}
            readOnly
            onChange={handleEditChange}
          />
          <input
            className={`form-control mb-2 ${dark ? "bg-secondary text-light" : ""}`}
            name="Login"
            title="Login"
            value={editingUser.Login}
            {...editingUser.ID ? "disabled" : null}
            onChange={handleEditChange}
          />
          <input
            className={`form-control mb-2 ${dark ? "bg-secondary text-light" : ""}`}
            name="Fullname"
            title="Fullname"
            value={editingUser.Fullname}
            onChange={handleEditChange}
          />
          <input
            className={`form-control mb-2 ${dark ? "bg-secondary text-light" : ""}`}
            name="GroupID"
            title="GroupID"
            value={editingUser.GroupID}
            readOnly
            onChange={handleEditChange}
          />
          <div>
            <button className="btn btn-success me-2" onClick={handleSave}>
              Save
            </button>
            <button
              className="btn btn-secondary me-4"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </button>
            {editingUser.ID>"" ?
                      <button
                        className="btn btn-danger"
                        onClick={handleDelete}
                      >
                        Delete
                      </button>
          : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
