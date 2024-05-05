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
          avatarUrl: `/uploads/${avatarPath}`,
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

      const token = jwt.sign(user.id, process.env.SECRETKEY);

      return res.status(200).json(token);
    } catch (err) {
      console.error(err);

      return res.status(500).json({ message: "Ошибка сервера!" });
    }
  },

  getUserById: async (req, res) => {
    await res.send("getUserById");
  },

  updateUser: async (req, res) => {
    await res.send("updateUser");
  },

  currentUser: async (req, res) => {
    await res.send("currentUser");
  },
};

module.exports = UserController;
