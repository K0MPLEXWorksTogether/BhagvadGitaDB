const express = require("express");
const basicAuth = require("basic-auth");
const { config } = require("dotenv");
const {
  createSequentialTable,
  updateTimeSequential,
  incrementCompleted,
  readCompleted,
  deleteSequential,
  insertSequential,
  queryUserSequential,
} = require("./sequentialUtil.js");
const {
  createRandomTable,
  insertRandom,
  deleteRandom,
  updateTimeRandom,
  queryUserRandom,
} = require("./randomUtil.js");

const app = express();
config();

const basicAuthMiddleWare = async (req, res, next) => {
  const user = basicAuth(req);

  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;

  if (
    !user ||
    !username ||
    !password ||
    user.name !== username ||
    user.pass !== password
  ) {
    return res.status(401).json({ message: "Unauthorized Access." });
  }

  next();
};

app.use(basicAuthMiddleWare);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "Welcome to the API. Available routes are /create, /incrementCompleted, /updateTime, /delete, /readCompleted, /query",
  });
});

app.get("/readCompleted", async (req, res) => {
  try {
    const username = req.query.username;

    if (!username) {
      return res
        .status(400)
        .json({ message: "Username not passed as parameter." });
    }

    const data = await readCompleted(username);

    if (data == null) {
      return res.status(404).json({ message: "Username not found." });
    }

    return res.status(200).json({ completed: data });
  } catch (err) {
    console.error("Error occured: ", err);
    return res.status(500).json({ message: "An unexpected error occured." });
  }
});

app.post("/create", async (req, res) => {
  try {
    const { username, usertype, time } = req.body;

    if (!username || !usertype || !time) {
      return res.status(400).json({
        message: "Username, usertype, or time not passed as a parameter.",
      });
    }

    if (usertype !== "random" && usertype !== "sequential") {
      return res
        .status(400)
        .json({ message: "Usertype must be 'sequential' or 'random'." });
    }

    if (usertype === "random") {
      const status = await insertRandom(username, time);
      if (status) {
        return res
          .status(200)
          .json({ message: "Random user added successfully." });
      } else {
        return res
          .status(500)
          .json({ message: "An unexpected error occured." });
      }
    } else {
      const status = await insertSequential(username, time);
      if (status) {
        return res
          .status(200)
          .json({ message: "Sequential user added successfully." });
      } else {
        return res
          .status(500)
          .json({ message: "An unexpected error occured." });
      }
    }
  } catch (err) {
    console.error("Error occured in /create: ", err);
    return res.status(500).json({ message: "An unexpected error occured." });
  }
});

app.delete("/delete", async (req, res) => {
  try {
    const { username, usertype } = req.body;

    if (!username || !usertype) {
      return res
        .status(400)
        .json({ message: "Username or usertype not passed as a parameter." });
    }

    if (usertype !== "sequential" && usertype !== "random") {
      return res
        .status(400)
        .json({ message: "Usertype must be 'sequential' or 'random'." });
    }

    if (usertype === "random") {
      const status = await deleteRandom(username);
      if (status) {
        return res
          .status(200)
          .json({ message: "Random user deleted successfully." });
      } else {
        return res
          .status(500)
          .json({ message: "An unexpected error occured." });
      }
    } else {
      const status = await deleteSequential(username);

      if (status) {
        return res
          .status(200)
          .json({ message: "Sequential user deleted successfully." });
      } else {
        return res
          .status(500)
          .json({ message: "An unexpected error occured." });
      }
    }
  } catch (err) {
    console.error("Error occured in /delete: ", err);
    return res.status(500).json({ message: "An unexpected error occured." });
  }
});

app.post("/incrementCompleted", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res
        .status(400)
        .json({ message: "Username not passed as a parameter." });
    }

    const status = await incrementCompleted(username);

    if (status) {
      return res.status(200).json({ message: "Completed value incremented." });
    } else {
      return res.status(500).json({ message: "An unexpected error occured." });
    }
  } catch (err) {
    console.error("Error occured in /incrementCompleted: ", err);
    return res.status(500).json({ message: "An unexpected error occured." });
  }
});

app.post("/updateTime", async (req, res) => {
  try {
    const { username, usertype, time } = req.body;

    if (!username || !usertype || !time) {
      return res.status(400).json({
        message: "Username, usertype or time not passed as a parameter.",
      });
    }

    if (usertype !== "sequential" && usertype !== "random") {
      return res
        .status(400)
        .json({ message: "Usertype must be 'sequential' or 'random'." });
    }

    if (usertype === "random") {
      const status = await updateTimeRandom(username, time);
      if (status) {
        return res
          .status(200)
          .json({ message: "Random user time updated successfully." });
      } else {
        return res
          .status(500)
          .json({ message: "An unexpected error occured." });
      }
    } else {
      const status = await updateTimeSequential(username, time);

      if (status) {
        return res
          .status(200)
          .json({ message: "Sequential user time updated successfully." });
      } else {
        return res
          .status(500)
          .json({ message: "An unexpected error occured." });
      }
    }
  } catch (err) {
    console.error("Error occured in /updateTime: ", err);
    return res.status(500).json({ message: "An unexpected error occured." });
  }
});

app.get("/query", async (req, res) => {
  try {
    const username = req.query.username;

    if (!username) {
      return res
        .status(400)
        .json({ message: "Username not passed as parameter." });
    }

    const randomStatus = await queryUserRandom(username);
    const sequentialStatus = await queryUserSequential(username);

    if (randomStatus === "error" || sequentialStatus === "error") {
      return res.status(500).json({ message: "An unexpected error occured." });
    }

    if (sequentialStatus) {
      return res.status(200).json({ usertype: "sequential" });
    } else if (randomStatus) {
      return res.status(200).json({ usertype: "random" });
    } else {
      return res.status(200).json({usertype: "does not exist"});
    }
  } catch (err) {
    console.error("Error occured in /query: ", err);
    return res.status(500).json({ message: "An unexpected error occured." });
  }
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
