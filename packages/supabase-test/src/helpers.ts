import { PgTestClient } from 'pgsql-test';

/**
 * Helper function to insert a new user into auth.users
 * @param client - The PgTestClient to use (pg or db)
 * @param email - The user's email address
 * @param id - Optional user ID (UUID). If not provided, a random UUID will be generated.
 * @returns The inserted user object with id and email
 */
export async function insertUser(
    client: PgTestClient,
    email: string,
    id?: string
  ): Promise<{ id: string; email: string }> {
    if (id) {
      return await client.one(
        `INSERT INTO auth.users (id, email) 
         VALUES ($1, $2) 
         RETURNING id, email`,
        [id, email]
      );
    } else {
      return await client.one(
        `INSERT INTO auth.users (id, email) 
         VALUES (gen_random_uuid(), $1) 
         RETURNING id, email`,
        [email]
      );
    }
  }