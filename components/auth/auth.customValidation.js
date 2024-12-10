import userMdl from "../../schemas/userMdl.js";
import authHelper from "../../helper/authHelper.js";

const emailExistingCheck = async (email) => {
  const countEmailExisting = await userMdl.user.countDocuments({ email });

  if (countEmailExisting > 0) {
    return true;
  }
  return false;
};

const customLoginValidation = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    const error = new Error("Email ID is required");
    error.code = "EMAIL_REQUIRED";
    error.status = 400;
    return next(error);
  } else if (!email.includes("@")) {
    const error = new Error("Email ID is in invalid format");
    error.code = "INVALID_EMAIL";
    error.status = 400;
    return next(error);
  } else {
    const emailExistCheck = await emailExistingCheck(email);

    if (!emailExistCheck) {
      const error = new Error("User not found");
      error.code = "USER_NOT_FOUND";
      error.status = 404;
      return next(error);
    }
  }

  const foundUserInDb = await userMdl.user.findOne({ email });
  //   console.log(foundUserInDb);

  if (!password) {
    const error = new Error("Password is required");
    error.code = "PASSWORD_REQUIRED";
    error.status = 400;
    return next(error);
  } else if (!authHelper.decryptPassword(password, foundUserInDb.password)) {
    const error = new Error("Invalid Password");
    error.code = "INVALID_PASSWORD";
    error.status = 401;
    return next(error);
  }

  next();
};

const customRegisterValidation = async (req, res, next) => {
  const { name, email, password } = req.body;

  //   console.log(password.length);
  //   console.log(password.length < 6);
  //   console.log(password.length > 18);

  if (!name) {
    const error = new Error("Name is required");
    error.code = "NAME_REQUIRED";
    error.status = 400;
    return next(error);
  } else if (name.length < 1) {
    const error = new Error("Name can't be null");
    error.code = "NAME_REQUIRED";
    error.status = 400;
    return next(error);
  }

  if (!email) {
    const error = new Error("Email ID is required");
    error.code = "EMAIL_REQUIRED";
    error.status = 400;
    return next(error);
  } else if (!email.includes("@")) {
    const error = new Error("Email ID is in invalid format");
    error.code = "EMAIL_INVALID";
    error.status = 400;
    return next(error);
  } else {
    const emailExistCheck = await emailExistingCheck(email);

    if (emailExistCheck) {
      const error = new Error("User already exist");
      error.code = "USER_EXIST";
      error.status = 409;
      return next(error);
    }
  }

  if (!password) {
    const error = new Error("Password is required");
    error.code = "PASSWORD_REQUIRED";
    error.status = 400;
    return next(error);
  } else if (password.length < 6 || password.length > 18) {
    const error = new Error("Password must be 6 digit short and 18 digit long");
    error.code = "PASSWORD_INVALID";
    error.status = 400;
    return next(error);
  }

  next();
};

export default {
  customLoginValidation,
  customRegisterValidation,
};
