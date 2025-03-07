package auth

// AuthUser represents an authenticated user
type AuthUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}
