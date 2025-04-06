package handler

import (
	"net/http"

	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/usecase"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
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

func (h *PetHandler) GetByOwner(c echo.Context) error {
	ownerID := c.QueryParam("ownerId")
	if ownerID == "" {
		log.Error("Failed to get pets: ownerId is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Owner ID is required",
		})
	}

	pets, err := h.petUsecase.GetByOwner(ownerID)
	if err != nil {
		log.Errorf("Failed to get pets: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to get pets",
		})
	}
	petResponses := make([]models.PetResponse, len(pets))
	for i, pet := range pets {
		url, err := h.storageUsecase.GetUrl(pet.ImageKey)
		if err != nil {
			log.Errorf("Failed to get pet image URL: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"error": "Failed to get pet image URL",
			})
		}
		petResponses[i] = models.NewPetResponse(pet, url)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"pets": petResponses,
	})
}

func (h *PetHandler) Create(c echo.Context) error {
	form, err := c.MultipartForm()
	if err != nil {
		log.Errorf("Failed to create pet: invalid form data: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
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
		log.Errorf("Failed to create pet: image file is required: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Image file is required",
		})
	}

	// Validate form values
	if name == "" || petType == "" || birthDay == "" || userID == "" {
		log.Error("Failed to create pet: missing required fields")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Missing required fields",
		})
	}

	// Upload the image
	fileKey, err := h.storageUsecase.UploadImage(file, "pets")
	if err != nil {
		log.Errorf("Failed to create pet: failed to upload image: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to upload image",
		})
	}

	_, err = h.petUsecase.Create(name, petType, species, birthDay, fileKey, userID)
	if err != nil {
		log.Errorf("Failed to create pet: failed to create pet: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to create pet",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Pet created successfully",
	})
}

func (h *PetHandler) Update(c echo.Context) error {
	petId := c.QueryParam("petId")
	if petId == "" {
		log.Error("Failed to update pet: petId is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Pet ID is required",
		})
	}
	form, err := c.MultipartForm()
	if err != nil {
		log.Errorf("Failed to update pet: invalid form data: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Invalid form data",
		})
	}

	// Get form values
	name := form.Value["name"][0]
	petType := form.Value["type"][0]
	species := form.Value["species"][0]
	birthDay := form.Value["birthDay"][0]

	if err := h.petUsecase.Update(petId, name, petType, species, birthDay); err != nil {
		log.Errorf("Failed to update pet: failed to update pet: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to update pet",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Pet updated successfully",
	})
}

func (h *PetHandler) Delete(c echo.Context) error {
	petId := c.QueryParam("petId")
	if petId == "" {
		log.Error("Failed to delete pet: petId is empty")
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Pet ID is required",
		})
	}

	if err := h.petUsecase.Delete(petId); err != nil {
		log.Errorf("Failed to delete pet: failed to delete pet: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "Failed to delete pet",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Pet deleted successfully",
	})
}
