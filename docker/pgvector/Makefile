IMAGE := pyramation/pgvector
TAG := 13.3-alpine
PLATFORMS := linux/amd64,linux/arm64
CONTAINER_NAME := pgvector

.PHONY: build push ssh cleanup clean-images

build:
	docker buildx build \
		--platform $(PLATFORMS) \
		-t $(IMAGE):$(TAG) \
		--output=type=docker \
		.

push:
	docker buildx build \
		--platform $(PLATFORMS) \
		-t $(IMAGE):$(TAG) \
		--push \
		.

ssh:
	docker run --platform=linux/arm64 -it $(IMAGE):$(TAG) sh

cleanup:
	@if [ ! -z "$$(docker ps -aq -f name=$(CONTAINER_NAME))" ]; then \
		echo "Stopping and removing existing container..."; \
		docker stop $(CONTAINER_NAME) && docker rm $(CONTAINER_NAME); \
	fi

clean-images:
	@if docker images | grep $(IMAGE); then \
		echo "Removing Docker images for $(IMAGE)..."; \
		docker rmi $(IMAGE):$(TAG) || true; \
	fi
