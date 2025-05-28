.PHONY: all push-all node-sqitch pgvector clean

all:
	$(MAKE) -C node-sqitch build
	$(MAKE) -C pgvector build

push-all:
	$(MAKE) -C node-sqitch push
	$(MAKE) -C pgvector push

node-sqitch:
	$(MAKE) -C node-sqitch build

pgvector:
	$(MAKE) -C pgvector build

# Git cleanup (repo-level only)
clean:
	@git reset --hard
	@git ls-files --other --exclude-standard | xargs rm -f
