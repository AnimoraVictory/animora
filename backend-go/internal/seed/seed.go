package seed

import (
	"log"

	"gorm.io/gorm"

	"github.com/htanos/animalia/backend-go/internal/domain/models"
)

// SeedData populates the database with sample data
func SeedData(db *gorm.DB) error {
	log.Println("Seeding database...")

	// Clear existing data (optional, comment out if you want to keep existing data)
	if err := clearData(db); err != nil {
		return err
	}

	// Create users
	users, err := createUsers(db)
	if err != nil {
		return err
	}

	// Create pets
	_, err = createPets(db, users)
	if err != nil {
		return err
	}

	// Create posts
	posts, err := createPosts(db, users)
	if err != nil {
		return err
	}

	// Create comments
	if err := createComments(db, posts, users); err != nil {
		return err
	}

	// Create likes
	if err := createLikes(db, posts, users); err != nil {
		return err
	}

	log.Println("Database seeding completed successfully")
	return nil
}

// clearData removes all existing data from the database
func clearData(db *gorm.DB) error {
	log.Println("Clearing existing data...")

	// Delete in order to respect foreign key constraints
	if err := db.Exec("DELETE FROM likes").Error; err != nil {
		return err
	}
	if err := db.Exec("DELETE FROM comments").Error; err != nil {
		return err
	}
	if err := db.Exec("DELETE FROM posts").Error; err != nil {
		return err
	}
	if err := db.Exec("DELETE FROM pets").Error; err != nil {
		return err
	}
	if err := db.Exec("DELETE FROM users").Error; err != nil {
		return err
	}

	return nil
}

// createUsers creates sample users
func createUsers(db *gorm.DB) ([]models.User, error) {
	log.Println("Creating sample users...")

	users := UserData()

	for i := range users {
		if err := db.Create(&users[i]).Error; err != nil {
			return nil, err
		}
	}

	return users, nil
}

// createPets creates sample pets for users
func createPets(db *gorm.DB, users []models.User) ([]models.Pet, error) {
	log.Println("Creating sample pets...")

	pets := PetData(users)

	for i := range pets {
		if err := db.Create(&pets[i]).Error; err != nil {
			return nil, err
		}
	}

	return pets, nil
}

// createPosts creates sample posts by users
func createPosts(db *gorm.DB, users []models.User) ([]models.Post, error) {
	log.Println("Creating sample posts...")

	posts := PostData(users)

	for i := range posts {
		if err := db.Create(&posts[i]).Error; err != nil {
			return nil, err
		}
	}

	return posts, nil
}

// createComments creates sample comments on posts
func createComments(db *gorm.DB, posts []models.Post, users []models.User) error {
	log.Println("Creating sample comments...")

	comments := CommentData(posts, users)

	for i := range comments {
		if err := db.Create(&comments[i]).Error; err != nil {
			return err
		}
	}

	return nil
}

// createLikes creates sample likes on posts
func createLikes(db *gorm.DB, posts []models.Post, users []models.User) error {
	log.Println("Creating sample likes...")

	likes := LikeData(posts, users)

	for i := range likes {
		if err := db.Create(&likes[i]).Error; err != nil {
			return err
		}
	}

	return nil
}
