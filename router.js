const express = require("express");
const multer = require("multer");
const {
  UserController,
  PostController,
  CommentController,
  LikeController,
  FollowController,
} = require("./controllers");

const checkAuth = require("./middleware/checkAuth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, next) => {
    next(null, file.originalname);
  },
});

const uploads = multer({ storage });

// Router пользователя
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", checkAuth, UserController.currentUser);
router.get("/users/:id", checkAuth, UserController.getUserById);
router.put("/users/:id", checkAuth, UserController.updateUser);

// Router постов
router.post("/posts", checkAuth, PostController.createPost);
router.get("/posts", checkAuth, PostController.getAllPosts);
router.get("/posts/:id", checkAuth, PostController.getPostById);
router.delete("/posts/:id", checkAuth, PostController.deletePost);

// Router комментариев
router.post("/comments", checkAuth, CommentController.createComment);
router.delete("/comments/:id", checkAuth, CommentController.deleteComment);

// Router лайков
router.post("/likes", checkAuth, LikeController.likePost);
router.delete("/likes/:id", checkAuth, LikeController.unLikePost);

// Router подписок
router.post("/follow", checkAuth, FollowController.followUser);
router.delete("/follow/:id", checkAuth, FollowController.unFollowUser);

module.exports = router;
