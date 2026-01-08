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
)

// GitHub OAuth endpoints
var githubAuthEndpoint = oauth2.Endpoint{
	AuthURL:  "https://github.com/login/oauth/authorize",
	TokenURL: "https://github.com/login/oauth/access_token",
}

// GitHubOAuthStart godoc
// @Summary Start GitHub OAuth2 login
// @Description Redirects to GitHub OAuth2 consent screen
// @Tags oauth
// @Produce json
// @Success 302 {string} string "Redirect to GitHub OAuth2 consent screen"
// @Router /oauth/github/start [get]
func GitHubOAuthStart(w http.ResponseWriter, r *http.Request) {
	if GitHubClientID == "" || GitHubClientSecret == "" || GitHubRedirectURL == "" {
		RespondSimpleError(w, ErrInternalServer, "GitHub OAuth not configured", http.StatusInternalServerError)
		return
	}
	conf := &oauth2.Config{
		ClientID:     GitHubClientID,
		ClientSecret: GitHubClientSecret,
		RedirectURL:  GitHubRedirectURL,
		Scopes:       []string{"user:email"},
		Endpoint:     githubAuthEndpoint,
	}
	state := fmt.Sprintf("st_%d", time.Now().UnixNano())
	http.SetCookie(w, &http.Cookie{Name: "oauth_state", Value: state, Path: "/", HttpOnly: true, MaxAge: 300})
	url := conf.AuthCodeURL(state, oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusFound)
}

// GitHubOAuthCallback godoc
// @Summary GitHub OAuth2 callback
// @Description Handles GitHub OAuth2 callback and issues JWT
// @Tags oauth
// @Produce json
// @Success 200 {string} string "HTML page that stores token and redirects"
// @Failure 400 {object} ErrorResponse "Invalid request"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /oauth/github/callback [get]
func GitHubOAuthCallback(w http.ResponseWriter, r *http.Request) {
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
		ClientID:     GitHubClientID,
		ClientSecret: GitHubClientSecret,
		RedirectURL:  GitHubRedirectURL,
		Scopes:       []string{"user:email"},
		Endpoint:     githubAuthEndpoint,
	}

	ctx := context.Background()
	token, err := conf.Exchange(ctx, code)
	if err != nil {
		log.Printf("GitHubOAuthCallback: token exchange failed: %v", err)
		RespondSimpleError(w, ErrInternalServer, "Token exchange failed", http.StatusInternalServerError)
		return
	}

	client := conf.Client(ctx, token)
	// get user
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		log.Printf("GitHubOAuthCallback: user request failed: %v", err)
		RespondSimpleError(w, ErrInternalServer, "Failed to fetch user", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	var userinfo map[string]interface{}
	if err := json.Unmarshal(body, &userinfo); err != nil {
		log.Printf("GitHubOAuthCallback: failed parsing user: %v", err)
		RespondSimpleError(w, ErrInternalServer, "Failed to parse user", http.StatusInternalServerError)
		return
	}
	// TODO: save this in a note attached to this user visible only to admins
	log.Print("GitHub userinfo: ", userinfo)

	loginStr, _ := userinfo["login"].(string)
	nameStr, _ := userinfo["name"].(string)

	// try to fetch primary email
	email := ""
	resp2, err := client.Get("https://api.github.com/user/emails")
	if err == nil {
		defer resp2.Body.Close()
		b2, _ := ioutil.ReadAll(resp2.Body)
		var emails []map[string]interface{}
		if json.Unmarshal(b2, &emails) == nil {
			for _, e := range emails {
				primary, _ := e["primary"].(bool)
				verified, _ := e["verified"].(bool)
				emailStr, _ := e["email"].(string)
				if primary && (verified || !verified) && emailStr != "" {
					email = emailStr
					break
				}
			}
		}
	}

	// fallback login-based identifier
	// identifier := email
	// if identifier == "" {
	// 	identifier = fmt.Sprintf("github:%s", loginStr)
	// }

	// Find or create user using same DB repo flow
	dbContext := &dblayer.DBContext{UserID: "-1", GroupIDs: []string{"-2"}, Schema: dblayer.DbSchema}
	repo := dblayer.NewDBRepository(dbContext, dblayer.Factory, dblayer.DbConnection)
	repo.Verbose = false

	userInst := repo.GetInstanceByTableName("users")
	if userInst == nil {
		RespondSimpleError(w, ErrInternalServer, "Users instance not available", http.StatusInternalServerError)
		return
	}

	// Try to find by email first
	var found []dblayer.DBEntityInterface
	// log.Print("GitHubOAuthCallback: searching for user. login=", loginStr, " email=", email)
	if email != "" {
		userInst.SetValue("email", email)
		found, err = repo.Search(userInst, false, false, "")
		if err != nil {
			RespondSimpleError(w, ErrInternalServer, "Search failed", http.StatusInternalServerError)
			return
		}
	}
	// If not found by email, try by login
	if len(found) == 0 {
		// reset email search
		userInst.SetValue("email", "")
		userInst.SetValue("login", loginStr)
		found, err = repo.Search(userInst, false, false, "")
		if err != nil {
			RespondSimpleError(w, ErrInternalServer, "Search failed", http.StatusInternalServerError)
			return
		}
	}

	var userID string
	if len(found) == 1 {
		userID = found[0].GetValue("id").(string)
		loginStr = found[0].GetValue("login").(string)
	} else if len(found) > 1 {
		RespondSimpleError(w, ErrInternalServer, "Multiple users found", http.StatusInternalServerError)
		return
	} else {
		userInst.SetValue("login", loginStr)
		userInst.SetValue("fullname", nameStr)
		userInst.SetValue("pwd", "")
		// userInst.SetValue("group_id", "-4")
		created, err := repo.Insert(userInst)
		if err != nil {
			log.Printf("GitHubOAuthCallback: failed to create user: %v", err)
			RespondSimpleError(w, ErrInternalServer, "Failed to create user", http.StatusInternalServerError)
			return
		}
		userID = created.GetValue("id").(string)
	}

	// collect groups
	userGroupsInstance := repo.GetInstanceByTableName("users_groups")
	group_list := []string{}
	if userGroupsInstance != nil {
		userGroupsInstance.SetValue("user_id", userID)
		ugs, _ := repo.Search(userGroupsInstance, false, false, "")
		for _, ug := range ugs {
			group_list = append(group_list, ug.GetValue("group_id").(string))
		}
	}

	// ensure primary group included
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
		"login":   loginStr,
		"groups":  stringsJoin(group_list, ","),
		"exp":     expiration.Unix(),
	}
	tokenJwt := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := tokenJwt.SignedString(JWTKey)
	if err != nil {
		RespondSimpleError(w, ErrInternalServer, "Could not generate token", http.StatusInternalServerError)
		return
	}

	_ = SaveToken(repo, userID, tokenString, expiration.Unix())

	// Build payload for frontend
	groupsCSV := ""
	for i, g := range group_list {
		if i > 0 {
			groupsCSV += ","
		}
		groupsCSV += g
	}
	payload := map[string]interface{}{
		"provider":     "github",
		"access_token": tokenString,
		"expires_at":   expiration.Unix(),
		"user_id":      userID,
		"login":        loginStr,
		"groups":       groupsCSV,
	}
	payloadJSON, _ := json.Marshal(payload)
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
