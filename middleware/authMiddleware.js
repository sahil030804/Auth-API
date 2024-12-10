import jwt from "jsonwebtoken";
import env from "../config.js";

const verifyToken = (req, res, next) => {
  try {
    // const token = req.session.accessToken; // get refresh token from session

    let token;
    const authToken = req.headers["authorization"]; //get refresh token from request header

    if (authToken && authToken.startsWith("Bearer ")) {
      token = authToken.split(" ")[1];
    }
    // console.log(token);

    if (!token) {
      const error = new Error("ACCESS_TOKEN_MISSING");
      return next(error);
    }

    if (token !== req.session.accessToken) {
      const error = new Error("ACCESS_DENIED");
      return next(error);
    }

    const decodedToken = jwt.verify(token, env.jwt.ACCESS_TOKEN_KEY);

    req.user = decodedToken;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const error = new Error("ACCESS_TOKEN_EXPIRED");
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

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false }); // abortearly for stopping code to be exit when one error occur then show all errors in array in object
      next();
    } catch (error) {
      const errorMessage = error.details.map((detail) => detail.message);
      res.status(400).json({ error: errorMessage });
      // console.log(errorMessage);
    }
  };
};

export default { verifyToken, validate };
