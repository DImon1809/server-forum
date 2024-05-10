const { prisma } = require("../prisma/prisma-client");
const bcrypt = require("bcrypt");
const Jdenticon = require("jdenticon");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const UserController = {
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name)
        return res.status(400).json({ message: "Все поля обязательные!" });

      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser)
        return res
          .status(400)
          .json({ message: "Пользователь уже существует!" });

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      const png = Jdenticon.toPng(name, 200);
      const avatartName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "../uploads", avatartName);

      fs.writeFileSync(avatarPath, png);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashPassword,
          name,
          avatarUrl: `/uploads/${avatartName}`,
        },
      });

      return res.status(200).json(user);
    } catch (err) {
      console.error(err);

      return res.status(500).json({ message: "Ошибка сервера!" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return res.status(400).json({ message: "Все поля обязательные!" });

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user)
        return res.status(400).json({ message: "Пользователь не найден!" });

      const isValidPass = await bcrypt.compare(password, user.password);

      if (!isValidPass)
        return res.status(400).json({ message: "Неверный пароль!" });

      const token = jwt.sign({ userId: user.id }, process.env.SECRETKEY);

      return res.status(200).json(token);
    } catch (err) {
      console.error(err);

      return res.status(500).json({ message: "Ошибка сервера!" });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user;

      const user = await prisma.user.findUnique({
        where: {
          id,
        },

        include: {
          followers: true,
          following: true,
        },
      });

      if (!user)
        return res.status(404).json({ message: "Пользователь не найден!" });

      const isFollowing = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId: id }],
        },
      });

      return res
        .status(200)
        .json({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (err) {
      console.error(err);

      return res.status(500).json({ message: "Ошибка сервера!" });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { email, name, dateOfBirth, bio, location } = req.body;

      let filePath;

      if (req.file && req.file.path) {
        filePath = req.file.path;
      }

      if (id !== req.user)
        return res.status(403).json({ message: "Ошибка авторизации!" });

      const existingUser = await prisma.user.findFirst({ where: { email } });

      if (existingUser && existingUser.id !== id)
        return res.status(400).json({ message: "Почта уже используется!" });

      // Если undefined не перезапишет, а оставит всё как есть
      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
        },
      });

      return res.status(200).json(user);
    } catch (err) {
      console.error(err);

      return res.status(500).json({ message: "Ошибка сервера!" });
    }
  },

  currentUser: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user,
        },

        include: {
          followers: {
            include: {
              follower: true,
            },
          },

          following: {
            include: {
              following: true,
            },
          },
        },
      });

      if (!user)
        return res
          .status(400)
          .json({ message: "Не удалось найти пользователя!" });

      return res.status(200).json(user);
    } catch (err) {
      console.error(err);

      return res.status(500).json({ message: "Ошибка сервера!" });
    }
  },
};

module.exports = UserController;
