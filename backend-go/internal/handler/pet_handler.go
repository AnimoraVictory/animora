package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/htanos/animalia/backend-go/internal/domain/models/responses"
	"github.com/htanos/animalia/backend-go/internal/usecase"
)

type PetHandler struct {
	petUsecase     usecase.PetUsecase
	storageUsecase usecase.StorageUsecase
}

func NewPetHandler(petUsecase usecase.PetUsecase, storageUsecase usecase.StorageUsecase) *PetHandler {
	return &PetHandler{
		petUsecase:     petUsecase,
		storageUsecase: storageUsecase,
	}
}

func (h *PetHandler) GetByOwner() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ownerID := c.Query("ownerId")
		if ownerID == "" {
			log.Error("Failed to get pets: ownerId is empty")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Owner ID is required",
			})
		}

		pets, err := h.petUsecase.GetByOwner(ownerID)
		if err != nil {
			log.Error("Failed to get pets: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to get pets",
			})
		}
		petResponses := make([]responses.PetResponse, len(pets))
		for i, pet := range pets {
			url, err := h.storageUsecase.GetUrl(pet.ImageKey)
			if err != nil {
				log.Error("Failed to get pet image URL: %v", err)
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to get pet image URL",
				})
			}
			petResponses[i] = responses.NewPetResponse(pet, url)
		}

		return c.JSON(fiber.Map{
			"pets": petResponses,
		})
	}
}

func (h *PetHandler) Create() fiber.Handler {
	return func(c *fiber.Ctx) error {
		form, err := c.MultipartForm()
		if err != nil {
			log.Error("Failed to create pet: invalid form data")
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
			log.Error("Failed to create pet: image file is required")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Image file is required",
			})
		}

		// Validate form values
		if name == "" || petType == "" || birthDay == "" || userID == "" {
			log.Error("Failed to create pet: missing required fields")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Missing required fields",
			})
		}

		// Upload the image
		fileKey, err := h.storageUsecase.UploadImage(file, "pets")
		if err != nil {
			log.Error("Failed to create pet: failed to upload image")
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to upload image",
			})
		}

		pet, err := h.petUsecase.Create(name, petType, species, birthDay, fileKey, userID)
		if err != nil {
			log.Error("Failed to create pet: failed to create pet")
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create pet",
			})
		}

		return c.JSON(fiber.Map{
			"message": "Pet created successfully",
			"pet":     pet,
		})
	}
}

func (h *PetHandler) Update() fiber.Handler {
	return func(c *fiber.Ctx) error {
		petId := c.Query("petId")
		if petId == "" {
			log.Error("Failed to update pet: petId is empty")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Pet ID is required",
			})
		}
		form, err := c.MultipartForm()
		if err != nil {
			log.Error("Failed to update pet: invalid form data")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid form data",
			})
		}

		// Get form values
		name := form.Value["name"][0]
		petType := form.Value["type"][0]
		species := form.Value["species"][0]
		birthDay := form.Value["birthDay"][0]

		if err := h.petUsecase.Update(petId, name, petType, species, birthDay); err != nil {
			log.Error("Failed to update pet: failed to update pet")
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update pet",
			})
		}

		return c.JSON(fiber.Map{
			"message": "Pet updated successfully",
		})
	}
}

func (h *PetHandler) Delete() fiber.Handler {
	return func(c *fiber.Ctx) error {
		petId := c.Query("petId")
		if petId == "" {
			log.Error("Failed to delete pet: petId is empty")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Pet ID is required",
			})
		}

		if err := h.petUsecase.Delete(petId); err != nil {
			log.Error("Failed to delete pet: failed to delete pet")
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to delete pet",
			})
		}

		return c.JSON(fiber.Map{
			"message": "Pet deleted successfully",
		})
	}
}
