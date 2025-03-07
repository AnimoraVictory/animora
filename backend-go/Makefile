.PHONY: 

run: up-db
	go run cmd/api/main.go

seed:
	go run cmd/api/main.go -seed

build:
	docker-compose build

up-db:
	docker compose up db -d