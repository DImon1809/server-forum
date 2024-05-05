const { prisma } = require("../prisma/prisma-client");
const bcrypt = require("bcrypt");
const Jdenticon = require("jdenticon");
const path = require("path");

const UserController = {
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      console.log(email, password, name);

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

      return res.status(200).json({ message: "Success" });
    } catch (err) {
      console.error(err);

      return res.status(500).json({ message: "Ошибка сервера!" });
    }
  },

  login: async (req, res) => {
    await res.send("login");
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
