const dotenv = require("dotenv");
const libsql = require("@libsql/client");

dotenv.config();

const turso = libsql.createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_API_TOKEN,
});

async function createSequentialTable() {
  const createSequentialTableQuery = `
        CREATE TABLE IF NOT EXISTS sequentialUser (
            username TEXT,
            time TEXT,
            completed INT DEFAULT 0,

            CONSTRAINT max_value_check CHECK (completed <= 683),   
            CONSTRAINT pk_sequentialUser PRIMARY KEY (username)
        );
    `;

  try {
    await turso.execute(createSequentialTableQuery);
    console.log("Table 'sequentialUser' created successfully.");
  } catch (err) {
    console.error("Could not create table: ", err);
  }
}

async function insertSequential(username, time) {
  const insertSequentialQuery = `
        INSERT INTO sequentialUser (username, time) VALUES (?, ?);
    `;

  try {
    await turso.execute(insertSequentialQuery, [username, time]);
    return true;
  } catch (err) {
    console.error("Could not insert record: ", err);
    return false;
  }
}

async function updateTimeSequential(username, time) {
  const updateTimeQuery = `
        UPDATE sequentialUser SET time = ? WHERE username = ?;
    `;

  try {
    await turso.execute(updateTimeQuery, [time, username]);
    return true;
  } catch (err) {
    console.error("Could not update record: ", err);
    return false;
  }
}

async function deleteSequential(username) {
  const deleteSequentialQuery = `DELETE FROM sequentialUser WHERE username = ?;`;

  try {
    await turso.execute(deleteSequentialQuery, [username]);
    return true;
  } catch (err) {
    console.error("Could not delete user: ", err);
    return false;
  }
}

async function readCompleted(username) {
  const readCompletedQuery = `SELECT completed FROM sequentialUser WHERE username = ?;`;

  try {
    const completedRow = await turso.execute(readCompletedQuery, [username]);

    if (completedRow.rows.length === 0) {
      console.log(`No record found for username: ${username}`);
      return null;
    }
    return parseInt(completedRow.rows[0].completed);
  } catch (err) {
    console.error("Could not find completd for ", username, "Due To: ", err);
  }
}

async function incrementCompleted(username) {
  const alreadyCompleted = await readCompleted(username);

  if (alreadyCompleted >= 683) {
    console.log(
      `User ${username} has already reached the maximum value of 683.`
    );
    return;
  }

  const incrementCompletedQuery =
    "UPDATE sequentialUser SET completed = ? WHERE username = ?;";

  try {
    await turso.execute(incrementCompletedQuery, [
      alreadyCompleted + 1,
      username,
    ]);
    return true;
  } catch (err) {
    console.log("Could not complete the updation: ", err);
    return false;
  }
}

async function queryUserSequential(username) {
  const queryUserSequentialQuery = `SELECT COUNT(username) as count FROM sequentialUser WHERE username = ?;`;

  try {
    const response = await turso.execute(queryUserSequentialQuery, [username]);
    const existance = response.rows[0].count;

    if (existance) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log("Could not query for user: ", err);
    return "error";
  }
}

module.exports = {
  createSequentialTable,
  updateTimeSequential,
  incrementCompleted,
  readCompleted,
  deleteSequential,
  insertSequential,
  queryUserSequential
};
