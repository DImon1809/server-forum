const express = require("express");
const multer = require("multer");
const { UserController } = require("./controllers");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, next) => {
    next(null, file.originalname);
  },
});

const uploads = multer({ storage });

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", UserController.currentUser);
router.get("/users/:id", UserController.getUserById);
router.put("/users/:id", UserController.updateUser);

module.exports = router;
