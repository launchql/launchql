.PHONY: up down ai

up:
	docker-compose up -d

down:
	docker-compose down -v
	docker-compose -f docker-compose.ai.yml down

ai:
	docker-compose -f docker-compose.ai.yml up -d

.PHONY: ssh roles install

ssh:
	docker exec -it postgres /bin/bash

roles:
	psql < bootstrap-roles.sql

install:
	docker exec postgres /sql-bin/install.sh
