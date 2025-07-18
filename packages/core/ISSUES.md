# TODO and test cases to cover

- [ ] Ensure the system rolls back to the last successful state (e.g. @v1.0.0) if a deployment fails 
- [ ] Rollback on Failed Deployment to a Tagged State
- [ ] Test scenario where deployment fails and we need to revert from the last that was successful
- [ ] Rollback to a point and fork/modify a previously depended on change & plan, then redeploy with recursive 
- [ ] Validate should also validate that it’s NOT any SQL errors in change files
- [ ] projects ref'ing each other multiple times — but not in a circular way — can't we just treat projects like files?

## Revert and Rollback

- [x] Support reverting individual modules
- [x] Support reverting individual projects
- [x] Support reverting via tag (using `toChange` parameter)
- [ ] Support recursive revert via tag (across projects/modules)
- [x] Support transaction control for reverts
- [x] Support reverse dependency order processing
- [x] Support external extension cleanup with CASCADE
- [ ] Check if extenral extensions cleanup doesn't impact cross-projects
- [x] Support Sqitch compatibility mode
- [x] Support change targeting (revert to specific change)
- [ ] Support cross-project dependency-aware revert
- [ ] Support workspace-wide recursive revert
- [ ] Support dry-run revert operations
- [ ] Support revert impact analysis

## Deploy 

- [x] Support deploying individual modules
- [x] Support deploying individual projects  
- [x] Support deploying via tag (using `toChange` parameter)
- [ ] Support recursive deploy via tag (across projects/modules)
- [x] Support transaction control for deployments
- [x] Support dependency resolution within projects
- [x] Support external extension management
- [x] Support Sqitch compatibility mode
- [x] Support change targeting (deploy up to specific change)
- [ ] Support cross-project dependency resolution
- [ ] Support workspace-wide recursive deployment
- [ ] Support parallel deployment of independent modules

## Verify issues

- [x] Support verifying individual modules
- [x] Support verifying individual projects
- [ ] Support verifying via tag (tag-based verification)
- [ ] Support recursive verify across project graph
- [x] Support external extension availability checking
- [x] Support Sqitch compatibility mode
- [x] Support change state validation
- [x] Support dependency order verification
- [ ] Support workspace-wide recursive verification
- [ ] Support verification reporting and summaries
- [ ] Support verification with change targeting
- [ ] Support verification impact analysis
- [ ] Support verification dry-run mode