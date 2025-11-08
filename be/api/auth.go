package api

import (
	"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// Middleware che controlla il token JWT
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Legge l'header Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "missing Authorization header", http.StatusUnauthorized)
			return
		}

		// Deve essere nel formato "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "invalid Authorization header", http.StatusUnauthorized)
			return
		}
		tokenString := parts[1]
		log.Printf("Token ricevuto: %s\n", tokenString)

		// Valida il token
		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
			return JWTKey, nil
		})
		log.Printf("Claims estratti: %+v\n", claims)
		log.Printf("err: %v\n", err)
		if err != nil || !token.Valid {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		// Se vuoi, puoi estrarre l'user_id dai claims
		// userID := claims["user_id"].(string)

		// Passa la richiesta all'handler successivo
		next.ServeHTTP(w, r)
	})
}
