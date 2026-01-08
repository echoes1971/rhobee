package api

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"rprj/be/dblayer"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// GoogleOAuthStart godoc
// @Summary Start Google OAuth2 login
// @Description Redirects to Google OAuth2 consent screen
// @Tags oauth
// @Produce json
// @Success 302 {string} string "Redirect to Google OAuth2 consent screen"
// @Router /oauth/google/start [get]
func GoogleOAuthStart(w http.ResponseWriter, r *http.Request) {
	if GoogleClientID == "" || GoogleClientSecret == "" || GoogleRedirectURL == "" {
		RespondSimpleError(w, ErrInternalServer, "Google OAuth not configured", http.StatusInternalServerError)
		return
	}

	conf := &oauth2.Config{
		ClientID:     GoogleClientID,
		ClientSecret: GoogleClientSecret,
		RedirectURL:  GoogleRedirectURL,
		Scopes:       []string{"openid", "profile", "email"},
		Endpoint:     google.Endpoint,
	}

	state := fmt.Sprintf("st_%d", time.Now().UnixNano())
	// store state in cookie (short lived)
	http.SetCookie(w, &http.Cookie{Name: "oauth_state", Value: state, Path: "/", HttpOnly: true, MaxAge: 300})
	url := conf.AuthCodeURL(state, oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusFound)
}

// GoogleOAuthCallback godoc
// @Summary Google OAuth2 callback
// @Description Handles Google OAuth2 callback and issues JWT
// @Tags oauth
// @Produce json
// @Success 200 {string} string "HTML page that stores token and redirects"
// @Failure 400 {object} ErrorResponse "Invalid request"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /oauth/google/callback [get]
func GoogleOAuthCallback(w http.ResponseWriter, r *http.Request) {
	// verify state
	stateCookie, err := r.Cookie("oauth_state")
	if err != nil {
		RespondSimpleError(w, ErrInvalidRequest, "Missing oauth state", http.StatusBadRequest)
		return
	}
	state := stateCookie.Value
	if r.URL.Query().Get("state") != state {
		RespondSimpleError(w, ErrInvalidRequest, "Invalid oauth state", http.StatusBadRequest)
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		RespondSimpleError(w, ErrInvalidRequest, "Missing code", http.StatusBadRequest)
		return
	}

	conf := &oauth2.Config{
		ClientID:     GoogleClientID,
		ClientSecret: GoogleClientSecret,
		RedirectURL:  GoogleRedirectURL,
		Scopes:       []string{"openid", "profile", "email"},
		Endpoint:     google.Endpoint,
	}

	ctx := context.Background()
	token, err := conf.Exchange(ctx, code)
	if err != nil {
		log.Printf("GoogleOAuthCallback: token exchange failed: %v", err)
		RespondSimpleError(w, ErrInternalServer, "Token exchange failed", http.StatusInternalServerError)
		return
	}

	client := conf.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		log.Printf("GoogleOAuthCallback: userinfo request failed: %v", err)
		RespondSimpleError(w, ErrInternalServer, "Failed to fetch userinfo", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	var userinfo map[string]interface{}
	if err := json.Unmarshal(body, &userinfo); err != nil {
		log.Printf("GoogleOAuthCallback: failed parsing userinfo: %v", err)
		RespondSimpleError(w, ErrInternalServer, "Failed to parse userinfo", http.StatusInternalServerError)
		return
	}
	// TODO: save this in a note attached to this user visible only to admins
	log.Print("Google userinfo: ", userinfo)

	email, _ := userinfo["email"].(string)
	name, _ := userinfo["name"].(string)

	if email == "" {
		RespondSimpleError(w, ErrInternalServer, "Google account has no email", http.StatusInternalServerError)
		return
	}

	// Find or create user
	dbContext := &dblayer.DBContext{
		UserID:   "-1",
		GroupIDs: []string{"-2"},
		Schema:   dblayer.DbSchema,
	}
	repo := dblayer.NewDBRepository(dbContext, dblayer.Factory, dblayer.DbConnection)
	repo.Verbose = false

	userInst := repo.GetInstanceByTableName("users")
	if userInst == nil {
		RespondSimpleError(w, ErrInternalServer, "Users instance not available", http.StatusInternalServerError)
		return
	}

	// Try to find by login (email)
	userInst.SetValue("login", email)
	found, err := repo.Search(userInst, false, false, "")
	if err != nil {
		RespondSimpleError(w, ErrInternalServer, "Search failed", http.StatusInternalServerError)
		return
	}
	// Try to find by email if not found
	if len(found) == 0 {
		userInst.SetValue("login", "")
		userInst.SetValue("email", email)
		found, err = repo.Search(userInst, false, false, "")
		if err != nil {
			RespondSimpleError(w, ErrInternalServer, "Search failed", http.StatusInternalServerError)
			return
		}
	}

	var userID string
	if len(found) == 1 {
		userID = found[0].GetValue("id").(string)
		// to return consistent login
		email = found[0].GetValue("login").(string)
	} else if len(found) > 1 {
		log.Printf("GoogleOAuthCallback: multiple users found for email: %s", email)
		RespondSimpleError(w, ErrInternalServer, "Multiple users found", http.StatusInternalServerError)
		return
	} else {
		// Create minimal user
		userInst.SetValue("login", email)
		userInst.SetValue("fullname", name)
		userInst.SetValue("email", email)
		userInst.SetValue("pwd", "")
		// default group: Guest (-4)
		// userInst.SetValue("group_id", "-4")
		userInst.SetMetadata("group_ids", []string{"-4"})
		created, err := repo.Insert(userInst)
		if err != nil {
			log.Printf("GoogleOAuthCallback: failed to create user: %v", err)
			RespondSimpleError(w, ErrInternalServer, "Failed to create user", http.StatusInternalServerError)
			return
		}
		userID = created.GetValue("id").(string)
	}

	// Build JWT
	// Get user groups
	userGroupsInstance := repo.GetInstanceByTableName("users_groups")
	group_list := []string{}
	if userGroupsInstance != nil {
		userGroupsInstance.SetValue("user_id", userID)
		ugs, _ := repo.Search(userGroupsInstance, false, false, "")
		for _, ug := range ugs {
			group_list = append(group_list, ug.GetValue("group_id").(string))
		}
	}

	// Ensure primary group included
	u := repo.GetInstanceByTableName("users")
	u.SetValue("id", userID)
	foundUsers, _ := repo.Search(u, false, false, "")
	if len(foundUsers) > 0 {
		if g := foundUsers[0].GetValue("group_id"); g != nil {
			gp := g.(string)
			present := false
			for _, v := range group_list {
				if v == gp {
					present = true
				}
			}
			if !present {
				group_list = append(group_list, gp)
			}
		}
	}

	expiration := time.Now().Add(1 * time.Hour)
	claims := &jwt.MapClaims{
		"user_id": userID,
		"login":   email,
		"groups":  stringsJoin(group_list, ","),
		"exp":     expiration.Unix(),
	}
	tokenJwt := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := tokenJwt.SignedString(JWTKey)
	if err != nil {
		RespondSimpleError(w, ErrInternalServer, "Could not generate token", http.StatusInternalServerError)
		return
	}

	// Save token
	_ = SaveToken(repo, userID, tokenString, expiration.Unix())

	// Build payload to send to frontend
	groupsCSV := ""
	for i, g := range group_list {
		if i > 0 {
			groupsCSV += ","
		}
		groupsCSV += g
	}
	payload := map[string]interface{}{
		"provider":     "google",
		"access_token": tokenString,
		"expires_at":   expiration.Unix(),
		"user_id":      userID,
		"login":        email,
		"groups":       groupsCSV,
	}
	payloadJSON, _ := json.Marshal(payload)

	// Return an HTML page that either posts message to opener (popup flow)
	// or writes to localStorage and redirects (same-tab flow). This lets
	// the frontend handle storing user info consistently.
	html := fmt.Sprintf(`<!doctype html><html><head><meta charset="utf-8"></head><body><script>
        (function(){
            try {
                var data = %s;
                if (window.opener && window.opener !== window) {
                    window.opener.postMessage(data, "*");
                    window.close();
                } else {
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('expires_at', data.expires_at);
                    localStorage.setItem('user_id', data.user_id);
                    if (data.login) localStorage.setItem('username', data.login);
                    if (data.groups) localStorage.setItem('groups', JSON.stringify(data.groups.split(',')));
                    window.location.href = '/';
                }
            } catch(e) { console.error(e); window.location.href = '/'; }
        })();
        </script></body></html>`, payloadJSON)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(html))
}

// helper: stringsJoin (avoid import cycle)
func stringsJoin(a []string, sep string) string {
	s := ""
	for i, v := range a {
		if i > 0 {
			s += sep
		}
		s += v
	}
	return s
}
