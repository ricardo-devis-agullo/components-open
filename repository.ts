import { Database } from 'https://deno.land/x/sqlite3@0.9.1/mod.ts';

export function Repository(url = 'test.db') {
  const db = new Database(url);

  function createTables() {
    db.exec(
      `CREATE TABLE IF NOT EXISTS components (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL
        );`
    );
    db.exec(
      `CREATE TABLE IF NOT EXISTS versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        component_id INTEGER NOT NULL,
        version TEXT NOT NULL,
        creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (component_id) REFERENCES components (id)
      );`
    );
  }
  createTables();
  const getVersionsQuery = db.prepare(
    `SELECT components.name, versions.version, versions.creation
     FROM components
     JOIN versions ON components.id = versions.component_id
     WHERE components.name = ?;`
  );

  return {
    getVersions(name: string) {
      const results: Array<{
        name: string;
        version: string;
        creation: string;
      }> = getVersionsQuery.all(name);

      return results;
    },
    close: db.close,
  };
}

export type Repository = ReturnType<typeof Repository>;
