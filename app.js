const express = require("express");

//Express-Async-Errors library is a way to catch errors at runtime without using try/catch blocks in  async functions.
require("express-async-errors");

const morgan = require("morgan");

const { errorHandler } = require("./middlewares/error");
require("dotenv").config();
require("./db");

// CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
const cors = require("cors");

// Require all the routes 
const userRouter = require("./routes/user");
const instructorRouter = require("./routes/instructor");
const courseRouter = require("./routes/course");
const reviewRouter = require("./routes/review");
const adminRouter = require("./routes/admin");

const { handleNotFound } = require("./utils/helper");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/user", userRouter);
app.use("/api/instructor", instructorRouter);
app.use("/api/course", courseRouter);
app.use("/api/review", reviewRouter);
app.use("/api/admin", adminRouter);
app.use("/*", handleNotFound);
app.use(errorHandler);


const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log("the app listening on port "+ PORT);
});
