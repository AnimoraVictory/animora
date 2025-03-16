package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/htanos/animalia/backend-go/internal/models"
	"github.com/htanos/animalia/backend-go/internal/services"
)

// SetupPetRoutes sets up the pet routes
func SetupPetRoutes(app *fiber.App) {
	petGroup := app.Group("/pets")

	// Get pets by owner ID
	petGroup.Get("/owner", getPetsByOwner)

	// Create a new pet
	petGroup.Post("/new", createPet)
}

// getPetsByOwner gets pets by owner ID
func getPetsByOwner(c *fiber.Ctx) error {
	ownerID := c.Query("ownerId")
	if ownerID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Owner ID is required",
		})
	}

	var pets []models.Pet
	if err := models.DB.Where("owner_id = ?", ownerID).Find(&pets).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get pets",
		})
	}

	return c.JSON(fiber.Map{
		"pets": pets,
	})
}

// createPet creates a new pet
func createPet(c *fiber.Ctx) error {
	// Parse multipart form
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid form data",
		})
	}

	// Get form values
	name := form.Value["name"][0]
	petType := form.Value["type"][0]
	species := form.Value["species"][0]
	birthDay := form.Value["birthDay"][0]
	userID := form.Value["userId"][0]

	// Get the image file
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Image file is required",
		})
	}

	// Validate form values
	if name == "" || petType == "" || birthDay == "" || userID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Missing required fields",
		})
	}

	// Upload the image to S3
	imageURL, err := services.UploadToS3(file)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to upload image",
		})
	}

	// Create the pet in the database
	pet := models.Pet{
		Name:     name,
		Type:     models.PetType(petType),
		Species:  species,
		BirthDay: birthDay,
		ImageURL: imageURL,
		OwnerID:  userID,
	}

	if err := models.DB.Create(&pet).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create pet",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Pet successfully registered",
		"pet":     pet,
	})
}
