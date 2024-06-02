const express = require("express");
const router = require("./router");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();

app.listen(process.env.PORT, (err) =>
  err
    ? console.error(err)
    : console.log(`Server working on ${process.env.PORT}...`)
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

app.get("/uploads/:id", (req, res) => {
  const imageId = req.params.id;

  const imagePath = path.join(__dirname, "uploads", imageId);

  return res.sendFile(imagePath);
});
