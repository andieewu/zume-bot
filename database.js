const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

async function initDB() {
  const db = await open({
    filename: "botdata.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS verify_channels (
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS verify_settings (
      guild_id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS welcome_channels (
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL
    )
  `);

  return db;
}

module.exports = initDB;
