package repository

import "mime/multipart"

type StorageRepository interface {
	UploadImage(file *multipart.FileHeader, directory string) (string, error)
	GetUrl(fileKey string) (string, error)
}
