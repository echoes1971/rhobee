import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import api from "./axios";
import { ThemeContext } from "./ThemeContext";
import { useTranslation } from "react-i18next";
import AssociationManager from "./AssociationManager";
import { getErrorMessage } from "./errorHandler";

function GroupProfile() {
  const { t } = useTranslation();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { dark, themeClass } = useContext(ThemeContext);

  const userGroups = localStorage.getItem("groups") ? JSON.parse(localStorage.getItem("groups")) : [];
  const isAdmin = userGroups.includes("-2");

  useEffect(() => {
    // Check permissions: must be admin
    if (!isAdmin) {
      navigate("/");
      return;
    }

    fetchGroup();
    fetchUsers();
  }, [groupId, isAdmin, navigate]);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchGroup = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.get(`/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroup(res.data);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, t));
      console.error("Error loading group:", err);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroup((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!group.name || group.name.trim() === "") {
      setErrorMessage(t("groups.name_required"));
      return;
    }

    setErrorMessage("");

    const token = localStorage.getItem("token");
    const payload = {
      name: group.name,
      description: group.description,
      user_ids: group.user_ids || []
    };

    try {
      await api.put(`/groups/${groupId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage(t("common.save") + " " + t("groups.group") + " successful!");
      
      // Reload group data
      fetchGroup();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, t));
      console.error("Error saving group:", err);
    }
  };

  const handleCancel = () => {
    navigate("/groups");
  };

  const handleDelete = async () => {
    if (!window.confirm(t("groups.delete_confirm"))) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await api.delete(`/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/groups");
    } catch (err) {
      setErrorMessage(getErrorMessage(err, t));
      console.error("Error deleting group:", err);
    }
  };

  if (!group) {
    return (
      <Container className={`mt-4 ${themeClass}`}>
        <p>Loading...</p>
      </Container>
    );
  }

  return (
    <Container className={`mt-4 ${themeClass}`}>
      <Card bg={dark ? "dark" : "light"} text={dark ? "light" : "dark"}>
        <Card.Header>
          <h2>{t("groups.group")}: {group.name}</h2>
        </Card.Header>
        <Card.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>ID</Form.Label>
              <Form.Control
                type="text"
                value={group.id || ""}
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("groups.group")} Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={group.name || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={group.description || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("groups.users")}</Form.Label>
              <AssociationManager
                title={t("groups.users")}
                available={users}
                selected={group.user_ids || []}
                onChange={(newIds) =>
                  setGroup((prev) => ({ ...prev, user_ids: newIds }))
                }
                labelKey="Fullname"
                valueKey="ID"
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" onClick={handleSave}>
                {t("common.save")}
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                {t("common.cancel")}
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                {t("common.delete")}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default GroupProfile;
