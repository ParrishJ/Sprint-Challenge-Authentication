// Update with your config settings.

module.exports = {
  development: {
    client: 'sqlite3',
    connection: { filename: './database/auth.db3' }, // change this if you want a different name for the database
    useNullAsDefault: true, // used to avoid warning on console
    migrations: {
      directory: './database/migrations',
      tableName: 'dbmigrations',
    },
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      },
    },
    seeds: { directory: './database/seeds' },
  },
};
