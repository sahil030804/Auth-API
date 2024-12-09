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
      const error = new Error("Token is not available in header");
      error.code = "TOKEN_MISSING";
      error.status = 401;
      return next(error);
    }

    const decodedToken = jwt.verify(token, env.jwt.ACCESS_TOKEN_KEY);

    req.user = decodedToken;

    next();
  } catch (err) {
    const error = new Error(err.message);
    error.code = err.code || "SERVER_ERR";
    error.status = err.status || 500;
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
