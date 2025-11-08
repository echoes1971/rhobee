package models

// Struttura che rappresenta la tabella
type DBUser struct {
	ID       string
	Login    string
	Pwd      string
	PwdSalt  string
	Fullname string
	GroupID  string
}

/*
CREATE TABLE IF NOT EXISTS oauth_tokens (

	token_id     VARCHAR(64) PRIMARY KEY,
	user_id      VARCHAR(16) NOT NULL,
	access_token TEXT NOT NULL,
	refresh_token TEXT,
	expires_at   DATETIME NOT NULL,
	created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES rra_users(id)

);
*/
type DBOAuthToken struct {
	TokenID      string
	UserID       string
	AccessToken  string
	RefreshToken string
	ExpiresAt    string // DATETIME in formato stringa
	CreatedAt    string // DATETIME in formato stringa
}
