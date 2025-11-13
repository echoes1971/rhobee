package api

import (
	"encoding/json"
	"net/http"

	"rprj/be/db"
	"rprj/be/models"

	"github.com/gorilla/mux"
)

// GET /users
func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	searchBy := r.URL.Query().Get("search")
	orderBy := r.URL.Query().Get("order_by")
	users, err := db.GetAllUsers(searchBy, orderBy)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(users)
}

// GET /users/{id}
func GetUserHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	user, err := db.GetUserByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if user == nil {
		http.NotFound(w, r)
		return
	}

	// Get user groups
	userGroups, err := db.GetUserGroupsByUserID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Build response with group IDs
	groupIDs := make([]string, len(userGroups))
	for i, ug := range userGroups {
		groupIDs[i] = ug.GroupID
	}

	response := map[string]interface{}{
		"id":        user.ID,
		"login":     user.Login,
		"fullname":  user.Fullname,
		"group_id":  user.GroupID,
		"group_ids": groupIDs,
	}

	json.NewEncoder(w).Encode(response)
}

// POST /users
func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Login    string   `json:"login"`
		Pwd      string   `json:"pwd"`
		Fullname string   `json:"fullname"`
		GroupID  string   `json:"group_id"`
		GroupIDs []string `json:"group_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Create personal group for the user
	personalGroup := models.DBGroup{
		Name:        req.Login + "'s group",
		Description: "Personal group for " + req.Login,
	}
	groupID, err := db.CreateGroup(personalGroup)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	u := models.DBUser{
		Login:    req.Login,
		Pwd:      req.Pwd,
		Fullname: req.Fullname,
		GroupID:  groupID, // Set the personal group as primary
	}

	userID, err := db.CreateUser(u)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	u.ID = userID

	// Add user to the personal group
	if err := db.CreateUserGroup(models.DBUserGroup{
		UserID:  userID,
		GroupID: groupID,
	}); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Add user to additional groups
	for _, gID := range req.GroupIDs {
		// Skip if it's the personal group (already added)
		if gID == groupID {
			continue
		}
		if err := db.CreateUserGroup(models.DBUserGroup{
			UserID:  userID,
			GroupID: gID,
		}); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(u)
}

// PUT /users/{id}
func UpdateUserHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	var req struct {
		Login    string   `json:"login"`
		Pwd      string   `json:"pwd"`
		Fullname string   `json:"fullname"`
		GroupID  string   `json:"group_id"`
		GroupIDs []string `json:"group_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	u := models.DBUser{
		ID:       id,
		Login:    req.Login,
		Pwd:      req.Pwd,
		Fullname: req.Fullname,
		GroupID:  req.GroupID,
	}

	// Update password only if provided
	updatePwd := req.Pwd != ""
	if err := db.UpdateUser(u, updatePwd); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update user groups: delete all and recreate
	if err := db.DeleteUserGroupsByUserID(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for _, groupID := range req.GroupIDs {
		if err := db.CreateUserGroup(models.DBUserGroup{
			UserID:  id,
			GroupID: groupID,
		}); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	json.NewEncoder(w).Encode(u)
}

// DELETE /users/{id}
func DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	if err := db.DeleteUser(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
