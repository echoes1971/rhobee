package models

import (
	"strings"
	"time"
)

// CustomTime handles both MySQL and ISO8601 date formats
type CustomTime struct {
	time.Time
}

// UnmarshalJSON handles multiple date formats from backend
func (ct *CustomTime) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), `"`)
	if s == "null" || s == "" {
		return nil
	}

	// Try MySQL format first: "2006-01-02 15:04:05"
	t, err := time.Parse("2006-01-02 15:04:05", s)
	if err == nil {
		ct.Time = t
		return nil
	}

	// Try ISO8601 format: "2006-01-02T15:04:05Z07:00"
	t, err = time.Parse(time.RFC3339, s)
	if err == nil {
		ct.Time = t
		return nil
	}

	return err
}

// MarshalJSON outputs in ISO8601 format
func (ct CustomTime) MarshalJSON() ([]byte, error) {
	if ct.Time.IsZero() {
		return []byte("null"), nil
	}
	return []byte(`"` + ct.Time.Format(time.RFC3339) + `"`), nil
}

// DBObject represents any object in ρBee
type DBObject struct {
	ID             string      `json:"id,omitempty"`
	Classname      string      `json:"classname,omitempty"`
	Name           string      `json:"name,omitempty"`
	Description    string      `json:"description,omitempty"`
	FatherID       string      `json:"father_id,omitempty"`
	Permissions    string      `json:"permissions,omitempty"`
	Creator        string      `json:"creator,omitempty"`
	GroupID        string      `json:"group_id,omitempty"`
	CreationDate   *CustomTime `json:"creation_date,omitempty"`
	LastModifyDate *CustomTime `json:"last_modify_date,omitempty"`
	DeletedDate    *CustomTime `json:"deleted_date,omitempty"`
	Language       string      `json:"language,omitempty"`

	// DBPage/DBNote fields
	HTML string `json:"html,omitempty"`

	// DBFile fields
	Filename string `json:"filename,omitempty"`
	Mime     string `json:"mime,omitempty"`
	Path     string `json:"path,omitempty"`

	// DBFolder fields
	ChildsSortOrder string `json:"childs_sort_order,omitempty"`
	IndexPageID     string `json:"index_page_id,omitempty"`

	// DBPerson fields
	Street  string `json:"street,omitempty"`
	Zip     string `json:"zip,omitempty"`
	City    string `json:"city,omitempty"`
	State   string `json:"state,omitempty"`
	Country string `json:"country,omitempty"`
	Email   string `json:"email,omitempty"`
	Phone   string `json:"phone,omitempty"`
	Mobile  string `json:"mobile,omitempty"`
	Fax     string `json:"fax,omitempty"`
	Website string `json:"website,omitempty"`

	// DBCompany fields
	CompanyName string `json:"company_name,omitempty"`
	VatNumber   string `json:"vat_number,omitempty"`

	// DBNote fields (shares HTML with DBPage)
	Text string `json:"text,omitempty"`
}

// LoginRequest is the request body for login
type LoginRequest struct {
	Login string `json:"login"`
	Pwd   string `json:"pwd"`
}

// LoginResponse is the response from login
type LoginResponse struct {
	AccessToken string   `json:"access_token"`
	ExpiresAt   int64    `json:"expires_at"`
	UserID      string   `json:"user_id"`
	Groups      []string `json:"groups"`
}

// SearchResponse is the response from search
type SearchResponse struct {
	Objects []DBObject `json:"objects"`
}

// NavigationChild represents a child in navigation
type NavigationChild struct {
	Data     DBObject `json:"data"`
	Metadata struct {
		CanRead  bool `json:"can_read"`
		CanWrite bool `json:"can_write"`
	} `json:"metadata"`
}

// NavigationResponse is the response from navigation
type NavigationResponse struct {
	Children []NavigationChild `json:"children"`
}
