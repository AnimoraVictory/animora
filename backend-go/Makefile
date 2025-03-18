include .env
export

.PHONY: run seed build up-db down-db psql

run: up-db
	go run cmd/api/main.go

seed:
	go run cmd/api/main.go -seed

build:
	docker-compose build

up-db:
	docker compose up db -d

down-db:
	docker compose down db

psql:
	psql ${DATABASE_URL}