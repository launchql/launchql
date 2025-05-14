
up:
	docker-compose up -d

down:
	docker-compose down -v

ssh:
	docker exec -it postgres /bin/bash

roles:
	psql < bootstrap-roles.sql

install:
	docker exec postgres /sql-bin/install.sh
