package models

import (
	"time"

	"github.com/google/uuid"
	pq "github.com/lib/pq"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Email     string    `json:"email" gorm:"unique"`
	Name      string    `json:"name"`
	Posts     []Post    `json:"posts,omitempty" gorm:"foreignKey:AuthorID"`
	Comments  []Comment `json:"comments,omitempty" gorm:"foreignKey:AuthorID"`
	Likes     []Like    `json:"likes,omitempty" gorm:"foreignKey:UserID"`
	Pets      []Pet     `json:"pets,omitempty" gorm:"foreignKey:OwnerID"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// Post represents a post in the system
type Post struct {
	ID        string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Title     string         `json:"title"`
	Content   string         `json:"content"`
	ImageUrls pq.StringArray `json:"imageUrls" gorm:"type:text[]"`
	AuthorID  string         `json:"authorId"`
	Author    User           `json:"author,omitempty" gorm:"foreignKey:AuthorID"`
	Comments  []Comment      `json:"comments,omitempty" gorm:"foreignKey:PostID"`
	Likes     []Like         `json:"likes,omitempty" gorm:"foreignKey:PostID"`
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
}

// Comment represents a comment on a post
type Comment struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Content   string    `json:"content"`
	PostID    string    `json:"postId"`
	Post      Post      `json:"post,omitempty" gorm:"foreignKey:PostID"`
	AuthorID  string    `json:"authorId"`
	Author    User      `json:"author,omitempty" gorm:"foreignKey:AuthorID"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// Like represents a like on a post
type Like struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	PostID    string    `json:"postId"`
	Post      Post      `json:"post,omitempty" gorm:"foreignKey:PostID"`
	UserID    string    `json:"userId"`
	User      User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// Pet represents a pet in the system
type Pet struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name      string    `json:"name"`
	BirthDay  string    `json:"birthDay"`
	Type      string    `json:"type"`
	ImageURL  string    `json:"imageUrl"`
	OwnerID   string    `json:"ownerId"`
	Owner     User      `json:"owner,omitempty" gorm:"foreignKey:OwnerID"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// Image represents an image associated with a post
type Image struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	URL       string    `json:"url"`
	PostID    string    `json:"postId"`
	Post      Post      `json:"post,omitempty" gorm:"foreignKey:PostID"`
	OrderNum  int       `json:"orderNum"` // 画像の表示順序
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// BeforeCreate is a GORM hook that generates a UUID for the ID field if it's empty
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

// BeforeCreate is a GORM hook that generates a UUID for the ID field if it's empty
func (p *Post) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

// BeforeCreate is a GORM hook that generates a UUID for the ID field if it's empty
func (c *Comment) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

// BeforeCreate is a GORM hook that generates a UUID for the ID field if it's empty
func (p *Pet) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

// BeforeCreate is a GORM hook that generates a UUID for the ID field if it's empty
func (i *Image) BeforeCreate(tx *gorm.DB) error {
	if i.ID == "" {
		i.ID = uuid.New().String()
	}
	return nil
}

// TableName specifies the table name for the Like model
func (Like) TableName() string {
	return "likes"
}

// UniqueConstraint ensures that a user can only like a post once
func (Like) UniqueConstraint() string {
	return "unique_post_user"
}
