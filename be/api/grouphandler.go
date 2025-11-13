package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"rprj/be/db"
	"rprj/be/models"

	"github.com/gorilla/mux"
)

// GET /groups
func GetAllGroupsHandler(w http.ResponseWriter, r *http.Request) {
	searchBy := r.URL.Query().Get("search")
	orderBy := r.URL.Query().Get("order_by")
	groups, err := db.SearchGroupsBy(searchBy, orderBy)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(groups)
}

// GET /groups/{id}
func GetGroupHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	group, err := db.GetGroupByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if group == nil {
		http.NotFound(w, r)
		return
	}

	// Get group users
	groupUsers, err := db.GetUserGroupsByGroupID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Build response with user IDs
	userIDs := make([]string, len(groupUsers))
	for i, gu := range groupUsers {
		userIDs[i] = gu.UserID
	}

	response := map[string]interface{}{
		"id":          group.ID,
		"name":        group.Name,
		"description": group.Description,
		"user_ids":    userIDs,
	}

	json.NewEncoder(w).Encode(response)
}

// POST /groups
func CreateGroupHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string   `json:"name"`
		Description string   `json:"description"`
		UserIDs     []string `json:"user_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	g := models.DBGroup{
		Name:        req.Name,
		Description: req.Description,
	}

	groupID, err := db.CreateGroup(g)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	g.ID = groupID

	// Add users to group
	for _, userID := range req.UserIDs {
		if err := db.CreateUserGroup(models.DBUserGroup{
			UserID:  userID,
			GroupID: groupID,
		}); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(g)
}

// PUT /groups/{id}
func UpdateGroupHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	var req struct {
		Name        string   `json:"name"`
		Description string   `json:"description"`
		UserIDs     []string `json:"user_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	g := models.DBGroup{
		ID:          id,
		Name:        req.Name,
		Description: req.Description,
	}

	if err := db.UpdateGroup(g); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update group users: delete all and recreate
	if err := db.DeleteUserGroupsByGroupID(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for _, userID := range req.UserIDs {
		if err := db.CreateUserGroup(models.DBUserGroup{
			UserID:  userID,
			GroupID: id,
		}); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusNoContent)
}

// DELETE /groups/{id}
func DeleteGroupHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	// Groups with negative ID cannot be deleted (system groups)
	if strings.HasPrefix(id, "-") {
		http.Error(w, "cannot delete system groups", http.StatusForbidden)
		return
	}

	// TODO:
	// - check if any user belongs to this group

	if err := db.DeleteGroup(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
