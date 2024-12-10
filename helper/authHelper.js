import userMdl from "../schemas/userMdl.js";
import jwt from "jsonwebtoken";
import env from "../config.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

const encryptPassword = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(password, salt);
};

const decryptPassword = (plain, hashed) => {
  return bcrypt.compareSync(plain, hashed);
};

const generateAccessToken = async (userId) => {
  try {
    const accessToken = jwt.sign({ _id: userId }, env.jwt.ACCESS_TOKEN_KEY, {
      expiresIn: env.jwt.ACCESS_TOKEN_EXPIRY,
    });

    return accessToken;
  } catch (err) {
    const error = new Error(err.message);
    return next(error);
  }
};

const generateRefreshToken = async (userId) => {
  try {
    const refreshToken = jwt.sign({ _id: userId }, env.jwt.REFRESH_TOKEN_KEY, {
      expiresIn: env.jwt.REFRESH_TOKEN_EXPIRY,
    });

    const foundUserInDb = await userMdl.user.findOne(userId);
    foundUserInDb.refreshToken = refreshToken;

    await foundUserInDb.save();

    return refreshToken;
  } catch (err) {
    const error = new Error(err.message);
    return next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  // const token = req.session.refreshToken;

  let token;
  const authToken = req.headers["authorization"];
  if (authToken && authToken.startsWith("Bearer ")) {
    token = authToken.split(" ")[1];
  }

  if (!token) {
    const error = new Error("REFRESH_TOKEN_MISSING");
    return next(error);
  }
  try {
    const decodedToken = jwt.verify(token, env.jwt.REFRESH_TOKEN_KEY);
    const foundUserInDb = await userMdl.user.findOne({ _id: decodedToken._id });

    if (!foundUserInDb) {
      const error = new Error("USER_NOT_FOUND");
      return next(error);
    }

    if (token !== foundUserInDb.refreshToken) {
      const error = new Error("REFRESH_TOKEN_EXPIRED");
      return next(error);
    }

    const accessToken = await generateAccessToken(decodedToken._id);

    req.session.accessToken = accessToken;
    res.status(201).json({
      message: "Access Token Refresh Successfully",
      accessToken: accessToken,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const error = new Error("REFRESH_TOKEN_EXPIRED");
      return next(error);
    }

    if (err.name === "JsonWebTokenError") {
      const error = new Error("TOKEN_INVALID");
      return next(error);
    }

    const error = new Error(err.message);
    return next(error);
  }
};

export default {
  encryptPassword,
  decryptPassword,
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
};
