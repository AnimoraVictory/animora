package seed

import (
	"github.com/google/uuid"
	"github.com/htanos/animalia/backend-go/internal/models"
)

// UserData returns a list of sample users
func UserData() []models.User {
	return []models.User{
		{
			ID:    uuid.New().String(),
			Email: "john.doe@example.com",
			Name:  "John Doe",
		},
		{
			ID:    uuid.New().String(),
			Email: "jane.smith@example.com",
			Name:  "Jane Smith",
		},
		{
			ID:    uuid.New().String(),
			Email: "alex.johnson@example.com",
			Name:  "Alex Johnson",
		},
		{
			ID:    uuid.New().String(),
			Email: "emily.wilson@example.com",
			Name:  "Emily Wilson",
		},
		{
			ID:    uuid.New().String(),
			Email: "michael.brown@example.com",
			Name:  "Michael Brown",
		},
		{
			ID:    uuid.New().String(),
			Email: "tanomitsu2002@gmail.com",
			Name:  "Mitsuru Hatano",
		},
		{
			ID:    uuid.New().String(),
			Email: "aki.kaku0627@gmail.com",
			Name:  "Akihiro Kaku",
		},
	}
}

// PetData returns a list of sample pets
func PetData(users []models.User) []models.Pet {
	return []models.Pet{
		{
			ID:       uuid.New().String(),
			Name:     "Max",
			BirthDay: "2023-01-15",
			Type:     "Dog",
			ImageURL: "https://example.com/images/max.jpg",
			OwnerID:  users[0].ID, // John's pet
		},
		{
			ID:       uuid.New().String(),
			Name:     "Luna",
			BirthDay: "2022-05-10",
			Type:     "Cat",
			ImageURL: "https://example.com/images/luna.jpg",
			OwnerID:  users[1].ID, // Jane's pet
		},
		{
			ID:       uuid.New().String(),
			Name:     "Buddy",
			BirthDay: "2021-11-22",
			Type:     "Dog",
			ImageURL: "https://example.com/images/buddy.jpg",
			OwnerID:  users[2].ID, // Alex's pet
		},
		{
			ID:       uuid.New().String(),
			Name:     "Coco",
			BirthDay: "2023-03-05",
			Type:     "Rabbit",
			ImageURL: "https://example.com/images/coco.jpg",
			OwnerID:  users[3].ID, // Emily's pet
		},
		{
			ID:       uuid.New().String(),
			Name:     "Rocky",
			BirthDay: "2022-08-17",
			Type:     "Dog",
			ImageURL: "https://example.com/images/rocky.jpg",
			OwnerID:  users[4].ID, // Michael's pet
		},
		{
			ID:       uuid.New().String(),
			Name:     "Milo",
			BirthDay: "2023-02-28",
			Type:     "Cat",
			ImageURL: "https://example.com/images/milo.jpg",
			OwnerID:  users[0].ID, // John's second pet
		},
	}
}

// PostData returns a list of sample posts
func PostData(users []models.User) []models.Post {
	return []models.Post{
		{
			ID:       uuid.New().String(),
			Title:    "My Dog's First Day at the Park",
			Content:  "Today I took Max to the park for the first time. He had so much fun running around and meeting other dogs!",
			AuthorID: users[0].ID, // John's post
			ImageUrls: []string{
				"https://example.com/images/max_park1.jpg",
				"https://example.com/images/max_park2.jpg",
			},
		},
		{
			ID:       uuid.New().String(),
			Title:    "Luna's New Toy",
			Content:  "I bought Luna a new toy today and she absolutely loves it. She's been playing with it non-stop!",
			AuthorID: users[1].ID, // Jane's post
			ImageUrls: []string{
				"https://example.com/images/luna_toy.jpg",
			},
		},
		{
			ID:       uuid.New().String(),
			Title:    "Buddy's Birthday Celebration",
			Content:  "We celebrated Buddy's 2nd birthday today with a special doggy cake and some new toys. He was so happy!",
			AuthorID: users[2].ID, // Alex's post
			ImageUrls: []string{
				"https://example.com/images/buddy_birthday1.jpg",
				"https://example.com/images/buddy_birthday2.jpg",
			},
		},
		{
			ID:       uuid.New().String(),
			Title:    "Coco's New Hutch",
			Content:  "We got Coco a new hutch today and she seems to really like it. It's much more spacious than her old one.",
			AuthorID: users[3].ID, // Emily's post
			ImageUrls: []string{
				"https://example.com/images/coco_hutch.jpg",
			},
		},
		{
			ID:       uuid.New().String(),
			Title:    "Rocky's First Swimming Lesson",
			Content:  "Took Rocky to the lake today for his first swimming lesson. He was a bit hesitant at first but then loved it!",
			AuthorID: users[4].ID, // Michael's post
			ImageUrls: []string{
				"https://example.com/images/rocky_swimming.jpg",
			},
		},
		{
			ID:       uuid.New().String(),
			Title:    "Milo's Favorite Napping Spot",
			Content:  "Milo has found his favorite spot for napping - right on top of my laptop when I'm trying to work!",
			AuthorID: users[0].ID, // John's second post
			ImageUrls: []string{
				"https://example.com/images/milo_napping.jpg",
			},
		},
	}
}

// CommentData returns a list of sample comments
func CommentData(posts []models.Post, users []models.User) []models.Comment {
	return []models.Comment{
		{
			ID:       uuid.New().String(),
			Content:  "He looks so happy! What breed is he?",
			PostID:   posts[0].ID, // Comment on John's post
			AuthorID: users[1].ID, // Comment by Jane
		},
		{
			ID:       uuid.New().String(),
			Content:  "That's such a cute toy! Where did you get it?",
			PostID:   posts[1].ID, // Comment on Jane's post
			AuthorID: users[2].ID, // Comment by Alex
		},
		{
			ID:       uuid.New().String(),
			Content:  "Happy birthday, Buddy! That cake looks delicious.",
			PostID:   posts[2].ID, // Comment on Alex's post
			AuthorID: users[3].ID, // Comment by Emily
		},
		{
			ID:       uuid.New().String(),
			Content:  "What a nice hutch! Coco must be very happy.",
			PostID:   posts[3].ID, // Comment on Emily's post
			AuthorID: users[4].ID, // Comment by Michael
		},
		{
			ID:       uuid.New().String(),
			Content:  "Swimming is great exercise for dogs! Rocky looks like he's having fun.",
			PostID:   posts[4].ID, // Comment on Michael's post
			AuthorID: users[0].ID, // Comment by John
		},
		{
			ID:       uuid.New().String(),
			Content:  "Haha, classic cat behavior! Milo is adorable.",
			PostID:   posts[5].ID, // Comment on John's second post
			AuthorID: users[1].ID, // Comment by Jane
		},
		{
			ID:       uuid.New().String(),
			Content:  "I love the park too! We should arrange a playdate for our dogs.",
			PostID:   posts[0].ID, // Second comment on John's post
			AuthorID: users[2].ID, // Comment by Alex
		},
	}
}

// LikeData returns a list of sample likes
func LikeData(posts []models.Post, users []models.User) []models.Like {
	return []models.Like{
		{
			PostID: posts[0].ID, // Like on John's post
			UserID: users[1].ID, // Like by Jane
		},
		{
			PostID: posts[0].ID, // Like on John's post
			UserID: users[2].ID, // Like by Alex
		},
		{
			PostID: posts[1].ID, // Like on Jane's post
			UserID: users[0].ID, // Like by John
		},
		{
			PostID: posts[1].ID, // Like on Jane's post
			UserID: users[3].ID, // Like by Emily
		},
		{
			PostID: posts[2].ID, // Like on Alex's post
			UserID: users[0].ID, // Like by John
		},
		{
			PostID: posts[2].ID, // Like on Alex's post
			UserID: users[1].ID, // Like by Jane
		},
		{
			PostID: posts[3].ID, // Like on Emily's post
			UserID: users[2].ID, // Like by Alex
		},
		{
			PostID: posts[4].ID, // Like on Michael's post
			UserID: users[3].ID, // Like by Emily
		},
		{
			PostID: posts[5].ID, // Like on John's second post
			UserID: users[1].ID, // Like by Jane
		},
		{
			PostID: posts[5].ID, // Like on John's second post
			UserID: users[4].ID, // Like by Michael
		},
	}
}

// ImageData returns a list of sample images
func ImageData(posts []models.Post) []models.Image {
	return []models.Image{
		{
			ID:       uuid.New().String(),
			URL:      "https://example.com/images/max_park1.jpg",
			PostID:   posts[0].ID, // First post's first image
			OrderNum: 1,
		},
		{
			ID:       uuid.New().String(),
			URL:      "https://example.com/images/max_park2.jpg",
			PostID:   posts[0].ID, // First post's second image
			OrderNum: 2,
		},
		{
			ID:       uuid.New().String(),
			URL:      "https://example.com/images/luna_toy.jpg",
			PostID:   posts[1].ID, // Second post's image
			OrderNum: 1,
		},
		{
			ID:       uuid.New().String(),
			URL:      "https://example.com/images/buddy_birthday1.jpg",
			PostID:   posts[2].ID, // Third post's first image
			OrderNum: 1,
		},
		{
			ID:       uuid.New().String(),
			URL:      "https://example.com/images/buddy_birthday2.jpg",
			PostID:   posts[2].ID, // Third post's second image
			OrderNum: 2,
		},
		{
			ID:       uuid.New().String(),
			URL:      "https://example.com/images/coco_hutch.jpg",
			PostID:   posts[3].ID, // Fourth post's image
			OrderNum: 1,
		},
		{
			ID:       uuid.New().String(),
			URL:      "https://example.com/images/rocky_swimming.jpg",
			PostID:   posts[4].ID, // Fifth post's image
			OrderNum: 1,
		},
		{
			ID:       uuid.New().String(),
			URL:      "https://example.com/images/milo_napping.jpg",
			PostID:   posts[5].ID, // Sixth post's image
			OrderNum: 1,
		},
	}
}
