# docker/node-sqitch/Makefile

IMAGE := pyramation/node-sqitch
TAG := 20.12.0
PLATFORMS := linux/amd64,linux/arm64
CONTAINER_NAME := node-sqitch

.PHONY: build push tag-latest ssh cleanup clean-images

build:
	docker buildx build \
		--platform $(PLATFORMS) \
		-t $(IMAGE):$(TAG) \
		--output=type=docker \
		.

push: tag-latest
	docker buildx build \
		--platform $(PLATFORMS) \
		-t $(IMAGE):$(TAG) \
		-t $(IMAGE):latest \
		--push \
		.

tag-latest:
	docker tag $(IMAGE):$(TAG) $(IMAGE):latest

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
		docker rmi $(IMAGE):$(TAG) $(IMAGE):latest || true; \
	fi
