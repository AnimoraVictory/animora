// internal/models/user.go
package models

import (
	"gorm.io/gorm"
)

// GetUserByEmail は、指定されたメールアドレスに一致するユーザーを DB から取得します。
func GetUserByEmail(db *gorm.DB, email string) (*User, error) {
	var user User
	// メールアドレスで検索し、最初の一致したレコードを取得
	if err := db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
