const dotenv = require("dotenv");
const libsql = require("@libsql/client");

dotenv.config();

const turso = libsql.createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_API_TOKEN,
});

async function createRandomTable() {
  const createRandomTableQuery = `
        CREATE TABLE IF NOT EXISTS randomUser (
            username TEXT,
            time TEXT,
            chatId TEXT,

            CONSTRAINT pk_randomUser PRIMARY KEY (username)
        );
    `;

  try {
    await turso.execute(createRandomTableQuery);
    console.log("Table 'randomUser' created successfully.");
  } catch (err) {
    console.error("Could not create table: ", err);
  }
}

async function insertRandom(username, time, chatId) {
  const insertRandomQuery = `
        INSERT INTO randomUser (username, time, chatId) VALUES (?, ?, ?);
    `;

  try {
    await turso.execute(insertRandomQuery, [username, time, chat]);
    return true;
  } catch (err) {
    console.error("Could not insert record: ", err);
    return false;
  }
}

async function updateTimeRandom(username, time) {
  const updateTimeQuery = `
        UPDATE randomUser SET time = ? WHERE username = ?;
    `;

  try {
    await turso.execute(updateTimeQuery, [time, username]);
    return true;
  } catch (err) {
    console.error("Could not update record: ", err);
    return false;
  }
}

async function deleteRandom(username) {
  const deleteRandomQuery = `DELETE FROM randomUser WHERE username = ?;`;

  try {
    await turso.execute(deleteRandomQuery, [username]);
    return true;
  } catch (err) {
    console.error("Could not delete user: ", err);
    return false;
  }
}

async function queryUserRandom(username) {
  const queryUserQuery = `SELECT COUNT(username) as count FROM randomUser WHERE username = ?;`;

  try {
    const result = await turso.execute(queryUserQuery, [username]);
    const existance = result.rows[0].count;

    if (existance) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error("Could not query for user: ", err);
    return "error";
  }
}

module.exports = {
  createRandomTable,
  insertRandom,
  deleteRandom,
  updateTimeRandom,
  queryUserRandom
};
