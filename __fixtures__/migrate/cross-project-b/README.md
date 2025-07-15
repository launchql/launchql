# Cross-Project-B: Tag-Based Dependencies Example

This fixture demonstrates complex tag-based dependencies between three projects:

## Projects

### Project X (Core System)
- Provides core functionality: schemas, types, functions, and extensions
- Tags:
  - `@x1.0.0` - Core schema and types
  - `@x1.1.0` - Added utility functions
  - `@x2.0.0` - Extended features (audit, config)

### Project Y (Auth System)
- Provides authentication and authorization
- Depends on Project X at specific versions
- Tags:
  - `@y1.0.0` - Basic auth (users, sessions)
  - `@y1.1.0` - Role-based access control
  - `@y2.0.0` - Advanced permissions

### Project Z (Application)
- Main application that uses both X and Y
- Depends on specific versions of both projects
- Tags:
  - `@z1.0.0` - Basic entities
  - `@z1.1.0` - Workflows with role checks
  - `@z2.0.0` - Analytics and reporting

## Tag Dependencies

```
project-x:@x1.0.0 ─┬─> project-y:auth_schema ─┬─> project-y:@y1.0.0 ─┬─> project-z:app_schema
                   │                           │                      │
project-x:@x1.1.0 ─┼─> project-y:auth_roles ──┴─> project-y:@y1.1.0 │
                   │                                                  │
project-x:@x2.0.0 ─┴─> project-y:auth_permissions -> project-y:@y2.0.0
                                                           │
                                                           └─> project-z:app_analytics
```

## Test Scenarios

1. **Deploy to project-z:@z1.0.0**
   - Should deploy: x:core_schema, x:core_types, x:@x1.0.0, x:core_functions, x:@x1.1.0
   - Should deploy: y:auth_schema, y:auth_users, y:@y1.0.0
   - Should deploy: z:app_schema, z:app_entities, z:@z1.0.0

2. **Deploy to project-z:@z2.0.0**
   - Should deploy everything including x:@x2.0.0 and y:@y2.0.0

3. **Rollback project-y to @y1.0.0**
   - Should remove: y:auth_roles, y:auth_permissions
   - Should fail if project-z has deployed beyond @z1.0.0

4. **Deploy project-y:auth_permissions without deploying project-x:@x2.0.0**
   - Should automatically deploy x:core_extensions first

## Key Features Demonstrated

- Tag dependencies across projects (`project-x:@x1.0.0`)
- Mixed tag and change dependencies
- Version constraints (e.g., app_analytics requires both x:@x2.0.0 and y:@y2.0.0)
- Cascading deployments through tag dependencies
- Rollback constraints based on dependent projects