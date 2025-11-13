import React, { useContext, useEffect, useState } from "react";
import api from "./axios";
import { ThemeContext } from "./ThemeContext";
import { useTranslation } from "react-i18next";
import AssociationManager from "./AssociationManager";

function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [query, setQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null); // utente in modifica
  const { dark, themeClass } = useContext(ThemeContext);

    // Carica tutti gli utenti all'inizio
  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async (search = "") => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.get(
        search
          ? `/users?search=${encodeURIComponent(search)}`
          : "/users",
        { headers: { Authorization: `Bearer ${token}` }, }
      );
      setUsers(res.data || []); // supponendo che l'API restituisca un array
    } catch (err) {
      console.log("Error loading users.");
    }
  };

  const fetchGroups = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.get("/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data || []);
    } catch (err) {
      console.log("Error loading groups.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(query);
  };

  // Helper per ottenere il nome del gruppo dall'ID
  const getGroupName = (groupId) => {
    const group = groups.find(g => g.ID === groupId);
    return group ? group.Name : groupId;
  };

  const handleEditClick = async (user) => {
    // Carica i dettagli completi dell'utente inclusi i group_ids
    const token = localStorage.getItem("token");
    try {
      const res = await api.get(`/users/${user.ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingUser({ ...user, group_ids: res.data.group_ids || [] });
    } catch (err) {
      console.log("Error loading user details.");
      // Fallback ai dati base se la chiamata fallisce
      setEditingUser({ ...user, group_ids: [] });
    }
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
        await api.post(`/users`, {
          login: editingUser.Login,
          pwd: editingUser.Pwd || "default",
          fullname: editingUser.Fullname,
          group_id: editingUser.GroupID,
          group_ids: editingUser.group_ids || []
        }, { headers: { Authorization: `Bearer ${token}` } } );
        setEditingUser(null);
        fetchUsers();
        fetchGroups();
        return;
      }
      // Utente esistente
      await api.put(`/users/${editingUser.ID}`, {
        login: editingUser.Login,
        pwd: editingUser.Pwd,
        fullname: editingUser.Fullname,
        group_id: editingUser.GroupID,
        group_ids: editingUser.group_ids || []
      }, { headers: { Authorization: `Bearer ${token}` } } );
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert("Errore salvataggio utente");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure to delete this user?")) {
      const token = localStorage.getItem("token");
      await api.delete(`/users/${editingUser.ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingUser(null);
      fetchUsers();
    }
  };

  return (
    <div className={`container mt-3 ${themeClass}`}>
      <h2 className={dark ? "text-light" : "text-dark"}>{t("users.users")}</h2>

      {/* Form di ricerca */}
      {!editingUser && (
        <form className="d-flex mb-3" onSubmit={handleSearch}>
          <input
            type="text"
            className={`form-control me-2 ${dark ? "bg-secondary text-light" : ""}`}
            placeholder={t("common.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary">{t("common.search")}</button>
        </form>
      )}

      {!editingUser && (
        <button
          className="btn btn-success mb-3"
          onClick={() => setEditingUser({ ID: "", Login: "", Fullname: "", GroupID: "", group_ids: [] })}
        >
          {t("users.newUser")}
        </button>
      )}

      {!editingUser && users.length > 0 && (
        <table 
        className={`table ${dark ? "table-dark" : "table-striped"} table-hover`}
        >
          <thead>
            <tr>
              <th className="d-none d-md-table-cell">ID</th>
              <th>Login</th>
              <th>Fullname</th>
              <th className="d-none d-md-table-cell">Group</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.ID}>
                <td className="d-none d-md-table-cell">{u.ID}</td>
                <td>{u.Login}</td>
                <td>{u.Fullname}</td>
                <td className="d-none d-md-table-cell">{getGroupName(u.GroupID)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleEditClick(u)}
                  >
                    {t("common.edit")}
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
          <h4>{editingUser.ID>'' ? t("common.edit") : t("common.create")} {t("users.user")}</h4>
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
            value={getGroupName(editingUser.GroupID)}
            readOnly
            onChange={handleEditChange}
          />
          
          {/* Association Manager per i gruppi */}
          <AssociationManager
            title={t("users.groups") || "Groups"}
            available={groups}
            selected={editingUser.group_ids || []}
            onChange={(newGroupIds) => setEditingUser(prev => ({ ...prev, group_ids: newGroupIds }))}
            labelKey="Name"
            valueKey="ID"
          />

          <div>
            <button className="btn btn-success me-2" onClick={handleSave}>
              { t("common.save") }
            </button>
            <button
              className="btn btn-secondary me-4"
              onClick={() => setEditingUser(null)}
            >
              { t("common.cancel") }
            </button>
            {editingUser.ID>"" ?
                      <button
                        className="btn btn-danger"
                        onClick={handleDelete}
                      >
                        { t("common.delete") }
                      </button>
          : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
