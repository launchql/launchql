# LaunchQL Migration System Documentation

## Architecture Overview

LaunchQL provides a modern, TypeScript-based database migration system that serves as a drop-in replacement for Sqitch. The system is split into two main packages:

- **@launchql/core**: High-level orchestration layer that manages multi-module projects, dependencies, and deployment strategies
- **@launchql/migrate**: Low-level migration engine that handles the actual database operations

## System Flow

```mermaid
graph TB
    subgraph "User Interface"
        CLI["CLI Commands<br/>deploy/revert/verify"]
        API["API Usage<br/>LaunchQLProject"]
    end
    
    subgraph "@launchql/core"
        LP["LaunchQLProject<br/>Project Management"]
        DM["deployModules()<br/>revertModules()<br/>verifyModules()"]
        DP["deployProject()<br/>Multi-module orchestration"]
        MOD["Module Resolution<br/>& Dependencies"]
        FAST["Fast Deploy<br/>Package & Cache"]
    end
    
    subgraph "@launchql/migrate"
        LM["LaunchQLMigrate<br/>Client"]
        PARSER["Plan Parser<br/>parsePlanFile()"]
        SQL["SQL Execution<br/>withTransaction()"]
        SCHEMA["launchql_migrate<br/>Schema"]
    end
    
    subgraph "Database"
        PG[("PostgreSQL")]
        MS[("Migration State<br/>projects, changes,<br/>dependencies, events")]
    end
    
    CLI --> DM
    API --> LP
    LP --> MOD
    DM --> DP
    DP --> MOD
    DP --> FAST
    DP --> LM
    DM --> LM
    
    LM --> PARSER
    LM --> SQL
    SQL --> PG
    SCHEMA --> MS
    MS --> PG
    
    style CLI fill:#e1f5fe
    style API fill:#e1f5fe
    style LP fill:#c5e1a5
    style DM fill:#c5e1a5
    style DP fill:#c5e1a5
    style MOD fill:#c5e1a5
    style FAST fill:#c5e1a5
    style LM fill:#ffccbc
    style PARSER fill:#ffccbc
    style SQL fill:#ffccbc
    style SCHEMA fill:#ffccbc
    style PG fill:#f5f5f5
    style MS fill:#f5f5f5
```


```mermaid
sequenceDiagram
    participant User
    participant Core as @launchql/core
    participant Migrate as @launchql/migrate
    participant DB as PostgreSQL
    participant FS as File System

    User->>Core: deployModules(options)
    
    alt Recursive Mode
        Core->>Core: getModuleMap()
        Core->>Core: resolveDependencies()
        loop For each dependent module
            Core->>Migrate: deploy(moduleOptions)
            Migrate->>FS: parsePlanFile(planPath)
            Migrate->>FS: readScript(deploy/change.sql)
            Migrate->>DB: BEGIN (if useTransaction)
            Migrate->>DB: CALL launchql_migrate.deploy(...)
            Migrate->>DB: COMMIT (if useTransaction)
        end
    else Direct Mode
        Core->>Migrate: deploy(options)
        Migrate->>FS: parsePlanFile(planPath)
        Migrate->>FS: getChangesInOrder()
        loop For each change
            Migrate->>DB: Check launchql_migrate.is_deployed()
            alt Not deployed
                Migrate->>FS: readScript(deploy/change.sql)
                Migrate->>DB: CALL launchql_migrate.deploy(...)
            else Already deployed
                Migrate->>Migrate: Skip change
            end
        end
    end
    
    Migrate-->>Core: DeployResult
    Core-->>User: Success/Failure
```