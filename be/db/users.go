package db

import (
	"database/sql"
	"fmt"

	"rprj/be/models"
)

// CREATE
func CreateUser(u models.DBUser) error {
	_, err := DB.Exec(
		"INSERT INTO "+tablePrefix+"users (id, login, pwd, pwd_salt, fullname, group_id) VALUES (?, ?, ?, ?, ?, ?)",
		u.ID, u.Login, u.Pwd, u.PwdSalt, u.Fullname, u.GroupID,
	)
	return err
}

// READ (by Login)
func GetUserByLogin(login string) (*models.DBUser, error) {
	row := DB.QueryRow("SELECT id, login, pwd, pwd_salt, fullname, group_id FROM "+tablePrefix+"users WHERE login = ?", login)
	var u models.DBUser
	err := row.Scan(&u.ID, &u.Login, &u.Pwd, &u.PwdSalt, &u.Fullname, &u.GroupID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &u, err
}

// READ (by ID)
func GetUserByID(id string) (*models.DBUser, error) {
	row := DB.QueryRow("SELECT id, login, pwd, pwd_salt, fullname, group_id FROM "+tablePrefix+"users WHERE id = ?", id)
	var u models.DBUser
	err := row.Scan(&u.ID, &u.Login, &u.Pwd, &u.PwdSalt, &u.Fullname, &u.GroupID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &u, err
}

// UPDATE
func UpdateUser(u models.DBUser) error {
	_, err := DB.Exec(
		"UPDATE "+tablePrefix+"users SET login=?, pwd=?, pwd_salt=?, fullname=?, group_id=? WHERE id=?",
		u.Login, u.Pwd, u.PwdSalt, u.Fullname, u.GroupID, u.ID,
	)
	return err
}

// DELETE
func DeleteUser(id string) error {
	_, err := DB.Exec("DELETE FROM "+tablePrefix+"users WHERE id=?", id)
	return err
}

// EXTRA: Count
func CountUsers() (int, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM " + tablePrefix + "users").Scan(&count)
	if err != nil {
		return 0, err
	}
	fmt.Println("Numero utenti:", count)
	return count, nil
}
