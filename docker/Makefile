.PHONY: all push-all build-all build-push-all build-process build-push-process \
        build-process-version build-push-process-version pgvector node-sqitch postgis clean

REPO_NAME?=pyramation
PLATFORMS?=linux/arm64

# default process if none specified (can be overridden: `make PROCESS=postgis build-process`)
PROCESS?=pgvector

# Convenience: list of known processes
PROCESSES:=pgvector node-sqitch postgis pgvector-postgis launchql

CONTAINER_NAME?=$(PROCESS)

## build-process builds docker image(s) for $(PROCESS) using base+versions from version.yaml
## It will build one image per version listed in $(PROCESS)/version.yaml and tag as <repo>/<process>:<version>
build-process:
	@echo "==> Building process: $(PROCESS)"
	@BASE=$$(sed -n 's/^[[:space:]]*base:[[:space:]]*//p' $(PROCESS)/version.yaml | head -n1); \
	VERSIONS=$$(sed -n '/^[[:space:]]*versions:/,$$p' $(PROCESS)/version.yaml | sed -n 's/^[[:space:]]*-[[:space:]]*//p'); \
	if [ -z "$$BASE" ] || [ -z "$$VERSIONS" ]; then \
		echo "Error: Could not parse base or versions from $(PROCESS)/version.yaml" 1>&2; \
		exit 1; \
	fi; \
	for v in $$VERSIONS; do \
		$(MAKE) --no-print-directory BASE=$$BASE VERSION=$$v build-process-version || exit $$?; \
	done

build-all:
	@for p in $(PROCESSES); do \
		$(MAKE) --no-print-directory PROCESS=$$p build-process || exit $$?; \
	done

build-push-process:
	@echo "==> Building+Pushing process: $(PROCESS)"
	@BASE=$$(sed -n 's/^[[:space:]]*base:[[:space:]]*//p' $(PROCESS)/version.yaml | head -n1); \
	VERSIONS=$$(sed -n '/^[[:space:]]*versions:/,$$p' $(PROCESS)/version.yaml | sed -n 's/^[[:space:]]*-[[:space:]]*//p'); \
	if [ -z "$$BASE" ] || [ -z "$$VERSIONS" ]; then \
		echo "Error: Could not parse base or versions from $(PROCESS)/version.yaml" 1>&2; \
		exit 1; \
	fi; \
	for v in $$VERSIONS; do \
		$(MAKE) --no-print-directory BASE=$$BASE VERSION=$$v build-push-process-version || exit $$?; \
	done

build-push-all:
	@for p in $(PROCESSES); do \
		$(MAKE) --no-print-directory PROCESS=$$p build-push-process || exit $$?; \
	done

# Build only a specific VERSION for $(PROCESS). Intended for internal use by build-process.
# Usage (internal): $(MAKE) BASE=<base> VERSION=<version> build-process-version
build-process-version:
	@test -n "$(BASE)" || { echo "Error: BASE is required"; exit 1; }
	@test -n "$(VERSION)" || { echo "Error: VERSION is required"; exit 1; }
	@echo "  -> $(BASE):$(VERSION) => $(REPO_NAME)/$(PROCESS):$(VERSION) (build)"
	@DOCKERFILE_PATH=$$( \
		if [ "$(PROCESS)" = "postgis" ]; then \
			case "$(VERSION)" in \
				13.*) echo "$(PROCESS)/Dockerfile.legacy" ;; \
				*)    echo "$(PROCESS)/Dockerfile" ;; \
			esac; \
		else \
			echo "$(PROCESS)/Dockerfile"; \
		fi ); \
		CONTEXT=$$( \
		if [ "$(PROCESS)" = "launchql" ]; then \
			echo ".."; \
		else \
			echo "$(PROCESS)"; \
		fi ); \
		docker buildx build \
		--platform $(PLATFORMS) \
		--build-arg BASE=$(BASE) \
		--build-arg BASE_VERSION=$(VERSION) \
		--file $$DOCKERFILE_PATH \
		-t $(REPO_NAME)/$(PROCESS):$(VERSION) \
		$$CONTEXT

# Build+push only a specific VERSION for $(PROCESS). Intended for internal use by build-push-process.
# Usage (internal): $(MAKE) BASE=<base> VERSION=<version> build-push-process-version
build-push-process-version:
	@test -n "$(BASE)" || { echo "Error: BASE is required"; exit 1; }
	@test -n "$(VERSION)" || { echo "Error: VERSION is required"; exit 1; }
	@echo "  -> $(BASE):$(VERSION) => $(REPO_NAME)/$(PROCESS):$(VERSION) (push)"
	@DOCKERFILE_PATH=$$( \
		if [ "$(PROCESS)" = "postgis" ]; then \
			case "$(VERSION)" in \
				13.*) echo "$(PROCESS)/Dockerfile.legacy" ;; \
				*)    echo "$(PROCESS)/Dockerfile" ;; \
			esac; \
		else \
			echo "$(PROCESS)/Dockerfile"; \
		fi ); \
		CONTEXT=$$( \
		if [ "$(PROCESS)" = "launchql" ]; then \
			echo ".."; \
		else \
			echo "$(PROCESS)"; \
		fi ); \
		docker buildx build \
		--platform $(PLATFORMS) \
		--build-arg BASE=$(BASE) \
		--build-arg BASE_VERSION=$(VERSION) \
		--file $$DOCKERFILE_PATH \
		-t $(REPO_NAME)/$(PROCESS):$(VERSION) \
		--push \
		$$CONTEXT

# Aliases
all: build-all
push-all: build-push-all

# Convenience per-process targets
pgvector:
	$(MAKE) PROCESS=pgvector build-process

node-sqitch:
	$(MAKE) PROCESS=node-sqitch build-process

postgis:
	$(MAKE) PROCESS=postgis build-process

pgvector-postgis:
	$(MAKE) PROCESS=pgvector-postgis build-process

launchql:
	$(MAKE) PROCESS=launchql build-process
