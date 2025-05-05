include .env

.PHONY: run run-all seed build psql down codegen seed

run-all: up-adminer run

run: build
	docker compose up api -d

run-attach: build
	docker compose up api

build:
	docker compose build api

up-db:
	docker compose up db -d

down-db:
	docker compose down db

up-adminer:
	docker compose up adminer -d

down:
	docker compose down api

psql:
	psql $(DATABASE_URL)

seed:
	cd db && bundle exec ruby seeds.rb
