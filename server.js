import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import router from "./indexRoutes.js";
import env from "./config.js";
import cors from "cors";
import errorCodes from "./errorCodes.js";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";

mongoose
  .connect(env.MY_DB_URL)
  .then(() => {
    console.log(`Database Connected`);
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const client = createClient({
  username: "default",
  password: "yhHO3kbMTR7U6ABXnHRPDSnbPRGZh6OP",
  socket: {
    host: "redis-16280.c264.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 16280,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => console.log("Redis Client Connected Successfully"));
await client.connect();

app.use(
  session({
    secret: env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day max age
    store: new RedisStore({ client }),
  })
);

app.use(cookieParser());

app.use(express.json());

app.use("/", router);

app.use((err, req, res, next) => {
  const errorNames = Object.keys(errorCodes);
  const error = err.message;
  const errorMatch = errorNames.includes(error);

  if (err.name === "ValidationError") {
    res.status(400).json({
      code: "DB_ERROR",
      message: err.message,
    });
  }

  if (errorMatch) {
    const status = errorCodes[error].httpStatusCode;
    const code = errorCodes[error].body.code;
    const message = errorCodes[error].body.message;

    res.status(status).json({
      code: code,
      message: message,
    });
  } else {
    res.status(500).json({
      code: err.code || "server_crashed",
      message: err.message || "Server crashed",
    });
  }
});

app.listen(env.PORT, () => {
  console.log(`Server Running On Port ${env.PORT}`);
});
