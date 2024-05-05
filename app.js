const express = require("express");
const router = require("./router");

require("dotenv").config();

const app = express();

app.listen(process.env.PORT, (err) =>
  err
    ? console.error(err)
    : console.log(`Server working on ${process.env.PORT}...`)
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});
