package db

import (
	"log"
)

func SaveToken(userID string, tokenString string, expiry int64) error {
	_, err := DB.Exec(
		"INSERT INTO "+tablePrefix+"oauth_tokens (user_id, token_id, expires_at) VALUES (?, ?, ?)",
		userID, tokenString, expiry,
	)
	if err != nil {
		log.Println("Errore salvataggio token:", err)
	}
	return err
}
