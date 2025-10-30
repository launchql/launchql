.PHONY: up down ai ssh roles install openhands

up:
	docker-compose up -d

down:
	docker-compose down -v
	docker-compose -f docker-compose.ai.yml down

ai:
	docker-compose -f docker-compose.ai.yml up -d

ssh:
	docker exec -it postgres /bin/bash

roles:
	pnpm exec lql admin-users bootstrap --yes
	pnpm exec lql admin-users add --test --yes

install:
	docker exec postgres /sql-bin/install.sh

openhands:
	@echo "Starting OpenHands with current directory: $(PWD)"
	export SANDBOX_VOLUMES=$(PWD):/workspace:rw; \
	docker run -it --rm --pull=always \
		-e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:0.44-nikolaik \
		-e SANDBOX_VOLUMES=$$SANDBOX_VOLUMES \
		-e LOG_ALL_EVENTS=true \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-v ~/.openhands:/.openhands \
		-p 4444:3000 \
		--add-host host.docker.internal:host-gateway \
		--name launchql-openhands \
		docker.all-hands.dev/all-hands-ai/openhands:0.44  