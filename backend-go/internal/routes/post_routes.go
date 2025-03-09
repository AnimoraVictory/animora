package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/htanos/animalia/backend-go/internal/models"
)

// SetupPostRoutes sets up the post routes
func SetupPostRoutes(app *fiber.App) {
	postGroup := app.Group("/posts")

	// Get all posts
	postGroup.Get("/", getAllPosts)

	// Create a new post
	postGroup.Post("/", createPost)

	postGroup.Get("/user", getPostsByUser)
}

// getAllPosts gets all posts
func getAllPosts(c *fiber.Ctx) error {
	// Get all posts from the database
	var posts []models.Post
	if err := models.DB.Find(&posts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get posts",
		})
	}

	return c.JSON(fiber.Map{
		"posts": posts,
	})
}

func getPostsByUser(c *fiber.Ctx) error {
	var posts []models.Post
	authorId := c.Query("authorId")
	if err := models.DB.Where("author_id = ?", authorId).Find(&posts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get posts",
		})
	}

	return c.JSON(fiber.Map{
		"posts": posts,
	})
}

// createPost creates a new post
func createPost(c *fiber.Ctx) error {
	// Parse request body
	var req struct {
		Title     string   `json:"title"`
		Content   string   `json:"content"`
		AuthorID  string   `json:"authorId"`
		ImageURLs []string `json:"imageUrls"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if req.Title == "" || req.Content == "" || req.AuthorID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "情報が不足しています",
		})
	}

	// Create the post in the database
	post := models.Post{
		Title:     req.Title,
		Content:   req.Content,
		AuthorID:  req.AuthorID,
		ImageUrls: req.ImageURLs,
	}

	if err := models.DB.Create(&post).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create post",
		})
	}

	return c.JSON(fiber.Map{
		"message": "投稿が作成されました",
		"post":    post,
	})
}
