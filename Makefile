include .env

.PHONY: run run-seed run-all seed build psql down-all

run-all: up-adminer run

run: build
	docker compose up api -d

run-seed:
	SEED=true docker compose up api -d

build:
	docker compose build

up-db:
	docker compose up db -d

down-db:
	docker compose down db

up-adminer:
	docker compose up adminer -d

down-all:
	docker compoes down

migrate:
	cd backend-go && atlas schema apply -u $(DATABASE_URL) --to file://schema.hcl

psql:
	psql $(DATABASE_URL)