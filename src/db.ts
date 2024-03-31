import { Kysely, PostgresDialect } from 'kysely';
import { type DB } from 'kysely-codegen';
import { Pool } from 'pg';

import { env } from './env';

declare global {
  var db: Kysely<DB>; // eslint-disable-line
}

global.db ||= new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: env.DATABASE_URL,
    }),
  }),
});

export default global.db;
