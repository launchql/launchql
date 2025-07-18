
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'launchql_migrate' 
               AND table_name = 'debug_mode_enabled') THEN
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'launchql_migrate' 
                      AND table_name = 'events' 
                      AND column_name = 'error_message') THEN
            ALTER TABLE launchql_migrate.events ADD COLUMN error_message TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'launchql_migrate' 
                      AND table_name = 'events' 
                      AND column_name = 'error_code') THEN
            ALTER TABLE launchql_migrate.events ADD COLUMN error_code TEXT;
        END IF;
        
    END IF;
END $$;
