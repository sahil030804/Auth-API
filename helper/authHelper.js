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
    error.code = err.code || "SERVER_ERR";
    error.status = err.status || 500;
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
    error.code = err.code || "SERVER_ERR";
    error.status = err.status || 500;
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
    const error = new Error("Refresh Token Is Unavailable");
    error.code = "REFRESH_TOKEN_MISSING";
    error.status = 401;
    return next(error);
  }
  try {
    const decodedToken = jwt.verify(token, env.jwt.REFRESH_TOKEN_KEY);
    const foundUserInDb = await userMdl.user.findOne({ _id: decodedToken._id });

    if (!foundUserInDb) {
      const error = new Error("User not found");
      error.code = "USER_NOT_FOUND";
      error.status = 404;
      return next(error);
    }

    if (token !== foundUserInDb.refreshToken) {
      const error = new Error("Refresh token expired or in use");
      error.code = "REFRESH_TOKEN_EXPIRED";
      error.status = 401;
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
      const error = new Error("Refresh token expired");
      error.code = "TOKEN_EXPIRED";
      error.status = 401;
      return next(error);
    }

    if (err.name === "JsonWebTokenError") {
      const error = new Error("Invalid refresh token");
      error.code = "TOKEN_INVALID";
      error.status = 401;
      return next(error);
    }

    const error = new Error(err.message);
    error.code = err.code || "SERVER_ERR";
    error.status = err.status || 500;
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
