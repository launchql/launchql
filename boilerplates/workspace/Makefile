
up:
	docker-compose up -d

down:
	docker-compose down -v

ssh:
	docker exec -it postgres /bin/bash

roles:
	lql admin-users bootstrap --yes
	lql admin-users add --test --yes

install:
	docker exec postgres /sql-bin/install.sh
