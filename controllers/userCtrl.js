const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const res = require("express/lib/response");

const userCtrl = {
  register: async (req, res) => {
    try {
      const { email, name, password } = req.body;

      const user = await Users.findOne({ email });
      if (user)
        return res.status(400).json({ msg: "The email already exists" });

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password is at least 6 characters" });

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new Users({
        name,
        email,
        password: passwordHash,
      });

      //save to mongodb
      await newUser.save();
      //then create jsonwebtoken to authenticate
      const accessToken = createAccessToken({ id: newUser._id });
      const refreshToken = createRefreshToken({ id: newUser._id });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json(accessToken);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email });
      if (!user) return res.status(400).json({ msg: "wrong credentials" });

      const isMatched = await bcrypt.compare(password, user.password);
      if (!isMatched) return res.status(400).json({ msg: "wrong credentials" });

      // if login success, create access token and refresh token
      const accessToken = createAccessToken({ id: user._id });
      const refreshToken = createRefreshToken({ id: user._id });

      res.cookie("refreshToken", refreshToken, {
        httpOnly:true,
        path: "/user/refresh_token",
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json(accessToken);
    } catch (err) {
      return res.status(500).json(err.message);
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("refreshToken", { path: "/user/refresh_token" });
      res.json({ msg: "Logged out" });
    } catch (err) {
      return res.status(500).json(err.message);
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");
      if (!user) return res.status(400).json({ msg: "user does not exist" });
      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshToken;

      console.log(req.cookies.refreshToken, 'ggggg');

      if (!rf_token)
        return res.status(400).json({ msg: "Please login or register" });

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
          return res.status(400).json({ msg: "Please login or register" });

        const accessToken = createAccessToken({ id: user.id });
        res.json({ accessToken });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  addCart: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id);
      if (!user) return res.status(400).json({ msg: "User does not exist" });

      await Users.findOneAndUpdate(
        { _id: req.user.id },
        {
          cart: req.body.cart,
        }
      );

      return res.json({ msg: "Added to cart" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "11m" });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

module.exports = userCtrl;
